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
    
    // Attach handlers immediately and also after delays
    this.attachCardHandlers();
    setTimeout(() => this.attachCardHandlers(), 100);
    setTimeout(() => this.attachCardHandlers(), 500);
    setTimeout(() => this.attachCardHandlers(), 1000);
  }
  
  attachCardHandlers() {
    // Begin Building card - use multiple methods
    const begin_card = document.getElementById("card-begin-building");
    if (begin_card) {
      // Remove any existing handlers by cloning
      const newCard = begin_card.cloneNode(true);
      begin_card.parentNode.replaceChild(newCard, begin_card);
      
      // Set onclick directly (most reliable)
      newCard.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
        return false;
      };
      
      // Touch handler
      newCard.ontouchend = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
      };
      
      // Also addEventListener as backup
      newCard.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
      });
      
      newCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
      });
      
      // Force styles
      newCard.style.pointerEvents = "auto";
      newCard.style.cursor = "pointer";
      newCard.style.zIndex = "10001";
      
      // Make it accessible
      newCard.setAttribute("role", "button");
      newCard.setAttribute("tabindex", "0");
      newCard.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.showLoginOverlay();
        }
      });
    }
    
    // Original microStudio site card
    const original_card = document.getElementById("card-original-site");
    if (original_card) {
      const newCard = original_card.cloneNode(true);
      original_card.parentNode.replaceChild(newCard, original_card);
      
      newCard.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
        return false;
      };
      
      newCard.ontouchend = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
      };
      
      newCard.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://microstudio.dev", "_blank");
      });
      
      newCard.style.pointerEvents = "auto";
      newCard.style.cursor = "pointer";
      newCard.style.zIndex = "10001";
    }
    
    // MIFF Repository card
    const miff_card = document.getElementById("card-miff-repo");
    if (miff_card) {
      const newCard = miff_card.cloneNode(true);
      miff_card.parentNode.replaceChild(newCard, miff_card);
      
      newCard.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
        return false;
      };
      
      newCard.ontouchend = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      };
      
      newCard.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      });
      
      newCard.style.pointerEvents = "auto";
      newCard.style.cursor = "pointer";
      newCard.style.zIndex = "10001";
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
