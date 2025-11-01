# ?? EXACT DEPLOYMENT INSTRUCTIONS

## Important: This is a Node.js Application

This microStudio application **requires a Node.js server** to run. GitHub Pages can only serve static files, so you have two options:

---

## Option 1: Full Server Deployment (RECOMMENDED for full functionality)

### Root Directory Structure
```
/workspace/                    ? ROOT (where you deploy from)
??? server/                    ? Node.js server code
?   ??? app.js                ? Main entry point
?   ??? package.json          ? Dependencies
?   ??? ...
??? static/                    ? Static assets (CSS, JS, images)
??? templates/                 ? Pug templates
??? ...
```

### Deploy Root: `/workspace/` (the root directory)

**However**, the actual server runs from `/workspace/server/`, so you need to configure your hosting platform accordingly.

---

## ?? Recommended Platforms for Full Deployment

### 1. Vercel (Easiest - RECOMMENDED)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json` in ROOT (`/workspace/`):**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/app.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server/app.js"
       }
     ]
   }
   ```

3. **Deploy from ROOT:**
   ```bash
   cd /workspace           # ? Deploy from ROOT
   vercel
   ```

4. **Follow prompts** - it will auto-detect and deploy

**Deploy Directory**: `/workspace/` (ROOT)

---

### 2. Railway

1. **Connect GitHub repo** to Railway
2. **Set Root Directory**: `/server`
3. **Set Start Command**: `npm start`
4. **Deploy automatically**

**Deploy Directory**: Railway uses `/workspace/server/` but you point it to that from ROOT

---

### 3. Heroku

1. **Create `Procfile` in ROOT (`/workspace/`):**
   ```
   web: cd server && npm start
   ```

2. **Deploy from ROOT:**
   ```bash
   cd /workspace           # ? Deploy from ROOT
   heroku create your-app-name
   git push heroku master
   ```

**Deploy Directory**: `/workspace/` (ROOT)

---

### 4. DigitalOcean App Platform

1. **Connect GitHub repo**
2. **Set Root Directory**: `server`
3. **Set Build Command**: `npm install`
4. **Set Run Command**: `npm start`
5. **Deploy**

**Deploy Directory**: Points to `/workspace/server/` from ROOT

---

## Option 2: GitHub Pages (Static Assets Only)

GitHub Pages can only serve static files. For limited functionality:

1. **Enable GitHub Pages**:
   - Go to: Repository Settings ? Pages
   - Source: `GitHub Actions` (use the workflow I created)
   - Or: `main` branch with `/docs` folder

2. **The workflow** (`.github/workflows/pages.yml`) will:
   - Build static assets
   - Deploy to GitHub Pages

3. **Limitations**:
   - ? No server-side features
   - ? No file saving/loading
   - ? No real-time collaboration
   - ? Static UI only (viewing)

**Deploy Directory**: GitHub Actions handles it automatically from ROOT

---

## ?? EXACT ANSWER TO YOUR QUESTION

### Where to Deploy From?

**Answer: `/workspace/` (THE ROOT DIRECTORY)**

The entire repository root is what you deploy, but you need to tell your hosting platform:

- **Root Directory for Deployment**: `/workspace/` (ROOT)
- **Server Entry Point**: `/workspace/server/app.js`
- **Package.json Location**: `/workspace/server/package.json`
- **Start Command**: `cd server && npm start` OR configure root as `server/`

---

## Quick Start Commands

### If using Vercel from ROOT:
```bash
cd /workspace              # ? Start here (ROOT)
npm install -g vercel
vercel
```

### If using Heroku from ROOT:
```bash
cd /workspace              # ? Start here (ROOT)
heroku create
git push heroku master
```

### If using Railway:
- Connect repo
- Set root: `server`
- Auto-deploys

---

## Environment Variables Needed

When deploying, you may need:

```bash
NODE_ENV=production
PORT=8080  # (or auto-assigned by platform)
```

---

## ?? Summary

**Deploy From**: `/workspace/` (ROOT directory)

**Best Option**: Vercel (easiest for Node.js apps)
1. Run `vercel` from ROOT
2. It will auto-detect the server setup
3. Create `vercel.json` in ROOT if needed

**For GitHub Pages**: 
- Already configured with GitHub Actions
- Auto-deploys on push to master
- But only serves static files (limited functionality)

---

**Ready to push to master!** ??
