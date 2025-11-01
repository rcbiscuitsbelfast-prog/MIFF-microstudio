// Vercel serverless function entry point for microStudio
const path = require("path");
const fs = require("fs");

// Set app_data to workspace root before requiring anything
const workspaceRoot = path.join(__dirname, "..");
process.env.APP_DATA = workspaceRoot;

// Create config.json if it doesn't exist (for Vercel)
const configPath = path.join(workspaceRoot, "config.json");
if (!fs.existsSync(configPath)) {
  const defaultConfig = {
    realm: "production",
    proxy: true,
    port: process.env.PORT || 8080,
    standalone: false
  };
  
  // Use config_prod.json as base if it exists
  const prodConfigPath = path.join(workspaceRoot, "config_prod.json");
  if (fs.existsSync(prodConfigPath)) {
        try {
          const prodConfig = JSON.parse(fs.readFileSync(prodConfigPath, "utf8"));
          Object.assign(defaultConfig, prodConfig);
        } catch (e) {
          console.warn("Could not read config_prod.json:", e.message);
        }
      }
  
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
}

// Change to server directory so relative paths work
process.chdir(path.join(__dirname, "../server"));

let expressApp = null;
let initPromise = null;

function initializeServer() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = new Promise((resolve, reject) => {
    try {
      // Import the server app - this triggers initialization
      const appModule = require("../server/app.js");
      
      // The server initializes asynchronously in the constructor
      // We need to wait for the Express app to be created
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds max
      
      const checkServer = setInterval(() => {
        attempts++;
        
        if (appModule.server && appModule.server.app) {
          expressApp = appModule.server.app;
          clearInterval(checkServer);
          console.log("Server initialized successfully");
          resolve(expressApp);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkServer);
          const error = new Error("Server initialization timeout - app not ready");
          console.error(error);
          reject(error);
        }
      }, 100);
    } catch (error) {
      console.error("Server initialization error:", error);
      reject(error);
    }
  });

  return initPromise;
}

// Export handler for Vercel
module.exports = async (req, res) => {
  try {
    // Initialize server if needed (Vercel may reuse the function instance)
    if (!expressApp) {
      await initializeServer();
    }

    if (!expressApp) {
      return res.status(503).json({ 
        error: "Server not initialized",
        message: "The microStudio server is still initializing. Please try again in a moment."
      });
    }

    // Handle the request with Express
    // Note: Express doesn't return a promise, but we can wrap it
    return new Promise((resolve) => {
      expressApp(req, res);
      
      // Ensure we resolve after response ends
      res.on("finish", resolve);
      res.on("close", resolve);
      
      // Timeout fallback
      setTimeout(resolve, 30000);
    });
  } catch (error) {
    console.error("Vercel handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Server error",
        message: error.message 
      });
    }
  }
};
