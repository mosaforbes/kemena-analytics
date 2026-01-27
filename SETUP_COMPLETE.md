# Kemena Analytics - Full Stack Setup Complete ✅

## Status

- ✅ **Backend**: Live on Railway
- ✅ **Frontend**: Ready for backend integration  
- ✅ **Database**: PostgreSQL connected, schema ready
- 🔄 **Configuration**: Requires your input for credentials and URLs

## What's Running

### Backend (Node.js + Express on Railway)
- Server: `npm start` via Railway deployment
- Port: Automatically assigned by Railway
- Database: PostgreSQL on Railway
- Status: Online and accepting requests

### Frontend (React Dashboard)
- Location: `index.html` in root directory
- View: Open in browser to see dashboard
- Backend: Not yet connected (optional - use with mock data or configure)

### Database (PostgreSQL on Railway)
- Status: Connected to backend
- Migrations: Ready to run
- Tables: 5 tables defined, awaiting migration execution

## File Structure

```
kemena-analytics/
├── backend/
│   ├── src/
│   │   ├── server.js           ← Express app entry point
│   │   ├── config.js           ← Environment configuration
│   │   ├── database/
│   │   │   ├── db.js          ← PostgreSQL connection
│   │   │   ├── migrate.js      ← Schema definition
│   │   │   └── artistQueries.js ← Database operations
│   │   ├── routes/
│   │   │   ├── artists.js      ← GET /api/artists/:id
│   │   │   └── sync.js         ← POST /api/sync/*
│   │   └── services/
│   │       ├── spotifyService.js
│   │       ├── youtubeService.js
│   │       └── syncService.js
│   ├── scripts/
│   │   ├── run-migrations.js   ← Run this first!
│   │   └── test-backend.js     ← Test connection
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── src/
│   ├── api/
│   │   └── client.js           ← Frontend API client
│   ├── utils/
│   │   ├── backend.js          ← Backend config & helpers
│   │   ├── analytics.js        ← Data processing
│   │   └── config.js           ← Frontend config
│   └── styles/
│       └── dashboard.css        ← UI styles
├── index.html                  ← Main React dashboard
├── package.json
├── INTEGRATION_GUIDE.md         ← Setup instructions
├── BACKEND_DEPLOYMENT.md        ← Deployment details
├── README.md                    ← Feature overview
└── DEPLOYMENT.md

```

## Quick Start

### 1️⃣ Run Database Migrations (Required)

The PostgreSQL database needs its schema set up. Choose one method:

**Method A: Using Railway Dashboard (Easiest)**
```
1. Go to https://railway.com/project/YOUR-PROJECT-ID
2. Click PostgreSQL plugin → Query tab
3. Copy-paste migration script and run
```

**Method B: Using Command Line**
```bash
cd /workspaces/kemena-analytics
export DATABASE_URL="postgresql://user:pass@host:5432/db"
node backend/scripts/run-migrations.js
```

### 2️⃣ Get Your Backend URL

From Railway dashboard:
1. Click your Node.js service
2. Find "Service URL" or "Domains" section
3. Copy the URL (looks like: `https://kemena-prod-xxxx.railway.app`)

### 3️⃣ Update Frontend Configuration

Edit `src/utils/backend.js`:

```javascript
const BACKEND_CONFIG = {
  development: 'http://localhost:5000',
  production: 'https://your-railway-url.railway.app'  // ← Update this
};
```

### 4️⃣ (Optional) Add API Credentials

For real Spotify/YouTube data, add to Railway environment variables:

```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
```

### 5️⃣ Test Backend Connection

```bash
node backend/scripts/test-backend.js https://your-railway-url.railway.app
```

Expected output:
```
✓ GET /health → 200
✓ GET /api/artists/test → 404 (expected)
✓ GET /api/sync/status → 200
```

## How to Get API Credentials

### Spotify
1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create one)
3. Click "Create an App"
4. Accept terms and create
5. Copy **Client ID** and **Client Secret**
6. Set Redirect URI to: `http://localhost:3000/callback`
7. Get refresh token using Spotify Web API Auth Code flow

