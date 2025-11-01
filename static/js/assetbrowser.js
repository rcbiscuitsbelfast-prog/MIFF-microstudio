// Asset Browser for Child-Friendly Asset Selection
class AssetBrowser {
  constructor(app) {
    this.app = app;
    this.categories = {
      ground_tiles: "Ground Tiles",
      world_assets: "World Assets",
      collision: "Collision",
      characters: "Characters",
      ui: "UI Elements"
    };
    
    this.current_category = null;
    this.assets = {};
    this.init();
  }

  init() {
    this.container = document.getElementById("asset-browser");
    if (!this.container) return;
    
    this.setupUI();
    this.loadAssets();
  }

  setupUI() {
    // Create category tabs
    this.category_tabs = document.createElement("div");
    this.category_tabs.className = "asset-category-tabs";
    
    for (const category in this.categories) {
      const label = this.categories[category];
      const tab = document.createElement("div");
      tab.className = "asset-category-tab";
      tab.dataset.category = category;
      tab.innerHTML = `
        <i class="fa fa-${this.getCategoryIcon(category)}"></i>
        <span>${label}</span>
      `;
      tab.addEventListener("click", () => {
        this.selectCategory(category);
      });
      this.category_tabs.appendChild(tab);
    }
    
    this.container.appendChild(this.category_tabs);

    // Create asset grid container
    this.asset_grid = document.createElement("div");
    this.asset_grid.className = "asset-grid";
    this.container.appendChild(this.asset_grid);

    // Create search box
    const search_container = document.createElement("div");
    search_container.className = "asset-search-container";
    search_container.innerHTML = `
      <input type="text" class="asset-search-input" placeholder="Search assets...">
      <i class="fa fa-search"></i>
    `;
    this.search_input = search_container.querySelector(".asset-search-input");
    this.search_input.addEventListener("input", () => {
      this.filterAssets();
    });
    this.container.insertBefore(search_container, this.asset_grid);
  }

  getCategoryIcon(category) {
    const icons = {
      ground_tiles: "th",
      world_assets: "cube",
      collision: "exclamation-triangle",
      characters: "user",
      ui: "window-restore"
    };
    return icons[category] || "image";
  }

  loadAssets(category = null) {
    let url = "/api/asset-modules/list";
    if (category) {
      url += `?category=${category}`;
    }
    
    fetch(url).then((response) => {
      response.json().then((data) => {
        this.assets = data;
        this.displayAssets(category);
      });
    });
  }

  selectCategory(category) {
    this.current_category = category;
    
    // Update tab styles
    const tabs = this.category_tabs.querySelectorAll(".asset-category-tab");
    tabs.forEach((tab) => {
      if (tab.dataset.category === category) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
    
    this.loadAssets(category);
  }

  displayAssets(category = null) {
    this.asset_grid.innerHTML = "";
    
    let asset_count = 0;
    
    for (const module_name in this.assets) {
      const module_assets = this.assets[module_name];
      
      // Group header
      const header = document.createElement("div");
      header.className = "asset-module-header";
      header.textContent = this.getModuleDisplayName(module_name);
      this.asset_grid.appendChild(header);
      
      // Asset grid for this module
      const module_grid = document.createElement("div");
      module_grid.className = "asset-module-grid";
      
      module_assets.forEach((asset) => {
        if (!category || asset.category === category) {
          const asset_item = this.createAssetItem(asset, module_name);
          module_grid.appendChild(asset_item);
          asset_count++;
        }
      });
      
      if (module_grid.children.length > 0) {
        this.asset_grid.appendChild(module_grid);
      }
    }
    
    // Show message if no assets
    if (asset_count === 0) {
      const no_assets = document.createElement("div");
      no_assets.className = "no-assets-message";
      no_assets.innerHTML = `
        <i class="fa fa-inbox"></i>
        <p>No assets found in this category</p>
      `;
      this.asset_grid.appendChild(no_assets);
    }
  }

  createAssetItem(asset, module_name) {
    const item = document.createElement("div");
    item.className = "asset-item";
    item.dataset.url = asset.url;
    item.dataset.name = asset.name;
    
    // Preview image
    const img = document.createElement("img");
    img.src = asset.url;
    img.alt = asset.name;
    img.className = "asset-preview";
    
    // Asset name
    const name_div = document.createElement("div");
    name_div.className = "asset-name";
    name_div.textContent = asset.name;
    
    item.appendChild(img);
    item.appendChild(name_div);
    
    // Click handler - add to project
    item.addEventListener("click", () => {
      this.selectAsset(asset, module_name);
    });
    
    return item;
  }

  getModuleDisplayName(module_name) {
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

  selectAsset(asset, module_name) {
    // Trigger event or callback to add asset to project
    if (this.app && this.app.map_editor) {
      // Add to map editor tile picker or sprite list
      console.info("Adding asset to project:", asset);
    }
    
    // Visual feedback
    const event = new CustomEvent("asset-selected", {
      detail: { asset, module: module_name } }
    });
    document.dispatchEvent(event);
  }

  filterAssets() {
    const query = this.search_input.value.toLowerCase();
    const items = this.asset_grid.querySelectorAll(".asset-item");
    
    items.forEach((item) => {
      const name = item.dataset.name.toLowerCase();
      if (name.indexOf(query) >= 0) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }
}

// Initialize when DOM is ready
window.addEventListener("load", () => {
  if (window.app) {
    window.asset_browser = new AssetBrowser(window.app);
  }
});
