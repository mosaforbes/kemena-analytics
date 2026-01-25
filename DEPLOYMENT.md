# Kemena Analytics Dashboard - Zero Cost Deployment

## Quick Deploy (5 minutes)

### Option 1: GitHub Pages (Recommended)

1. **Create GitHub Repository**
   ```bash
   # On GitHub.com, create new repository named "kemena-analytics"
   # Make it public (required for free GitHub Pages)
   ```

2. **Upload Files**
   ```bash
   git init
   git add kemena_dashboard.html
   git commit -m "initial dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kemena-analytics.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Save
   - Your site will be live at: `https://YOUR_USERNAME.github.io/kemena-analytics/kemena_dashboard.html`

4. **Custom Domain (Optional)**
   - Add CNAME file with your domain
   - Configure DNS A records to GitHub Pages IPs
   - Enable HTTPS in settings

### Option 2: Netlify Drop (2 minutes)

1. Go to https://app.netlify.com/drop
2. Drag and drop `kemena_dashboard.html`
3. Instant deployment with random URL
4. Customize URL in settings

### Option 3: Vercel (3 minutes)

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow prompts
4. Deployed instantly

## Updating Data

The dashboard currently has hardcoded data. To update with fresh Viberate data:

1. Download new CSV from Viberate
2. Run the Python analytics script
3. Update the `rawData` object in the HTML file with new values
4. Push changes to GitHub (auto-deploys)

## Cost Breakdown

- Hosting: $0 (GitHub Pages free forever)
- Domain: $0 (use github.io subdomain) or $12/year (custom domain)
- SSL Certificate: $0 (auto-provisioned)
- Bandwidth: $0 (unlimited on GitHub Pages)
- Maintenance: $0

**Total: $0/month**

## Advanced: Automated Data Updates

For automated updates without manual CSV downloads, you'd need:
- Viberate API access (requires paid plan)
- GitHub Actions cron job to fetch data
- Still 100% free hosting

Current solution requires manual CSV export from Viberate dashboard.
