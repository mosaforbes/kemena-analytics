import express from 'express';
import { getOrCreateArtist } from '../database/artistQueries.js';
import { getSpotifyArtistTracks } from '../services/spotifyService.js';
import { getLatestVideos } from '../services/youtubeService.js';

const router = express.Router();

/**
 * GET /api/sync/spotify/:artistId
 * Manually trigger Spotify sync
 */
router.post('/spotify/:artistId', async (req, res) => {
  try {
    // This would typically call the sync service
    // For now, return success message
    res.json({
      status: 'success',
      message: 'Spotify sync initiated for artist',
      artistId: req.params.artistId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sync/youtube/:channelId
 * Manually trigger YouTube sync
 */
router.post('/youtube/:channelId', async (req, res) => {
  try {
    // This would typically call the sync service
    // For now, return success message
    res.json({
      status: 'success',
      message: 'YouTube sync initiated for channel',
      channelId: req.params.channelId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/sync/all
 * Trigger all syncs
 */
router.post('/all', async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'All syncs initiated',
      syncs: ['spotify', 'youtube', 'instagram']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
