/**
 * Configuration file for Kemena Analytics Dashboard
 * Centralized settings for easy maintenance and customization
 */

const CONFIG = {
  // Application Info
  APP_NAME: 'KEMENA',
  APP_SUBTITLE: 'Artist Intelligence Report',
  ARTIST_NAME: 'Kemena',
  GENRE: 'Afrobeat',

  // Data Sources
  DATA_URL: './src/data/analytics.json',
  AUTO_REFRESH: false, // Set to true for auto-refresh
  REFRESH_INTERVAL_MS: 60000, // 1 minute

  // Thresholds for insights and opportunities
  THRESHOLDS: {
    ENGAGEMENT_MIN: 4,              // Engagement multiplier threshold
    GROWTH_MIN: 1,                  // Follower growth % threshold
    RADIO_SPINS_MIN: 50,            // Radio spins threshold
    PLAYLIST_REACH_MIN: 50000,      // Minimum playlist reach
    YOUTUBE_SUBSCRIBERS_MIN: 1000,  // YouTube monetization threshold
    INSTAGRAM_STAGNATION_DAYS: 30   // Days to consider as stagnation
  },

  // UI Configuration
  UI: {
    COLORS: ['#667eea', '#f093fb', '#4facfe', '#43e97b'],
    THEME: 'dark', // 'dark' or 'light'
    ANIMATIONS_ENABLED: true,
    RESPONSIVE_BREAKPOINTS: {
      mobile: 480,
      tablet: 768,
      desktop: 1200
    }
  },

  // Chart Configuration
  CHARTS: {
    SHOW_PLATFORM_DISTRIBUTION: true,
    SHOW_GROWTH_VELOCITY: true,
    SHOW_PERFORMANCE_RADAR: true,
    DEFAULT_HEIGHT: 300,
    RADAR_HEIGHT: 400
  },

  // Feature Flags
  FEATURES: {
    SHOW_HISTORY: true,
    SHOW_COMPARATIVES: true,
    SHOW_STRATEGIC_IMPERATIVES: true,
    ENABLE_EXPORT: false, // Can be enabled for premium features
    ENABLE_ALERTS: false   // Can be enabled for real-time notifications
  },

  // Storage Configuration
  STORAGE: {
    HISTORY_KEY: 'kemena_history',
    MAX_HISTORY_ITEMS: 50,
    STORAGE_ENABLED: true
  },

  // Display Configuration
  DISPLAY: {
    TIMESTAMP_FORMAT: 'en-US',
    SHOW_TIMESTAMPS: true,
    LOADING_TIMEOUT_MS: 5000,
    ERROR_RETRY_ATTEMPTS: 3
  }
};

// Validate configuration on load
(function validateConfig() {
  if (!CONFIG.ARTIST_NAME) console.warn('CONFIG: Artist name not set');
  if (!CONFIG.DATA_URL) console.warn('CONFIG: Data URL not set');
  if (!CONFIG.THRESHOLDS.ENGAGEMENT_MIN) console.warn('CONFIG: Invalid engagement threshold');
})();
