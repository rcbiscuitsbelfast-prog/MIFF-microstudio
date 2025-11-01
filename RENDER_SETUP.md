# Render Deployment Setup

## ? Render Configuration

### Service Type
**Web Service** (not Static Site)

### Build Settings

**Root Directory:** Leave empty (or set to `/`)

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && npm start
```

OR use:
```bash
yarn start
```
(if you add a root package.json)

### Environment Variables

Set these in Render Dashboard ? Environment:

```
NODE_ENV=production
PORT=8080
```

(Optional - can also use config.json)

## ?? Step-by-Step Setup

### 1. Connect Repository
1. Go to https://render.com
2. New ? Web Service
3. Connect your GitHub repository
4. Select: `rcbiscuitsbelfast-prog/MIFF-microstudio`

### 2. Configure Service

**Name:** `miff-microstudio` (or any name)

**Region:** Choose closest to you

**Branch:** `master` (or `main`)

**Root Directory:** Leave empty

**Runtime:** Node

**Build Command:**
```
cd server && npm install
```

**Start Command:**
```
cd server && npm start
```

OR use the Procfile:
```
web: cd server && npm start
```

### 3. Environment Variables

In Render Dashboard ? Environment:

```
NODE_ENV=production
PORT=8080
```

### 4. Advanced Settings

**Auto-Deploy:** Yes (deploy on every push)

**Health Check Path:** `/health` (optional - we added this endpoint)

**Plan:** 
- Free tier works, but has limitations
- Starter plan recommended for production

## ? What Render Provides (vs Vercel)

**Advantages:**
- ? Full Node.js server (not serverless)
- ? Persistent file system
- ? WebSocket support
- ? Better for real-time features
- ? No read-only filesystem issues
- ? Database can use local files (or external)

**Storage:**
- Free tier: 512MB disk
- Paid tiers: More storage available
- Files persist across deployments

## ?? Configuration File

You can also use `config.json` in root:

```json
{
  "realm": "production",
  "proxy": true,
  "port": 8080,
  "standalone": false
}
```

Or use `config_prod.json` which should be in your repo.

## ?? Deploy

1. Click "Create Web Service"
2. Render will:
   - Clone your repo
   - Run `cd server && npm install`
   - Run `cd server && npm start`
   - Start your server

## ?? Your App URL

After deployment, you'll get a URL like:
```
https://miff-microstudio.onrender.com
```

(Or custom domain if you configure one)

## ?? Troubleshooting

### If Build Fails
- Check that `server/package.json` exists
- Verify all dependencies are listed
- Check build logs in Render dashboard

### If Start Fails
- Check start command is correct: `cd server && npm start`
- Verify `server/app.js` exists
- Check logs for errors

### If App Won't Load
- Check health endpoint: `https://your-app.onrender.com/health`
- Check Render service logs
- Verify PORT environment variable

## ?? Monitoring

Render provides:
- Build logs
- Runtime logs
- Metrics (CPU, memory, requests)

## ?? Next Steps

1. **Deploy on Render** using the settings above
2. **Test the app** - should work much better than Vercel!
3. **Configure custom domain** (optional)
4. **Set up auto-deploy** from GitHub

---

**Status:** Ready for Render deployment! ??

Render is much better suited for this app than Vercel serverless functions.
