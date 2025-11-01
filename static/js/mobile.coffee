# Mobile-specific functionality for Phase 1

class MobileUI
  constructor:(@app)->
    @mobile_menu_open = false
    @initMobileMenu()
    @initBottomNav()
    @detectMobile()
    @initTouchGestures()

  detectMobile:()->
    # Detect if we're on a mobile device
    @is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    @is_touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    if @is_mobile or @is_touch
      document.body.classList.add("mobile-device")
    else
      document.body.classList.add("desktop-device")

  initMobileMenu:()->
    menu_button = document.getElementById("main-menu-button")
    menu_overlay = document.getElementById("mobile-menu-overlay")
    
    return if not menu_button or not menu_overlay

    # Toggle menu
    menu_button.addEventListener "click", (e)=>
      @toggleMobileMenu()
      e.stopPropagation()

    # Close menu when clicking overlay background
    menu_overlay.addEventListener "click", (e)=>
      if e.target == menu_overlay
        @closeMobileMenu()

    # Map menu items to existing functionality
    menu_items = [
      { id: "mobile-menu-explore", action: "menu-explore" }
      { id: "mobile-menu-projects", action: "menu-projects" }
      { id: "mobile-menu-tutorials", action: "menu-tutorials" }
      { id: "mobile-menu-help", action: "menu-help" }
      { id: "mobile-menu-about", action: "menu-about" }
    ]

    for item in menu_items
      elem = document.getElementById(item.id)
      continue if not elem
      elem.addEventListener "click", ()=>
        @closeMobileMenu()
        # Trigger the corresponding desktop menu action
        desktop_elem = document.getElementById(item.action)
        if desktop_elem
          desktop_elem.click()

  toggleMobileMenu:()->
    if @mobile_menu_open
      @closeMobileMenu()
    else
      @openMobileMenu()

  openMobileMenu:()->
    menu_overlay = document.getElementById("mobile-menu-overlay")
    return if not menu_overlay
    menu_overlay.classList.add("active")
    @mobile_menu_open = true
    document.body.style.overflow = "hidden"

  closeMobileMenu:()->
    menu_overlay = document.getElementById("mobile-menu-overlay")
    return if not menu_overlay
    menu_overlay.classList.remove("active")
    @mobile_menu_open = false
    document.body.style.overflow = ""

  initBottomNav:()->
    # Create bottom navigation for mobile project view
    @bottom_nav = document.createElement("div")
    @bottom_nav.className = "mobile-bottom-nav"
    @bottom_nav.id = "mobile-bottom-nav"
    
    # Only show on mobile and in project view
    if @is_mobile
      # Add navigation items based on sidemenu
      sidemenu_items = [
        { id: "menuitem-code", icon: "fa-code", label: "Code" }
        { id: "menuitem-sprites", icon: "fa-image", label: "Sprites" }
        { id: "menuitem-maps", icon: "fa-map", label: "Maps" }
        { id: "menuitem-assets", icon: "fa-cube", label: "Assets" }
        { id: "menuitem-sounds", icon: "fa-volume-up", label: "Sounds" }
      ]

      for item in sidemenu_items
        nav_item = document.createElement("div")
        nav_item.className = "mobile-bottom-nav-item"
        nav_item.innerHTML = "<i class='fa #{item.icon}'></i><span>#{item.label}</span>"
        nav_item.addEventListener "click", ()=>
          desktop_item = document.getElementById(item.id)
          if desktop_item
            desktop_item.click()
        @bottom_nav.appendChild(nav_item)

      document.body.appendChild(@bottom_nav)
      @updateBottomNavVisibility()

  updateBottomNavVisibility:()->
    return if not @bottom_nav
    projectview = document.querySelector(".projectview")
    if projectview and projectview.offsetParent
      @bottom_nav.style.display = "flex"
    else
      @bottom_nav.style.display = "none"

  initTouchGestures:()->
    # Prevent double-tap zoom on buttons
    buttons = document.querySelectorAll("button, .button, .sidemenu li")
    for button in buttons
      button.addEventListener "touchend", (e)=>
        e.preventDefault()
        e.target.click()

    # Improve scroll performance on mobile
    if @is_touch
      # Add smooth scrolling where appropriate
      document.querySelectorAll(".sidemenu, .assetlist, .maplist").forEach (elem)=>
        elem.style.webkitOverflowScrolling = "touch"

  # Update bottom nav active state when sidemenu changes
  updateBottomNavActive:(active_id)->
    return if not @bottom_nav
    items = @bottom_nav.querySelectorAll(".mobile-bottom-nav-item")
    for item in items
      item.classList.remove("active")
    
    # Find corresponding item and activate it
    # This would need to be called when sidemenu selection changes

# Initialize mobile UI when app is ready
window.addEventListener "load", ()->
  if window.app
    window.mobile_ui = new MobileUI(window.app)
  
  # Also initialize on DOMContentLoaded as fallback
  if document.readyState == "loading"
    document.addEventListener "DOMContentLoaded", ()->
      if window.app
        window.mobile_ui = new MobileUI(window.app)
