// Simple No-Code World Builder - Drag and Drop Interface
class SimpleWorldBuilder {
  constructor(app) {
    this.app = app;
    this.mode = null; // "side-scroll" or "top-down"
    this.selected_tile = null;
    this.selected_asset = null;
    this.canvas = null;
    this.ctx = null;
    this.placed_tiles = {};
    this.placed_assets = {};
    this.collision_map = {};
    this.grid_size = 32;
    this.scale = 1;
    this.pan_x = 0;
    this.pan_y = 0;
    this.init();
  }

  init() {
    this.container = document.getElementById("simple-world-builder");
    if (!this.container) return;
    
    this.setupCanvas();
    this.setupMenu();
    this.loadTileSheets();
  }

  setupCanvas() {
    // Create main canvas for world editing
    this.canvas = document.createElement("canvas");
    this.canvas.id = "world-canvas";
    this.canvas.width = 1200;
    this.canvas.height = 800;
    this.canvas.style.border = "2px solid #fff";
    this.canvas.style.cursor = "crosshair";
    this.canvas.style.background = "#1a1a2e";
    this.canvas.style.display = "block";
    this.canvas.style.margin = "20px auto";
    this.canvas.style.imageRendering = "pixelated";
    
    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);
    
    // Canvas interaction
    let is_drawing = false;
    
    this.canvas.addEventListener("mousedown", (e) => {
      is_drawing = true;
      this.handleCanvasClick(e);
    });
    
    this.canvas.addEventListener("mousemove", (e) => {
      if (is_drawing) {
        this.handleCanvasClick(e);
      } else {
        this.handleCanvasHover(e);
      }
    });
    
    this.canvas.addEventListener("mouseup", () => {
      is_drawing = false;
    });
    
    this.canvas.addEventListener("mouseleave", () => {
      is_drawing = false;
    });
    
