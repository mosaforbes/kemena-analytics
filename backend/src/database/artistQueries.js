import { query } from '../database/db.js';
import { getSpotifyArtist } from '../services/spotifyService.js';
import { getChannelStats } from '../services/youtubeService.js';

/**
 * Get or create artist
 */
export const getOrCreateArtist = async (name, spotifyId = null) => {
  try {
    let artist = await query(
      'SELECT * FROM artists WHERE name = $1 OR spotify_id = $2',
      [name, spotifyId]
    );

    if (artist.rows.length > 0) {
      return artist.rows[0];
    }

    // Create new artist
    const result = await query(
      'INSERT INTO artists (name, spotify_id) VALUES ($1, $2) RETURNING *',
      [name, spotifyId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error in getOrCreateArtist:', error);
    throw error;
  }
};

/**
 * Record metrics for a specific date
 */
export const recordMetrics = async (artistId, metricsData) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO metrics (
        artist_id, metric_date,
        spotify_followers, spotify_monthly_listeners, spotify_streams_monthly, spotify_streams_total,
        spotify_playlist_reach, spotify_playlist_adds_monthly, spotify_saves_monthly,
        youtube_subscribers, youtube_views_monthly, youtube_views_total,
        instagram_followers, instagram_engagement_rate,
        engagement_ratio, momentum_score
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) ON CONFLICT (artist_id, metric_date) DO UPDATE SET
        spotify_followers = EXCLUDED.spotify_followers,
        spotify_monthly_listeners = EXCLUDED.spotify_monthly_listeners,
        spotify_streams_monthly = EXCLUDED.spotify_streams_monthly,
        spotify_streams_total = EXCLUDED.spotify_streams_total,
        spotify_playlist_reach = EXCLUDED.spotify_playlist_reach,
        spotify_playlist_adds_monthly = EXCLUDED.spotify_playlist_adds_monthly,
        spotify_saves_monthly = EXCLUDED.spotify_saves_monthly,
        youtube_subscribers = EXCLUDED.youtube_subscribers,
        youtube_views_monthly = EXCLUDED.youtube_views_monthly,
        youtube_views_total = EXCLUDED.youtube_views_total,
        instagram_followers = EXCLUDED.instagram_followers,
        instagram_engagement_rate = EXCLUDED.instagram_engagement_rate,
        engagement_ratio = EXCLUDED.engagement_ratio,
        momentum_score = EXCLUDED.momentum_score
      RETURNING *`,
      [
        artistId, today,
        metricsData.spotify?.followers,
        metricsData.spotify?.monthly_listeners,
        metricsData.spotify?.streams_monthly,
        metricsData.spotify?.streams_total,
        metricsData.spotify?.playlist_reach,
        metricsData.spotify?.playlist_adds_monthly,
        metricsData.spotify?.saves_monthly,
        metricsData.youtube?.subscribers,
        metricsData.youtube?.views_monthly,
        metricsData.youtube?.views_total,
        metricsData.instagram?.followers,
        metricsData.instagram?.engagement_rate,
        metricsData.engagement_ratio,
        metricsData.momentum_score
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error recording metrics:', error);
    throw error;
  }
};

/**
 * Get metrics history for artist
 */
export const getMetricsHistory = async (artistId, days = 30) => {
  try {
    const result = await query(
      `SELECT * FROM metrics 
       WHERE artist_id = $1 
       AND metric_date >= NOW() - make_interval(days => $2)
       ORDER BY metric_date DESC`,
      [artistId, days]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting metrics history:', error);
    throw error;
  }
};

/**
 * Get latest metrics
 */
export const getLatestMetrics = async (artistId) => {
  try {
    const result = await query(
      `SELECT * FROM metrics 
       WHERE artist_id = $1 
       ORDER BY metric_date DESC 
       LIMIT 1`,
      [artistId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting latest metrics:', error);
    throw error;
  }
};

/**
 * Calculate metrics growth
 */
export const calculateGrowth = async (artistId, days = 30) => {
  try {
    const result = await query(
      `SELECT 
        (FIRST_VALUE(spotify_followers) OVER (ORDER BY metric_date DESC) - 
         FIRST_VALUE(spotify_followers) OVER (ORDER BY metric_date ASC)) as followers_change,
        (FIRST_VALUE(spotify_monthly_listeners) OVER (ORDER BY metric_date DESC) - 
         FIRST_VALUE(spotify_monthly_listeners) OVER (ORDER BY metric_date ASC)) as listeners_change,
        (FIRST_VALUE(youtube_subscribers) OVER (ORDER BY metric_date DESC) - 
         FIRST_VALUE(youtube_subscribers) OVER (ORDER BY metric_date ASC)) as youtube_change
       FROM metrics 
       WHERE artist_id = $1 
       AND metric_date >= NOW() - make_interval(days => $2)
       LIMIT 1`,
      [artistId, days]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error calculating growth:', error);
    throw error;
  }
};

export default {
  getOrCreateArtist,
  recordMetrics,
  getMetricsHistory,
  getLatestMetrics,
  calculateGrowth
};
