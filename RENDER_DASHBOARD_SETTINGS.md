# ?? Render Dashboard Settings - EXACT CONFIGURATION

## Critical Settings

### 1. Root Directory
**?? MOST IMPORTANT**
- **Value:** Leave EMPTY or set to `/`
- **DO NOT set to:** `src` or any other value
- This is likely causing the error!

### 2. Build Command
**Option A (Recommended):**
```bash
cd server && npm install
```

**Option B (If Root Directory is empty):**
```bash
npm install
```

### 3. Start Command  
**Option A (Recommended):**
```bash
cd server && npm start
```

**Option B (If Root Directory is empty):**
```bash
npm start
```

### 4. Environment Variables
Add these in Render Dashboard ? Environment:
```
NODE_ENV=production
PORT=8080
```

## ?? Step-by-Step Fix

1. **Go to Render Dashboard**
   - Your Service ? Settings

2. **Find "Root Directory"**
   - Clear it (make it empty/blank)
   - OR set it to: `/`
   - DO NOT use: `src`

3. **Set Build Command:**
   ```
   cd server && npm install
   ```

4. **Set Start Command:**
   ```
   cd server && npm start
   ```

5. **Save Settings**

6. **Manual Deploy**
   - Go to Deploys tab
   - Click "Manual Deploy"
   - Select "Clear build cache & deploy"

## ? What Should Happen

After fixing Root Directory, you should see:
```
==> Running build command 'cd server && npm install'...
==> Running 'cd server && npm start'...
```

NOT:
```
==> Running 'yarn start'...
==> error in /opt/render/project/src
```

## ?? If Still Not Working

Try this exact configuration:

**Build Command:**
```bash
npm install --prefix server && cd server && npm install
```

**Start Command:**
```bash
cd server && node app.js
```

---

**The root issue:** Root Directory is set to `src` instead of `/` or empty.
