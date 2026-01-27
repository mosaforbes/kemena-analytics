# 🎵 Complete FREE Data Sources Guide for Artist Analytics

## Overview: Zero-Cost Artist Data Collection

Your Kemena Analytics platform can get comprehensive artist data **completely free** using public APIs and smart caching strategies. This guide covers everything.

---

## 1️⃣ SPOTIFY API (Free Tier) ✅

### What's Available (FREE)
- Artist metadata (name, followers, genres, images)
- Top tracks and albums
- Related artists
- Playlist information
- Audio features (energy, danceability, etc.)
- Track/album details

### What Requires Payment
- User listening history
- Real-time user library
- Premium user-specific features

### Free Tier Limits
- **Rate Limit:** 120 requests/minute
- **Authentication:** OAuth 2.0 (FREE to register)
- **No credit card required for basic access**

### How to Set Up (FREE)
```bash
1. Go to: https://developer.spotify.com/dashboard
2. Click "Log in" or "Create account" (free)
3. No credit card needed for the free tier
4. Create an app → Get Client ID & Secret
5. Use Client Credentials flow (no user login needed)
```

### Code Example
```javascript
// No refresh token needed for public data!
async function getSpotifyArtist(artistId) {
  const clientId = 'YOUR_CLIENT_ID';
  const clientSecret = 'YOUR_CLIENT_SECRET';
  
  // Get token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: { 'Authorization': `Basic ${auth}` }
  });
  const { access_token } = await tokenRes.json();
  
  // Get artist data
  const artistRes = await fetch(
    `https://api.spotify.com/v1/artists/${artistId}`,
    { headers: { 'Authorization': `Bearer ${access_token}` } }
  );
  return artistRes.json();
}
```

### Spotify Data You Can Get
```
✓ Followers count
✓ Genres
✓ Popularity score (0-100)
✓ Top tracks (audio features)
✓ Related artists
✓ Album information
✓ Artist image
✓ Artist URL/Spotify link
```

### Cost: **$0** (Free tier unlimited)

---

## 2️⃣ YOUTUBE API (Free Tier) ✅

### What's Available (FREE)
- Channel statistics (subscribers, video count, view count)
- Public video data
- Playlist information
- Search results

### Free Tier Limits
- **10,000 quota units per day**
- **Each request costs 1 unit** (very efficient!)
- **Authentication:** API Key (free to generate)
- **No credit card required**

### How Much Can You Query?
```
10,000 quota units/day means:
✓ 10,000 video lookups per day
✓ 1,000+ channel lookups per day
✓ Plenty for regular updates (hourly + historical)
```

### How to Set Up (FREE)
```bash
1. Go to: https://console.cloud.google.com
2. Create new project (free)
3. Enable "YouTube Data API v3"
4. Create credentials → API Key (free)
5. No payment method required!
```

### Code Example
```javascript
async function getYoutubeChannelStats(channelId) {
  const apiKey = 'YOUR_API_KEY';
  
  const response = await fetch(
    'https://www.googleapis.com/youtube/v3/channels?' +
    `part=statistics,snippet&id=${channelId}&key=${apiKey}`
  );
  const data = await response.json();
  
  const channel = data.items[0];
  return {
    subscribers: channel.statistics.subscriberCount,
    views: channel.statistics.viewCount,
    videos: channel.statistics.videoCount,
    description: channel.snippet.description
  };
}
```

### YouTube Data You Can Get
```
✓ Subscriber count
✓ Total video views
✓ Video count
✓ Channel description
✓ Channel creation date
✓ Public videos list
✓ Video statistics (views, likes, comments)
✓ Trending videos in category
```

### Cost: **$0** (10,000 quota units/day free)

---

## 3️⃣ LAST.FM API (Unlimited FREE) ⭐

### What's Available (FREE & UNLIMITED)
- Track play counts
- User listening history (if public)
- Trending tracks/artists
- Top tracks by country/region
- Scrobble data (listening statistics)
- User profiles (public)
- Music charts

### Free Tier Limits
- **UNLIMITED requests** (no quota!)
- **No payment required ever**
- **Rate limit:** 1 request/second (very generous)

### Why It's Great
- Last.fm tracks **every song play globally**
- Has 70+ million users
- Tracks play counts (more realistic than other sources)
- Completely free forever

### How to Set Up (FREE)
```bash
1. Go to: https://www.last.fm/api
2. Create account (free)
3. Create API application (free)
4. Get API key (instant)
5. No payment required!
```

### Code Example
```javascript
async function getLastFMStats(artistName) {
  const apiKey = 'YOUR_LAST_FM_API_KEY';
  
  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?` +
    `method=artist.getinfo&` +
    `artist=${encodeURIComponent(artistName)}&` +
    `api_key=${apiKey}&format=json`
  );
  
  const data = await response.json();
  return {
    listeners: data.artist.stats.listeners,
    playcount: data.artist.stats.playcount,
    tags: data.artist.tags.tag,
    bio: data.artist.bio.summary
  };
}
```

### Last.FM Data You Can Get
```
✓ Total play count (all time)
✓ Monthly listeners
✓ Genre tags
✓ Artist bio
✓ Similar artists
✓ Recent listeners
✓ Country-specific stats
✓ Top tracks by play count
```

### Cost: **$0 FOREVER** (Unlimited!)

---

## 4️⃣ MUSICBRAINZ API (Free Forever) ⭐

### What's Available (FREE & UNLIMITED)
- Artist information
- Album/release details
- Recording metadata
- Genre classification
- Artist relationships (collaborations, members)
- Historical data
- ISRC codes (music identifiers)

### Free Tier Limits
- **UNLIMITED requests** (seriously!)
- **Rate limit:** 1 request/second
- **No registration required**
- **No API key needed**
- **Open source data (CC0 license)**

### Why It's Great
- Largest open music database
- Community-maintained
- Very reliable
- Completely free

### How to Use (FREE - No Setup!)
```bash
Just make requests directly to:
https://musicbrainz.org/ws/2/artist/ARTIST_ID
```

### Code Example
```javascript
async function getMusicBrainzArtist(artistMbid) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/artist/${artistMbid}?` +
    `inc=aliases+tags+ratings&fmt=json`,
    { headers: { 'User-Agent': 'YourApp/1.0' } }
  );
  
  const data = await response.json();
  return {
    name: data.name,
    country: data['country-code'],
    genres: data.tags?.map(t => t.name),
    members: data.relations,
    founded: data['life-span']?.begin
  };
}
```

### MusicBrainz Data You Can Get
```
✓ Artist metadata
✓ Album/release catalog
✓ Genre/style tags
✓ Artist members/collaborations
✓ Relationships (produced by, featuring, etc.)
✓ Recording information
✓ ISRC codes
✓ Historical releases
```

### Cost: **$0 FOREVER** (Completely free)

---

## 5️⃣ GENIUS API (Free Tier)

### What's Available (FREE)
- Lyrics (searchable)
- Song information
- Artist profiles
- Song annotations (crowdsourced)
- Featured artists
- Production credits

### Free Tier Limits
- **No quota limit** (unlimited free tier!)
- **Rate limit:** Generous (no official limit, respect server)
- **API access:** Free
- **No payment required**

### How to Set Up (FREE)
```bash
1. Go to: https://genius.com/api-clients
2. Create free account
3. Create API client
4. Get access token (free)
5. No payment required!
```

### Code Example
```javascript
async function getGeniusLyrics(songName, artistName) {
  const accessToken = 'YOUR_GENIUS_ACCESS_TOKEN';
  
  // Search for song
  const searchRes = await fetch(
    `https://api.genius.com/search?` +
    `q=${encodeURIComponent(`${songName} ${artistName}`)}&` +
    `access_token=${accessToken}`
  );
  
  const results = await searchRes.json();
  const song = results.response.hits[0]?.result;
  
  return {
    title: song.title,
    artist: song.primary_artist.name,
    lyrics_url: song.url,
    genius_id: song.id
  };
}
```

### Genius Data You Can Get
```
✓ Song title & metadata
✓ Artist & featured artists
✓ Album/project info
✓ Release date
✓ Production credits
✓ Genius URL (for lyrics)
✓ Genius annotations (analysis)
✓ Song tags/themes
```

### Cost: **$0** (Free tier unlimited)

---

## 6️⃣ TWITTER API (Limited Free Tier)

### What's Available (FREE)
- Tweet search
- User profile data
- Follower count
- Tweet engagement (likes, retweets)
- Tweets from artist account

### Free Tier Limits
- **450 requests/15 minutes** (moderate limit)
- **Recent tweets only** (last 7 days)
- **Requires authentication** (API key)
- **Needs approval** (apply for access)

### How to Set Up
```bash
1. Go to: https://developer.twitter.com
2. Apply for developer account (requires approval)
3. Create project & app
4. Get API keys
5. Note: May take 24-48 hours for approval
```

### Data You Can Get
```
✓ Follower count
✓ Tweet engagement
✓ Mentions & sentiment
✓ Tweet frequency
✓ Recent activity
```

### Cost: **$0** (Free tier) but limited data

---

## 7️⃣ INSTAGRAM (No Official Free API) ❌

**Note:** Instagram doesn't offer a free API for artist analytics anymore.

### Alternatives:
1. **Manual entry** - Have artist manually input data
2. **Browser scraping** (risky - violates ToS)
3. **Third-party services** (mostly paid)
4. **Use follower count from artist's profile** (public data)

---

## 📊 RECOMMENDED DATA STRATEGY

### Primary Sources (Always Use)
1. **Spotify** - Followers, streams, popularity
2. **YouTube** - Subscribers, views, engagement
3. **Last.FM** - Global play counts, listeners
4. **MusicBrainz** - Artist metadata, collaborations

### Secondary Sources (When Needed)
5. **Genius** - Song info, production credits
6. **Twitter** - Social following (if needed)

### Data Update Frequency (Optimized)
```
✓ Daily:    Last.FM stats (unlimited quota)
✓ Daily:    Spotify followers (120 req/min = plenty)
✓ Daily:    YouTube stats (10K units/day = plenty)
✓ Weekly:   MusicBrainz (rarely changes)
✓ Weekly:   Genius (for new releases)
✓ As needed: Twitter (manual)
```

---

## 🎯 IMPLEMENTATION GUIDE

### Step 1: Add Free API Keys to Your Backend

Create `backend/.env`:
```env
# Spotify (FREE - no payment needed)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# YouTube (FREE - no payment needed)
YOUTUBE_API_KEY=your_youtube_api_key

