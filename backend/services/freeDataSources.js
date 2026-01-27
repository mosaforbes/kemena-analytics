// data-sources-integration.js
// Practical implementation for integrating free data sources into your Kemena Analytics project

const axios = require('axios');
const NodeCache = require('node-cache');
const { EventEmitter } = require('events');

/**
 * Unified Free Data Sources Manager
 * Handles Spotify, YouTube, Last.fm, MusicBrainz, Genius, Discogs
 * Zero-cost implementation with intelligent caching and rate limiting
 */
class FreeArtistAnalyticsService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.cache = new NodeCache({ 
      stdTTL: 86400, // 24 hour cache by default
      checkperiod: 3600 
    });

    this.config = {
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
      spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      lastfmApiKey: process.env.LASTFM_API_KEY,
      geniusToken: process.env.GENIUS_TOKEN,
      youtubeApiKey: process.env.YOUTUBE_API_KEY,
      discogsUserAgent: 'AnalyticsApp/1.0 +http://kemena-analytics.local',
      ...config
    };

    this.quotaManager = new QuotaManager();
    this.rateLimiters = this.initializeRateLimiters();
    this.spotifyToken = null;
    this.spotifyTokenExpiry = null;
  }

  /**
   * Initialize rate limiters for each API
   */
  initializeRateLimiters() {
    return {
      spotify: new RateLimiter(2, 1000), // 2 requests per second
      lastfm: new RateLimiter(5, 1000), // 5 requests per second
      genius: new RateLimiter(10, 1000), // 10 requests per second
      musicbrainz: new RateLimiter(1, 1000), // 1 request per second (strict)
      discogs: new RateLimiter(25, 60000), // 25 per minute
      youtube: new QuotaBasedLimiter(10000), // 10k daily quota
    };
  }

  /**
   * Get complete artist analytics from all free sources
   */
  async getArtistAnalytics(artistQuery) {
    const cacheKey = `artist:${artistQuery}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      this.emit('cache-hit', { artistQuery });
      return cached;
    }

    try {
      const analytics = await Promise.allSettled([
        this.getSpotifyArtistData(artistQuery),
        this.getYoutubeChannelData(artistQuery),
        this.getLastFmArtistData(artistQuery),
        this.getMusicBrainzArtistData(artistQuery),
        this.getGeniusArtistData(artistQuery),
        this.getDiscogsArtistData(artistQuery),
      ]);

      const result = {
        artistQuery,
        timestamp: new Date(),
        sources: {
          spotify: this.extractResult(analytics[0]),
          youtube: this.extractResult(analytics[1]),
          lastfm: this.extractResult(analytics[2]),
          musicbrainz: this.extractResult(analytics[3]),
          genius: this.extractResult(analytics[4]),
          discogs: this.extractResult(analytics[5]),
        },
        aggregated: this.aggregateMetrics(analytics),
        quotaStatus: this.quotaManager.getStatus()
      };

      // Cache for 24 hours
      this.cache.set(cacheKey, result, 86400);
      this.emit('analytics-complete', result);

      return result;
    } catch (error) {
      this.emit('error', { error, artistQuery });
      throw error;
    }
  }

  /**
   * SPOTIFY API - Get artist metadata (free tier)
   */
  async getSpotifyArtistData(artistQuery) {
    if (!this.config.spotifyClientId) {
      throw new Error('Spotify credentials not configured');
    }

    try {
      // Ensure valid token
      const token = await this.getSpotifyToken();

      // Search for artist
      const searchResponse = await this.rateLimiters.spotify.execute(
        () => axios.get('https://api.spotify.com/v1/search', {
          params: {
            q: `artist:${artistQuery}`,
            type: 'artist',
            limit: 1
          },
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      const artist = searchResponse.data.artists.items[0];
      if (!artist) throw new Error(`Artist not found: ${artistQuery}`);

      // Get audio features from top tracks (free tier metric)
      const topTracksResponse = await this.rateLimiters.spotify.execute(
        () => axios.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks`, {
          params: { market: 'US', limit: 10 },
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      // Get track features (batch request)
      const trackIds = topTracksResponse.data.tracks
        .map(t => t.id)
        .join(',');

      const featuresResponse = await this.rateLimiters.spotify.execute(
        () => axios.get('https://api.spotify.com/v1/audio-features', {
          params: { ids: trackIds },
          headers: { 'Authorization': `Bearer ${token}` }
        })
      );

      // Calculate aggregate audio features
      const avgFeatures = this.calculateAverageFeatures(
        featuresResponse.data.audio_features
      );

      return {
        artistId: artist.id,
        name: artist.name,
        followers: artist.followers.total,
        popularity: artist.popularity,
        genres: artist.genres,
        images: artist.images[0]?.url,
        externalUrls: artist.external_urls,
        audioFeatures: {
          avgEnergy: avgFeatures.energy,
          avgDanceability: avgFeatures.danceability,
          avgValence: avgFeatures.valence,
          avgAcousticness: avgFeatures.acousticness,
          avgInstrumentalness: avgFeatures.instrumentalness,
          topGenres: artist.genres.slice(0, 5)
        },
        topTracks: topTracksResponse.data.tracks.map(t => ({
          name: t.name,
          popularity: t.popularity,
          releaseDate: t.album.release_date
        })),
        source: 'spotify',
        quotaCost: 3 // 1 search + 1 top-tracks + 1 features
      };
    } catch (error) {
      this.emit('spotify-error', error);
      return { error: error.message, source: 'spotify' };
    }
  }

  /**
   * YOUTUBE API - Get channel statistics (free tier)
   */
  async getYoutubeChannelData(artistQuery) {
    if (!this.config.youtubeApiKey) {
      return { skipped: 'YouTube API key not configured', source: 'youtube' };
    }

    try {
      // Check quota before making request
      if (!this.rateLimiters.youtube.canExecute(101)) { // 100 for search + 1 for stats
        return { 
          error: 'YouTube quota exhausted', 
          remainingQuota: this.rateLimiters.youtube.getRemainingQuota(),
          source: 'youtube' 
        };
      }

      // Search for channel
      const searchResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: this.config.youtubeApiKey,
            q: `${artistQuery} music`,
            type: 'channel',
            part: 'snippet',
            maxResults: 1
          }
        }
      );

      this.rateLimiters.youtube.spend(100); // Search costs 100 units

      const channel = searchResponse.data.items[0];
      if (!channel) return { error: 'Channel not found', source: 'youtube' };

      // Get channel statistics
      const statsResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            key: this.config.youtubeApiKey,
            part: 'statistics,snippet,brandingSettings',
            id: channel.id.channelId
          }
        }
      );

      this.rateLimiters.youtube.spend(1); // List costs 1 unit

      const channelData = statsResponse.data.items[0];

      return {
        channelId: channelData.id,
        channelName: channelData.snippet.title,
        subscribers: parseInt(channelData.statistics.subscriberCount || 0),
        viewCount: parseInt(channelData.statistics.viewCount || 0),
        videoCount: parseInt(channelData.statistics.videoCount || 0),
        description: channelData.snippet.description,
        profileImage: channelData.snippet.thumbnails.default?.url,
        source: 'youtube',
        quotaCost: 101,
        remainingQuota: this.rateLimiters.youtube.getRemainingQuota()
      };
    } catch (error) {
      this.emit('youtube-error', error);
      return { error: error.message, source: 'youtube' };
    }
  }

  /**
   * LAST.FM API - Get artist and user listening data (free tier)
   */
  async getLastFmArtistData(artistQuery) {
    if (!this.config.lastfmApiKey) {
      return { skipped: 'Last.fm API key not configured', source: 'lastfm' };
    }

    try {
      // Get artist info
      const artistResponse = await this.rateLimiters.lastfm.execute(
        () => axios.get('http://ws.audioscrobbler.com/2.0/', {
          params: {
            method: 'artist.getInfo',
            artist: artistQuery,
            api_key: this.config.lastfmApiKey,
            format: 'json'
          }
        })
      );

      const artist = artistResponse.data.artist;

      // Get top tracks
      const topTracksResponse = await this.rateLimiters.lastfm.execute(
        () => axios.get('http://ws.audioscrobbler.com/2.0/', {
          params: {
            method: 'artist.getTopTracks',
            artist: artistQuery,
            api_key: this.config.lastfmApiKey,
            format: 'json',
            limit: 10
          }
        })
      );

      // Get similar artists
      const similarResponse = await this.rateLimiters.lastfm.execute(
        () => axios.get('http://ws.audioscrobbler.com/2.0/', {
          params: {
            method: 'artist.getSimilar',
            artist: artistQuery,
            api_key: this.config.lastfmApiKey,
            format: 'json',
            limit: 5
          }
        })
      );

      return {
        name: artist.name,
        listeners: parseInt(artist.stats?.listeners || 0),
        playcount: parseInt(artist.stats?.playcount || 0),
        mbid: artist.mbid,
        url: artist.url,
        image: artist.image?.[3]?.['#text'],
        tags: artist.tags?.tag?.slice(0, 5).map(t => t.name) || [],
        topTracks: topTracksResponse.data.toptracks?.track?.map(t => ({
          name: t.name,
          playcount: parseInt(t.playcount),
          listeners: parseInt(t.listeners)
        })) || [],
        similarArtists: similarResponse.data.similarartists?.artist?.map(a => ({
          name: a.name,
          match: parseFloat(a.match)
        })) || [],
        source: 'lastfm',
        quotaCost: 3
      };
    } catch (error) {
      this.emit('lastfm-error', error);
      return { error: error.message, source: 'lastfm' };
    }
  }

  /**
   * MUSICBRAINZ API - Get comprehensive metadata (free, no auth needed)
   */
  async getMusicBrainzArtistData(artistQuery) {
    try {
      // Search for artist (strict 1 req/sec rate limit)
      const searchResponse = await this.rateLimiters.musicbrainz.execute(
        () => axios.get('https://musicbrainz.org/ws/2/artist', {
          params: {
            query: `artist:"${artistQuery}"`,
            fmt: 'json',
            limit: 1
          },
          headers: {
            'User-Agent': this.config.discogsUserAgent
          }
        })
      );

      const artist = searchResponse.data.artists?.[0];
      if (!artist) return { error: 'Artist not found', source: 'musicbrainz' };

      // Get detailed artist info with relationships
      const detailResponse = await this.rateLimiters.musicbrainz.execute(
        () => axios.get(`https://musicbrainz.org/ws/2/artist/${artist.id}`, {
          params: {
            fmt: 'json',
            inc: 'releases+recordings+relationships+tags'
          },
          headers: {
            'User-Agent': this.config.discogsUserAgent
          }
        })
      );

      const detailedArtist = detailResponse.data;

      return {
        mbid: artist.id,
        name: detailedArtist.name,
        type: detailedArtist.type,
        country: detailedArtist.country,
        area: detailedArtist.area?.name,
        releaseCount: detailedArtist['release-group-count'],
        recordingCount: detailedArtist['recording-count'],
        tags: detailedArtist.tags?.tag?.slice(0, 5).map(t => ({
          name: t.name,
          count: t.count
        })) || [],
        members: this.extractBandMembers(detailedArtist.relationships),
        source: 'musicbrainz',
        quotaCost: 2
      };
    } catch (error) {
      this.emit('musicbrainz-error', error);
      return { error: error.message, source: 'musicbrainz' };
    }
  }

  /**
   * GENIUS API - Get song data and lyrics (free tier)
   */
  async getGeniusArtistData(artistQuery) {
    if (!this.config.geniusToken) {
      return { skipped: 'Genius token not configured', source: 'genius' };
    }

    try {
      // Search for artist/songs
      const searchResponse = await this.rateLimiters.genius.execute(
        () => axios.get('https://api.genius.com/search', {
          params: { q: artistQuery },
          headers: { 'Authorization': `Bearer ${this.config.geniusToken}` }
        })
      );

      const hits = searchResponse.data.response.hits.slice(0, 5);

      return {
        songs: hits.map(hit => ({
          title: hit.result.title,
          artist: hit.result.primary_artist.name,
          url: hit.result.url,
          releaseDate: hit.result.release_date_components,
          image: hit.result.song_art_image_url
        })),
        source: 'genius',
        quotaCost: 1
      };
    } catch (error) {
      this.emit('genius-error', error);
      return { error: error.message, source: 'genius' };
    }
  }

  /**
   * DISCOGS API - Get vinyl/physical release data (free tier)
   */
  async getDiscogsArtistData(artistQuery) {
    try {
      // Search for artist
      const searchResponse = await this.rateLimiters.discogs.execute(
        () => axios.get('https://api.discogs.com/database/search', {
          params: {
            q: artistQuery,
            type: 'artist'
          },
          headers: {
            'User-Agent': this.config.discogsUserAgent
          }
        })
      );

      const artistResult = searchResponse.data.results[0];
      if (!artistResult) return { error: 'Artist not found', source: 'discogs' };

      // Get releases
      const releasesResponse = await this.rateLimiters.discogs.execute(
        () => axios.get(artistResult.resource_url + '/releases', {
          headers: {
            'User-Agent': this.config.discogsUserAgent
          }
        })
      );

      const releases = releasesResponse.data.releases || [];

      return {
        discogsId: artistResult.id,
        name: artistResult.title,
        releaseCount: releases.length,
        releases: releases.slice(0, 10).map(r => ({
          title: r.title,
          year: r.year,
          format: r.basic_information?.format?.[0],
          uri: r.resource_url
        })),
        source: 'discogs',
        quotaCost: 2
      };
    } catch (error) {
      this.emit('discogs-error', error);
      return { error: error.message, source: 'discogs' };
    }
  }

  /**
   * Helper: Get valid Spotify token
   */
  async getSpotifyToken() {
    // Check if we have a valid cached token
    if (this.spotifyToken && this.spotifyTokenExpiry > Date.now()) {
      return this.spotifyToken;
    }

    const auth = Buffer.from(
      `${this.config.spotifyClientId}:${this.config.spotifyClientSecret}`
    ).toString('base64');

    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.spotifyToken = response.data.access_token;
    this.spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000);

    return this.spotifyToken;
  }

  /**
   * Calculate average audio features
   */
  calculateAverageFeatures(features) {
    const valid = features.filter(f => f);
    if (valid.length === 0) return {};

    const avg = {};
    const keys = ['energy', 'danceability', 'valence', 'acousticness', 'instrumentalness'];

    keys.forEach(key => {
      avg[key] = (
        valid.reduce((sum, f) => sum + f[key], 0) / valid.length
      ).toFixed(3);
    });

    return avg;
  }

  /**
   * Extract band members from relationships
   */
  extractBandMembers(relationships) {
    if (!relationships) return [];

    return relationships
      .filter(rel => rel.type === 'member of band' && rel['target-type'] === 'artist')
      .map(rel => rel.artist?.name)
      .filter(Boolean);
  }

  /**
   * Aggregate metrics from all sources
   */
  aggregateMetrics(analyticsResults) {
    const aggregated = {
      followerRange: null,
      estimatedPopularity: null,
      topGenres: [],
      sources: []
    };

    // Combine follower counts
    const followers = [
      analyticsResults[0]?.value?.followers,
      analyticsResults[1]?.value?.subscribers,
      analyticsResults[2]?.value?.listeners
    ].filter(Boolean);

    if (followers.length > 0) {
      const avg = followers.reduce((a, b) => a + b) / followers.length;
      aggregated.estimatedPopularity = Math.round(avg);
    }

    // Combine genres
    const allGenres = [
      ...analyticsResults[0]?.value?.genres || [],
      ...analyticsResults[3]?.value?.tags?.map(t => t.name) || []
    ];

    aggregated.topGenres = [...new Set(allGenres)].slice(0, 5);
    aggregated.sources = analyticsResults
      .map(r => r.value?.source)
      .filter(Boolean);

    return aggregated;
  }

  /**
   * Extract result from Promise.allSettled
   */
  extractResult(result) {
    return result.status === 'fulfilled' ? result.value : null;
  }

  /**
   * Get current quota status
   */
  getQuotaStatus() {
    return {
      youtube: this.rateLimiters.youtube.getStatus(),
      timestamps: {
        spotify: Date.now(),
        lastfm: Date.now(),
        genius: Date.now(),
        musicbrainz: Date.now(),
        discogs: Date.now()
      }
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.flushAll();
  }
}

