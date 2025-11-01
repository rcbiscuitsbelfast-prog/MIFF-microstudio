var Server, fs;

fs = require("fs");

Server = require(__dirname + "/server.js");

this.App = (function() {
  function App() {
    this.config = {
      realm: "local"
    };
    
    // Check for Vercel in-memory config first
    if (process.env.VERCEL_CONFIG) {
      try {
        this.config = JSON.parse(process.env.VERCEL_CONFIG);
        console.info("Vercel config loaded from environment");
        this.server = new Server(this.config);
        return;
      } catch (e) {
        console.warn("Failed to parse VERCEL_CONFIG:", e.message);
      }
    }
    
    fs.readFile("../config.json", (function(_this) {
      return function(err, data) {
        if (!err) {
          _this.config = JSON.parse(data);
          console.info("config.json loaded");
        } else {
          console.info("No config.json file found, running local with default settings");
          // For Vercel, use production defaults if no config
          if (process.env.VERCEL) {
            _this.config = {
              realm: "production",
              proxy: true,
              port: process.env.PORT || 8080,
              standalone: false
            };
            console.info("Using Vercel default config");
          }
        }
        return _this.server = new Server(_this.config);
      };
    })(this));
  }

  return App;

})();

module.exports = new this.App();
