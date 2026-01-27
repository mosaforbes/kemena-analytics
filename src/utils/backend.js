/**
 * Backend Configuration & Utilities
 * Manages communication with the backend API
 */

// Configure your Railway backend URL here
// Update this with your actual Railway service URL
const BACKEND_CONFIG = {
  // Development
  development: 'http://localhost:5000',
  
  // Production - Replace with your Railway service URL
  // Format: https://yourusername-kemena-analytics-backend-production.railway.app
  production: 'https://yourusername-kemena-analytics-backend-production.railway.app'
};

export const getBackendURL = () => {
  // Check if we're in development
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Try to get from window config (can be set in HTML)
  if (window.__BACKEND_URL__) {
    return window.__BACKEND_URL__;
  }
  
  return isDev ? BACKEND_CONFIG.development : BACKEND_CONFIG.production;
};

/**
 * Parse metric data from backend for dashboard display
 */
export const parseMetricData = (data) => {
  if (!data) return null;
  
  return {
    spotify: {
      followers: data.spotify_followers || 0,
      monthlyListeners: data.spotify_monthly_listeners || 0,
      monthlyStreams: data.spotify_streams_monthly || 0,
      playlistReach: data.spotify_playlist_reach || 0,
      playlistAdds: data.spotify_playlist_adds_monthly || 0,
      saves: data.spotify_saves_monthly || 0
    },
    youtube: {
      subscribers: data.youtube_subscribers || 0,
      monthlyViews: data.youtube_views_monthly || 0,
      totalViews: data.youtube_views_total || 0
    },
    instagram: {
      followers: data.instagram_followers || 0,
      engagementRate: data.instagram_engagement_rate || 0
    },
    computed: {
      engagementRatio: data.engagement_ratio || 0,
      momentumScore: data.momentum_score || 0
    }
  };
};

/**
 * Generate mock data for testing when backend is unavailable
 */
export const generateMockMetric = (artistName) => {
  const today = new Date();
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    id: Math.floor(Math.random() * 10000),
    name: artistName,
    spotify_followers: Math.floor(50000 + Math.random() * 100000),
    spotify_monthly_listeners: Math.floor(10000 + Math.random() * 50000),
    spotify_streams_monthly: Math.floor(100000 + Math.random() * 500000),
    spotify_playlist_reach: Math.floor(50 + Math.random() * 200),
    spotify_playlist_adds_monthly: Math.floor(10 + Math.random() * 50),
    spotify_saves_monthly: Math.floor(100 + Math.random() * 1000),
    youtube_subscribers: Math.floor(10000 + Math.random() * 100000),
    youtube_views_monthly: Math.floor(50000 + Math.random() * 500000),
    instagram_followers: Math.floor(5000 + Math.random() * 50000),
    instagram_engagement_rate: (2 + Math.random() * 8).toFixed(2),
    engagement_ratio: (Math.random() * 10).toFixed(4),
    momentum_score: Math.floor(50 + Math.random() * 50),
    metric_date: today.toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };
};

/**
 * Generate chart data from metric history
 */
export const generateChartData = (metrics) => {
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return [];
  }

  return metrics
    .sort((a, b) => new Date(a.metric_date) - new Date(b.metric_date))
    .map((metric) => ({
      date: metric.metric_date,
      followers: metric.spotify_followers || 0,
      listeners: metric.spotify_monthly_listeners || 0,
      streams: metric.spotify_streams_monthly || 0,
      playlists: metric.spotify_playlist_reach || 0,
      youtubeSubscribers: metric.youtube_subscribers || 0,
      youtubeViews: metric.youtube_views_monthly || 0,
      momentum: metric.momentum_score || 0
    }));
};

/**
 * Format numbers for display
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Get trend direction
 */
export const getTrendDirection = (value) => {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'stable';
};

export default {
  getBackendURL,
  parseMetricData,
  generateMockMetric,
  generateChartData,
  formatNumber,
  calculateGrowth,
  getTrendDirection
};
