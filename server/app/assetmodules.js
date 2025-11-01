const fs = require("fs");
const path = require("path");

class AssetModules {
  constructor(server) {
    this.server = server;
    this.modules = {};
    this.asset_cache = {};
    this.base_path = path.join(__dirname, "../../..");
    this.scanModules();
  }

  scanModules() {
    // Asset module structure
    this.module_paths = {
      "superpowers": "assets/2d/superpowers",
      "gdquest-sprites": "assets/2d/gdquest-sprites",
      "cordon-sprites": "assets/2d/cordon-sprites",
      "pixellevel": "assets/2d/pixellevel",
      "lpc-characters": "assets/2d/lpc-characters",
      "kenney-ui": "assets/ui/kenney-ui",
      "bunnitech": "assets/mixed/bunnitech"
    };

    for (const module_name in this.module_paths) {
      const module_path = this.module_paths[module_name];
      this.modules[module_name] = {
        name: module_name,
        path: module_path,
        full_path: path.join(this.base_path, "../", module_path),
        assets: [],
        categories: {
          ground_tiles: [],
          world_assets: [],
          collision: [],
          characters: [],
          ui: []
        }
      };
    }
  }

  scanModuleAssets(module_name) {
    const module = this.modules[module_name];
    if (!module) return [];

    const assets = [];
    const full_path = module.full_path;

    try {
      // Recursively find all image files
      const files = this.findImageFiles(full_path);
      
      for (const file_path of files) {
        const rel_path = path.relative(full_path, file_path);
        const category = this.categorizeAsset(rel_path, module_name);
        
        const asset = {
          module: module_name,
          name: path.basename(file_path, path.extname(file_path)),
          path: rel_path,
          full_path: file_path,
          category: category,
          url: `/asset-module/${module_name}/${rel_path.replace(/\\/g, '/')}`
        };
        
        assets.push(asset);
        module.assets.push(asset);
        if (module.categories[category]) {
          module.categories[category].push(asset);
        }
      }

      return assets;
    } catch (e) {
      console.error(`Error scanning module ${module_name}:`, e);
      return [];
    }
  }

  findImageFiles(dir, fileList = []) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const file_path = path.join(dir, file);
        const stat = fs.statSync(file_path);
        
        if (stat.isDirectory()) {
          // Skip hidden directories and common non-asset dirs
          if (!file.startsWith(".") && file !== "node_modules") {
            this.findImageFiles(file_path, fileList);
          }
        } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(file)) {
          fileList.push(file_path);
        }
      }
      
      return fileList;
    } catch (e) {
      return fileList;
    }
  }

  categorizeAsset(file_path, module_name) {
    const path_lower = file_path.toLowerCase();
    const name_lower = path.basename(file_path).toLowerCase();
    
    // Ground tiles
    if (/tile|ground|floor|platform|brick|wall|grass|dirt|stone|cobble/i.test(path_lower) ||
        /base|terrain|land/i.test(path_lower) ||
        (module_name === "pixellevel" && /dungeon|environment/i.test(path_lower))) {
      return "ground_tiles";
    }
    
    // Characters
    if (/character|player|hero|person|sprite.*char|lpc|pc|npc/i.test(path_lower) ||
        module_name === "lpc-characters" ||
        /walk|run|idle|attack|anim/i.test(name_lower)) {
      return "characters";
    }
    
    // UI elements
    if (/ui|button|panel|icon|menu|hud|interface|gui/i.test(path_lower) ||
        module_name === "kenney-ui") {
      return "ui";
    }
    
    // World assets (buildings, props, decorations, nature)
    if (/building|house|tree|rock|prop|decor|object|item|chest|door|sign|fence|barrel|crate|box/i.test(path_lower) ||
        /nature|environment|world|level|scene/i.test(path_lower)) {
      return "world_assets";
    }
    
    // Default to world_assets
    return "world_assets";
  }

  getAllAssets(category = null) {
    let all_assets = [];
    
    for (const module_name in this.modules) {
      const module = this.modules[module_name];
      let assets;
      if (category) {
        assets = module.categories[category] || [];
      } else {
        assets = module.assets;
      }
      
      all_assets = all_assets.concat(assets);
    }
    
    return all_assets;
  }

  getModulesByCategory(category) {
    const result = [];
    
    for (const module_name in this.modules) {
      const module = this.modules[module_name];
      if (module.categories[category] && module.categories[category].length > 0) {
        result.push({
          name: module_name,
          display_name: this.getDisplayName(module_name),
          assets: module.categories[category],
          count: module.categories[category].length
        });
      }
    }
    
    return result;
  }

  getDisplayName(module_name) {
    const names = {
      "superpowers": "Superpowers Packs",
      "gdquest-sprites": "GDQuest Sprites",
      "cordon-sprites": "Cordon Sprites",
      "pixellevel": "Pixel Level",
      "lpc-characters": "RPG Characters",
      "kenney-ui": "UI Elements",
      "bunnitech": "Free Game Assets"
    };
    
    return names[module_name] || module_name;
  }

  // API endpoint data
  getAssetList(category = null) {
    let assets;
    if (category) {
      assets = this.getAllAssets(category);
    } else {
      assets = this.getAllAssets();
    }
    
    // Group by module for easier browsing
    const grouped = {};
    for (const asset of assets) {
      if (!grouped[asset.module]) {
        grouped[asset.module] = [];
      }
      grouped[asset.module].push({
        name: asset.name,
        path: asset.path,
        url: asset.url,
        category: asset.category
      });
    }
    
    return grouped;
  }

  // Scan all modules (can be expensive, cache results)
  scanAllModules() {
    console.info("Scanning all asset modules...");
    for (const module_name in this.modules) {
      this.scanModuleAssets(module_name);
    }
    console.info("Asset module scanning complete");
  }
}

module.exports = AssetModules;
