# Kemena Analytics Intelligence Dashboard

**Data-driven artist intelligence for Afrobeat musicians on a zero-budget deployment**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Cost](https://img.shields.io/badge/cost-$0%2Fmonth-brightgreen)

## Overview

Kemena Analytics is a sophisticated artist intelligence dashboard that transforms raw music platform data into actionable insights. Built for independent Afrobeat artists, it provides strategic recommendations, performance analysis, and growth opportunities across Spotify, YouTube, Instagram, and radio platforms.

**Zero hosting cost** – Deploy instantly on GitHub Pages, Netlify, or Vercel.

## Features

✅ **Real-time Analytics Dashboard** – Multi-platform performance metrics  
✅ **Strategic Intelligence** – AI-powered insights and growth recommendations  
✅ **Critical Opportunities** – Identify and prioritize growth areas  
✅ **Performance Radar** – Engagement, discovery, conversion analysis  
✅ **Responsive Design** – Works seamlessly on desktop, tablet, mobile  
✅ **Data Persistence** – Historical tracking via browser storage  
✅ **Zero Cost** – GitHub Pages, Netlify, or Vercel deployment  
✅ **Modular Architecture** – Easy to customize and extend  

## Project Structure

```
kemena-analytics/
├── index.html                  # Main application file
├── package.json               # Project metadata & scripts
├── DEPLOYMENT.md              # Deployment guide
├── README.md                  # This file
├── .gitignore                 # Git ignore rules
└── src/
    ├── data/
    │   └── analytics.json     # Raw analytics data (update this)
    ├── styles/
    │   └── dashboard.css      # All styling (extracted)
    └── utils/
        ├── config.js          # Centralized configuration
        └── analytics.js       # Utility functions & calculations
```

## Quick Start

### 1. Local Development

```bash
# Clone the repository
git clone https://github.com/mosaforbes/kemena-analytics.git
cd kemena-analytics

# Option A: Using Python (built-in)
python -m http.server 8000

# Option B: Using Node.js
npm start

# Option C: Using any http server
npx http-server
```

Navigate to `http://localhost:8000` in your browser.

### 2. Update Analytics Data

Edit [src/data/analytics.json](src/data/analytics.json) with your latest metrics:

```json
{
  "timestamp": "2026-01-27T10:00:00",
  "artist": "Kemena",
  "spotify": {
    "followers": { "total": 1259, "change_1m": 17 },
    "streams": { "total": 3465595, "monthly": 102081 },
    ...
  }
}
```

**Data sources:**
- Spotify: Artist Dashboard
- YouTube: Analytics > Overview
- Instagram: Insights > Total Followers
- Radio: Viberate or direct provider APIs

### 3. Deploy Instantly

#### **Option A: GitHub Pages (Recommended)**

```bash
# Create repo on GitHub.com
git init
git add .
git commit -m "Initial Kemena Analytics commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kemena-analytics.git
git push -u origin main

# Enable Pages in repo Settings > Pages
# Source: Deploy from branch → main → / (root)
```

**Live URL:** `https://YOUR_USERNAME.github.io/kemena-analytics/`

#### **Option B: Netlify (2 minutes)**

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag & drop the project folder
3. Done! ✅

#### **Option C: Vercel**

```bash
npm install -g vercel
vercel --prod
```

## Configuration

All settings are centralized in [src/utils/config.js](src/utils/config.js):

```javascript
const CONFIG = {
  // Artist & Platform Info
  APP_NAME: 'KEMENA',
  ARTIST_NAME: 'Kemena',
  GENRE: 'Afrobeat',

  // Data Source
  DATA_URL: './src/data/analytics.json',

  // Insight Thresholds (adjust for your metrics)
  THRESHOLDS: {
    ENGAGEMENT_MIN: 4,              // Listener/follower multiplier
    GROWTH_MIN: 1,                  // Follower growth % threshold
    RADIO_SPINS_MIN: 50,
    PLAYLIST_REACH_MIN: 50000,
    YOUTUBE_SUBSCRIBERS_MIN: 1000
  },

  // Feature Toggles
  FEATURES: {
    SHOW_HISTORY: true,
    SHOW_COMPARATIVES: true,
    SHOW_STRATEGIC_IMPERATIVES: true
  }
};
```

## Key Metrics Explained

| Metric | Definition | Why It Matters |
|--------|-----------|-----------------|
| **Engagement Multiplier** | Monthly Listeners ÷ Followers | Measures algorithmic reach vs fanbase size |
| **Momentum Score** | Weighted growth across all metrics | Overall career trajectory (0-100) |
| **Playlist Reach** | Estimated listeners via playlists | Discovery potential |
| **Growth Velocity** | Month-over-month change % | Trend direction |

## Utility Functions

The dashboard includes powerful utility functions in [src/utils/analytics.js](src/utils/analytics.js):

```javascript
// Calculate engagement ratio
calculateEngagementRatio(metrics)

// Calculate follower growth percentage
calculateFollowerGrowthPercent(metrics)

// Calculate overall momentum score
calculateMomentumScore(metrics)

// Evaluate strengths based on metrics
evaluateStrengths(metrics)

// Identify critical growth opportunities
identifyOpportunities(metrics)

// Generate strategic imperatives
generateStrategicImperatives()

// Validate data structure
validateMetricsData(data)
```

## Customization Guide

### Change Artist Name

In [src/utils/config.js](src/utils/config.js):
```javascript
APP_NAME: 'YOUR_ARTIST_NAME',
ARTIST_NAME: 'Your Artist Name'
```

### Adjust Insight Thresholds

```javascript
THRESHOLDS: {
  ENGAGEMENT_MIN: 5,              // Higher = stricter criteria
  GROWTH_MIN: 2,
  PLAYLIST_REACH_MIN: 100000
}
```

### Hide/Show Features

```javascript
FEATURES: {
  SHOW_HISTORY: false,            // Hide historical data
  SHOW_COMPARATIVES: false,       // Hide percentile rankings
  SHOW_STRATEGIC_IMPERATIVES: true
}
```

### Modify Charts

In [src/utils/config.js](src/utils/config.js):
```javascript
CHARTS: {
  SHOW_PLATFORM_DISTRIBUTION: true,
  SHOW_GROWTH_VELOCITY: true,
  DEFAULT_HEIGHT: 300
}
```

## Architecture

### Separation of Concerns

- **index.html** – Application logic & React components
- **config.js** – All configuration in one place
- **analytics.js** – Pure utility functions (no side effects)
- **dashboard.css** – All styling (responsive, mobile-first)
- **analytics.json** – Data layer (easy to replace with API)

### Error Handling

The dashboard includes:
- ✅ Error boundary component
- ✅ Try-catch blocks for data loading
- ✅ Data validation before rendering
- ✅ Fallback UI for loading/error states
- ✅ Graceful degradation on data fetch failure

## Data Update Workflow

### Weekly Manual Update
```bash
1. Download latest data from music platforms
2. Update src/data/analytics.json
3. git add src/data/analytics.json
4. git commit -m "Update analytics: [date]"
5. git push origin main
# Changes auto-deploy!
```

### Automated Updates (Advanced)
For real-time data updates, add GitHub Actions workflow (no cost with free tier):
- Fetch data from Viberate API
- Update analytics.json
- Auto-commit & deploy

## Performance Metrics

- **Bundle Size:** ~180KB (React + Recharts CDN)
- **Load Time:** <2 seconds on 3G
- **Mobile:** Fully responsive (320px - 2560px)
- **Accessibility:** WCAG 2.1 Level AA ready

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Dashboard shows "Loading analytics..." indefinitely

**Cause:** CORS error or incorrect DATA_URL

**Solution:**
1. Check browser console (F12 > Console)
2. Verify `DATA_URL` in config.js points to correct path
3. Ensure analytics.json is in src/data/ folder
4. Test with `fetch('./src/data/analytics.json')` in console

### Charts not rendering

**Cause:** Invalid data structure

**Solution:**
1. Validate analytics.json against schema
2. Check browser console for error messages
3. Use validateMetricsData() function to debug

### Styling looks broken on mobile

**Solution:**
Responsive CSS is in src/styles/dashboard.css. Check:
- Media queries at bottom of CSS file
- Viewport meta tag in index.html

## API Reference

### CONFIG Object

```javascript
CONFIG.APP_NAME          // Application display name
CONFIG.ARTIST_NAME       // Artist name for personalization
CONFIG.THRESHOLDS        // Insight generation thresholds
CONFIG.FEATURES          // Feature flags
CONFIG.UI.COLORS         // Color palette
CONFIG.CHARTS            // Chart configuration
```

### Utility Functions

All functions are globally available after analytics.js loads:

```javascript
generateInsights(metrics)           // Returns complete insights
calculateMomentumScore(metrics)    // Returns 0-100 score
evaluateStrengths(metrics)         // Returns array of strengths
identifyOpportunities(metrics)     // Returns array of opportunities
validateMetricsData(data)          // Returns boolean
saveToHistory(data, maxItems)      // Saves to localStorage
formatNumber(num)                  // Formats with commas
formatPercent(value, decimals)     // Formats as percentage
```

## Development Roadmap

- [ ] CSV/Excel import functionality
- [ ] Export reports to PDF
- [ ] Historical trend analysis charts
- [ ] Automated alert system
- [ ] Multi-artist comparison
- [ ] Real-time API integration
- [ ] Dark/Light theme toggle
- [ ] Mobile app version (React Native)

## Contributing

Found a bug or want to improve? Fork, make changes, and submit a PR!

**Areas for contribution:**
- Additional insight algorithms
- UI/UX improvements
- Mobile optimization
- Documentation
- Localization

## License

MIT – Free to use, modify, and distribute

## Support

- 📧 Email: (Add your contact)
- 💬 Discussions: GitHub Issues
- 📚 Docs: [DEPLOYMENT.md](DEPLOYMENT.md)

## Credits

Built with:
- React 18 – UI framework
- Recharts – Data visualization
- GitHub Pages – Free hosting

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-27 | Initial release - Modular architecture, separated CSS/config/utils |
| 0.1.0 | 2026-01-24 | Original single-file dashboard |

---

**Made with ❤️ for independent Afrobeat artists**

*Last updated: January 27, 2026*
