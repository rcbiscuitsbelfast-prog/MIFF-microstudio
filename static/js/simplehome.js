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
    // Begin Building card
    const begin_card = document.getElementById("card-begin-building");
    if (begin_card) {
      console.log("Found begin building card, attaching handlers");
      
      // Remove old listeners by cloning
      const newBeginCard = begin_card.cloneNode(true);
      begin_card.parentNode.replaceChild(newBeginCard, begin_card);
      
      // Direct click handler - no capture to allow bubbling test
      const clickHandler = (e) => {
        console.log("BEGIN BUILDING CLICKED!", e);
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
        return false;
      };
      
      newBeginCard.onclick = clickHandler;
      newBeginCard.addEventListener("click", clickHandler);
      newBeginCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("BEGIN BUILDING TOUCHED!");
        this.showLoginOverlay();
      });
      
      // Force styles
      newBeginCard.style.pointerEvents = "auto";
      newBeginCard.style.cursor = "pointer";
      newBeginCard.style.zIndex = "10001";
      newBeginCard.style.position = "relative";
      
      console.log("Begin card handler attached");
    } else {
      console.warn("card-begin-building not found!");
    }
    
    // Original microStudio site card
    const original_card = document.getElementById("card-original-site");
    if (original_card) {
      const newOriginalCard = original_card.cloneNode(true);
      original_card.parentNode.replaceChild(newOriginalCard, original_card);
      
      const clickHandler = (e) => {
        console.log("ORIGINAL SITE CLICKED!", e);
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
        return false;
      };
      
      newOriginalCard.onclick = clickHandler;
      newOriginalCard.addEventListener("click", clickHandler);
      newOriginalCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
      });
      
      newOriginalCard.style.pointerEvents = "auto";
      newOriginalCard.style.cursor = "pointer";
      newOriginalCard.style.zIndex = "10001";
      newOriginalCard.style.position = "relative";
    }
    
    // MIFF Repository card
    const miff_card = document.getElementById("card-miff-repo");
    if (miff_card) {
      const newMiffCard = miff_card.cloneNode(true);
      miff_card.parentNode.replaceChild(newMiffCard, miff_card);
      
      const clickHandler = (e) => {
        console.log("MIFF REPO CLICKED!", e);
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
        return false;
      };
      
      newMiffCard.onclick = clickHandler;
      newMiffCard.addEventListener("click", clickHandler);
      newMiffCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      });
      
      newMiffCard.style.pointerEvents = "auto";
      newMiffCard.style.cursor = "pointer";
      newMiffCard.style.zIndex = "10001";
      newMiffCard.style.position = "relative";
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
