# Simple No-Code World Builder - Drag and Drop Interface
class SimpleWorldBuilder
  constructor:(@app)->
    @mode = null # "side-scroll" or "top-down"
    @selected_tile = null
    @canvas = null
    @ctx = null
    @tiles = {}
    @world_assets = {}
    @collision_map = {}
    @grid_size = 32
    @init()

  init:()->
    @container = document.getElementById("simple-world-builder")
    return if not @container?
    
    @setupCanvas()
    @setupMenu()
    @loadTileSheets()

  setupCanvas:()->
    # Create main canvas for world editing
    @canvas = document.createElement("canvas")
    @canvas.id = "world-canvas"
    @canvas.width = 800
    @canvas.height = 600
    @canvas.style.border = "2px solid #fff"
    @canvas.style.cursor = "crosshair"
    @canvas.style.background = "#1a1a2e"
    
    @ctx = @canvas.getContext("2d")
    @container.appendChild(@canvas)
    
    # Canvas interaction
    @canvas.addEventListener "mousedown", (e)=>
      @handleCanvasClick(e)
    
    @canvas.addEventListener "mousemove", (e)=>
      @handleCanvasHover(e)
    
    @canvas.addEventListener "dragstart", (e)=>
      e.preventDefault()
    
    @canvas.addEventListener "drop", (e)=>
      @handleDrop(e)

  setupMenu:()->
    # Hidden menu button (top right corner)
    @menu_button = document.createElement("div")
    @menu_button.className = "simple-menu-button"
    @menu_button.innerHTML = "<i class='fa fa-bars'></i>"
    @menu_button.addEventListener "click", ()=>
      @toggleMenu()
    @container.appendChild(@menu_button)
    
    # Menu panel (slides in from right)
    @menu_panel = document.createElement("div")
    @menu_panel.className = "simple-menu-panel"
    @menu_panel.innerHTML = """
      <div class="menu-header">
        <h3>World Builder</h3>
        <button class="menu-close"><i class="fa fa-times"></i></button>
      </div>
      <div class="menu-tabs">
        <button class="menu-tab active" data-tab="tiles">?? Ground Tiles</button>
        <button class="menu-tab" data-tab="assets">?? World Assets</button>
        <button class="menu-tab" data-tab="collision">?? Collision</button>
        <button class="menu-tab" data-tab="options">?? Options</button>
      </div>
      <div class="menu-content">
        <div class="menu-section" id="menu-tiles">
          <div class="tile-palette" id="tile-palette"></div>
        </div>
        <div class="menu-section hidden" id="menu-assets">
          <div class="asset-palette" id="asset-palette"></div>
        </div>
        <div class="menu-section hidden" id="menu-collision">
          <p>Draw collision zones by clicking on the canvas</p>
          <button class="clear-collision">Clear All Collision</button>
        </div>
        <div class="menu-section hidden" id="menu-options">
          <label>World Type:</label>
          <select id="world-type">
            <option value="side-scroll">Side Scrolling</option>
            <option value="top-down">Top Down</option>
          </select>
          <br><br>
          <label>Grid Size:</label>
          <input type="number" id="grid-size" value="32" min="8" max="64">
          <br><br>
          <button class="clear-world">Clear World</button>
        </div>
      </div>
    """
    @container.appendChild(@menu_panel)
    
    # Menu interactions
    @menu_panel.querySelector(".menu-close").addEventListener "click", ()=>
      @hideMenu()
    
    @menu_panel.querySelectorAll(".menu-tab").forEach (tab)=>
      tab.addEventListener "click", ()=>
        @switchTab(tab.dataset.tab)
    
    @menu_panel.querySelector("#world-type").addEventListener "change", (e)=>
      @mode = e.target.value
      @redraw()
    
    @menu_panel.querySelector("#grid-size").addEventListener "change", (e)=>
      @grid_size = parseInt(e.target.value)
      @redraw()

  toggleMenu:()->
    if @menu_panel.classList.contains("visible")
      @hideMenu()
    else
      @showMenu()

  showMenu:()->
    @menu_panel.classList.add("visible")

  hideMenu:()->
    @menu_panel.classList.remove("visible")

  switchTab:(tab_name)->
    @menu_panel.querySelectorAll(".menu-tab").forEach (t)=>
      t.classList.remove("active")
    @menu_panel.querySelectorAll(".menu-section").forEach (s)=>
      s.classList.add("hidden")
    
    @menu_panel.querySelector(".menu-tab[data-tab='#{tab_name}']")?.classList.add("active")
    @menu_panel.querySelector("#menu-#{tab_name}")?.classList.remove("hidden")
    
    # Load content for tab
    switch tab_name
      when "tiles" then @loadTiles()
      when "assets" then @loadAssets()
      when "collision" then @loadCollisionUI()

  loadTileSheets:()->
    # Load tile sheets from asset modules
    fetch("/api/asset-modules/list?category=ground_tiles").then (response)=>
      response.json().then (data)=>
        @processTileSheets(data)

  processTileSheets:(data)->
    # Process and extract individual tiles from sheets
    for module_name, assets of data
      for asset in assets
        if @isTileSheet(asset)
          @loadTileSheet(asset, module_name)

  isTileSheet:(asset)->
    # Heuristic: tiles usually in "tile" folder or named with "sheet"
    path = asset.path.toLowerCase()
    return path.indexOf("tile") >= 0 or path.indexOf("sheet") >= 0

  loadTileSheet:(asset, module_name)->
    # Load tile sheet image and extract individual tiles
    img = new Image()
    img.onload = ()=>
      tiles = @extractTilesFromSheet(img, asset, module_name)
      @tiles[asset.name] = tiles
      @renderTilePalette()
    
    img.src = asset.url

  extractTilesFromSheet:(img, asset, module_name)->
    # Extract individual tiles (assuming 32x32 default)
    tiles = []
    tile_size = @grid_size
    
    cols = Math.floor(img.width / tile_size)
    rows = Math.floor(img.height / tile_size)
    
    for row in [0...rows]
      for col in [0...cols]
        tile = 
          x: col * tile_size
          y: row * tile_size
          width: tile_size
          height: tile_size
          source: img
          name: "#{asset.name}_#{row}_#{col}"
          module: module_name
        
        tiles.push(tile)
    
    return tiles

  loadTiles:()->
    # Already loaded via loadTileSheets
    @renderTilePalette()

  renderTilePalette:()->
    palette = document.getElementById("tile-palette")
    return if not palette?
    palette.innerHTML = ""
    
    for sheet_name, tiles of @tiles
      # Group header
      header = document.createElement("div")
      header.className = "palette-group-header"
      header.textContent = sheet_name
      palette.appendChild(header)
      
      # Tile grid
      grid = document.createElement("div")
      grid.className = "palette-grid"
      
      for tile in tiles
        tile_item = @createTileItem(tile)
        grid.appendChild(tile_item)
      
      palette.appendChild(grid)

  createTileItem:(tile)->
    item = document.createElement("div")
    item.className = "palette-item"
    item.dataset.tile_name = tile.name
    
    # Preview canvas
    canvas = document.createElement("canvas")
    canvas.width = @grid_size
    canvas.height = @grid_size
    canvas.className = "tile-preview"
    
    ctx = canvas.getContext("2d")
    ctx.drawImage tile.source, tile.x, tile.y, tile.width, tile.height, 0, 0, @grid_size, @grid_size
    
    item.appendChild(canvas)
    
    # Click to select
    item.addEventListener "click", ()=>
      @selectTile(tile)
    
    # Drag support
    item.draggable = true
    item.addEventListener "dragstart", (e)=>
      e.dataTransfer.setData "tile", JSON.stringify(tile)
    
    return item

  selectTile:(tile)->
    @selected_tile = tile
    document.querySelectorAll(".palette-item").forEach (item)=>
      item.classList.remove("selected")
    event?.currentTarget?.classList.add("selected")
    @canvas.style.cursor = "crosshair"

  loadAssets:()->
    fetch("/api/asset-modules/list?category=world_assets").then (response)=>
      response.json().then (data)=>
        @renderAssetPalette(data)

  renderAssetPalette:(data)->
    palette = document.getElementById("asset-palette")
    return if not palette?
    palette.innerHTML = ""
    
    for module_name, assets of data
      header = document.createElement("div")
      header.className = "palette-group-header"
      header.textContent = module_name
      palette.appendChild(header)
      
      grid = document.createElement("div")
      grid.className = "palette-grid"
      
      for asset in assets
        item = @createAssetItem(asset)
        grid.appendChild(item)
      
      palette.appendChild(grid)

  createAssetItem:(asset)->
    item = document.createElement("div")
    item.className = "palette-item asset-item"
    
    img = document.createElement("img")
    img.src = asset.url
    img.className = "asset-preview"
    item.appendChild(img)
    
    name = document.createElement("div")
    name.className = "asset-name"
    name.textContent = asset.name
    item.appendChild(name)
    
    item.draggable = true
    item.addEventListener "dragstart", (e)=>
      e.dataTransfer.setData "asset", JSON.stringify(asset)
    
    item.addEventListener "click", ()=>
      @selectAsset(asset)
    
    return item

  selectAsset:(asset)->
    @selected_asset = asset
    @canvas.style.cursor = "grab"

  loadCollisionUI:()->
    # Collision tools
    @collision_mode = false

  handleCanvasClick:(e)->
    rect = @canvas.getBoundingClientRect()
    x = e.clientX - rect.left
    y = e.clientY - rect.top
    
    grid_x = Math.floor(x / @grid_size) * @grid_size
    grid_y = Math.floor(y / @grid_size) * @grid_size
    
    if @selected_tile
      @placeTile(grid_x, grid_y, @selected_tile)
    else if @selected_asset
      @placeAsset(grid_x, grid_y, @selected_asset)

  handleCanvasHover:(e)->
    # Show grid preview
    rect = @canvas.getBoundingClientRect()
    x = e.clientX - rect.left
    y = e.clientY - rect.top
    
    grid_x = Math.floor(x / @grid_size) * @grid_size
    grid_y = Math.floor(y / @grid_size) * @grid_size
    
    # Could show preview here

  handleDrop:(e)->
    e.preventDefault()
    rect = @canvas.getBoundingClientRect()
    x = e.clientX - rect.left
    y = e.clientY - rect.top
    
    grid_x = Math.floor(x / @grid_size) * @grid_size
    grid_y = Math.floor(y / @grid_size) * @grid_size
    
    tile_data = e.dataTransfer.getData("tile")
    if tile_data
      tile = JSON.parse(tile_data)
      @placeTile(grid_x, grid_y, tile)
    
    asset_data = e.dataTransfer.getData("asset")
    if asset_data
      asset = JSON.parse(asset_data)
      @placeAsset(grid_x, grid_y, asset)

  placeTile:(x, y, tile)->
    key = "#{x},#{y}"
    @tiles[key] = {x, y, tile}
    @redraw()

  placeAsset:(x, y, asset)->
    key = "#{x},#{y}"
    @world_assets[key] = {x, y, asset}
    @redraw()

  redraw:()->
    # Clear canvas
    @ctx.fillStyle = "#1a1a2e"
    @ctx.fillRect(0, 0, @canvas.width, @canvas.height)
    
    # Draw grid
    @drawGrid()
    
    # Draw placed tiles
    for key, tile_data of @tiles
      @drawTile(tile_data.x, tile_data.y, tile_data.tile)
    
    # Draw placed assets
    for key, asset_data of @world_assets
      @drawAsset(asset_data.x, asset_data.y, asset_data.asset)

  drawGrid:()->
    @ctx.strokeStyle = "rgba(255,255,255,0.1)"
    @ctx.lineWidth = 1
    
    for x in [0..@canvas.width] by @grid_size
      @ctx.beginPath()
      @ctx.moveTo(x, 0)
      @ctx.lineTo(x, @canvas.height)
      @ctx.stroke()
    
    for y in [0..@canvas.height] by @grid_size
      @ctx.beginPath()
      @ctx.moveTo(0, y)
      @ctx.lineTo(@canvas.width, y)
      @ctx.stroke()

  drawTile:(x, y, tile)->
    @ctx.drawImage tile.source, tile.x, tile.y, tile.width, tile.height, x, y, @grid_size, @grid_size

  drawAsset:(x, y, asset)->
    img = new Image()
    img.onload = ()=>
      @ctx.drawImage img, x, y
    img.src = asset.url

# Initialize when ready
window.addEventListener "load", ()->
  if window.app
    window.simple_world_builder = new SimpleWorldBuilder(window.app)