/**
 * Rate Limiter - Handles request throttling
 */
class RateLimiter {
  constructor(requestsPerSecond = 1, timeWindowMs = 1000) {
    this.requestsPerSecond = requestsPerSecond;
    this.timeWindow = timeWindowMs;
    this.requests = [];
  }

  async execute(fn) {
    // Clean old requests
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // Wait if limit reached
    if (this.requests.length >= this.requestsPerSecond) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Execute request
    this.requests.push(Date.now());
    return fn();
  }
}

/**
 * Quota-Based Limiter - For APIs with daily quotas (like YouTube)
 */
class QuotaBasedLimiter {
  constructor(dailyQuota = 10000) {
    this.dailyQuota = dailyQuota;
    this.used = 0;
    this.resetTime = this.getNextMidnightPT();
  }

  spend(units) {
    this.checkReset();
    this.used += units;
    
    if (this.used > this.dailyQuota) {
      throw new Error(
        `Quota exceeded: ${this.used}/${this.dailyQuota}`
      );
    }
  }

  canExecute(units) {
    this.checkReset();
    return (this.used + units) <= this.dailyQuota;
  }

  getRemainingQuota() {
    this.checkReset();
    return this.dailyQuota - this.used;
  }

  checkReset() {
    if (Date.now() > this.resetTime) {
      this.used = 0;
      this.resetTime = this.getNextMidnightPT();
    }
  }

