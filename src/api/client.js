/**
 * API Client for Kemena Analytics Backend
 * Handles all communication with the Express backend
 */

class APIClient {
  constructor() {
    // Determine backend URL based on environment
    this.backendURL = this.getBackendURL();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get the backend URL from environment or use default
   */
  getBackendURL() {
    // Check if running in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // For production, use Railway URL or configured value
    const railwayURL = window.__BACKEND_URL__;
    if (railwayURL) {
      return railwayURL;
    }
    
    // Fallback: try to infer from Railway environment
    // Railway sets PORT env var, but we need to construct the public URL
    // This should be set in the frontend HTML file
    console.warn('Backend URL not configured. Please set window.__BACKEND_URL__');
    return null;
  }

  /**
   * Fetch artist data with metrics
   * GET /api/artists/:artistId
   */
  async getArtist(artistId) {
    return this.cachedFetch(`/api/artists/${artistId}`);
  }

  /**
   * Fetch metric history for an artist
   * GET /api/artists/:artistId/metrics
   */
  async getMetricHistory(artistId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    const query = params.toString();
    const url = `/api/artists/${artistId}/metrics${query ? '?' + query : ''}`;
    return this.cachedFetch(url);
  }

  /**
   * Fetch latest metrics snapshot
   * GET /api/artists/:artistId/metrics/latest
   */
  async getLatestMetrics(artistId) {
    return this.cachedFetch(`/api/artists/${artistId}/metrics/latest`);
  }

  /**
   * Trigger Spotify sync for an artist
   * POST /api/sync/spotify/:artistId
   */
  async syncSpotify(artistId) {
    return this.fetch(`/api/sync/spotify/${artistId}`, {
      method: 'POST'
    });
  }

  /**
   * Trigger YouTube sync
   * POST /api/sync/youtube/:channelId
   */
  async syncYouTube(channelId) {
    return this.fetch(`/api/sync/youtube/${channelId}`, {
      method: 'POST'
    });
  }

  /**
   * Trigger all syncs
   * POST /api/sync/all
   */
  async syncAll() {
    return this.fetch(`/api/sync/all`, {
      method: 'POST'
    });
  }

  /**
   * Get sync status
   * GET /api/sync/status
   */
  async getSyncStatus() {
    return this.cachedFetch(`/api/sync/status`, 1 * 60 * 1000); // 1 minute cache
  }

  /**
   * Check backend health
   * GET /health
   */
  async checkHealth() {
    try {
      const response = await this.fetch('/health', { noCache: true });
      return response.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Internal fetch with error handling
   */
  async fetch(endpoint, options = {}) {
    if (!this.backendURL) {
      throw new Error('Backend URL not configured');
    }

    const url = `${this.backendURL}${endpoint}`;
    const fetchOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Fetch with caching
   */
  async cachedFetch(endpoint, customTimeout = null) {
    const timeout = customTimeout || this.cacheTimeout;
    const cacheKey = endpoint;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < timeout) {
        console.log(`Cache hit for ${endpoint}`);
        return cached.data;
      }
    }

    // Fetch fresh data
    const data = await this.fetch(endpoint);
    
    // Cache it
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cache entry
   */
  clearCacheEntry(endpoint) {
    this.cache.delete(endpoint);
  }

  /**
   * Set backend URL (useful for testing)
   */
  setBackendURL(url) {
    this.backendURL = url;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Also export class for testing
export default APIClient;
