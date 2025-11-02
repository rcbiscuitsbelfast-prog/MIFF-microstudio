// Simple Home Page Interactions
class SimpleHome {
  constructor(app) {
    this.app = app;
    this.init();
  }

  init() {
    console.log("SimpleHome initializing...");
    
    // Begin Building card
    const begin_card = document.getElementById("card-begin-building");
    if (begin_card) {
      console.log("Found begin building card");
      begin_card.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Begin building clicked");
        this.showLoginOverlay();
      });
      // Also support touch
      begin_card.addEventListener("touchend", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showLoginOverlay();
      });
    } else {
      console.error("card-begin-building not found!");
    }
    
    // Original microStudio site card
    const original_card = document.getElementById("card-original-site");
    if (original_card) {
      original_card.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://microstudio.dev", "_blank");
      });
      original_card.addEventListener("touchend", (e) => {
        e.preventDefault();
        window.open("https://microstudio.dev", "_blank");
      });
    }
    
    // MIFF Repository card
    const miff_card = document.getElementById("card-miff-repo");
    if (miff_card) {
      miff_card.addEventListener("click", (e) => {
        e.preventDefault();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      });
      miff_card.addEventListener("touchend", (e) => {
        e.preventDefault();
        window.open("https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank");
      });
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