    // Touch support
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      is_drawing = true;
      const touch = e.touches[0];
      const mouse_event = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleCanvasClick(mouse_event);
    });
    
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (is_drawing && e.touches[0]) {
        const touch = e.touches[0];
        const mouse_event = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        this.handleCanvasClick(mouse_event);
      }
    });
    
    this.canvas.addEventListener("touchend", () => {
      is_drawing = false;
    });
    
    // Drop support
    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    
    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      this.handleDrop(e);
    });
  }

  setupMenu() {
    // Hidden menu button (top right corner)
    this.menu_button = document.createElement("div");
    this.menu_button.className = "simple-menu-button";
    this.menu_button.innerHTML = "<i class='fa fa-bars'></i>";
    this.menu_button.addEventListener("click", () => {
      this.toggleMenu();
    });
    this.container.appendChild(this.menu_button);
    
    // Menu panel (slides in from right)
    this.menu_panel = document.createElement("div");
    this.menu_panel.className = "simple-menu-panel";
    this.menu_panel.innerHTML = `
      <div class="menu-header">
        <h3>?? World Builder</h3>
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
          <div class="tile-palette" id="tile-palette">Loading tiles...</div>
        </div>
        <div class="menu-section hidden" id="menu-assets">
          <div class="asset-palette" id="asset-palette">Loading assets...</div>
        </div>
        <div class="menu-section hidden" id="menu-collision">
          <p>Tap on canvas to add collision zones</p>
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
    `;
    this.container.appendChild(this.menu_panel);
    
    // Menu interactions
    this.menu_panel.querySelector(".menu-close").addEventListener("click", () => {
      this.hideMenu();
    });
    
    this.menu_panel.querySelectorAll(".menu-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        this.switchTab(tab.dataset.tab);
      });
    });
    
    this.menu_panel.querySelector("#world-type").addEventListener("change", (e) => {
      this.mode = e.target.value;
      this.redraw();
    });
    
    this.menu_panel.querySelector("#grid-size").addEventListener("change", (e) => {
      this.grid_size = parseInt(e.target.value);
      this.redraw();
    });
    
    this.menu_panel.querySelector(".clear-world").addEventListener("click", () => {
      if (confirm("Clear the entire world?")) {
        this.placed_tiles = {};
        this.placed_assets = {};
        this.redraw();
      }
    });
    
    this.menu_panel.querySelector(".clear-collision").addEventListener("click", () => {
      if (confirm("Clear all collision zones?")) {
        this.collision_map = {};
        this.redraw();
      }
    });
  }

  toggleMenu() {
    if (this.menu_panel.classList.contains("visible")) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  showMenu() {
    this.menu_panel.classList.add("visible");
  }

  hideMenu() {
    this.menu_panel.classList.remove("visible");
  }

  switchTab(tab_name) {
    this.menu_panel.querySelectorAll(".menu-tab").forEach((t) => {
      t.classList.remove("active");
    });
    this.menu_panel.querySelectorAll(".menu-section").forEach((s) => {
      s.classList.add("hidden");
    });
    
    const tab = this.menu_panel.querySelector(`.menu-tab[data-tab='${tab_name}']`);
    const section = this.menu_panel.querySelector(`#menu-${tab_name}`);
    
    if (tab) tab.classList.add("active");
    if (section) section.classList.remove("hidden");
    
    // Load content for tab
    switch (tab_name) {
      case "tiles":
        this.loadTiles();
        break;
      case "assets":
        this.loadAssets();
        break;
      case "collision":
        // Already loaded
        break;
    }
  }

  loadTileSheets() {
    // Load individual tiles from cordon-sprites first (they're ready to use)
    this.loadDirectTiles();
    
    // Also load from asset modules API
    fetch("/api/asset-modules/list?category=ground_tiles")
      .then((response) => response.json())
      .then((data) => {
        this.processTileAssets(data);
      })
      .catch((err) => {
        console.error("Error loading tiles:", err);
      });
  }

  loadDirectTiles() {
    // Load individual tile images from cordon-sprites
    const direct_tiles = [
      { name: "grass", url: "/asset-module/cordon-sprites/sprites/tiles/grass.png", module: "cordon-sprites" },
      { name: "grass2", url: "/asset-module/cordon-sprites/sprites/tiles/grass2.png", module: "cordon-sprites" },
      { name: "cement", url: "/asset-module/cordon-sprites/sprites/tiles/cement.png", module: "cordon-sprites" },
      { name: "gravel", url: "/asset-module/cordon-sprites/sprites/tiles/gravel.png", module: "cordon-sprites" },
      { name: "water", url: "/asset-module/cordon-sprites/sprites/tiles/water.png", module: "cordon-sprites" },
      { name: "train-tracks", url: "/asset-module/cordon-sprites/sprites/tiles/train-tracks-horizontal.png", module: "cordon-sprites" }
    ];
    
    this.tiles = {};
    direct_tiles.forEach((tile_info) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!this.tiles["cordon-tiles"]) {
          this.tiles["cordon-tiles"] = [];
        }
        this.tiles["cordon-tiles"].push({
          name: tile_info.name,
          image: img,
          url: tile_info.url,
          module: tile_info.module,
          width: img.width,
          height: img.height
        });
        this.renderTilePalette();
      };
      img.onerror = () => {
        console.warn(`Failed to load tile: ${tile_info.url}`);
      };
      img.src = tile_info.url;
    });
  }

  processTileAssets(data) {
    // Process tiles from API
    for (const module_name in data) {
      const assets = data[module_name];
      assets.forEach((asset) => {
        if (!this.tiles[module_name]) {
          this.tiles[module_name] = [];
        }
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // Check if it's a sprite sheet or single tile
          if (img.width > this.grid_size * 2 || img.height > this.grid_size * 2) {
            // Likely a sprite sheet - extract tiles
            const tiles = this.extractTilesFromSheet(img, asset, module_name);
            this.tiles[module_name] = this.tiles[module_name].concat(tiles);
          } else {
            // Single tile
            this.tiles[module_name].push({
              name: asset.name,
              image: img,
              url: asset.url,
              module: module_name,
              width: img.width,
              height: img.height
            });
          }
          this.renderTilePalette();
        };
        img.src = asset.url;
      });
    }
  }

  extractTilesFromSheet(img, asset, module_name) {
    const tiles = [];
    const tile_size = this.grid_size;
    const cols = Math.floor(img.width / tile_size);
    const rows = Math.floor(img.height / tile_size);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tiles.push({
          name: `${asset.name}_${row}_${col}`,
          image: img,
          source_x: col * tile_size,
          source_y: row * tile_size,
          source_width: tile_size,
          source_height: tile_size,
          module: module_name,
          is_sheet: true
        });
      }
    }
    
    return tiles;
  }

  loadTiles() {
    this.renderTilePalette();
  }

  renderTilePalette() {
    const palette = document.getElementById("tile-palette");
    if (!palette) return;
    
    palette.innerHTML = "";
    
    if (Object.keys(this.tiles).length === 0) {
      palette.innerHTML = "<p>Loading tiles...</p>";
      return;
    }
    
    for (const sheet_name in this.tiles) {
      const tile_list = this.tiles[sheet_name];
      if (tile_list.length === 0) continue;
      
      // Group header
      const header = document.createElement("div");
      header.className = "palette-group-header";
      header.textContent = sheet_name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      palette.appendChild(header);
      
      // Tile grid
      const grid = document.createElement("div");
      grid.className = "palette-grid";
      
      tile_list.forEach((tile) => {
        const item = this.createTileItem(tile);
        grid.appendChild(item);
      });
      
      palette.appendChild(grid);
    }
  }

  createTileItem(tile) {
    const item = document.createElement("div");
    item.className = "palette-item";
    item.dataset.tile_name = tile.name;
    item.title = tile.name;
    
    // Preview canvas
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    canvas.className = "tile-preview";
    
    const ctx = canvas.getContext("2d");
    
    if (tile.is_sheet) {
      ctx.drawImage(
        tile.image,
        tile.source_x, tile.source_y, tile.source_width, tile.source_height,
        0, 0, 64, 64
      );
    } else {
      // Scale to fit
      const scale = Math.min(64 / tile.width, 64 / tile.height);
      const w = tile.width * scale;
      const h = tile.height * scale;
      const x = (64 - w) / 2;
      const y = (64 - h) / 2;
      ctx.drawImage(tile.image, x, y, w, h);
    }
    
    item.appendChild(canvas);
    
    // Click to select
    item.addEventListener("click", () => {
      this.selectTile(tile);
      // Update selected state
      document.querySelectorAll(".palette-item").forEach((i) => {
        i.classList.remove("selected");
      });
      item.classList.add("selected");
    });
    
    // Drag support
    item.draggable = true;
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/json", JSON.stringify({
        type: "tile",
        data: tile
      }));
      item.style.opacity = "0.5";
    });
    
    item.addEventListener("dragend", () => {
      item.style.opacity = "1";
    });
    
    return item;
  }

  selectTile(tile) {
    this.selected_tile = tile;
    this.selected_asset = null;
    this.canvas.style.cursor = "crosshair";
  }

  loadAssets() {
    fetch("/api/asset-modules/list?category=world_assets")
      .then((response) => response.json())
      .then((data) => {
        this.renderAssetPalette(data);
      })
      .catch((err) => {
        console.error("Error loading assets:", err);
      });
  }

  renderAssetPalette(data) {
    const palette = document.getElementById("asset-palette");
    if (!palette) return;
    
    palette.innerHTML = "";
    
    if (Object.keys(data).length === 0) {
      palette.innerHTML = "<p>No assets found</p>";
      return;
    }
    
    for (const module_name in data) {
      const assets = data[module_name];
      if (assets.length === 0) continue;
      
      const header = document.createElement("div");
      header.className = "palette-group-header";
      header.textContent = module_name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      palette.appendChild(header);
      
      const grid = document.createElement("div");
      grid.className = "palette-grid";
      
      assets.forEach((asset) => {
        const item = this.createAssetItem(asset);
        grid.appendChild(item);
      });
      
      palette.appendChild(grid);
    }
  }

  createAssetItem(asset) {
    const item = document.createElement("div");
    item.className = "palette-item asset-item";
    item.title = asset.name;
    
    const img = document.createElement("img");
    img.src = asset.url;
    img.className = "asset-preview";
    img.onerror = () => {
      img.style.display = "none";
      const error = document.createElement("div");
      error.className = "asset-error";
      error.textContent = "?";
      item.appendChild(error);
    };
    item.appendChild(img);
    
    const name = document.createElement("div");
    name.className = "asset-name";
    name.textContent = asset.name.length > 12 ? asset.name.substring(0, 10) + "..." : asset.name;
    item.appendChild(name);
    
    item.draggable = true;
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("application/json", JSON.stringify({
        type: "asset",
        data: asset
      }));
      item.style.opacity = "0.5";
    });
    
    item.addEventListener("dragend", () => {
      item.style.opacity = "1";
    });
    
    item.addEventListener("click", () => {
      this.selectAsset(asset);
      document.querySelectorAll(".palette-item").forEach((i) => {
        i.classList.remove("selected");
      });
      item.classList.add("selected");
    });
    
    return item;
  }

  selectAsset(asset) {
    this.selected_asset = asset;
    this.selected_tile = null;
    this.canvas.style.cursor = "grab";
  }

  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const grid_x = Math.floor(x / this.grid_size) * this.grid_size;
    const grid_y = Math.floor(y / this.grid_size) * this.grid_size;
    
    if (this.selected_tile) {
      this.placeTile(grid_x, grid_y, this.selected_tile);
    } else if (this.selected_asset) {
      this.placeAsset(grid_x, grid_y, this.selected_asset);
    }
  }

  handleCanvasHover(e) {
    // Could show preview here
  }

  handleDrop(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const grid_x = Math.floor(x / this.grid_size) * this.grid_size;
    const grid_y = Math.floor(y / this.grid_size) * this.grid_size;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data.type === "tile") {
        this.placeTile(grid_x, grid_y, data.data);
      } else if (data.type === "asset") {
        this.placeAsset(grid_x, grid_y, data.data);
      }
    } catch (err) {
      console.error("Error handling drop:", err);
    }
  }

  placeTile(x, y, tile) {
    const key = `${x},${y}`;
    this.placed_tiles[key] = { x, y, tile };
    this.redraw();
  }

  placeAsset(x, y, asset) {
    const key = `${x},${y}`;
    this.placed_assets[key] = { x, y, asset };
    this.redraw();
  }

  redraw() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw placed tiles
    for (const key in this.placed_tiles) {
      const data = this.placed_tiles[key];
      this.drawTile(data.x, data.y, data.tile);
    }
    
    // Draw placed assets
    for (const key in this.placed_assets) {
      const data = this.placed_assets[key];
      this.drawAsset(data.x, data.y, data.asset);
    }
  }

  drawGrid() {
    this.ctx.strokeStyle = "rgba(255,255,255,0.1)";
    this.ctx.lineWidth = 1;
    
    for (let x = 0; x < this.canvas.width; x += this.grid_size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += this.grid_size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  drawTile(x, y, tile) {
    if (tile.is_sheet) {
      this.ctx.drawImage(
        tile.image,
        tile.source_x, tile.source_y, tile.source_width, tile.source_height,
        x, y, this.grid_size, this.grid_size
      );
    } else if (tile.image) {
      const scale = Math.min(this.grid_size / tile.width, this.grid_size / tile.height);
      const w = tile.width * scale;
      const h = tile.height * scale;
      const offset_x = (this.grid_size - w) / 2;
      const offset_y = (this.grid_size - h) / 2;
      this.ctx.drawImage(tile.image, x + offset_x, y + offset_y, w, h);
    }
  }

  drawAsset(x, y, asset) {
    // Assets will be loaded asynchronously
    if (!asset._image) {
      asset._image = new Image();
      asset._image.crossOrigin = "anonymous";
      asset._image.onload = () => {
        this.redraw();
      };
      asset._image.src = asset.url;
    }
    
    if (asset._image.complete && asset._image.naturalWidth > 0) {
      const max_size = this.grid_size * 2;
      let w = asset._image.width;
      let h = asset._image.height;
      
      if (w > max_size || h > max_size) {
        const scale = Math.min(max_size / w, max_size / h);
        w = w * scale;
        h = h * scale;
      }
      
      this.ctx.drawImage(asset._image, x, y - h + this.grid_size, w, h);
    }
  }
}

// Initialize when ready
window.addEventListener("load", () => {
  if (window.app) {
    window.simple_world_builder = new SimpleWorldBuilder(window.app);
  }
});
