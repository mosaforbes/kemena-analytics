import express from 'express';
import { getOrCreateArtist, getLatestMetrics, getMetricsHistory, calculateGrowth } from '../database/artistQueries.js';

const router = express.Router();

/**
 * GET /api/artists/:artistId
 * Get artist details
 */
router.get('/:artistId', async (req, res) => {
  try {
    const artist = await getOrCreateArtist(req.params.artistId);
    const metrics = await getLatestMetrics(artist.id);
    
    res.json({
      artist,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching artist:', error.message);
    // Return mock data if database isn't ready
    res.json({
      artist: { id: 1, name: req.params.artistId, spotify_id: null },
      metrics: null,
      timestamp: new Date().toISOString(),
      warning: 'Database not yet initialized. Use /api/sync/all to populate data.'
    });
  }
});

/**
 * GET /api/artists/:artistId/metrics
 * Get metrics history
 */
router.get('/:artistId/metrics', async (req, res) => {
  try {
    const artist = await getOrCreateArtist(req.params.artistId);
    const days = req.query.days || 30;
    
    const history = await getMetricsHistory(artist.id, days);
    const growth = await calculateGrowth(artist.id, days);
    
    res.json({
      artist,
      metrics: history || [],
      growth,
      period: `${days} days`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching metrics history:', error.message);
    res.json({
      artist: { name: req.params.artistId },
      metrics: [],
      period: '30 days',
      warning: 'Database not yet initialized',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/artists/:artistId/metrics/latest
 * Get latest metrics (for dashboard)
 */
router.get('/:artistId/metrics/latest', async (req, res) => {
  try {
    const artist = await getOrCreateArtist(req.params.artistId);
    const metrics = await getLatestMetrics(artist.id);
    
    if (!metrics) {
      return res.json({
        artist,
        metrics: null,
        message: 'No metrics found. Run /api/sync/all to collect data.',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      artist,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching latest metrics:', error.message);
    res.json({
      artist: { name: req.params.artistId },
      metrics: null,
      warning: 'Database not initialized. Run migrations first.',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
