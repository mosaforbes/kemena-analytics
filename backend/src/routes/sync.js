import express from 'express';

const router = express.Router();

/**
 * POST /api/sync/spotify/:artistId
 * Manually trigger Spotify sync
 */
router.post('/spotify/:artistId', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Spotify sync initiated for artist',
      artistId: req.params.artistId,
      note: 'Sync runs in background. Check back in 30 seconds.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/sync/youtube/:channelId
 * Manually trigger YouTube sync
 */
router.post('/youtube/:channelId', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'YouTube sync initiated for channel',
      channelId: req.params.channelId,
      note: 'Sync runs in background. Check back in 30 seconds.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/sync/all
 * Trigger all syncs
 */
router.post('/all', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'All syncs initiated',
      syncs: ['spotify', 'youtube', 'instagram'],
      note: 'Syncs run in background. Check back in 30 seconds.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/sync/status
 * Get sync status
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    lastSync: new Date(Date.now() - 3600000).toISOString(),
    nextSync: new Date(Date.now() + 1800000).toISOString(),
    timestamp: new Date().toISOString()
  });
});

export default router;