# Last.FM (FREE - no payment needed)
LASTFM_API_KEY=your_lastfm_api_key

# MusicBrainz (No key needed - but set user agent)
MUSICBRAINZ_USER_AGENT=YourApp/1.0

# Genius (FREE - no payment needed)
GENIUS_ACCESS_TOKEN=your_genius_access_token

# Twitter (optional, FREE limited)
TWITTER_BEARER_TOKEN=optional_bearer_token
```

### Step 2: Create Combined Data Service

Create `backend/src/services/freeDataService.js`:

```javascript
import axios from 'axios';

const createFreeDataService = (config) => ({
  // Spotify data
  async getSpotifyArtist(artistName) {
    // Uses Client Credentials flow (no user login)
    const token = await this.getSpotifyToken();
    const res = await axios.get(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.data.artists.items[0];
  },

  // YouTube data
  async getYoutubeChannel(channelId) {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'statistics,snippet',
        id: channelId,
        key: config.YOUTUBE_API_KEY
      }
    });
    return res.data.items[0];
  },

  // Last.FM data (unlimited!)
  async getLastFMStats(artistName) {
    const res = await axios.get('https://ws.audioscrobbler.com/2.0/', {
      params: {
        method: 'artist.getinfo',
        artist: artistName,
        api_key: config.LASTFM_API_KEY,
        format: 'json'
      }
    });
    return res.data.artist;
  },

  // MusicBrainz data (no auth needed!)
  async getMusicBrainzArtist(artistId) {
    const res = await axios.get(
      `https://musicbrainz.org/ws/2/artist/${artistId}`,
      {
        params: { fmt: 'json' },
        headers: { 'User-Agent': config.MUSICBRAINZ_USER_AGENT }
      }
    );
    return res.data;
  },

  // Helper: Get Spotify token
  async getSpotifyToken() {
    const auth = Buffer.from(
      `${config.SPOTIFY_CLIENT_ID}:${config.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');
    
    const res = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      { headers: { 'Authorization': `Basic ${auth}` } }
    );
    return res.data.access_token;
  }
});

export default createFreeDataService;
```

### Step 3: Update Your Sync Service

```javascript
// In backend/src/services/syncService.js
import createFreeDataService from './freeDataService.js';

export const syncAllFreeData = async (artistName, channelId) => {
  const freeDataService = createFreeDataService(config);
  
  const data = {
    spotify: await freeDataService.getSpotifyArtist(artistName),
    youtube: await freeDataService.getYoutubeChannel(channelId),
    lastfm: await freeDataService.getLastFMStats(artistName),
    musicbrainz: await freeDataService.getMusicBrainzArtist('artist_id')
  };
  
  return data;
};
```

---

## 💰 COST SUMMARY

| API | Cost | Requests/Day | Best For |
|-----|------|-------------|----------|
| **Spotify** | $0 | 172,800 | Followers, streams, popularity |
| **YouTube** | $0 | 10,000 | Subscribers, views |
| **Last.FM** | $0 | UNLIMITED ⭐ | Play counts, trends |
| **MusicBrainz** | $0 | UNLIMITED ⭐ | Metadata, collaborations |
| **Genius** | $0 | UNLIMITED ⭐ | Song info, credits |
| **Twitter** | $0 | 43,200 | Social presence (limited) |
| **Instagram** | ❌ | N/A | ❌ Use alternatives |
| **Total** | **$0** | **Unlimited** | **Everything** |

**Comparison:**
- Traditional music analytics: $50-500/month
- Your cost: **$0/month** ✅

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Get API Keys (1 hour)
- [ ] Spotify: Create app at https://developer.spotify.com/dashboard
- [ ] YouTube: Get API key at https://console.cloud.google.com
- [ ] Last.FM: Create account at https://www.last.fm/api
- [ ] MusicBrainz: No setup needed (just add user agent)
- [ ] Genius: Create app at https://genius.com/api-clients

### Phase 2: Implement Services (2 hours)
- [ ] Create `backend/src/services/freeDataService.js`
- [ ] Update `backend/src/services/syncService.js`
- [ ] Add API keys to `.env`
- [ ] Update `backend/src/database/artistQueries.js` to store new data fields

### Phase 3: Test (30 minutes)
- [ ] Test each API individually
- [ ] Verify data quality
- [ ] Check rate limiting
- [ ] Test caching

### Phase 4: Deploy (15 minutes)
- [ ] Add API keys to Railway environment variables
- [ ] Deploy to production
- [ ] Monitor initial sync

---

## ⚠️ IMPORTANT: Rate Limiting & Caching

### Smart Caching Strategy
```javascript
// Cache responses by data source freshness

const CACHE_TIMES = {
  SPOTIFY_FOLLOWERS: 6 * 60 * 60,     // 6 hours (slow changes)
  YOUTUBE_SUBSCRIBERS: 6 * 60 * 60,   // 6 hours
  LASTFM_PLAYCOUNT: 1 * 60 * 60,      // 1 hour (near real-time)
  MUSICBRAINZ: 24 * 60 * 60,          // 24 hours (rarely changes)
  GENIUS: 7 * 24 * 60 * 60            // 7 days (static data)
};

// This way:
// - You stay within ALL free quotas
// - Data is always fresh when it matters
// - You never hit rate limits
```

### Daily Query Budget
```
Spotify:     120 req/min × 1,440 min/day = 172,800 queries
             Only need: ~100 (followers, top tracks, recommendations)
             ✓ 99.94% under quota

YouTube:     10,000 units/day (1 unit per request)
             Only need: ~100 (channel stats, videos)
             ✓ 99% under quota

Last.FM:     UNLIMITED
             Can query every hour = 24 queries/day
             ✓ No limits

MusicBrainz: UNLIMITED
             Can query daily = 1 query/day
             ✓ No limits
```

---

## 📈 DATA QUALITY NOTES

### Most Reliable Sources (Best Data)
1. **Spotify** - Official, up-to-date, accurate
2. **YouTube** - Official, verified
3. **Last.FM** - User-submitted, but validated community data

### Good But Less Official
4. **MusicBrainz** - Community-maintained, very good
5. **Genius** - Crowdsourced, good for song info

### Limitations to Know
- Instagram: No free API (use manual or avoid)
- Twitter: Limited to recent tweets
- Some platforms update less frequently (Spotify updates weekly)

---

## 🎯 NEXT STEPS

1. **Get API Keys** (1 hour) - Follow the "How to Set Up" sections above
2. **Implement `freeDataService.js`** (2 hours) - Copy code from this guide
3. **Update your sync service** (30 minutes) - Integrate the free APIs
4. **Deploy to Railway** (15 minutes) - Add keys to environment
5. **Start collecting data** - It's all free and unlimited!

---

## ✅ SUCCESS CRITERIA

After implementation:
- ✅ Fetching artist data from 4+ free sources
- ✅ No API costs ($0/month)
- ✅ Data updates regularly
- ✅ Dashboard shows real data
- ✅ All requests within free quotas

---

## 📚 Additional Resources

- **Spotify API Docs:** https://developer.spotify.com/documentation/web-api
- **YouTube API Docs:** https://developers.google.com/youtube/v3
- **Last.FM API Docs:** https://www.last.fm/api
- **MusicBrainz API Docs:** https://musicbrainz.org/development/mmd
- **Genius API Docs:** https://genius.com/api-clients
- **Twitter API Docs:** https://developer.twitter.com/en/docs

---

**Total Cost:** $0  
**Total Effort:** 4-5 hours setup, then 100% automated  
**Data Quality:** Professional-grade  
**Unlimited After Setup:** YES! ✅
