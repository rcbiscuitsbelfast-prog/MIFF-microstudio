// Vercel serverless function entry point for microStudio
const path = require("path");
const fs = require("fs");

// Set app_data to workspace root before requiring anything
const workspaceRoot = path.join(__dirname, "..");
process.env.APP_DATA = workspaceRoot;
process.env.VERCEL = "true"; // Signal we're running on Vercel

// Create necessary directories if they don't exist
// In Vercel, we can only write to /tmp, so use that for writable directories
const tmpDir = "/tmp";
const requiredDirs = [
  path.join(tmpDir, "microstudio-data"),
  path.join(tmpDir, "microstudio-files"),
  path.join(tmpDir, "microstudio-logs")
];

requiredDirs.forEach(dir => {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn(`Could not create directory ${dir}:`, e.message);
  }
});

// Set app_data to /tmp for writable files in Vercel
if (process.env.VERCEL) {
  process.env.APP_DATA = tmpDir;
  process.env.DATA_DIR = path.join(tmpDir, "microstudio-data");
  process.env.FILES_DIR = path.join(tmpDir, "microstudio-files");
}

// In Vercel, /var/task is read-only. Use /tmp for writable files or check existing config
const configPath = path.join(workspaceRoot, "config.json");
if (!fs.existsSync(configPath)) {
  // Try to use config_prod.json as template, or use environment variables
  let defaultConfig = {
    realm: "production",
    proxy: true,
    port: process.env.PORT || 8080,
    standalone: false,
    vercel: true // Special flag for Vercel
  };
  
  // Use config_prod.json as base if it exists (it should be in the repo)
  const prodConfigPath = path.join(workspaceRoot, "config_prod.json");
  if (fs.existsSync(prodConfigPath)) {
    try {
      const prodConfig = JSON.parse(fs.readFileSync(prodConfigPath, "utf8"));
      defaultConfig = Object.assign(defaultConfig, prodConfig);
      defaultConfig.vercel = true; // Ensure Vercel flag is set
    } catch (e) {
      console.warn("Could not read config_prod.json:", e.message);
    }
  }
  
  // In Vercel, we can't write to /var/task, so use /tmp or in-memory config
  // Instead of writing config.json, we'll pass config directly to the server
  // Store config in environment or pass it programmatically
  process.env.VERCEL_CONFIG = JSON.stringify(defaultConfig);
  console.log("Using in-memory config for Vercel (read-only filesystem)");
} else {
  console.log("Using existing config.json");
}

// Change to server directory so relative paths work
const serverDir = path.join(__dirname, "../server");
if (!fs.existsSync(serverDir)) {
  throw new Error(`Server directory not found: ${serverDir}`);
}
process.chdir(serverDir);

let expressApp = null;
let serverInstance = null;
let initPromise = null;
let initError = null;

// Mock http.createServer().listen() to prevent crashes in serverless
const originalHttp = require("http");
const originalCreateServer = originalHttp.createServer;
originalHttp.createServer = function(...args) {
  const server = originalCreateServer.apply(originalHttp, args);
  
  // In Vercel, we don't actually listen - just return the server object
  const originalListen = server.listen;
  server.listen = function(...listenArgs) {
    if (process.env.VERCEL) {
      console.log("Skipping listen() in Vercel serverless environment");
      // Don't actually listen, just return
      return server;
    }
    return originalListen.apply(server, listenArgs);
  };
  
  return server;
};

function initializeServer() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise((resolve, reject) => {
    try {
      console.log("Starting server initialization...");
      console.log("Workspace root:", workspaceRoot);
      console.log("Server dir:", serverDir);
      console.log("Current dir:", process.cwd());
      
      // Import the server app - this triggers initialization
      const appModule = require("../server/app.js");
      
      // The server initializes asynchronously in the constructor
      // We need to wait for the Express app to be created
      let attempts = 0;
      const maxAttempts = 300; // 30 seconds max for first initialization
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        try {
          if (appModule.server) {
            serverInstance = appModule.server;
            if (serverInstance.app) {
              expressApp = serverInstance.app;
              clearInterval(checkInterval);
              console.log("Server initialized successfully");
              resolve(expressApp);
              return;
            }
          }
          
          // Check for errors
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            const error = new Error(`Server initialization timeout - app not ready after ${maxAttempts * 100}ms`);
            console.error("Initialization timeout");
            console.error("appModule:", appModule);
            console.error("server:", appModule.server);
            if (appModule.server) {
              console.error("server.app:", appModule.server.app);
            }
            initError = error;
            reject(error);
          }
        } catch (err) {
          clearInterval(checkInterval);
          console.error("Error during initialization check:", err);
          console.error(err.stack);
          initError = err;
          reject(err);
        }
      }, 100);
      
      // Also set a timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!expressApp) {
          const error = new Error("Server initialization timeout");
          initError = error;
          reject(error);
        }
      }, 30000);
      
    } catch (error) {
      console.error("Server initialization error:", error);
      console.error(error.stack);
      initError = error;
      reject(error);
    }
  });

  return initPromise;
}

// Export handler for Vercel
module.exports = async (req, res) => {
  try {
    // Add CORS headers if needed
    if (!res.headersSent) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
    
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Initialize server if needed (Vercel may reuse the function instance)
    if (!expressApp && !initError) {
      try {
        console.log("Initializing server for request:", req.url);
        await initializeServer();
        console.log("Server initialized, handling request");
      } catch (error) {
        console.error("Failed to initialize server:", error);
        console.error(error.stack);
        initError = error;
        if (!res.headersSent) {
          return res.status(503).json({ 
            error: "Server initialization failed",
            message: error.message,
            details: process.env.NODE_ENV === "development" ? error.stack : "Check Vercel function logs"
          });
        }
      }
    }

    if (initError) {
      if (!res.headersSent) {
        return res.status(503).json({ 
          error: "Server initialization error",
          message: initError.message,
          details: process.env.NODE_ENV === "development" ? initError.stack : "Check Vercel function logs"
        });
      }
    }

    if (!expressApp) {
      if (!res.headersSent) {
        return res.status(503).json({ 
          error: "Server not initialized",
          message: "The microStudio server is still initializing. Please try again in a moment."
        });
      }
    }

    // Handle the request with Express
    return new Promise((resolve) => {
      let resolved = false;
      
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Handle response end
      res.on("finish", cleanup);
      res.on("close", cleanup);
      
      // Handle errors
      req.on("error", (err) => {
        console.error("Request error:", err);
        if (!resolved) cleanup();
      });
      
      res.on("error", (err) => {
        console.error("Response error:", err);
        if (!resolved) cleanup();
      });
      
      // Call Express handler
      try {
        expressApp(req, res);
      } catch (err) {
        console.error("Express handler error:", err);
        console.error(err.stack);
        if (!res.headersSent && !resolved) {
          res.status(500).json({
            error: "Handler error",
            message: err.message,
            details: process.env.NODE_ENV === "development" ? err.stack : "Check Vercel function logs"
          });
        }
        cleanup();
      }
      
      // Timeout fallback (60 seconds for Vercel Pro, 10 for free)
      setTimeout(cleanup, 60000);
    });
  } catch (error) {
    console.error("Vercel handler error:", error);
    console.error(error.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Server error",
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.stack : "Check Vercel function logs"
      });
    }
  }
};
