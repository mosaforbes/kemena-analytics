# Kemena Analytics Backend API

Production-ready backend for the Kemena Artist Analytics Dashboard.

## Features

- **Spotify API Integration**: Real-time artist metrics (followers, streams, playlists)
- **YouTube Integration**: Channel statistics and video performance
- **PostgreSQL Database**: Time-series metrics storage
- **REST API**: Clean endpoints for dashboard consumption
- **Auto-sync**: Scheduled data synchronization
- **Zero-cost Hosting**: Deploy on Railway free tier

## Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL
- **APIs**: Spotify, YouTube, Instagram (optional)
- **Deployment**: Railway, Vercel

## Setup

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npm run migrate
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:5000`

### Getting API Keys

#### Spotify API
1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Get Client ID and Client Secret
4. Use Spotify's Authorization Code Flow to get Refresh Token

#### YouTube API
1. Go to https://console.developers.google.com/
2. Create a project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Get API key

## Database Schema

### Tables
- **artists**: Artist profiles
- **metrics**: Time-series metrics (daily snapshots)
- **campaigns**: Campaign tracking
- **sync_logs**: API sync history
- **insights**: AI-generated insights

## API Endpoints

### Health Check
- `GET /health` - Server status

### Artists
- `GET /api/artists/:artistId` - Get artist details
- `GET /api/artists/:artistId/metrics` - Get metrics history
- `GET /api/artists/:artistId/metrics/latest` - Get latest metrics

### Sync
- `POST /api/sync/spotify/:artistId` - Trigger Spotify sync
- `POST /api/sync/youtube/:channelId` - Trigger YouTube sync
- `POST /api/sync/all` - Trigger all syncs

## Deployment on Railway

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Railway account** at https://railway.app

3. **Create new project** and connect GitHub repo

4. **Add PostgreSQL plugin** in Railway dashboard

5. **Set environment variables** in Railway dashboard:
   - Copy all variables from `.env.example`
   - Add Spotify, YouTube, Instagram credentials

6. **Deploy**
   Railway auto-deploys on push

## Environment Variables

See `.env.example` for all required variables.

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Railway | $5/month | Includes 500 hours compute + PostgreSQL |
| Spotify API | Free | Up to 400k calls/month |
| YouTube API | Free | 10k quota units/day |
| Instagram | Free | Basic tier |
| **Total** | **$5/month** | Production-ready |

## Monitoring

Check sync logs:
```sql
SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 10;
```

View recent metrics:
```sql
SELECT * FROM metrics ORDER BY created_at DESC LIMIT 30;
```

## Roadmap

- [ ] Real-time WebSocket support
- [ ] Historical trending analysis
- [ ] Predictive analytics
- [ ] Playlist pitch automation
- [ ] Multi-artist support
- [ ] Admin dashboard

## Support

For issues or questions, check the [main repository](https://github.com/mosaforbes/kemena-analytics)