### YouTube
1. Go to https://console.developers.google.com
2. Create new project
3. Enable **YouTube Data API v3**
4. Go to Credentials → Create API key
5. Copy the API key
6. Get your Channel ID from: YouTube Settings → Advanced Settings

### Instagram (Optional)
Not required for basic functionality. Can be added later.

## Available API Endpoints

### Health Check
```
GET /health
Response: {"status":"ok"}
```

### Artist Data
```
GET /api/artists/:artistId
GET /api/artists/:artistId/metrics
GET /api/artists/:artistId/metrics/latest
```

### Sync Operations
```
POST /api/sync/spotify/:artistId
POST /api/sync/youtube/:channelId
POST /api/sync/all
GET /api/sync/status
```

## Connecting Frontend to Backend

The frontend is ready to use the API. Currently it uses mock data from `src/data/mockData.js`.

To use live data:

```javascript
// In index.html, replace mock data fetch with:
import { apiClient } from './src/api/client.js';

// In the KemenaDashboard component:
const loadAnalyticsData = async () => {
  try {
    // Replace with actual artist ID
    const data = await apiClient.getArtist('spotify-artist-id-here');
    setData(data);
  } catch (error) {
    console.error('Failed to load:', error);
    // Falls back to mock data
  }
};
```

## Testing Without Credentials

You can test the entire system without API credentials:

1. ✅ Backend returns mock data automatically
2. ✅ Dashboard displays with mock metrics
3. ✅ All UI patterns work (tooltips, badges, charts)
4. ✅ Database operations work (if migrations run)

Get real data later by adding credentials.

## Deployment Overview

```
GitHub Repository
    ↓ (git push)
Railway Auto-Deploy
    ↓ (npm install && npm start)
Node.js Backend Running
    ↓ (Connection string from Railway add-ons)
PostgreSQL Database
    ↓ (Queries & data caching)
External APIs (Spotify, YouTube)
    ↓ (HTTPS responses)
Frontend Dashboard (GitHub Pages/Vercel)
```

## Environment Variables

**Backend (.env file):**
```
NODE_ENV=production
PORT=5000
DB_HOST=postgresql-host
DB_PORT=5432
DB_NAME=kemena_analytics
DB_USER=postgres
DB_PASSWORD=xxxx
SPOTIFY_CLIENT_ID=xxxx
SPOTIFY_CLIENT_SECRET=xxxx
YOUTUBE_API_KEY=xxxx
```

**Railway Dashboard Variables:**
Use Railway's UI to set these instead of .env file for production.

## Troubleshooting

### Backend Not Responding
```bash
# Check if it's running
curl https://your-url/health

# Check logs in Railway dashboard → Logs tab
```

### Database Connection Failed
```
• Verify DATABASE_URL in Railway environment
• Check PostgreSQL is running (Railway add-on)
• Run migrations if not executed yet
```

### CORS Errors
```
• Check FRONTEND_URL matches your frontend domain
• Frontend must be HTTPS in production
• Backend has CORS enabled by default
```

### API Returns Null Data
```
• Check if credentials are set in environment
• Verify artist/channel IDs are correct
• Check API quota limits (Spotify, YouTube)
```

## Performance Considerations

- **Caching**: Frontend caches API responses for 5 minutes
- **Rate Limiting**: Backend rate limits to 100 requests/minute
- **Database**: Indexes on common queries (artist, date)
- **Cost**: ~$5/month for PostgreSQL + compute on Railway free tier

## Next Steps

1. ✅ Run migrations (top priority)
2. ✅ Update backend URL in frontend
3. ✅ Test `/health` endpoint
4. ✅ (Optional) Add API credentials
5. ✅ (Optional) Connect frontend to live data

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Backend Status**: ✅ Live on Railway  
**Database Status**: ✅ Connected & Ready  
**Frontend Status**: ✅ Ready for Integration  
**Next Action**: Run migrations
