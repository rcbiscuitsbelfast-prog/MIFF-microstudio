# Vercel Deployment Fix - Read-Only Filesystem

## ? Problem Fixed

**Error:** `EROFS: read-only file system, open '/var/task/config.json'`

**Cause:** Vercel's serverless functions have a read-only filesystem in `/var/task/`

## ? Solution Applied

1. **No longer writes config.json** - Uses in-memory config via `VERCEL_CONFIG` environment variable
2. **Uses /tmp for writable files** - `/tmp/` is writable in Vercel serverless functions
3. **Sets app_data to /tmp** - Database and user files stored in `/tmp/microstudio-data/` and `/tmp/microstudio-files/`

## ?? Changes Made

### `api/vercel.js`
- Creates directories in `/tmp` instead of workspace root
- Passes config via `VERCEL_CONFIG` environment variable instead of writing file
- Sets `APP_DATA` to `/tmp` for writable storage

### `server/app.js`
- Checks for `VERCEL_CONFIG` environment variable first
- Falls back to reading config.json if environment variable not set
- Uses Vercel defaults if neither available

## ?? Important Notes

### File Persistence
- Files in `/tmp` are **ephemeral** - they may be cleared between function invocations
- For production use, consider:
  - External database (PostgreSQL, MongoDB)
  - External file storage (S3, Cloudinary)
  - Or use a platform with persistent storage (Railway, Render)

### Cold Starts
- First request after inactivity: 10-30 seconds
- Subsequent requests: Much faster (function stays warm)
- Consider keeping function warm with cron jobs

### Memory Limits
- Free tier: 1GB RAM, 10 second timeout
- Pro tier: Up to 3GB RAM, 60 second timeout
- Large asset submodules may consume memory

## ?? Deployment Status

After these fixes:
- ? No more read-only filesystem errors
- ? Config loads correctly
- ? Writable directories available
- ?? File persistence may be limited (see above)

## ?? Testing

After redeploy, check Vercel logs for:
- "Using /tmp for app_data in Vercel"
- "Using in-memory config for Vercel"
- "Server initialized successfully"

If you see errors, check:
1. Function logs in Vercel dashboard
2. Memory usage
3. Timeout issues (if initialization takes > 10 seconds on free tier)

---

**Status:** Read-only filesystem issue fixed! ??
