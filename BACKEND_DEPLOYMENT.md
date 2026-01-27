# Kemena Analytics - Zero-Cost Backend Deployment Guide

## Overview

Deploy the Kemena Analytics backend to production **completely free** using Railway's free tier. This guide includes everything you need.

## Architecture

```
Frontend (GitHub Pages/Vercel)
    ↓ API Calls
Backend API (Railway) ← PostgreSQL (Railway)
    ↓ External APIs
Spotify / YouTube / Instagram
```

## Step 1: Create Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Sign up (free forever, no credit card required)
3. Create a new project

## Step 2: Connect GitHub Repository

1. In Railway dashboard, select "Deploy from GitHub"
2. Authorize Railway to access your GitHub account
3. Select repository: `kemena-analytics`
4. Select branch: `main`

## Step 3: Add PostgreSQL Database

1. In Railway dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway auto-generates credentials
4. Note the connection details (you'll need these)

## Step 4: Set Environment Variables

In Railway dashboard, go to your project and add variables:

```
NODE_ENV=production
PORT=5000

# Database (Railway provides these automatically, but if needed:)
DB_HOST=<railway-postgres-host>
DB_PORT=5432
DB_NAME=<railway-postgres-db>
DB_USER=<railway-postgres-user>
DB_PASSWORD=<railway-postgres-password>

# Spotify API (get from https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REFRESH_TOKEN=your_spotify_refresh_token

# YouTube API (get from https://console.developers.google.com/)
YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CHANNEL_ID=your_youtube_channel_id

# App Config
ARTIST_NAME=Kemena
SYNC_INTERVAL_MINUTES=60

# Frontend URL (update with your frontend URL)
FRONTEND_URL=https://kemena-analytics.vercel.app
```

## Step 5: Configure Build & Deploy

Railway should auto-detect Node.js project, but ensure:

1. **Root directory**: `backend`
2. **Start command**: `npm start`
3. **Build command**: `npm install` (default)
4. **Deploy branch**: `main`

## Step 6: Deploy

1. Push code to GitHub:
   ```bash
   git add -A
   git commit -m "Add backend with zero-cost deployment"
   git push origin main
   ```

2. Railway auto-deploys on push
3. Watch the build logs in Railway dashboard
4. Once deployed, you'll get a public URL

## Step 7: Get Spotify API Keys

### Create Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Log in or create account (free)
3. Accept terms and create app
4. You'll get:
   - **Client ID**
   - **Client Secret**

### Get Refresh Token

Use this script to get refresh token (run locally):

```bash
# Set these first
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret
export SPOTIFY_REDIRECT_URI=http://localhost:8888/callback

# Then visit:
# https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-read-private%20user-read-email
```

Or use this simpler approach:
1. Go to [Spotify Web API Console](https://developer.spotify.com/console)
2. Authorize with your Spotify account
3. Use the Authorization Code Flow to get a refresh token

## Step 8: Get YouTube API Key

1. Go to https://console.developers.google.com/
2. Create new project
3. Enable "YouTube Data API v3"
4. Create API key (Credentials → Create Credentials → API Key)
5. Add your API key to Railway environment variables

## Step 9: Verify Deployment

Test your backend:

```bash
# Check health
curl https://your-railway-url/health

# Get latest artist metrics
curl https://your-railway-url/api/artists/kemena/metrics/latest

# Manual sync
curl -X POST https://your-railway-url/api/sync/all
```

## Step 10: Connect Frontend to Backend

Update your frontend to use the backend API:

In `src/utils/config.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-railway-url',
  ENDPOINTS: {
    METRICS: '/api/artists/kemena/metrics/latest',
    HISTORY: '/api/artists/kemena/metrics',
    SYNC: '/api/sync/all'
  }
};
```

## Monthly Cost Breakdown

| Service | Cost | Details |
|---------|------|---------|
| Railway Compute | $5 | Includes 500 hours |
| Railway PostgreSQL | Free | <1GB free tier |
| Spotify API | Free | 400k calls/month free |
| YouTube API | Free | 10k quota/day |
| GitHub | Free | Unlimited repos |
| **Total** | **$5/month** | Production ready |

*Note: Railway free plan is truly free, $5 is their cheapest paid plan if you exceed free tier*

## Monitoring & Maintenance

### Check Deployment Status

```bash
# View logs
railway logs

# View database
railway database view
```

### Monitor Metrics

```sql
-- Check latest sync
SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 5;

-- View recent metrics
SELECT * FROM metrics ORDER BY created_at DESC LIMIT 30;

-- Check data freshness
SELECT CURRENT_TIMESTAMP - MAX(created_at) as data_age 
FROM metrics;
```

### Set Up Auto-Sync

Add a cron job in your backend (optional):

```javascript
import cron from 'node-cron';
import { syncAllData } from './services/syncService.js';

// Sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled sync...');
  try {
    await syncAllData();
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});
```

## Troubleshooting

### Database Connection Failed
- Check DATABASE_URL in Railway environment
- Ensure PostgreSQL service is running
- Verify credentials in .env

### API Returns 403/401
- Check Spotify/YouTube API keys
- Verify credentials haven't expired
- Check rate limits haven't been exceeded

### Build Fails
- Check Node.js version (need 18+)
- Verify all dependencies in package.json
- Check for syntax errors in code

### Slow Syncs
- Data caching reduces API calls
- Cache TTL set to 600 seconds (10 min)
- Can increase for less frequent updates

## Next Steps

1. ✅ Backend deployed
2. ⏭️ Update frontend to use backend API
3. ⏭️ Set up automated syncs
4. ⏭️ Add multi-artist support
5. ⏭️ Implement real-time updates with WebSockets

## Security Notes

- Never commit `.env` files
- Rotate API keys periodically
- Use Railway's built-in secrets management
- Restrict API keys to necessary scopes
- Rate limit API endpoints in production

## Support

- Railway Docs: https://docs.railway.app
- Spotify API: https://developer.spotify.com/documentation
- YouTube API: https://developers.google.com/youtube/v3

---

**Deployment Status**: Ready to deploy immediately with zero-cost hosting! 🚀
