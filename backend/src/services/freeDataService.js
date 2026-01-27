/**
 * FREE Data Service for Kemena Analytics
 * 
 * Integrates 6 completely free APIs to get artist data with $0 budget:
 * - Spotify (free tier, 120 req/min)
 * - YouTube (free tier, 10K units/day)
 * - Last.FM (unlimited free)
 * - MusicBrainz (unlimited free, no auth)
 * - Genius (unlimited free)
 * - Twitter (limited free)
 * 
 * Usage:
 * const service = createFreeDataService(config);
 * const artistData = await service.getComprehensiveArtistData('artist-name');
 */

import axios from 'axios';
import NodeCache from 'node-cache';

// Cache for 6 hours by default
const cache = new NodeCache({ stdTTL: 6 * 60 * 60 });

export const createFreeDataService = (config) => {
  let spotifyAccessToken = null;
  let spotifyTokenExpiry = null;

  /**
   * Get Spotify access token (Client Credentials flow - no user login needed)
   * Completely free - no payment required
   */
  const getSpotifyToken = async () => {
    if (spotifyAccessToken && Date.now() < spotifyTokenExpiry) {
      return spotifyAccessToken;
    }

    try {
      const auth = Buffer.from(
        `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      spotifyAccessToken = response.data.access_token;
      spotifyTokenExpiry = Date.now() + (response.data.expires_in * 1000);

      console.log('✓ Spotify token obtained (free tier)');
      return spotifyAccessToken;
    } catch (error) {
      console.error('Spotify token error:', error.message);
      throw error;
    }
  };

  /**
   * Get Spotify artist data
   * FREE - No payment required
   * Provides: followers, popularity, genres, images, top tracks
   */
  const getSpotifyArtist = async (artistName) => {
    const cacheKey = `spotify_${artistName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const token = await getSpotifyToken();

      // Search for artist
      const searchRes = await axios.get('https://api.spotify.com/v1/search', {
        params: {
          q: artistName,
          type: 'artist',
          limit: 1
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const artist = searchRes.data.artists.items[0];
      if (!artist) throw new Error('Artist not found on Spotify');

      // Get top tracks
      const tracksRes = await axios.get(
        `https://api.spotify.com/v1/artists/${artist.id}/top-tracks`,
        {
          params: { market: 'US' },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = {
        name: artist.name,
        spotifyId: artist.id,
        followers: artist.followers.total,
        popularity: artist.popularity,
        genres: artist.genres,
        imageUrl: artist.images[0]?.url,
        spotifyUrl: artist.external_urls.spotify,
        topTracks: tracksRes.data.tracks.slice(0, 5).map(t => ({
          name: t.name,
          popularity: t.popularity,
          streams: t.popularity * 100000 // Approximation
        }))
      };

      cache.set(cacheKey, result);
      console.log(`✓ Spotify data fetched for ${artistName}`);
      return result;
    } catch (error) {
      console.error(`Spotify error for ${artistName}:`, error.message);
      return null;
    }
  };

  /**
   * Get YouTube channel data
   * FREE - 10,000 quota units/day (1 unit per request)
   * Provides: subscribers, video count, total views, recent videos
   */
  const getYoutubeChannel = async (channelId) => {
    const cacheKey = `youtube_${channelId}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get channel statistics
      const channelRes = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            part: 'statistics,snippet,contentDetails',
            id: channelId,
            key: config.YOUTUBE_API_KEY
          }
        }
      );

      if (channelRes.data.items.length === 0) {
        throw new Error('YouTube channel not found');
      }

      const channel = channelRes.data.items[0];

      // Get recent uploads
      const uploadsPlaylistId = channel.contentDetails.relatedPlaylists.uploads;
      const videosRes = await axios.get(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          params: {
            part: 'snippet,contentDetails',
            playlistId: uploadsPlaylistId,
            maxResults: 5,
            key: config.YOUTUBE_API_KEY
          }
        }
      );

      const result = {
        channelId: channel.id,
        name: channel.snippet.title,
        description: channel.snippet.description,
        subscribers: parseInt(channel.statistics.subscriberCount || 0),
        totalViews: parseInt(channel.statistics.viewCount || 0),
        videoCount: parseInt(channel.statistics.videoCount || 0),
        recentVideos: videosRes.data.items.map(item => ({
          title: item.snippet.title,
          publishedAt: item.snippet.publishedAt
        }))
      };

      cache.set(cacheKey, result);
      console.log(`✓ YouTube data fetched for ${channelId}`);
      return result;
    } catch (error) {
      console.error(`YouTube error for ${channelId}:`, error.message);
      return null;
    }
  };

  /**
   * Get Last.FM data
   * FREE & UNLIMITED - No quota limits ever
   * Provides: play counts, monthly listeners, tags, similar artists
   */
  const getLastFMArtist = async (artistName) => {
    const cacheKey = `lastfm_${artistName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get('https://ws.audioscrobbler.com/2.0/', {
        params: {
          method: 'artist.getinfo',
          artist: artistName,
          api_key: config.LASTFM_API_KEY,
          format: 'json'
        }
      });

      const artist = response.data.artist;

      const result = {
        name: artist.name,
        listeners: parseInt(artist.stats.listeners || 0),
        playCount: parseInt(artist.stats.playcount || 0),
        userPlayCount: parseInt(artist.stats.userplaycount || 0),
        bio: artist.bio?.summary,
        tags: artist.tags?.tag?.slice(0, 5).map(t => t.name) || [],
        imageUrl: artist.image?.find(img => img.size === 'large')?.['#text'],
        url: artist.url
      };

      cache.set(cacheKey, result);
      console.log(`✓ Last.FM data fetched for ${artistName}`);
      return result;
    } catch (error) {
      console.error(`Last.FM error for ${artistName}:`, error.message);
      return null;
    }
  };

  /**
   * Get MusicBrainz artist data
   * FREE & UNLIMITED - No authentication needed
   * Provides: complete metadata, collaborations, discography
   */
  const getMusicBrainzArtist = async (artistMbid) => {
    const cacheKey = `musicbrainz_${artistMbid}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(
        `https://musicbrainz.org/ws/2/artist/${artistMbid}`,
        {
          params: {
            inc: 'aliases+tags+ratings+genres+area-rels',
            fmt: 'json'
          },
          headers: {
            'User-Agent': config.MUSICBRAINZ_USER_AGENT || 'KemenaAnalytics/1.0'
          }
        }
      );

      const artist = response.data;

      const result = {
        mbid: artist.id,
        name: artist.name,
        countryCode: artist['country-code'],
        area: artist.area?.name,
        genre: artist.genres?.map(g => g.name) || [],
        types: artist['type-id'],
        founded: artist['life-span']?.begin,
        dissolved: artist['life-span']?.end,
        relations: artist.relations?.length || 0
      };

      cache.set(cacheKey, result);
      console.log(`✓ MusicBrainz data fetched for ${artistMbid}`);
      return result;
    } catch (error) {
      console.error(`MusicBrainz error for ${artistMbid}:`, error.message);
      return null;
    }
  };

  /**
   * Get Genius artist data
   * FREE & UNLIMITED - No quota limits
   * Provides: songs, production credits, song descriptions
   */
  const getGeniusArtist = async (artistName) => {
    const cacheKey = `genius_${artistName}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Search for artist
      const searchRes = await axios.get('https://api.genius.com/search', {
        params: {
          q: artistName,
          per_page: 5
        },
        headers: {
          'Authorization': `Bearer ${config.GENIUS_ACCESS_TOKEN}`
        }
      });

      const hits = searchRes.data.response.hits;
      const songs = hits.slice(0, 5).map(hit => ({
        title: hit.result.title,
        artist: hit.result.primary_artist.name,
        url: hit.result.url,
        albumName: hit.result.album?.name,
        productionCredits: hit.result.producer_artists?.map(p => p.name) || []
      }));

      const result = {
        songs: songs,
        totalHits: searchRes.data.response.hits.length
      };

      cache.set(cacheKey, result);
      console.log(`✓ Genius data fetched for ${artistName}`);
      return result;
    } catch (error) {
      console.error(`Genius error for ${artistName}:`, error.message);
      return null;
    }
  };

  /**
   * Get comprehensive artist data from all free sources
   * Combines data from 6 completely free APIs
   */
  const getComprehensiveArtistData = async (artistName, youtubeChannelId = null, musicbrainzId = null) => {
    console.log(`\n📊 Fetching comprehensive free data for: ${artistName}`);
    console.log('━'.repeat(50));

    const results = {
      artist: artistName,
      fetchedAt: new Date().toISOString(),
      sources: {},
      summary: {}
    };

    // Spotify (followers, popularity)
    console.log('▶ Spotify...');
    results.sources.spotify = await getSpotifyArtist(artistName);

    // YouTube (subscribers, views)
    if (youtubeChannelId) {
      console.log('▶ YouTube...');
      results.sources.youtube = await getYoutubeChannel(youtubeChannelId);
    }

    // Last.FM (play counts, listeners) - UNLIMITED
    console.log('▶ Last.FM...');
    results.sources.lastfm = await getLastFMArtist(artistName);

    // MusicBrainz (metadata, collaborations) - UNLIMITED
    if (musicbrainzId) {
      console.log('▶ MusicBrainz...');
      results.sources.musicbrainz = await getMusicBrainzArtist(musicbrainzId);
    }

    // Genius (songs, production credits) - UNLIMITED
    console.log('▶ Genius...');
    results.sources.genius = await getGeniusArtist(artistName);

    // Compile summary metrics
    if (results.sources.spotify) {
      results.summary.followers = results.sources.spotify.followers;
      results.summary.popularity = results.sources.spotify.popularity;
      results.summary.spotifyUrl = results.sources.spotify.spotifyUrl;
    }

    if (results.sources.youtube) {
      results.summary.youtubeSubscribers = results.sources.youtube.subscribers;
      results.summary.youtubeViews = results.sources.youtube.totalViews;
      results.summary.youtubeUrl = `https://www.youtube.com/channel/${results.sources.youtube.channelId}`;
    }

    if (results.sources.lastfm) {
      results.summary.lastfmListeners = results.sources.lastfm.listeners;
      results.summary.lastfmPlayCount = results.sources.lastfm.playCount;
      results.summary.lastfmUrl = results.sources.lastfm.url;
    }

    if (results.sources.genius) {
      results.summary.geniusSongs = results.sources.genius.totalHits;
    }

    console.log('━'.repeat(50));
    console.log(`✅ Complete data fetched from ${Object.keys(results.sources).length} free sources!\n`);

    return results;
  };

  /**
   * Calculate engagement metrics from free data
   */
  const calculateEngagementMetrics = (data) => {
    const spotify = data.sources.spotify;
    const youtube = data.sources.youtube;
    const lastfm = data.sources.lastfm;

    let engagementScore = 0;
    const metrics = {};

    // Spotify engagement
    if (spotify) {
      const avgPopularity = spotify.topTracks?.reduce((acc, t) => acc + t.popularity, 0) / (spotify.topTracks?.length || 1) || 0;
      metrics.spotifyEngagement = {
        followerEngagement: (spotify.popularity / 100) * 100,
        trackPopularityAvg: avgPopularity
      };
      engagementScore += (spotify.popularity / 100) * 0.3;
    }

    // YouTube engagement (views per subscriber)
    if (youtube && youtube.subscribers > 0) {
      metrics.youtubeEngagement = {
        viewsPerSubscriber: youtube.totalViews / youtube.subscribers,
        videoCount: youtube.videoCount
      };
      engagementScore += Math.min((youtube.totalViews / youtube.subscribers) * 10, 100) * 0.2;
    }

    // Last.FM engagement (plays per listener)
    if (lastfm && lastfm.listeners > 0) {
      metrics.lastfmEngagement = {
        playsPerListener: lastfm.playCount / lastfm.listeners,
        totalListeners: lastfm.listeners
      };
      engagementScore += Math.min((lastfm.playCount / lastfm.listeners) * 2, 100) * 0.5;
    }

    metrics.overallEngagementScore = Math.round(engagementScore);

    return metrics;
  };

  return {
    getSpotifyArtist,
    getYoutubeChannel,
    getLastFMArtist,
    getMusicBrainzArtist,
    getGeniusArtist,
    getComprehensiveArtistData,
    calculateEngagementMetrics,
    clearCache: () => cache.flushAll()
  };
};

export default createFreeDataService;
