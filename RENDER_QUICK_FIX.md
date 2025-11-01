# Render Quick Fix - package.json Issue

## ?? Current Error

```
error Couldn't find a package.json file in "/opt/render/project/src"
```

## ? Solutions to Try

### Solution 1: Update Render Dashboard Settings (Recommended)

Go to Render Dashboard ? Your Service ? Settings:

1. **Root Directory:** Set to `/` (or leave empty, NOT `src`)
2. **Build Command:** `npm install` 
3. **Start Command:** `npm start`
4. **Environment:** Set `PACKAGE_MANAGER=npm` (optional)

### Solution 2: Use Direct Paths

If Root Directory is causing issues:

**Build Command:**
```bash
npm install --prefix server
```

**Start Command:**
```bash
cd server && npm start
```

OR

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && npm start
```

### Solution 3: Remove Root Directory Setting

If you have "Root Directory" set to `src`, **remove it** or set it to `/` or leave it empty.

## ?? Exact Render Settings

**Name:** miff-microstudio  
**Environment:** Node  
**Root Directory:** `/` (empty or blank)  
**Build Command:** `cd server && npm install`  
**Start Command:** `cd server && npm start`  
**Node Version:** 22 (or 18/20)

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=8080` (Render sets this automatically)

## ? Verify package.json

The root `package.json` should exist. Check Render logs:
- Should see "Cloning from GitHub"
- Should see "Running build command"
- Should NOT look in `/src` directory

## ?? After Fixing

1. **Save settings** in Render Dashboard
2. **Manually trigger deploy** (Deploys ? Manual Deploy)
3. **Watch logs** - should see:
   - `cd server && npm install`
   - `cd server && npm start`
   - Server starting successfully

---

**Most likely fix:** Set Root Directory to `/` (not `src`) in Render Dashboard Settings.
