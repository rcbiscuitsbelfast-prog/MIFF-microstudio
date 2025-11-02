// Force hide all old home sections immediately on page load
(function() {
  function hideOldHomeSections() {
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
      // Force home section visible
      homeSection.style.display = "block";
      homeSection.style.visibility = "visible";
      
      // Hide all parts except simple-home and simple-footer
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
          part.style.width = "0";
          part.style.padding = "0";
          part.style.margin = "0";
        }
      });
      
      // Force show simple home
      const simpleHome = homeSection.querySelector(".simple-home");
      const simpleFooter = homeSection.querySelector(".simple-footer");
      if (simpleHome) {
        simpleHome.style.display = "flex";
        simpleHome.style.visibility = "visible";
        simpleHome.style.opacity = "1";
        simpleHome.style.position = "relative";
        simpleHome.style.height = "auto";
        simpleHome.style.width = "auto";
        simpleHome.style.left = "auto";
      }
      if (simpleFooter) {
        simpleFooter.style.display = "block";
        simpleFooter.style.visibility = "visible";
        simpleFooter.style.opacity = "1";
        simpleFooter.style.position = "relative";
        simpleFooter.style.height = "auto";
        simpleFooter.style.width = "auto";
        simpleFooter.style.left = "auto";
      }
    }
  }
  
  // Run immediately - use inline script execution
  hideOldHomeSections();
  
  // Run when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideOldHomeSections);
  } else {
    setTimeout(hideOldHomeSections, 0);
  }
  
  // Also run after delays to catch any late-rendering
  setTimeout(hideOldHomeSections, 50);
  setTimeout(hideOldHomeSections, 200);
  setTimeout(hideOldHomeSections, 500);
  setTimeout(hideOldHomeSections, 1000);
  
  // Monitor for any parts that appear later
  const observer = new MutationObserver(() => {
    hideOldHomeSections();
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }
})();
