import NodeCache from 'node-cache';
import { getSpotifyArtist, getSpotifyArtistTracks } from '../services/spotifyService.js';
import { getChannelStats, getLatestVideos } from '../services/youtubeService.js';
import { getOrCreateArtist, recordMetrics } from '../database/artistQueries.js';
import config from '../config.js';

// Cache data for 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

/**
 * Sync all data from external APIs
 */
export const syncAllData = async () => {
  try {
    console.log('Starting full data sync...');
    
    // Get or create artist
    const artist = await getOrCreateArtist(config.ARTIST_NAME);
    
    // Sync Spotify data
    console.log('Syncing Spotify data...');
    const spotifyData = await syncSpotifyData(artist.id, artist.spotify_id);
    
    // Sync YouTube data
    console.log('Syncing YouTube data...');
    const youtubeData = await syncYouTubeData();
    
    // Combine and record metrics
    const combinedMetrics = {
      ...spotifyData,
      youtube: youtubeData,
      engagement_ratio: calculateEngagementRatio(spotifyData),
      momentum_score: calculateMomentumScore(spotifyData, youtubeData)
    };
    
    const recorded = await recordMetrics(artist.id, combinedMetrics);
    
    console.log('✓ Full sync completed successfully');
    return {
      artist,
      metrics: recorded,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in syncAllData:', error);
    throw error;
  }
};

/**
 * Sync Spotify data
 */
export const syncSpotifyData = async (artistId, spotifyId = null) => {
  try {
    const cacheKey = `spotify_${artistId}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('Returning cached Spotify data');
      return cached;
    }

    // Get artist profile (if we have spotify ID)
    let artistProfile = null;
    if (spotifyId) {
      try {
        artistProfile = await getSpotifyArtist(spotifyId);
      } catch (error) {
        console.warn('Could not fetch Spotify artist profile:', error.message);
      }
    }

    // Mock data for demonstration
    // In production, this would fetch real data from Spotify API
    const spotifyData = {
      spotify: {
        followers: artistProfile?.followers || 2547,
        monthly_listeners: 12450,
        streams_monthly: 45670,
        streams_total: 567890,
        playlist_reach: 1230,
        playlist_adds_monthly: 89,
        saves_monthly: 234
      }
    };

    cache.set(cacheKey, spotifyData);
    return spotifyData;
  } catch (error) {
    console.error('Error syncing Spotify data:', error);
    throw error;
  }
};

/**
 * Sync YouTube data
 */
export const syncYouTubeData = async () => {
  try {
    const cacheKey = 'youtube_data';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('Returning cached YouTube data');
      return cached;
    }

    // Mock data for demonstration
    // In production, this would fetch real data from YouTube API
    const youtubeData = {
      subscribers: 1245,
      views_monthly: 23450,
      views_total: 567890
    };

    cache.set(cacheKey, youtubeData);
    return youtubeData;
  } catch (error) {
    console.error('Error syncing YouTube data:', error);
    throw error;
  }
};

/**
 * Calculate engagement ratio
 */
const calculateEngagementRatio = (spotifyData) => {
  const monthlyListeners = spotifyData.spotify?.monthly_listeners || 1;
  const followers = spotifyData.spotify?.followers || 1;
  return (monthlyListeners / followers).toFixed(2);
};

/**
 * Calculate momentum score
 */
const calculateMomentumScore = (spotifyData, youtubeData) => {
  const weights = {
    followers: 0.25,
    streams: 0.30,
    engagement: 0.25,
    youtube: 0.20
  };

  const followerScore = Math.min((spotifyData.spotify?.followers / 5000) * 100, 100);
  const streamScore = Math.min((spotifyData.spotify?.streams_monthly / 50000) * 100, 100);
  const engagementScore = Math.min((calculateEngagementRatio(spotifyData) * 20), 100);
  const youtubeScore = Math.min((youtubeData.subscribers / 2000) * 100, 100);

  return Math.round(
    (followerScore * weights.followers) +
    (streamScore * weights.streams) +
    (engagementScore * weights.engagement) +
    (youtubeScore * weights.youtube)
  );
};

export default {
  syncAllData,
  syncSpotifyData,
  syncYouTubeData
};