  getNextMidnightPT() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Adjust for Pacific Time offset
    const ptOffset = -7 * 60 * 60 * 1000; // PDT
    return tomorrow.getTime() + ptOffset;
  }

  getStatus() {
    return {
      used: this.used,
      remaining: this.getRemainingQuota(),
      quota: this.dailyQuota,
      resetTime: new Date(this.resetTime)
    };
  }
}

/**
 * Quota Manager - Track overall quota usage
 */
class QuotaManager {
  constructor() {
    this.quotaUsage = {
      spotify: { used: 0, limit: Infinity },
      youtube: { used: 0, limit: 10000, resetDaily: true },
      lastfm: { used: 0, limit: Infinity },
      genius: { used: 0, limit: Infinity },
      musicbrainz: { used: 0, limit: Infinity },
      discogs: { used: 0, limit: Infinity }
    };
  }

  track(source, cost) {
    if (this.quotaUsage[source]) {
      this.quotaUsage[source].used += cost;
    }
  }

  getStatus() {
    return Object.entries(this.quotaUsage).reduce((acc, [source, data]) => {
      acc[source] = {
        ...data,
        percentage: (data.used / data.limit * 100).toFixed(2) + '%'
      };
      return acc;
    }, {});
  }
}

module.exports = FreeArtistAnalyticsService;
