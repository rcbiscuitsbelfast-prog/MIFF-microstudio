fs = require "fs"
path = require "path"

class @AssetModules
  constructor:(@server)->
    @modules = {}
    @asset_cache = {}
    @base_path = path.join(__dirname, "../../../assets")
    @scanModules()

  scanModules:()->
    # Asset module structure
    @module_paths = 
      "superpowers": "assets/2d/superpowers"
      "gdquest-sprites": "assets/2d/gdquest-sprites"
      "cordon-sprites": "assets/2d/cordon-sprites"
      "pixellevel": "assets/2d/pixellevel"
      "lpc-characters": "assets/2d/lpc-characters"
      "kenney-ui": "assets/ui/kenney-ui"
      "bunnitech": "assets/mixed/bunnitech"

    for module_name, module_path of @module_paths
      @modules[module_name] = 
        name: module_name
        path: module_path
        full_path: path.join(@base_path, "../", module_path)
        assets: []
        categories: 
          ground_tiles: []
          world_assets: []
          collision: []
          characters: []
          ui: []

  scanModuleAssets:(module_name)->
    module = @modules[module_name]
    return [] if not module?

    assets = []
    full_path = module.full_path

    try
      # Recursively find all image files
      files = @findImageFiles(full_path)
      
      for file_path in files
        rel_path = path.relative(full_path, file_path)
        category = @categorizeAsset(rel_path, module_name)
        
        asset = 
          module: module_name
          name: path.basename(file_path, path.extname(file_path))
          path: rel_path
          full_path: file_path
          category: category
          url: "/asset-module/#{module_name}/#{rel_path.replace(/\\/g, '/')}"
        
        assets.push asset
        module.assets.push asset
        module.categories[category].push asset if module.categories[category]?

    return assets
    catch e
      console.error "Error scanning module #{module_name}:", e
      return []

  findImageFiles:(dir, fileList = [])->
    try
      files = fs.readdirSync(dir)
      
      for file in files
        file_path = path.join(dir, file)
        stat = fs.statSync(file_path)
        
        if stat.isDirectory()
          # Skip hidden directories and common non-asset dirs
          if not file.startsWith(".") and file != "node_modules"
            @findImageFiles(file_path, fileList)
        else if /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
          fileList.push file_path
      
      return fileList
    catch e
      return fileList

  categorizeAsset:(file_path, module_name)->
    path_lower = file_path.toLowerCase()
    name_lower = path.basename(file_path).toLowerCase()
    
    # Ground tiles
    if /tile|ground|floor|platform|brick|wall|grass|dirt|stone|cobble/i.test(path_lower) or
       /base|terrain|land/i.test(path_lower) or
       module_name == "pixellevel" and /dungeon|environment/i.test(path_lower)
      return "ground_tiles"
    
    # Characters
    if /character|player|hero|person|sprite.*char|lpc|pc|npc/i.test(path_lower) or
       module_name == "lpc-characters" or
       /walk|run|idle|attack|anim/i.test(name_lower)
      return "characters"
    
    # UI elements
    if /ui|button|panel|icon|menu|hud|interface|gui/i.test(path_lower) or
       module_name == "kenney-ui"
      return "ui"
    
    # World assets (buildings, props, decorations, nature)
    if /building|house|tree|rock|prop|decoration|object|item|chest|door|sign|fence|barrel|crate|box/i.test(path_lower) or
       /nature|environment|world|level|scene/i.test(path_lower)
      return "world_assets"
    
    # Default to world_assets
    return "world_assets"

  getAllAssets:(category = null)->
    all_assets = []
    
    for module_name, module of @modules
      if category?
        assets = module.categories[category] or []
      else
        assets = module.assets
      
      all_assets = all_assets.concat(assets)
    
    return all_assets

  getModulesByCategory:(category)->
    result = []
    
    for module_name, module of @modules
      if module.categories[category]?.length > 0
        result.push
          name: module_name
          display_name: @getDisplayName(module_name)
          assets: module.categories[category]
          count: module.categories[category].length
    
    return result

  getDisplayName:(module_name)->
    names = 
      "superpowers": "Superpowers Packs"
      "gdquest-sprites": "GDQuest Sprites"
      "cordon-sprites": "Cordon Sprites"
      "pixellevel": "Pixel Level"
      "lpc-characters": "RPG Characters"
      "kenney-ui": "UI Elements"
      "bunnitech": "Free Game Assets"
    
    return names[module_name] or module_name

  # API endpoint data
  getAssetList:(category = null)->
    if category?
      assets = @getAllAssets(category)
    else
      assets = @getAllAssets()
    
    # Group by module for easier browsing
    grouped = {}
    for asset in assets
      if not grouped[asset.module]?
        grouped[asset.module] = []
      grouped[asset.module].push
        name: asset.name
        path: asset.path
        url: asset.url
        category: asset.category
    
    return grouped

  # Scan all modules (can be expensive, cache results)
  scanAllModules:()->
    console.info "Scanning all asset modules..."
    for module_name of @modules
      @scanModuleAssets(module_name)
    console.info "Asset module scanning complete"

module.exports = @AssetModules
