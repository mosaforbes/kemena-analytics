# Backend Integration Setup Guide

## Overview

Your backend is now live on Railway! This guide explains what's been set up and what requires your configuration.

## What's Already Done ✅

### Backend Infrastructure
- ✅ Node.js/Express server deployed on Railway
- ✅ PostgreSQL database connected
- ✅ API routes created and tested
- ✅ Error handling with graceful degradation
- ✅ Health check endpoint available at `/health`

### Database Schema
The PostgreSQL database has 5 tables ready for migrations:
- `artists` - Artist profiles (Spotify ID, URI, timestamps)
- `metrics` - Time-series metrics data (Spotify, YouTube, Instagram metrics)
- `campaigns` - Campaign tracking (song names, goals, progress)
- `sync_logs` - API sync operation logs
- `insights` - AI-generated insights and recommendations

### Frontend Infrastructure  
- ✅ API client module created (`src/api/client.js`)
- ✅ Backend utilities module created (`src/utils/backend.js`)
- ✅ Migration runner script created (`backend/scripts/run-migrations.js`)

## What Requires Your Input 🔑

### 1. **Run Database Migrations**

The schema exists but hasn't been applied to your PostgreSQL database yet.

**Option A: Using Railway Dashboard**
1. Go to your Railway project: https://railway.com/project/a2d8a842-30c2-4bba-93bc-aff819459df9
2. Click on the PostgreSQL plugin
3. Open the "Query" tab
4. Copy-paste the migration script from `backend/scripts/run-migrations.js` and execute it

**Option B: Using Command Line**
```bash
# From your workspace
cd /workspaces/kemena-analytics

# Set your Railway database URL (get from Railway dashboard PostgreSQL plugin)
export DATABASE_URL="postgresql://..."

# Run migrations
node backend/scripts/run-migrations.js
```

**Verify migrations ran successfully:**
- Check Railway database logs for "✅ All migrations completed successfully!"
- Your database will show 5 tables: artists, metrics, campaigns, sync_logs, insights

### 2. **Configure Backend URL in Frontend**

Update `src/utils/backend.js` with your Railway service URL:

```javascript
const BACKEND_CONFIG = {
  development: 'http://localhost:5000',
  // Find this URL in Railway dashboard > Service details
  production: 'https://your-actual-railway-url.railway.app'
};
```

**To find your Railway backend URL:**
1. Log into Railway: https://railway.com
2. Click your project
3. Click the Service (Node.js app)
4. Look for "Service URL" or "Domains" section
5. Copy the full URL (should look like `https://youname-kemena-analytics-backend-production.railway.app`)

**OR set it dynamically in index.html:**
```html
<script>
  // Add this before other scripts load
  window.__BACKEND_URL__ = 'https://your-railway-url.railway.app';
</script>
```

### 3. **Add API Credentials (Optional - For Real Data)**

To fetch real data from Spotify and YouTube, add your API keys to Railway:

**In Railway Dashboard:**
1. Go to your Service settings
2. Add these environment variables:

```
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_channel_id
```

**How to get these:**

**Spotify:**
- Go to https://developer.spotify.com/dashboard
- Create an app
- Copy Client ID and Client Secret
- For refresh token, use the Spotify Web API auth flow

**YouTube:**
- Go to https://console.developers.google.com/
- Create a project
- Enable YouTube Data API v3
- Create an API key
- Get your channel ID from your YouTube channel

### 4. **Test the Backend Connection**

Once you have the backend URL configured, you can test:

```bash
# Check if backend is healthy
curl https://your-railway-url.railway.app/health

# Expected response:
# {"status":"ok"}
```

### 5. **Update Frontend Dashboard**

The frontend needs to be updated to use the backend API. Edit `index.html` to use:

```javascript
// Instead of fetching from local JSON file
const response = await fetch(CONFIG.DATA_URL);

// Use the API client
import { apiClient } from './src/api/client.js';
const artistData = await apiClient.getArtist('spotify-artist-id');
```

**Example integration:**
```javascript
const loadData = async () => {
  try {
    // Set your artist ID (replace with actual Spotify artist ID)
    const artistId = 'your-spotify-artist-id';
    
    const data = await apiClient.getArtist(artistId);
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    // Fallback to mock data
  }
};
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  (GitHub Pages or Vercel - Served from index.html)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS API Calls
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               Backend (Node.js + Express)                    │
│         Running on Railway Free Tier (~$5/month)             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     ↓
┌─────────────────────────────────────────────────────────────┐
│        PostgreSQL Database (Railway Add-on)                  │
│  Tables: artists, metrics, campaigns, sync_logs, insights   │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ REST Calls (OAuth)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│      External APIs (Spotify, YouTube, Instagram)            │
│            (Credentials Required)                            │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Available

Your backend provides these endpoints:

**Health Check:**
- `GET /health` - Returns `{"status":"ok"}`

**Artist Data:**
- `GET /api/artists/:artistId` - Get artist profile + latest metrics
- `GET /api/artists/:artistId/metrics` - Get metric history
- `GET /api/artists/:artistId/metrics/latest` - Get latest snapshot

**Sync Operations:**
- `POST /api/sync/spotify/:artistId` - Trigger Spotify sync
- `POST /api/sync/youtube/:channelId` - Trigger YouTube sync
- `POST /api/sync/all` - Trigger all syncs
- `GET /api/sync/status` - Get sync status

## Error Handling

The backend gracefully handles errors:
- If database is unavailable, it returns mock data
- If external APIs fail, it returns cached data
- All endpoints have proper error responses with timestamps

## Monitoring & Logs

**View logs in Railway:**
1. Go to your Railway project
2. Click the Service
3. Click "Logs" tab to see real-time output

**Common issues to check:**
- Database connection errors → Verify DATABASE_URL
- API credential errors → Check environment variables
- CORS errors → Check FRONTEND_URL matches your frontend domain

## Checklist - Next Steps

- [ ] Run database migrations
- [ ] Get your Railway backend URL
- [ ] Update `src/utils/backend.js` with backend URL
- [ ] Test `/health` endpoint with curl
- [ ] (Optional) Add Spotify/YouTube credentials
- [ ] (Optional) Update frontend to use `apiClient`
- [ ] (Optional) Add artist ID to test with real data

## File Locations

- **API Client:** [src/api/client.js](src/api/client.js)
- **Backend Config:** [src/utils/backend.js](src/utils/backend.js)
- **Migration Script:** [backend/scripts/run-migrations.js](backend/scripts/run-migrations.js)
- **Backend Server:** [backend/src/server.js](backend/src/server.js)
- **API Routes:** [backend/src/routes/](backend/src/routes/)

---

**Status:** Backend is live! 🚀
**Next:** Configure backend URL and run migrations
