# Quick Reference - Backend Integration

## Three Easy Steps to Get Started

### Step 1: Run Migrations (1 minute)
```bash
# Option A: Use Railway dashboard (easiest)
# Go to: https://railway.com/project/YOUR-ID
# Click PostgreSQL → Query
# Copy-paste backend/scripts/run-migrations.js and execute

# Option B: Command line
node backend/scripts/run-migrations.js
```

### Step 2: Update Backend URL (2 minutes)
```bash
# Find your Railway service URL
# https://railway.com/project/YOUR-ID → Node.js Service → Service URL

# Option A: Interactive setup
node setup-wizard.js

# Option B: Manual edit
# Edit src/utils/backend.js, update line:
# production: 'https://your-service-url.railway.app'
```

### Step 3: Test Connection (1 minute)
```bash
# Test that everything works
node backend/scripts/test-backend.js https://your-service-url

# Expected output:
# ✓ GET /health → 200
# ✓ GET /api/artists/test-artist-123 → 404
# ✓ GET /api/sync/status → 200
```

## What You Have

### Backend API (Live on Railway)
- `GET /health` - Check if backend is running
- `GET /api/artists/:id` - Get artist data
- `GET /api/artists/:id/metrics` - Get metric history
- `POST /api/sync/spotify/:id` - Sync Spotify data
- `POST /api/sync/youtube/:id` - Sync YouTube data

### Frontend (Ready to use)
- React dashboard with charts
- 7 UI patterns (tooltips, badges, etc.)
- API client module for calling backend
- Works with mock data or live data

### Database (Connected)
- PostgreSQL on Railway
- 5 tables: artists, metrics, campaigns, sync_logs, insights
- Migrations ready to run

## Optional: Add Real Data

### Get Spotify API Key
1. https://developer.spotify.com/dashboard
2. Create app
3. Copy Client ID + Secret
4. Add to Railway environment variables:
   - `SPOTIFY_CLIENT_ID=xxx`
   - `SPOTIFY_CLIENT_SECRET=xxx`

### Get YouTube API Key
1. https://console.developers.google.com
2. Create project, enable YouTube Data API v3
3. Create API key
4. Add to Railway environment variables:
   - `YOUTUBE_API_KEY=xxx`
   - `YOUTUBE_CHANNEL_ID=xxx`

## Useful Commands

```bash
# See what you have
ls -la

# Run migrations
node backend/scripts/run-migrations.js

# Test backend
node backend/scripts/test-backend.js https://your-url

# Setup wizard
node setup-wizard.js

# View git commits
git log --oneline -10

# Push changes
git add .
git commit -m "your message"
git push origin main
```

## File Locations

| File | Purpose |
|------|---------|
| `src/api/client.js` | Frontend API client - use this to call backend |
| `src/utils/backend.js` | Backend URL configuration - UPDATE THIS |
| `backend/scripts/run-migrations.js` | Database setup - RUN THIS FIRST |
| `backend/scripts/test-backend.js` | Connection tester |
| `setup-wizard.js` | Interactive setup helper |
| `INTEGRATION_GUIDE.md` | Detailed setup steps |
| `SETUP_COMPLETE.md` | Feature overview |
| `SETUP_READY.md` | Current status |

## Find Your Backend URL

1. Go to https://railway.com/project/YOUR-PROJECT-ID
2. Click your Node.js Service
3. Look for "Service URL" or "Domain"
4. Copy it (should look like `https://kemena-prod-xxxx.railway.app`)
5. Update `src/utils/backend.js` production URL

## Common Issues

| Issue | Solution |
|-------|----------|
| "Backend not found" | Update production URL in src/utils/backend.js |
| "Database error" | Run migrations: `node backend/scripts/run-migrations.js` |
| "CORS error" | Backend already has CORS enabled, check frontend URL |
| "Null data" | Add API credentials or use mock data |
| "Service offline" | Check Railway logs: https://railway.com → Your project → Logs |

## Status Check

```bash
# Is backend responding?
curl https://your-url/health

# Is database connected?
# Check Railway PostgreSQL logs

# Is frontend configured?
# Check browser console for API errors
```

## Need Help?

- 📖 **Setup Instructions:** INTEGRATION_GUIDE.md
- 🔧 **Feature Overview:** SETUP_COMPLETE.md
- 📊 **API Docs:** backend/README.md
- 🚀 **Deployment Help:** BACKEND_DEPLOYMENT.md
- 🎯 **Status:** SETUP_READY.md

## Next Actions

1. ✅ Run migrations (copy script from backend/scripts/run-migrations.js)
2. ✅ Update src/utils/backend.js with your Railway URL
3. ✅ Run test: `node backend/scripts/test-backend.js`
4. ✅ (Optional) Add API credentials to Railway
5. ✅ (Optional) Update index.html to use apiClient

---

**Status:** Backend is LIVE ✅ Database is READY ✅ Frontend is CONFIGURED ✅

**Next:** Run migrations and update backend URL (5 minutes total)
