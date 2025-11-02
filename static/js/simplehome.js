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
    
    // Hide all old parts first
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      const allParts = homeSection.querySelectorAll(".part");
      allParts.forEach((part) => {
        if (!part.classList.contains("simple-home") && !part.classList.contains("simple-footer")) {
          part.style.display = "none";
          part.style.visibility = "hidden";
          part.style.height = "0";
          part.style.overflow = "hidden";
        }
      });
    }
    
    // Begin Building card
    const begin_card = document.getElementById("card-begin-building");
    if (begin_card) {
      console.log("Found begin building card");
      
      // Remove any existing listeners
      const newBeginCard = begin_card.cloneNode(true);
      begin_card.parentNode.replaceChild(newBeginCard, begin_card);
      
      // Add handlers to new element
      newBeginCard.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Begin building clicked");
        this.showLoginOverlay();
      }, {capture: true});
      
      newBeginCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Begin building touched");
        this.showLoginOverlay();
      }, {capture: true});
      
      // Force pointer events
      newBeginCard.style.pointerEvents = "auto";
      newBeginCard.style.cursor = "pointer";
      newBeginCard.style.zIndex = "1000";
    } else {
      console.error("card-begin-building not found!");
    }
    
    // Original microStudio site card
    const original_card = document.getElementById("card-original-site");
    if (original_card) {
      const newOriginalCard = original_card.cloneNode(true);
      original_card.parentNode.replaceChild(newOriginalCard, original_card);
      
      newOriginalCard.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
      }, {capture: true});
      
      newOriginalCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://microstudio.dev", "_blank");
      }, {capture: true});
      
      newOriginalCard.style.pointerEvents = "auto";
      newOriginalCard.style.cursor = "pointer";
      newOriginalCard.style.zIndex = "1000";
    }
    
    // MIFF Repository card
    const miff_card = document.getElementById("card-miff-repo");
    if (miff_card) {
      const newMiffCard = miff_card.cloneNode(true);
      miff_card.parentNode.replaceChild(newMiffCard, miff_card);
      
      newMiffCard.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      }, {capture: true});
      
      newMiffCard.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      }, {capture: true});
      
      newMiffCard.style.pointerEvents = "auto";
      newMiffCard.style.cursor = "pointer";
      newMiffCard.style.zIndex = "1000";
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
