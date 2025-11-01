// Mobile-specific functionality for Phase 1

class MobileUI {
  constructor(app) {
    this.app = app;
    this.mobile_menu_open = false;
    this.initMobileMenu();
    this.initBottomNav();
    this.detectMobile();
    this.initTouchGestures();
  }

  detectMobile() {
    // Detect if we're on a mobile device
    this.is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.is_touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (this.is_mobile || this.is_touch) {
      document.body.classList.add("mobile-device");
    } else {
      document.body.classList.add("desktop-device");
    }
  }

  initMobileMenu() {
    const menu_button = document.getElementById("main-menu-button");
    const menu_overlay = document.getElementById("mobile-menu-overlay");
    
    if (!menu_button || !menu_overlay) return;

    // Toggle menu
    menu_button.addEventListener("click", (e) => {
      this.toggleMobileMenu();
      e.stopPropagation();
    });

    // Close menu when clicking overlay background
    menu_overlay.addEventListener("click", (e) => {
      if (e.target === menu_overlay) {
        this.closeMobileMenu();
      }
    });

    // Map menu items to existing functionality
    const menu_items = [
      { id: "mobile-menu-explore", action: "menu-explore" },
      { id: "mobile-menu-projects", action: "menu-projects" },
      { id: "mobile-menu-tutorials", action: "menu-tutorials" },
      { id: "mobile-menu-help", action: "menu-help" },
      { id: "mobile-menu-about", action: "menu-about" }
    ];

    menu_items.forEach((item) => {
      const elem = document.getElementById(item.id);
      if (!elem) return;
      elem.addEventListener("click", () => {
        this.closeMobileMenu();
        // Trigger the corresponding desktop menu action
        const desktop_elem = document.getElementById(item.action);
        if (desktop_elem) {
          desktop_elem.click();
        }
      });
    });
  }

  toggleMobileMenu() {
    if (this.mobile_menu_open) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    const menu_overlay = document.getElementById("mobile-menu-overlay");
    if (!menu_overlay) return;
    menu_overlay.classList.add("active");
    this.mobile_menu_open = true;
    document.body.style.overflow = "hidden";
  }

  closeMobileMenu() {
    const menu_overlay = document.getElementById("mobile-menu-overlay");
    if (!menu_overlay) return;
    menu_overlay.classList.remove("active");
    this.mobile_menu_open = false;
    document.body.style.overflow = "";
  }

  initBottomNav() {
    // Create bottom navigation for mobile project view
    this.bottom_nav = document.createElement("div");
    this.bottom_nav.className = "mobile-bottom-nav";
    this.bottom_nav.id = "mobile-bottom-nav";
    
    // Only show on mobile and in project view
    if (this.is_mobile) {
      // Add navigation items based on sidemenu
      const sidemenu_items = [
        { id: "menuitem-code", icon: "fa-code", label: "Code" },
        { id: "menuitem-sprites", icon: "fa-image", label: "Sprites" },
        { id: "menuitem-maps", icon: "fa-map", label: "Maps" },
        { id: "menuitem-assets", icon: "fa-cube", label: "Assets" },
        { id: "menuitem-sounds", icon: "fa-volume-up", label: "Sounds" }
      ];

      sidemenu_items.forEach((item) => {
        const nav_item = document.createElement("div");
        nav_item.className = "mobile-bottom-nav-item";
        nav_item.innerHTML = `<i class='fa ${item.icon}'></i><span>${item.label}</span>`;
        nav_item.addEventListener("click", () => {
          const desktop_item = document.getElementById(item.id);
          if (desktop_item) {
            desktop_item.click();
          }
        });
        this.bottom_nav.appendChild(nav_item);
      });

      document.body.appendChild(this.bottom_nav);
      this.updateBottomNavVisibility();
    }
  }

  updateBottomNavVisibility() {
    if (!this.bottom_nav) return;
    const projectview = document.querySelector(".projectview");
    if (projectview && projectview.offsetParent) {
      this.bottom_nav.style.display = "flex";
    } else {
      this.bottom_nav.style.display = "none";
    }
  }

  initTouchGestures() {
    // Prevent double-tap zoom on buttons
    const buttons = document.querySelectorAll("button, .button, .sidemenu li");
    buttons.forEach((button) => {
      button.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (e.target.click) {
          e.target.click();
        }
      });
    });

    // Improve scroll performance on mobile
    if (this.is_touch) {
      // Add smooth scrolling where appropriate
      document.querySelectorAll(".sidemenu, .assetlist, .maplist").forEach((elem) => {
        elem.style.webkitOverflowScrolling = "touch";
      });
    }
  }

  // Update bottom nav active state when sidemenu changes
  updateBottomNavActive(active_id) {
    if (!this.bottom_nav) return;
    const items = this.bottom_nav.querySelectorAll(".mobile-bottom-nav-item");
    items.forEach((item) => {
      item.classList.remove("active");
    });
    
    // Find corresponding item and activate it
    // This would need to be called when sidemenu selection changes
  }
}

// Initialize mobile UI when app is ready
window.addEventListener("load", () => {
  if (window.app) {
    window.mobile_ui = new MobileUI(window.app);
  }
  
  // Also initialize on DOMContentLoaded as fallback
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (window.app) {
        window.mobile_ui = new MobileUI(window.app);
      }
    });
  }
});
