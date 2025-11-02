// Simple Home Page Interactions
class SimpleHome {
  constructor(app) {
    this.app = app;
    // Delay init to ensure DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  init() {
    console.log("SimpleHome initializing...");
    
    // Force home section to be visible
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      homeSection.style.display = "block";
      homeSection.style.visibility = "visible";
      
      // Hide all old parts first
      const allParts = homeSection.querySelectorAll(".part");
      allParts.forEach((part) => {
        if (!part.classList.contains("simple-home") && !part.classList.contains("simple-footer")) {
          part.style.display = "none";
          part.style.visibility = "hidden";
          part.style.height = "0";
          part.style.overflow = "hidden";
          part.style.opacity = "0";
          part.style.position = "absolute";
          part.style.left = "-9999px";
        } else if (part.classList.contains("simple-home")) {
          part.style.display = "flex";
          part.style.visibility = "visible";
        } else if (part.classList.contains("simple-footer")) {
          part.style.display = "block";
          part.style.visibility = "visible";
        }
      });
    }
    
    // Wait a bit for DOM to settle, then attach handlers
    setTimeout(() => {
      this.attachCardHandlers();
    }, 100);
    
    // Also attach after a longer delay
    setTimeout(() => {
      this.attachCardHandlers();
    }, 500);
  }
  
  attachCardHandlers() {
    // Begin Building card - use onclick directly (most reliable)
    const begin_card = document.getElementById("card-begin-building");
    if (begin_card) {
      begin_card.onclick = () => {
        this.showLoginOverlay();
        return false;
      };
      begin_card.ontouchend = (e) => {
        e.preventDefault();
        this.showLoginOverlay();
      };
      begin_card.style.pointerEvents = "auto";
      begin_card.style.cursor = "pointer";
    }
    
    // Original microStudio site card
    const original_card = document.getElementById("card-original-site");
    if (original_card) {
      original_card.onclick = () => {
        window.open("https://microstudio.dev", "_blank");
        return false;
      };
      original_card.ontouchend = (e) => {
        e.preventDefault();
        window.open("https://microstudio.dev", "_blank");
      };
      original_card.style.pointerEvents = "auto";
      original_card.style.cursor = "pointer";
    }
    
    // MIFF Repository card
    const miff_card = document.getElementById("card-miff-repo");
    if (miff_card) {
      miff_card.onclick = () => {
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
        return false;
      };
      miff_card.ontouchend = (e) => {
        e.preventDefault();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      };
      miff_card.style.pointerEvents = "auto";
      miff_card.style.cursor = "pointer";
    }
  }

  showLoginOverlay() {
    const overlay = document.getElementById("login-overlay");
    const guest_panel = document.getElementById("guest-panel");
    
    if (overlay && guest_panel) {
      overlay.style.display = "flex";
      guest_panel.style.display = "block";
      // Highlight guest button
      const guest_button = document.getElementById("guest-action-guest");
      if (guest_button) {
        setTimeout(() => {
          guest_button.focus();
        }, 100);
      }
    }
  }
}

// Initialize when ready
window.addEventListener("load", () => {
  if (window.app) {
    window.simple_home = new SimpleHome(window.app);
  }
});
