# ?? Simple World Builder - User Guide

## ? What's Been Added

A **no-code, drag-and-drop** world builder that's perfect for kids!

## ?? Features

### 1. **Hidden Menu System**
- **Menu Button:** Top-right corner (hamburger icon)
- **Slides In:** From the right side
- **Tabs:**
  - ?? **Ground Tiles** - Choose tiles to place
  - ?? **World Assets** - Buildings, props, decorations
  - ?? **Collision** - Mark collision zones
  - ?? **Options** - World type, grid size

### 2. **Drag & Drop**
- **Click** tiles/assets to select
- **Click** on canvas to place
- **Drag** tiles/assets directly onto canvas
- Works on **touch devices** too!

### 3. **Tile Loading**
- Automatically loads tiles from:
  - `cordon-sprites/tiles/` - Individual tile images
  - Asset modules API - Ground tiles category
  - Sprite sheets are auto-split into individual tiles

### 4. **Current Tiles Available**
From `cordon-sprites`:
- ?? Grass
- ?? Grass2  
- ??? Cement
- ?? Gravel
- ?? Water
- ?? Train Tracks

## ?? How to Use

### Step 1: Open Simple World Builder
1. Click **"Simple World"** in the sidebar (globe icon)
2. You'll see a canvas with a grid

### Step 2: Open Menu
1. Click the **menu button** (top-right corner)
2. Menu slides in from the right

### Step 3: Choose Ground Tiles
1. Click **"?? Ground Tiles"** tab
2. Tiles will load automatically
3. **Click** a tile to select it (it highlights)
4. **Click** on the canvas to place it

### Step 4: Add World Assets
1. Click **"?? World Assets"** tab
2. Browse available assets
3. **Click** to select, then **click** on canvas to place
4. Or **drag** directly onto canvas

### Step 5: Set Options
1. Click **"?? Options"** tab
2. Choose world type:
   - **Side Scrolling** - Platformer style
   - **Top Down** - RPG style
3. Adjust grid size (8-64 pixels)

## ?? Visual Features

- **Grid overlay** - Helps align tiles perfectly
- **Pixel-perfect rendering** - Crisp pixel art
- **Large touch targets** - Easy to use on mobile
- **Visual feedback** - Selected items highlight

## ?? Mobile Optimized

- **Touch-friendly** - Works great on tablets/phones
- **Full-screen menu** - On mobile, menu takes full width
- **Touch placement** - Tap to place tiles
- **Swipe-friendly** - Menu slides smoothly

## ?? Technical Details

### Tile Loading
- Loads individual tiles from `cordon-sprites/sprites/tiles/`
- Also loads from asset modules API
- Sprite sheets are automatically split

### Canvas
- 1200x800 default size
- Grid-based placement
- Snaps to grid automatically

### Storage
- Tiles/assets stored in memory (for now)
- Will save to project in next phase

## ?? Next Steps (Coming Soon)

1. **Save to project** - Persist worlds
2. **Export as map** - Convert to microStudio map format
3. **More tile sets** - Load from all submodules
4. **Undo/Redo** - Easy mistake correction
5. **Collision editor** - Visual collision zones

---

**Status:** ? Basic no-code world builder is ready to use!

Test it by:
1. Going to a project
2. Clicking "Simple World" in sidebar
3. Opening the menu (top-right)
4. Selecting tiles and clicking on canvas!
