# Vercel Function Crash Troubleshooting

## Common Error: FUNCTION_INVOCATION_FAILED

### Issue
The serverless function crashes with a 500 error. This is usually because:

1. **Server tries to call `app.listen()`** - Vercel doesn't allow this
2. **Database initialization fails** - File system limitations
3. **Missing dependencies** - Packages not installed
4. **Path issues** - Relative paths not working in serverless

### Fixes Applied

1. **Mocked `http.createServer().listen()`** - Prevents crashes when server tries to listen
2. **Better error handling** - Catches and logs all errors
3. **Extended timeout** - 30 seconds for initialization
4. **Required directories created** - Auto-creates data, files, logs directories

### Check Vercel Logs

1. Go to Vercel Dashboard
2. Click your project
3. Go to "Functions" tab
4. Click on the function
5. Check "Logs" tab

Look for:
- "Server initialized successfully" - Good!
- "Initialization timeout" - Server taking too long
- Error stack traces - These will show the real problem

### Common Log Messages

**Good:**
```
Starting server initialization...
Server initialized successfully
Server initialized, handling request
```

**Bad:**
```
Server initialization timeout
Failed to initialize server
Error during initialization check
```

### If Still Crashing

1. **Check Function Logs** - Most important step!
   - Vercel Dashboard ? Functions ? vercel ? Logs
   - Look for the actual error message

2. **Verify Dependencies**
   - Ensure `server/package.json` is correct
   - Check that all dependencies are installed

3. **File System Issues**
   - Vercel has limited file system access
   - Database might not initialize properly
   - Consider using external database

4. **Memory Limits**
   - Free tier: 1GB memory
   - Large asset submodules might cause issues
   - Check function memory usage

### Alternative: Use Railway Instead

Vercel serverless functions have limitations:
- No persistent file system
- WebSocket support is limited
- Cold starts can be slow
- Memory constraints

**Railway** is better suited for this app:
- Full Node.js server support
- Persistent file system
- WebSocket support
- Better for real-time features

### Quick Railway Setup

1. Connect GitHub repo to Railway
2. Set Root Directory: `server`
3. Set Start Command: `npm start`
4. Deploy!

---

**Next Steps:** Check Vercel function logs to see the actual error message, then we can fix the specific issue.
