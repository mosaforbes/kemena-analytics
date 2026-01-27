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
      metrics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      metrics: history,
      growth,
      period: `${days} days`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      return res.status(404).json({ error: 'No metrics found for this artist' });
    }
    
    res.json({
      artist,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
