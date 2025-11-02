# Mobile-First No-Code Pixel World Builder
# Complete rebuild from ground up - all drag and drop, no code

class MobileWorldBuilder
  constructor:(@app)->
    @assets = 
      sprites: []
      tiles: []
    @world = 
      ground: {}
      objects: {}
      collision: {}
      size: { rows: 15, cols: 20 }
    @selected_asset = null
    @selected_tool = "tile" # "tile", "object", "collision"
    @grid_size = 16
    @zoom = 1
    @pan_x = 0
    @pan_y = 0
    @init()

  init:()->
    @container = document.getElementById("mobile-world-builder")
    return if not @container?
    
    @setupUI()
    @setupCanvas()
    @setupToolbar()

  setupUI:()->
    # Mobile-first interface
    @container.innerHTML = """
      <div class="mwb-header">
        <h2>?? Pixel World Builder</h2>
        <button class="mwb-menu-btn"><i class="fa fa-bars"></i></button>
      </div>
      
      <div class="mwb-toolbar">
        <button class="tool-btn active" data-tool="tile">
          <i class="fa fa-th"></i><span>Ground</span>
        </button>
        <button class="tool-btn" data-tool="object">
          <i class="fa fa-cube"></i><span>Objects</span>
        </button>
        <button class="tool-btn" data-tool="collision">
          <i class="fa fa-exclamation-triangle"></i><span>Collision</span>
        </button>
        <button class="tool-btn" data-tool="upload">
          <i class="fa fa-upload"></i><span>Upload</span>
        </button>
      </div>
      
      <div class="mwb-main">
        <div class="mwb-sidebar" id="mwb-sidebar">
          <div class="sidebar-content">
            <div class="upload-section" id="upload-section">
              <h3>?? Upload Sprite Sheet</h3>
              <input type="file" id="sprite-upload" accept="image/*" style="display:none">
              <button class="upload-btn" id="upload-btn">
                <i class="fa fa-cloud-upload-alt"></i>
                Choose Image
              </button>
              <div class="processing-status" id="processing-status"></div>
            </div>
            
            <div class="assets-section" id="assets-section">
              <h3 id="assets-title">?? Ground Tiles</h3>
              <div class="assets-grid" id="assets-grid"></div>
            </div>
            
            <div class="world-controls">
              <h3>World Size</h3>
              <div class="size-controls">
                <button class="expand-btn" data-dir="up">??</button>
                <div class="size-display">
                  <span id="world-size">20 ? 15</span>
                </div>
                <button class="expand-btn" data-dir="down">??</button>
                <button class="expand-btn" data-dir="left">??</button>
                <button class="expand-btn" data-dir="right">??</button>
              </div>
              <div class="zoom-controls">
                <button class="zoom-btn" data-action="out">-</button>
                <span id="zoom-level">100%</span>
                <button class="zoom-btn" data-action="in">+</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mwb-canvas-container" id="canvas-container">
          <canvas id="world-canvas"></canvas>
          <div class="canvas-overlay" id="collision-overlay"></div>
        </div>
      </div>
      
      <div class="mwb-menu-panel" id="menu-panel">
        <div class="menu-header">
          <h3>Menu</h3>
          <button class="menu-close"><i class="fa fa-times"></i></button>
        </div>
        <div class="menu-content">
          <button class="menu-item" id="menu-export">?? Export World</button>
          <button class="menu-item" id="menu-clear">??? Clear World</button>
          <button class="menu-item" id="menu-settings">?? Settings</button>
        </div>
      </div>
    """
    
    @setupInteractions()

  setupInteractions:()->
    # Toolbar buttons
    @container.querySelectorAll(".tool-btn").forEach (btn)=>
      btn.addEventListener "click", ()=>
        @selectTool(btn.dataset.tool)
    
    # Upload
    upload_btn = @container.querySelector("#upload-btn")
    upload_input = @container.querySelector("#sprite-upload")
    upload_btn?.addEventListener "click", ()=>
      upload_input?.click()
    
    upload_input?.addEventListener "change", (e)=>
      @handleSpriteUpload(e.target.files[0]) if e.target.files[0]
    
    # Menu
    menu_btn = @container.querySelector(".mwb-menu-btn")
    menu_panel = @container.querySelector("#menu-panel")
    menu_close = @container.querySelector(".menu-close")
    
    menu_btn?.addEventListener "click", ()=>
      menu_panel?.classList.add("visible")
    
    menu_close?.addEventListener "click", ()=>
      menu_panel?.classList.remove("visible")
    
    # Export
    @container.querySelector("#menu-export")?.addEventListener "click", ()=>
      @exportWorld()
    
    # Expand buttons
    @container.querySelectorAll(".expand-btn").forEach (btn)=>
      btn.addEventListener "click", ()=>
        @expandWorld(btn.dataset.dir)
    
    # Zoom buttons
    @container.querySelectorAll(".zoom-btn").forEach (btn)=>
      btn.addEventListener "click", ()=>
        if btn.dataset.action == "in"
          @zoomIn()
        else
          @zoomOut()

  setupCanvas:()->
    @canvas = @container.querySelector("#world-canvas")
    return if not @canvas?
    
    @ctx = @canvas.getContext("2d")
    @resizeCanvas()
    
    # Touch/mouse events
    @setupCanvasEvents()
    
    @redraw()

  resizeCanvas:()->
    container = @container.querySelector("#canvas-container")
    return if not container?
    
    @canvas.width = container.clientWidth
    @canvas.height = container.clientHeight
    @redraw()

  setupCanvasEvents:()->
    is_drawing = false
    last_pos = null
    
    # Mouse
    @canvas.addEventListener "mousedown", (e)=>
      is_drawing = true
      pos = @getCanvasPosition(e)
      @handleCanvasClick(pos.x, pos.y)
      last_pos = pos
    
    @canvas.addEventListener "mousemove", (e)=>
      if is_drawing
        pos = @getCanvasPosition(e)
        @handleCanvasClick(pos.x, pos.y)
        last_pos = pos
    
    @canvas.addEventListener "mouseup", ()=>
      is_drawing = false
    
    @canvas.addEventListener "mouseleave", ()=>
      is_drawing = false
    
    # Touch
    @canvas.addEventListener "touchstart", (e)=>
      e.preventDefault()
      is_drawing = true
      touch = e.touches[0]
      pos = @getCanvasPosition({clientX: touch.clientX, clientY: touch.clientY})
      @handleCanvasClick(pos.x, pos.y)
      last_pos = pos
    
    @canvas.addEventListener "touchmove", (e)=>
      e.preventDefault()
      if is_drawing and e.touches[0]
        touch = e.touches[0]
        pos = @getCanvasPosition({clientX: touch.clientX, clientY: touch.clientY})
        @handleCanvasClick(pos.x, pos.y)
        last_pos = pos
    
    @canvas.addEventListener "touchend", ()=>
      is_drawing = false
    
    # Pan with two fingers or right mouse
    @canvas.addEventListener "contextmenu", (e)=>
      e.preventDefault()
    
    # Pinch zoom (would need more complex handling)

  getCanvasPosition:(e)->
    rect = @canvas.getBoundingClientRect()
    x = (e.clientX - rect.left) / @zoom - @pan_x
    y = (e.clientY - rect.top) / @zoom - @pan_y
    
    grid_x = Math.floor(x / @grid_size)
    grid_y = Math.floor(y / @grid_size)
    
    return {x: grid_x, y: grid_y, pixel_x: grid_x * @grid_size, pixel_y: grid_y * @grid_size}

  setupToolbar:()->
    # Will be set up in setupInteractions

  selectTool:(tool)->
    @selected_tool = tool
    @container.querySelectorAll(".tool-btn").forEach (btn)=>
      if btn.dataset.tool == tool
        btn.classList.add("active")
      else
        btn.classList.remove("active")
    
    # Update assets section title
    title_map = 
      tile: "?? Ground Tiles"
      object: "?? World Objects"
      collision: "?? Collision"
      upload: "?? Upload Assets"
    
    title = @container.querySelector("#assets-title")
    title.textContent = title_map[tool] or "Assets"
    
    # Show/hide sections
    upload_section = @container.querySelector("#upload-section")
    assets_section = @container.querySelector("#assets-section")
    
    if tool == "upload"
      upload_section.style.display = "block"
      assets_section.style.display = "none"
    else
      upload_section.style.display = "none"
      assets_section.style.display = "block"
      @renderAssets()

  handleSpriteUpload:(file)->
    status = @container.querySelector("#processing-status")
    status.innerHTML = "Processing..."
    
    reader = new FileReader()
    reader.onload = (e)=>
      img = new Image()
      img.onload = ()=>
        @processSpriteSheet(img, file.name)
      img.src = e.target.result
    
    reader.readAsDataURL(file)

  processSpriteSheet:(img, filename)->
    # Phase 1: Auto-detect sprites using flood fill
    # For now, also offer grid slicing
    
    status = @container.querySelector("#processing-status")
    status.innerHTML = """
      <div class="processing-options">
        <h4>How to slice?</h4>
        <button class="auto-detect-btn">Auto Detect</button>
        <button class="grid-slice-btn">Grid Slice</button>
      </div>
    """
    
    @container.querySelector(".auto-detect-btn")?.addEventListener "click", ()=>
      @autoDetectSprites(img, filename)
    
    @container.querySelector(".grid-slice-btn")?.addEventListener "click", ()=>
      @showGridSliceDialog(img, filename)

  autoDetectSprites:(img, filename)->
    # Phase 1: Flood fill detection
    # Extract sprites using flood fill algorithm
    canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0)
    
    image_data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    detected = @floodFillDetection(image_data)
    
    status = @container.querySelector("#processing-status")
    status.innerHTML = "Found #{detected.length} sprites! Loading..."
    
    # Extract each sprite
    for sprite_data in detected
      sprite = @extractSprite(img, sprite_data)
      @assets.sprites.push(sprite)
    
    @selectTool("object")
    @renderAssets()

  floodFillDetection:(image_data)->
    # Simple flood fill to detect sprite boundaries
    # Returns array of {x, y, width, height} bounding boxes
    width = image_data.width
    height = image_data.height
    data = image_data.data
    visited = new Array(width * height).fill(false)
    sprites = []
    
    for y in [0...height]
      for x in [0...width]
        idx = (y * width + x) * 4
        alpha = data[idx + 3]
        
        if alpha > 0 and not visited[y * width + x]
          # Found unvisited pixel - flood fill from here
          bounds = @floodFill(x, y, width, height, data, visited)
          if bounds.width > 4 and bounds.height > 4 # Ignore tiny sprites
            sprites.push(bounds)
    
    return sprites

  floodFill:(start_x, start_y, width, height, data, visited)->
    # Simple flood fill implementation
    stack = [{x: start_x, y: start_y}]
    min_x = start_x
    max_x = start_x
    min_y = start_y
    max_y = start_y
    
    while stack.length > 0
      {x, y} = stack.pop()
      
      if x < 0 or x >= width or y < 0 or y >= height
        continue
      
      idx = y * width + x
      if visited[idx]
        continue
      
      pixel_idx = idx * 4
      alpha = data[pixel_idx + 3]
      
      if alpha == 0
        continue
      
      visited[idx] = true
      min_x = Math.min(min_x, x)
      max_x = Math.max(max_x, x)
      min_y = Math.min(min_y, y)
      max_y = Math.max(max_y, y)
      
      # Check neighbors
      stack.push({x: x+1, y})
      stack.push({x: x-1, y})
      stack.push({x, y: y+1})
      stack.push({x, y: y-1})
    
    return {
      x: min_x
      y: min_y
      width: max_x - min_x + 1
      height: max_y - min_y + 1
    }

  extractSprite:(source_img, bounds)->
    # Extract sprite from source image
    canvas = document.createElement("canvas")
    canvas.width = bounds.width
    canvas.height = bounds.height
    ctx = canvas.getContext("2d")
    
    ctx.drawImage source_img, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height
    
    return 
      id: "sprite_#{Date.now()}_#{Math.random().toString(36).substr(2,9)}"
      image: canvas
      width: bounds.width
      height: bounds.height
      type: "sprite"
      collision: false
      data_url: canvas.toDataURL()

  showGridSliceDialog:(img, filename)->
    # Phase 2: Grid slice option
    status = @container.querySelector("#processing-status")
    status.innerHTML = """
      <div class="grid-slice-dialog">
        <h4>Grid Size:</h4>
        <input type="number" id="slice-size" value="16" min="8" max="64">
        <button class="slice-btn">Slice Now</button>
      </div>
    """
    
    @container.querySelector(".slice-btn")?.addEventListener "click", ()=>
      size = parseInt(@container.querySelector("#slice-size").value)
      @gridSliceImage(img, size, filename)

  gridSliceImage:(img, tile_size, filename)->
    # Phase 2: Grid slicing
    cols = Math.floor(img.width / tile_size)
    rows = Math.floor(img.height / tile_size)
    
    tiles = []
    
    for row in [0...rows]
      for col in [0...cols]
        canvas = document.createElement("canvas")
        canvas.width = tile_size
        canvas.height = tile_size
        ctx = canvas.getContext("2d")
        
        ctx.drawImage img, col * tile_size, row * tile_size, tile_size, tile_size, 0, 0, tile_size, tile_size
        
        # Check if tile has content (not transparent)
        image_data = ctx.getImageData(0, 0, tile_size, tile_size)
        has_content = false
        for i in [0...image_data.data.length] by 4
          if image_data.data[i+3] > 0
            has_content = true
            break
        
        if has_content
          tiles.push
            id: "tile_#{filename}_#{row}_#{col}"
            image: canvas
            width: tile_size
            height: tile_size
            type: "tile"
            data_url: canvas.toDataURL()
    
    @assets.tiles = @assets.tiles.concat(tiles)
    
    status = @container.querySelector("#processing-status")
    status.innerHTML = "Created #{tiles.length} tiles!"
    
    @selectTool("tile")
    @renderAssets()

  renderAssets:()->
    grid = @container.querySelector("#assets-grid")
    return if not grid?
    
    grid.innerHTML = ""
    
    assets = if @selected_tool == "object" then @assets.sprites else @assets.tiles
    
    if assets.length == 0
      grid.innerHTML = "<p>No assets yet. Upload a sprite sheet!</p>"
      return
    
    for asset in assets
      item = @createAssetItem(asset)
      grid.appendChild(item)

  createAssetItem:(asset)->
    item = document.createElement("div")
    item.className = "asset-item"
    item.dataset.asset_id = asset.id
    
    # Preview
    preview = document.createElement("canvas")
    preview.width = 64
    preview.height = 64
    ctx = preview.getContext("2d")
    
    # Scale to fit
    scale = Math.min(64 / asset.width, 64 / asset.height)
    w = asset.width * scale
    h = asset.height * scale
    x = (64 - w) / 2
    y = (64 - h) / 2
    
    ctx.drawImage asset.image, x, y, w, h
    
    item.appendChild(preview)
    
    # Collision toggle for sprites
    if asset.type == "sprite"
      collision_btn = document.createElement("button")
      collision_btn.className = "collision-toggle #{if asset.collision then 'active' else ''}"
      collision_btn.innerHTML = "<i class='fa fa-shield-alt'></i>"
      collision_btn.title = if asset.collision then "Solid" else "Passable"
      collision_btn.addEventListener "click", (e)=>
        e.stopPropagation()
        asset.collision = not asset.collision
        collision_btn.classList.toggle("active")
        collision_btn.title = if asset.collision then "Solid" else "Passable"
      item.appendChild(collision_btn)
    
    # Click to select
    item.addEventListener "click", ()=>
      @selectAsset(asset)
      @container.querySelectorAll(".asset-item").forEach (i)=>
        i.classList.remove("selected")
      item.classList.add("selected")
    
    # Drag support
    item.draggable = true
    item.addEventListener "dragstart", (e)=>
      e.dataTransfer.setData "asset", JSON.stringify(asset)
    
    return item

  selectAsset:(asset)->
    @selected_asset = asset

  handleCanvasClick:(grid_x, grid_y)->
    return if not @selected_asset?
    
    key = "#{grid_x},#{grid_y}"
    
    switch @selected_tool
      when "tile"
        @world.ground[key] = 
          asset_id: @selected_asset.id
          x: grid_x
          y: grid_y
      when "object"
        @world.objects[key] = 
          asset_id: @selected_asset.id
          x: grid_x
          y: grid_y
      when "collision"
        if @world.collision[key]?
          delete @world.collision[key]
        else
          @world.collision[key] = true
    
    @redraw()

  redraw:()->
    # Clear
    @ctx.fillStyle = "#1a1a2e"
    @ctx.fillRect(0, 0, @canvas.width, @canvas.height)
    
    # Apply zoom and pan
    @ctx.save()
    @ctx.translate(@pan_x, @pan_y)
    @ctx.scale(@zoom, @zoom)
    
    # Draw grid
    @drawGrid()
    
    # Draw ground layer
    @drawLayer("ground")
    
    # Draw objects layer
    @drawLayer("objects")
    
    # Draw collision overlay
    @drawCollisionLayer()
    
    @ctx.restore()
    
    # Update zoom display
    zoom_display = @container.querySelector("#zoom-level")
    zoom_display.textContent = "#{Math.round(@zoom * 100)}%" if zoom_display

  drawGrid:()->
    @ctx.strokeStyle = "rgba(255,255,255,0.1)"
    @ctx.lineWidth = 1
    
    start_x = Math.floor(-@pan_x / @zoom / @grid_size)
    end_x = Math.ceil((@canvas.width - @pan_x) / @zoom / @grid_size)
    start_y = Math.floor(-@pan_y / @zoom / @grid_size)
    end_y = Math.ceil((@canvas.height - @pan_y) / @zoom / @grid_size)
    
    for x in [start_x...end_x]
      px = x * @grid_size
      @ctx.beginPath()
      @ctx.moveTo(px, start_y * @grid_size)
      @ctx.lineTo(px, end_y * @grid_size)
      @ctx.stroke()
    
    for y in [start_y...end_y]
      py = y * @grid_size
      @ctx.beginPath()
      @ctx.moveTo(start_x * @grid_size, py)
      @ctx.lineTo(end_x * @grid_size, py)
      @ctx.stroke()

  drawLayer:(layer_name)->
    layer_data = if layer_name == "ground" then @world.ground else @world.objects
    
    for key, data of layer_data
      asset = @findAsset(data.asset_id)
      continue if not asset?
      
      x = data.x * @grid_size
      y = data.y * @grid_size
      
      if asset.type == "tile"
        # Scale tile to grid size
        @ctx.drawImage asset.image, x, y, @grid_size, @grid_size
      else
        # Scale sprite proportionally
        scale = Math.min(@grid_size / asset.width, @grid_size / asset.height)
        w = asset.width * scale
        h = asset.height * scale
        offset_y = @grid_size - h # Align to bottom
        @ctx.drawImage asset.image, x, y + offset_y, w, h

  drawCollisionLayer:()->
    overlay = @container.querySelector("#collision-overlay")
    return if not overlay?
    
    overlay.innerHTML = ""
    
    for key of @world.collision
      [x, y] = key.split(",").map(Number)
      div = document.createElement("div")
      div.className = "collision-cell"
      div.style.left = "#{x * @grid_size * @zoom + @pan_x}px"
      div.style.top = "#{y * @grid_size * @zoom + @pan_y}px"
      div.style.width = "#{@grid_size * @zoom}px"
      div.style.height = "#{@grid_size * @zoom}px"
      overlay.appendChild(div)

  findAsset:(asset_id)->
    for asset in @assets.tiles.concat(@assets.sprites)
      return asset if asset.id == asset_id
    return null

  expandWorld:(direction)->
    switch direction
      when "up"
        @world.size.rows += 5
      when "down"
        @world.size.rows += 5
      when "left"
        @world.size.cols += 5
      when "right"
        @world.size.cols += 5
    
    @container.querySelector("#world-size").textContent = "#{@world.size.cols} ? #{@world.size.rows}"
    @redraw()

  zoomIn:()->
    @zoom = Math.min(@zoom * 1.2, 4)
    @redraw()

  zoomOut:()->
    @zoom = Math.max(@zoom / 1.2, 0.25)
    @redraw()

  exportWorld:()->
    # Phase 7: Export as JSON
    export_data = 
      worldSize: @world.size
      gridSize: @grid_size
      layers:
        ground: []
        objects: []
        collision: []
    
    # Export ground tiles
    for key, data of @world.ground
      export_data.layers.ground.push
        x: data.x
        y: data.y
        assetId: data.asset_id
    
    # Export objects
    for key, data of @world.objects
      asset = @findAsset(data.asset_id)
      export_data.layers.objects.push
        x: data.x
        y: data.y
        assetId: data.asset_id
        collision: asset?.collision or false
    
    # Export collision
    for key of @world.collision
      [x, y] = key.split(",").map(Number)
      export_data.layers.collision.push {x, y}
    
    # Download JSON
    blob = new Blob([JSON.stringify(export_data, null, 2)], {type: "application/json"})
    url = URL.createObjectURL(blob)
    a = document.createElement("a")
    a.href = url
    a.download = "world.json"
    a.click()
    URL.revokeObjectURL(url)

# Initialize
window.addEventListener "load", ()->
  if window.app
    window.mobile_world_builder = new MobileWorldBuilder(window.app)
