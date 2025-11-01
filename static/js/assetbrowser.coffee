# Asset Browser for Child-Friendly Asset Selection
class AssetBrowser
  constructor:(@app)->
    @categories = 
      ground_tiles: "Ground Tiles"
      world_assets: "World Assets"
      collision: "Collision"
      characters: "Characters"
      ui: "UI Elements"
    
    @current_category = null
    @assets = {}
    @init()

  init:()->
    @container = document.getElementById("asset-browser")
    return if not @container?
    
    @setupUI()
    @loadAssets()

  setupUI:()->
    # Create category tabs
    @category_tabs = document.createElement("div")
    @category_tabs.className = "asset-category-tabs"
    
    for category, label of @categories
      tab = document.createElement("div")
      tab.className = "asset-category-tab"
      tab.dataset.category = category
      tab.innerHTML = """
        <i class="fa fa-#{@getCategoryIcon(category)}"></i>
        <span>#{label}</span>
      """
      tab.addEventListener "click", ()=>
        @selectCategory(category)
      @category_tabs.appendChild(tab)
    
    @container.appendChild(@category_tabs)

    # Create asset grid container
    @asset_grid = document.createElement("div")
    @asset_grid.className = "asset-grid"
    @container.appendChild(@asset_grid)

    # Create search box
    search_container = document.createElement("div")
    search_container.className = "asset-search-container"
    search_container.innerHTML = """
      <input type="text" class="asset-search-input" placeholder="Search assets...">
      <i class="fa fa-search"></i>
    """
    @search_input = search_container.querySelector(".asset-search-input")
    @search_input.addEventListener "input", ()=>
      @filterAssets()
    @container.insertBefore(search_container, @asset_grid)

  getCategoryIcon:(category)->
    icons = 
      ground_tiles: "th"
      world_assets: "cube"
      collision: "exclamation-triangle"
      characters: "user"
      ui: "window-restore"
    return icons[category] or "image"

  loadAssets:(category = null)->
    url = "/api/asset-modules/list"
    if category
      url += "?category=#{category}"
    
    fetch(url).then (response)=>
      response.json().then (data)=>
        @assets = data
        @displayAssets(category)

  selectCategory:(category)->
    @current_category = category
    
    # Update tab styles
    tabs = @category_tabs.querySelectorAll(".asset-category-tab")
    for tab in tabs
      if tab.dataset.category == category
        tab.classList.add("active")
      else
        tab.classList.remove("active")
    
    @loadAssets(category)

  displayAssets:(category = null)->
    @asset_grid.innerHTML = ""
    
    asset_count = 0
    
    for module_name, module_assets of @assets
      # Group header
      header = document.createElement("div")
      header.className = "asset-module-header"
      header.textContent = @getModuleDisplayName(module_name)
      @asset_grid.appendChild(header)
      
      # Asset grid for this module
      module_grid = document.createElement("div")
      module_grid.className = "asset-module-grid"
      
      for asset in module_assets
        if not category or asset.category == category
          asset_item = @createAssetItem(asset, module_name)
          module_grid.appendChild(asset_item)
          asset_count++
      
      @asset_grid.appendChild(module_grid) if module_grid.children.length > 0
    
    # Show message if no assets
    if asset_count == 0
      no_assets = document.createElement("div")
      no_assets.className = "no-assets-message"
      no_assets.innerHTML = """
        <i class="fa fa-inbox"></i>
        <p>No assets found in this category</p>
      """
      @asset_grid.appendChild(no_assets)

  createAssetItem:(asset, module_name)->
    item = document.createElement("div")
    item.className = "asset-item"
    item.dataset.url = asset.url
    item.dataset.name = asset.name
    
    # Preview image
    img = document.createElement("img")
    img.src = asset.url
    img.alt = asset.name
    img.className = "asset-preview"
    
    # Asset name
    name_div = document.createElement("div")
    name_div.className = "asset-name"
    name_div.textContent = asset.name
    
    item.appendChild(img)
    item.appendChild(name_div)
    
    # Click handler - add to project
    item.addEventListener "click", ()=>
      @selectAsset(asset, module_name)
    
    return item

  getModuleDisplayName:(module_name)->
    names = 
      "superpowers": "Superpowers Packs"
      "gdquest-sprites": "GDQuest Sprites"
      "cordon-sprites": "Cordon Sprites"
      "pixellevel": "Pixel Level"
      "lpc-characters": "RPG Characters"
      "kenney-ui": "UI Elements"
      "bunnitech": "Free Game Assets"
    return names[module_name] or module_name

  selectAsset:(asset, module_name)->
    # Trigger event or callback to add asset to project
    if @app? and @app.map_editor?
      # Add to map editor tile picker or sprite list
      console.info "Adding asset to project:", asset
    
    # Visual feedback
    event = new CustomEvent("asset-selected", 
      detail: { asset: asset, module: module_name }
    )
    document.dispatchEvent(event)

  filterAssets:()->
    query = @search_input.value.toLowerCase()
    items = @asset_grid.querySelectorAll(".asset-item")
    
    for item in items
      name = item.dataset.name.toLowerCase()
      if name.indexOf(query) >= 0
        item.style.display = ""
      else
        item.style.display = "none"

# Initialize when DOM is ready
window.addEventListener "load", ()->
  if window.app
    window.asset_browser = new AssetBrowser(window.app)
