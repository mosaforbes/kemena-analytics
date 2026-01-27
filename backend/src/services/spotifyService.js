import axios from 'axios';
import config from '../config.js';

let spotifyAccessToken = null;
let tokenExpiry = null;

/**
 * Get Spotify access token using refresh token
 */
export const getSpotifyAccessToken = async () => {
  if (spotifyAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyAccessToken;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: config.SPOTIFY_REFRESH_TOKEN,
        client_id: config.SPOTIFY_CLIENT_ID,
        client_secret: config.SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    spotifyAccessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    console.log('✓ Spotify access token refreshed');
    return spotifyAccessToken;
  } catch (error) {
    console.error('Failed to get Spotify access token:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get artist profile from Spotify
 */
export const getSpotifyArtist = async (artistId) => {
  const token = await getSpotifyAccessToken();
  
  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      id: response.data.id,
      name: response.data.name,
      uri: response.data.uri,
      image: response.data.images[0]?.url,
      followers: response.data.followers.total,
      genres: response.data.genres
    };
  } catch (error) {
    console.error('Failed to get artist from Spotify:', error.message);
    throw error;
  }
};

/**
 * Get artist's top tracks for stream data
 */
export const getSpotifyArtistTracks = async (artistId, limit = 50) => {
  const token = await getSpotifyAccessToken();
  
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}/top/tracks?market=US&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return response.data.tracks.map(track => ({
      id: track.id,
      name: track.name,
      uri: track.uri,
      popularity: track.popularity,
      external_urls: track.external_urls
    }));
  } catch (error) {
    console.error('Failed to get artist tracks from Spotify:', error.message);
    throw error;
  }
};

/**
 * Get playlist data (for playlist additions tracking)
 */
export const getSpotifyPlaylistData = async (playlistId) => {
  const token = await getSpotifyAccessToken();
  
  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      followers: response.data.followers.total,
      tracks_total: response.data.tracks.total
    };
  } catch (error) {
    console.error('Failed to get playlist data from Spotify:', error.message);
    throw error;
  }
};

/**
 * Get current user's profile (for authenticated requests)
 */
export const getSpotifyCurrentUser = async () => {
  const token = await getSpotifyAccessToken();
  
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get current user from Spotify:', error.message);
    throw error;
  }
};

export default {
  getSpotifyAccessToken,
  getSpotifyArtist,
  getSpotifyArtistTracks,
  getSpotifyPlaylistData,
  getSpotifyCurrentUser
};
