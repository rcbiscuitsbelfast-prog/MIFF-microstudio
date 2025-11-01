# GitHub Pages Setup Guide

This microStudio application can be set up to work with GitHub Pages, though note that **GitHub Pages only serves static files**, so the full server functionality requires a separate hosting solution.

## Setup Options

### Option 1: Static Assets on GitHub Pages (Recommended for Static Content)

GitHub Pages can serve the static assets (CSS, JS, images). For full functionality, you'll need to:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` or `main` with `/docs` folder

2. **The GitHub Actions workflow** (`.github/workflows/pages.yml`) will automatically:
   - Build static assets
   - Deploy to GitHub Pages on push to main/master

3. **Note**: Full server features require a Node.js host. For that, consider:
   - **Vercel** (recommended for Node.js apps)
   - **Heroku**
   - **Railway**
   - **DigitalOcean App Platform**
   - **Your own server**

### Option 2: Full Server Deployment

For the complete microStudio experience with all server features:

#### Using Vercel (Easiest)

1. Install Vercel CLI: `npm i -g vercel`
2. In project root: `vercel`
3. Follow prompts
4. Server will be automatically deployed

#### Using Heroku

1. Create `Procfile` in project root:
   ```
   web: cd server && npm start
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Using Railway

1. Connect GitHub repo to Railway
2. Set root directory to `/server`
3. Set start command: `npm start`
4. Deploy

### Option 3: Hybrid Approach

- **Static assets** (CSS, JS, images) ? GitHub Pages
- **API/Server** ? Vercel/Heroku/etc.
- **Update API endpoints** in client code to point to server URL

## Current Setup

The repository includes:

1. **GitHub Actions Workflow** (`.github/workflows/pages.yml`)
   - Builds static assets on push
   - Deploys to GitHub Pages

2. **Mobile-responsive CSS** (`static/css/mobile.css`)
   - Phase 1 mobile optimizations
   - Touch-friendly interface

3. **Mobile JavaScript** (`static/js/mobile.js`)
   - Mobile menu functionality
   - Touch gesture handling
   - Bottom navigation for mobile

## Manual Deployment to GitHub Pages

If you prefer manual deployment:

```bash
# Build static assets
cd server
npm install
npm run compile  # Compile CoffeeScript (if available)

# Copy files to gh-pages branch or docs folder
mkdir -p ../docs
cp -r ../static ../docs/
cp -r ../templates ../docs/

# Commit and push
git add docs/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Environment Variables

If deploying server functionality, you may need:

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)

## Troubleshooting

### Static Assets Not Loading
- Check base URL in templates
- Ensure paths are relative (not absolute)
- Verify file permissions

### Mobile Menu Not Working
- Ensure `mobile.js` is loaded
- Check browser console for errors
- Verify mobile CSS is included

### GitHub Actions Failing
- Check Node.js version compatibility
- Verify `package-lock.json` is committed
- Review workflow logs

## Next Steps

1. Choose your deployment method (static, server, or hybrid)
2. Enable GitHub Pages in repository settings
3. Push to main branch to trigger automatic deployment
4. Configure custom domain (optional) in Pages settings

## Support

For issues:
- Check GitHub Actions logs
- Review server logs
- Verify static asset paths
- Test mobile functionality on actual devices
