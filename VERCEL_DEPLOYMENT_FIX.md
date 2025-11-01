# Vercel Deployment Fix - Troubleshooting Guide

## ? What I've Added

1. **`vercel.json`** - Routes configuration for Vercel
2. **`api/vercel.js`** - Serverless function handler
3. **`.vercelignore`** - Files to exclude from deployment

## ?? Common Issues & Fixes

### Issue 1: 404 Errors

**Possible Causes:**
- Server not initializing properly
- Routes not matching
- Static files not being served

**Fixes:**

1. **Check Vercel Build Logs**
   - Go to Vercel Dashboard ? Your Project ? Deployments
   - Click on the latest deployment
   - Check "Build Logs" for errors

2. **Verify Routes**
   - The `vercel.json` routes static files first
   - Then catches all other routes with `/api/vercel.js`
   - Make sure your root path `/` is being caught

3. **Check Environment Variables**
   - In Vercel Dashboard ? Settings ? Environment Variables
   - Ensure `NODE_ENV=production` is set

### Issue 2: Server Initialization Timeout

**Fix:**
The server initializes asynchronously. If you see "Server not initialized":
- Wait 10-30 seconds after first deployment
- The first request might be slow (cold start)
- Subsequent requests should be faster

### Issue 3: Static Files Not Loading

**Fix:**
Check that routes in `vercel.json` match your static file paths:
- `/static/*` files should be served
- `/css/*` redirects to `/static/css/*`
- `/js/*` redirects to `/static/js/*`

## ??? Manual Testing Steps

1. **Check Vercel Function Logs:**
   ```
   Vercel Dashboard ? Your Project ? Functions ? vercel
   ```

2. **Test API Endpoint:**
   ```
   https://your-domain.vercel.app/api/asset-modules/list
   ```

3. **Test Static Files:**
   ```
   https://your-domain.vercel.app/css/mobile.css
   ```

4. **Test Root Path:**
   ```
   https://your-domain.vercel.app/
   ```

## ?? Alternative: Simpler Entry Point

If the current setup doesn't work, try this simplified version:

Create `api/index.js`:
```javascript
const express = require('express');
const app = express();

// Basic test
app.get('/', (req, res) => {
  res.send('microStudio is running!');
});

module.exports = app;
```

Then update `vercel.json`:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/api/index.js" }
  ]
}
```

## ?? Vercel Configuration Checklist

- [ ] `vercel.json` exists in root
- [ ] `api/vercel.js` exists and exports handler
- [ ] `.vercelignore` configured (optional)
- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: Leave empty or `cd server && npm install`
- [ ] Output directory: Leave empty
- [ ] Install command: `cd server && npm install`

## ?? Important Notes

1. **WebSocket Support**: Vercel serverless functions don't support WebSockets natively. Real-time features may not work.

2. **File System**: Write access is limited. The app may need external storage (like a database) for user files.

3. **Cold Starts**: First request after inactivity can take 5-10 seconds.

4. **Function Timeout**: Default is 10 seconds, can be increased to 60 seconds in Pro plan.

## ?? Redeployment

After fixing issues:
```bash
# Force redeploy
vercel --prod

# Or push to trigger automatic deployment
git push origin master
```

## ?? Recommended Alternative

If Vercel serverless functions are too limiting, consider:
- **Railway** (easiest for Node.js apps)
- **Render** (free tier available)
- **DigitalOcean App Platform**
- **Heroku** (paid, but reliable)

These platforms support full Node.js servers with WebSocket support.

---

**Need Help?** Check Vercel logs first, then verify the configuration matches above.
