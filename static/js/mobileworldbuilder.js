// Mobile-First No-Code Pixel World Builder - Complete rebuild
class MobileWorldBuilder {
  constructor(app) {
    this.app = app;
    this.assets = {
      sprites: [],
      tiles: []
    };
    this.world = {
      ground: {},
      objects: {},
      collision: {},
      size: { rows: 15, cols: 20 }
    };
    this.selected_asset = null;
    this.selected_tool = "tile";
    this.grid_size = 16;
    this.zoom = 1;
    this.pan_x = 0;
    this.pan_y = 0;
    this.init();
  }

  init() {
    this.container = document.getElementById("mobile-world-builder");
    if (!this.container) return;
    
    this.setupUI();
    this.setupCanvas();
    this.setupToolbar();
  }

  setupUI() {
    // Mobile-first interface - completely rebuilt
    this.container.innerHTML = `
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
            <div class="upload-section" id="upload-section" style="display:none">
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
                <div style="display:flex;gap:10px;justify-content:center;margin-top:8px">
                  <button class="expand-btn" data-dir="left">??</button>
                  <button class="expand-btn" data-dir="right">??</button>
                </div>
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
    `;
    
    this.setupInteractions();
  }

  setupInteractions() {
    // Toolbar buttons
    this.container.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectTool(btn.dataset.tool);
      });
    });
    
    // Upload
    const upload_btn = this.container.querySelector("#upload-btn");
    const upload_input = this.container.querySelector("#sprite-upload");
    upload_btn?.addEventListener("click", () => {
      upload_input?.click();
    });
    
    upload_input?.addEventListener("change", (e) => {
      if (e.target.files[0]) {
        this.handleSpriteUpload(e.target.files[0]);
      }
    });
    
    // Menu
    const menu_btn = this.container.querySelector(".mwb-menu-btn");
    const menu_panel = this.container.querySelector("#menu-panel");
    const menu_close = this.container.querySelector(".menu-close");
    
    menu_btn?.addEventListener("click", () => {
      menu_panel?.classList.add("visible");
    });
    
    menu_close?.addEventListener("click", () => {
      menu_panel?.classList.remove("visible");
    });
    
    // Export
    this.container.querySelector("#menu-export")?.addEventListener("click", () => {
      this.exportWorld();
    });
    
    // Clear
    this.container.querySelector("#menu-clear")?.addEventListener("click", () => {
      if (confirm("Clear the entire world?")) {
        this.world = {
          ground: {},
          objects: {},
          collision: {},
          size: { rows: 15, cols: 20 }
        };
        this.redraw();
      }
    });
    
    // Expand buttons
    this.container.querySelectorAll(".expand-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.expandWorld(btn.dataset.dir);
      });
    });
    
    // Zoom buttons
    this.container.querySelectorAll(".zoom-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.action === "in") {
          this.zoomIn();
        } else {
          this.zoomOut();
        }
      });
    });
  }

  setupCanvas() {
    this.canvas = this.container.querySelector("#world-canvas");
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    
    // Touch/mouse events
    this.setupCanvasEvents();
    
    // Don't auto-load tiles - let user upload instead to avoid rate limits
    // this.loadTileAssets();
    
    this.redraw();
    
    // Handle window resize
    window.addEventListener("resize", () => {
      this.resizeCanvas();
    });
  }

  resizeCanvas() {
    const container = this.container.querySelector("#canvas-container");
    if (!container) return;
    
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.redraw();
  }

  loadTileAssets() {
    // Load tiles from cordon-sprites - but only if assets haven't loaded yet
    if (this.assets.tiles.length > 0) {
      return; // Already loaded
    }
    
    // Only load a few tiles to avoid too many requests
    const tile_files = [
      "grass", "grass2", "cement", "gravel"
    ];
    
    let loaded = 0;
    const max_concurrent = 2; // Limit concurrent requests
    
    tile_files.forEach((name, index) => {
      // Stagger requests to avoid hitting rate limits
      setTimeout(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          
          this.assets.tiles.push({
            id: `tile_${name}`,
            image: canvas,
            width: img.width,
            height: img.height,
            type: "tile",
            data_url: canvas.toDataURL()
          });
          
          loaded++;
          if (loaded === tile_files.length && this.selected_tool === "tile") {
            this.renderAssets();
          }
        };
        img.onerror = () => {
          console.warn(`Failed to load tile: ${name}`);
          loaded++;
        };
        // Use relative path to avoid CORS issues
        img.src = `/asset-module/cordon-sprites/sprites/tiles/${name}.png`;
      }, index * 200); // Stagger by 200ms
    });
  }

  setupCanvasEvents() {
    let is_drawing = false;
    let last_pos = null;
    
    // Mouse
    this.canvas.addEventListener("mousedown", (e) => {
      is_drawing = true;
      const pos = this.getCanvasPosition(e);
      this.handleCanvasClick(pos.x, pos.y);
      last_pos = pos;
    });
    
    this.canvas.addEventListener("mousemove", (e) => {
      if (is_drawing) {
        const pos = this.getCanvasPosition(e);
        if (last_pos && (last_pos.x !== pos.x || last_pos.y !== pos.y)) {
          this.handleCanvasClick(pos.x, pos.y);
        }
        last_pos = pos;
      }
    });
    
    this.canvas.addEventListener("mouseup", () => {
      is_drawing = false;
    });
    
    this.canvas.addEventListener("mouseleave", () => {
      is_drawing = false;
    });
    
    // Touch
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      is_drawing = true;
      const touch = e.touches[0];
      const pos = this.getCanvasPosition({
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleCanvasClick(pos.x, pos.y);
      last_pos = pos;
    });
    
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (is_drawing && e.touches[0]) {
        const touch = e.touches[0];
        const pos = this.getCanvasPosition({
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        if (last_pos && (last_pos.x !== pos.x || last_pos.y !== pos.y)) {
          this.handleCanvasClick(pos.x, pos.y);
        }
        last_pos = pos;
      }
    });
    
    this.canvas.addEventListener("touchend", () => {
      is_drawing = false;
    });
    
    // Prevent context menu
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    
    // Pan with drag (right mouse or two finger)
    // Would need additional handling for pan mode
  }

  getCanvasPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.zoom - this.pan_x;
    const y = (e.clientY - rect.top) / this.zoom - this.pan_y;
    
    const grid_x = Math.floor(x / this.grid_size);
    const grid_y = Math.floor(y / this.grid_size);
    
    return {
      x: grid_x,
      y: grid_y,
      pixel_x: grid_x * this.grid_size,
      pixel_y: grid_y * this.grid_size
    };
  }

  setupToolbar() {
    // Already set up in setupInteractions
  }

  selectTool(tool) {
    this.selected_tool = tool;
    this.container.querySelectorAll(".tool-btn").forEach((btn) => {
      if (btn.dataset.tool === tool) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    // Update assets section title
    const title_map = {
      tile: "?? Ground Tiles",
      object: "?? World Objects",
      collision: "?? Collision Zones",
      upload: "?? Upload Assets"
    };
    
    const title = this.container.querySelector("#assets-title");
    if (title) {
      title.textContent = title_map[tool] || "Assets";
    }
    
    // Show/hide sections
    const upload_section = this.container.querySelector("#upload-section");
    const assets_section = this.container.querySelector("#assets-section");
    
    if (tool === "upload") {
      if (upload_section) upload_section.style.display = "block";
      if (assets_section) assets_section.style.display = "none";
    } else {
      if (upload_section) upload_section.style.display = "none";
      if (assets_section) assets_section.style.display = "block";
      this.renderAssets();
    }
    
    // Update collision overlay
    const overlay = this.container.querySelector("#collision-overlay");
    if (overlay) {
      overlay.style.display = tool === "collision" ? "block" : "none";
    }
  }

  handleSpriteUpload(file) {
    const status = this.container.querySelector("#processing-status");
    if (status) {
      status.innerHTML = "Processing...";
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.processSpriteSheet(img, file.name);
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }

  processSpriteSheet(img, filename) {
    const status = this.container.querySelector("#processing-status");
    if (!status) return;
    
    status.innerHTML = `
      <div class="processing-options">
        <h4>How to slice this image?</h4>
        <button class="auto-detect-btn">?? Auto Detect Sprites</button>
        <button class="grid-slice-btn">?? Grid Slice</button>
      </div>
    `;
    
    this.container.querySelector(".auto-detect-btn")?.addEventListener("click", () => {
      this.autoDetectSprites(img, filename);
    });
    
    this.container.querySelector(".grid-slice-btn")?.addEventListener("click", () => {
      this.showGridSliceDialog(img, filename);
    });
  }

  autoDetectSprites(img, filename) {
    // Phase 1: Flood fill detection
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const detected = this.floodFillDetection(image_data);
    
    const status = this.container.querySelector("#processing-status");
    if (status) {
      status.innerHTML = `Found ${detected.length} sprites! Extracting...`;
    }
    
    // Extract each sprite
    detected.forEach((sprite_data) => {
      const sprite = this.extractSprite(img, sprite_data);
      this.assets.sprites.push(sprite);
    });
    
    if (status) {
      status.innerHTML = `? Added ${detected.length} sprites!`;
    }
    
    this.selectTool("object");
    this.renderAssets();
  }

  floodFillDetection(image_data) {
    // Simple flood fill to detect sprite boundaries
    const width = image_data.width;
    const height = image_data.height;
    const data = image_data.data;
    const visited = new Array(width * height).fill(false);
    const sprites = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const alpha = data[idx + 3];
        
        if (alpha > 0 && !visited[y * width + x]) {
          // Found unvisited pixel - flood fill from here
          const bounds = this.floodFill(x, y, width, height, data, visited);
          if (bounds.width > 4 && bounds.height > 4) {
            // Ignore tiny sprites
            sprites.push(bounds);
          }
        }
      }
    }
    
    return sprites;
  }

  floodFill(start_x, start_y, width, height, data, visited) {
    // Simple flood fill implementation
    const stack = [{ x: start_x, y: start_y }];
    let min_x = start_x;
    let max_x = start_x;
    let min_y = start_y;
    let max_y = start_y;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop();
      
      if (x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      const idx = y * width + x;
      if (visited[idx]) {
        continue;
      }
      
      const pixel_idx = idx * 4;
      const alpha = data[pixel_idx + 3];
      
      if (alpha === 0) {
        continue;
      }
      
      visited[idx] = true;
      min_x = Math.min(min_x, x);
      max_x = Math.max(max_x, x);
      min_y = Math.min(min_y, y);
      max_y = Math.max(max_y, y);
      
      // Check neighbors
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
    
    return {
      x: min_x,
      y: min_y,
      width: max_x - min_x + 1,
      height: max_y - min_y + 1
    };
  }

  extractSprite(source_img, bounds) {
    // Extract sprite from source image
    const canvas = document.createElement("canvas");
    canvas.width = bounds.width;
    canvas.height = bounds.height;
    const ctx = canvas.getContext("2d");
    
    ctx.drawImage(
      source_img,
      bounds.x, bounds.y, bounds.width, bounds.height,
      0, 0, bounds.width, bounds.height
    );
    
    return {
      id: `sprite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image: canvas,
      width: bounds.width,
      height: bounds.height,
      type: "sprite",
      collision: false,
      data_url: canvas.toDataURL()
    };
  }

  showGridSliceDialog(img, filename) {
    // Phase 2: Grid slice option
    const status = this.container.querySelector("#processing-status");
    if (!status) return;
    
    status.innerHTML = `
      <div class="grid-slice-dialog">
        <h4>Grid Size (pixels):</h4>
        <input type="number" id="slice-size" value="16" min="8" max="64" style="width:100%;padding:8px;margin:8px 0;">
        <button class="slice-btn" style="width:100%;padding:12px;background:hsl(180,50%,40%);border:none;border-radius:4px;color:white;cursor:pointer;">Slice Now</button>
      </div>
    `;
    
    this.container.querySelector(".slice-btn")?.addEventListener("click", () => {
      const size_input = this.container.querySelector("#slice-size");
      const size = parseInt(size_input?.value || "16");
      this.gridSliceImage(img, size, filename);
    });
  }

  gridSliceImage(img, tile_size, filename) {
    // Phase 2: Grid slicing
    const cols = Math.floor(img.width / tile_size);
    const rows = Math.floor(img.height / tile_size);
    
    const tiles = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const canvas = document.createElement("canvas");
        canvas.width = tile_size;
        canvas.height = tile_size;
        const ctx = canvas.getContext("2d");
        
        ctx.drawImage(
          img,
          col * tile_size, row * tile_size, tile_size, tile_size,
          0, 0, tile_size, tile_size
        );
        
        // Check if tile has content (not transparent)
        const image_data = ctx.getImageData(0, 0, tile_size, tile_size);
        let has_content = false;
        for (let i = 0; i < image_data.data.length; i += 4) {
          if (image_data.data[i + 3] > 0) {
            has_content = true;
            break;
          }
        }
        
        if (has_content) {
          tiles.push({
            id: `tile_${filename}_${row}_${col}`,
            image: canvas,
            width: tile_size,
            height: tile_size,
            type: "tile",
            data_url: canvas.toDataURL()
          });
        }
      }
    }
    
    this.assets.tiles = this.assets.tiles.concat(tiles);
    
    const status = this.container.querySelector("#processing-status");
    if (status) {
      status.innerHTML = `? Created ${tiles.length} tiles!`;
    }
    
    this.selectTool("tile");
    this.renderAssets();
  }

  renderAssets() {
    const grid = this.container.querySelector("#assets-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    const assets = this.selected_tool === "object" ? this.assets.sprites : this.assets.tiles;
    
    if (assets.length === 0) {
      grid.innerHTML = "<p style='padding:20px;color:rgba(255,255,255,0.6);'>No assets yet. Upload a sprite sheet!</p>";
      return;
    }
    
    assets.forEach((asset) => {
      const item = this.createAssetItem(asset);
      grid.appendChild(item);
    });
  }

  createAssetItem(asset) {
    const item = document.createElement("div");
    item.className = "asset-item";
    item.dataset.asset_id = asset.id;
    
    // Preview
    const preview = document.createElement("canvas");
    preview.width = 64;
    preview.height = 64;
    preview.className = "asset-preview";
    const ctx = preview.getContext("2d");
    
    // Scale to fit
    const scale = Math.min(64 / asset.width, 64 / asset.height);
    const w = asset.width * scale;
    const h = asset.height * scale;
    const x = (64 - w) / 2;
    const y = (64 - h) / 2;
    
    ctx.drawImage(asset.image, x, y, w, h);
    
    item.appendChild(preview);
    
    // Collision toggle for sprites (Phase 3)
    if (asset.type === "sprite") {
      const collision_btn = document.createElement("button");
      collision_btn.className = `collision-toggle ${asset.collision ? "active" : ""}`;
      collision_btn.innerHTML = "<i class='fa fa-shield-alt'></i>";
      collision_btn.title = asset.collision ? "Solid" : "Passable";
      collision_btn.addEventListener("click", (e) => {
        e.stopPropagation();
        asset.collision = !asset.collision;
        collision_btn.classList.toggle("active");
        collision_btn.title = asset.collision ? "Solid" : "Passable";
      });
      item.appendChild(collision_btn);
    }
    
    // Click to select
    item.addEventListener("click", () => {
      this.selectAsset(asset);
      this.container.querySelectorAll(".asset-item").forEach((i) => {
        i.classList.remove("selected");
      });
      item.classList.add("selected");
    });
    
    // Drag support
    item.draggable = true;
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/json", JSON.stringify(asset));
    });
    
    return item;
  }

  selectAsset(asset) {
    this.selected_asset = asset;
  }

  handleCanvasClick(grid_x, grid_y) {
    // Phase 5: Tile + Object Placement
    const key = `${grid_x},${grid_y}`;
    
    switch (this.selected_tool) {
      case "tile":
        if (this.selected_asset && this.selected_asset.type === "tile") {
          this.world.ground[key] = {
            asset_id: this.selected_asset.id,
            x: grid_x,
            y: grid_y
          };
        }
        break;
      case "object":
        if (this.selected_asset && this.selected_asset.type === "sprite") {
          this.world.objects[key] = {
            asset_id: this.selected_asset.id,
            x: grid_x,
            y: grid_y
          };
        }
        break;
      case "collision":
        // Phase 6: Toggle collision
        if (this.world.collision[key]) {
          delete this.world.collision[key];
        } else {
          this.world.collision[key] = true;
        }
        break;
    }
    
    this.redraw();
  }

  redraw() {
    // Clear
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply zoom and pan
    this.ctx.save();
    this.ctx.translate(this.pan_x, this.pan_y);
    this.ctx.scale(this.zoom, this.zoom);
    
    // Draw grid
    this.drawGrid();
    
    // Draw ground layer
    this.drawLayer("ground");
    
    // Draw objects layer
    this.drawLayer("objects");
    
    this.ctx.restore();
    
    // Draw collision overlay (separate from canvas)
    this.drawCollisionLayer();
    
    // Update zoom display
    const zoom_display = this.container.querySelector("#zoom-level");
    if (zoom_display) {
      zoom_display.textContent = `${Math.round(this.zoom * 100)}%`;
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1;
    
    const start_x = Math.floor(-this.pan_x / this.zoom / this.grid_size);
    const end_x = Math.ceil((this.canvas.width - this.pan_x) / this.zoom / this.grid_size);
    const start_y = Math.floor(-this.pan_y / this.zoom / this.grid_size);
    const end_y = Math.ceil((this.canvas.height - this.pan_y) / this.zoom / this.grid_size);
    
    for (let x = start_x; x <= end_x; x++) {
      const px = x * this.grid_size;
      this.ctx.beginPath();
      this.ctx.moveTo(px, start_y * this.grid_size);
      this.ctx.lineTo(px, end_y * this.grid_size);
      this.ctx.stroke();
    }
    
    for (let y = start_y; y <= end_y; y++) {
      const py = y * this.grid_size;
      this.ctx.beginPath();
      this.ctx.moveTo(start_x * this.grid_size, py);
      this.ctx.lineTo(end_x * this.grid_size, py);
      this.ctx.stroke();
    }
  }

  drawLayer(layer_name) {
    const layer_data = layer_name === "ground" ? this.world.ground : this.world.objects;
    
    for (const key in layer_data) {
      const data = layer_data[key];
      const asset = this.findAsset(data.asset_id);
      if (!asset) continue;
      
      const x = data.x * this.grid_size;
      const y = data.y * this.grid_size;
      
      if (asset.type === "tile") {
        // Scale tile to grid size
        this.ctx.drawImage(asset.image, x, y, this.grid_size, this.grid_size);
      } else {
        // Scale sprite proportionally
        const scale = Math.min(this.grid_size / asset.width, this.grid_size / asset.height);
        const w = asset.width * scale;
        const h = asset.height * scale;
        const offset_y = this.grid_size - h; // Align to bottom
        this.ctx.drawImage(asset.image, x, y + offset_y, w, h);
      }
    }
  }

  drawCollisionLayer() {
    // Phase 6: Visual collision overlay
    const overlay = this.container.querySelector("#collision-overlay");
    if (!overlay) return;
    
    overlay.innerHTML = "";
    
    if (this.selected_tool !== "collision") {
      overlay.style.display = "none";
      return;
    }
    
    overlay.style.display = "block";
    
    for (const key in this.world.collision) {
      const [x, y] = key.split(",").map(Number);
      const div = document.createElement("div");
      div.className = "collision-cell";
      div.style.position = "absolute";
      div.style.left = `${x * this.grid_size * this.zoom + this.pan_x}px`;
      div.style.top = `${y * this.grid_size * this.zoom + this.pan_y}px`;
      div.style.width = `${this.grid_size * this.zoom}px`;
      div.style.height = `${this.grid_size * this.zoom}px`;
      div.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
      div.style.border = "2px solid rgba(255, 0, 0, 0.6)";
      div.style.boxSizing = "border-box";
      overlay.appendChild(div);
    }
  }

  findAsset(asset_id) {
    for (const asset of [...this.assets.tiles, ...this.assets.sprites]) {
      if (asset.id === asset_id) {
        return asset;
      }
    }
    return null;
  }

  expandWorld(direction) {
    // Phase 4: World grid expansion
    switch (direction) {
      case "up":
        this.world.size.rows += 5;
        break;
      case "down":
        this.world.size.rows += 5;
        break;
      case "left":
        this.world.size.cols += 5;
        break;
      case "right":
        this.world.size.cols += 5;
        break;
    }
    
    const size_display = this.container.querySelector("#world-size");
    if (size_display) {
      size_display.textContent = `${this.world.size.cols} ? ${this.world.size.rows}`;
    }
    this.redraw();
  }

  zoomIn() {
    this.zoom = Math.min(this.zoom * 1.2, 4);
    this.redraw();
  }

  zoomOut() {
    this.zoom = Math.max(this.zoom / 1.2, 0.25);
    this.redraw();
  }

  exportWorld() {
    // Phase 7: Export as JSON
    const export_data = {
      worldSize: this.world.size,
      gridSize: this.grid_size,
      layers: {
        ground: [],
        objects: [],
        collision: []
      }
    };
    
    // Export ground tiles
    for (const key in this.world.ground) {
      const data = this.world.ground[key];
      export_data.layers.ground.push({
        x: data.x,
        y: data.y,
        assetId: data.asset_id
      });
    }
    
    // Export objects
    for (const key in this.world.objects) {
      const data = this.world.objects[key];
      const asset = this.findAsset(data.asset_id);
      export_data.layers.objects.push({
        x: data.x,
        y: data.y,
        assetId: data.asset_id,
        collision: asset?.collision || false
      });
    }
    
    // Export collision
    for (const key in this.world.collision) {
      const [x, y] = key.split(",").map(Number);
      export_data.layers.collision.push({ x, y });
    }
    
    // Download JSON
    const blob = new Blob([JSON.stringify(export_data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "world.json";
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize when ready
window.addEventListener("load", () => {
  if (window.app) {
    window.mobile_world_builder = new MobileWorldBuilder(window.app);
  }
});
