import axios from 'axios';
import config from '../config.js';

/**
 * Get channel statistics
 */
export const getChannelStats = async () => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'statistics,snippet,brandingSettings',
        forUsername: config.YOUTUBE_CHANNEL_ID.startsWith('UC') ? undefined : config.YOUTUBE_CHANNEL_ID,
        id: config.YOUTUBE_CHANNEL_ID.startsWith('UC') ? config.YOUTUBE_CHANNEL_ID : undefined,
        key: config.YOUTUBE_API_KEY
      }
    });

    if (response.data.items.length === 0) {
      throw new Error('YouTube channel not found');
    }

    const channel = response.data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscribers: parseInt(channel.statistics.subscriberCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
      viewCount: parseInt(channel.statistics.viewCount || 0)
    };
  } catch (error) {
    console.error('Failed to get YouTube channel stats:', error.message);
    throw error;
  }
};

/**
 * Get latest videos
 */
export const getLatestVideos = async (maxResults = 10) => {
  try {
    const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        channelId: config.YOUTUBE_CHANNEL_ID.startsWith('UC') ? config.YOUTUBE_CHANNEL_ID : undefined,
        forUsername: config.YOUTUBE_CHANNEL_ID.startsWith('UC') ? undefined : config.YOUTUBE_CHANNEL_ID,
        order: 'date',
        maxResults: maxResults,
        key: config.YOUTUBE_API_KEY,
        type: 'video'
      }
    });

    const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'statistics,snippet,contentDetails',
        id: videoIds,
        key: config.YOUTUBE_API_KEY
      }
    });

    return statsResponse.data.items.map(video => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnail: video.snippet.thumbnails.default.url,
      viewCount: parseInt(video.statistics.viewCount || 0),
      likeCount: parseInt(video.statistics.likeCount || 0),
      commentCount: parseInt(video.statistics.commentCount || 0),
      duration: video.contentDetails.duration
    }));
  } catch (error) {
    console.error('Failed to get YouTube videos:', error.message);
    throw error;
  }
};

export default {
  getChannelStats,
  getLatestVideos
};
