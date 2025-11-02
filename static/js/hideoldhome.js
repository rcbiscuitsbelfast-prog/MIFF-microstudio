// Force hide all old home sections immediately on page load
(function() {
  function hideOldHomeSections() {
    const homeSection = document.getElementById("home-section");
    if (homeSection) {
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
        }
      });
      
      // Force show simple home
      const simpleHome = homeSection.querySelector(".simple-home");
      const simpleFooter = homeSection.querySelector(".simple-footer");
      if (simpleHome) {
        simpleHome.style.display = "flex";
        simpleHome.style.visibility = "visible";
        simpleHome.style.opacity = "1";
      }
      if (simpleFooter) {
        simpleFooter.style.display = "block";
        simpleFooter.style.visibility = "visible";
        simpleFooter.style.opacity = "1";
      }
    }
  }
  
  // Run immediately if DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hideOldHomeSections);
  } else {
    hideOldHomeSections();
  }
  
  // Also run after a short delay to catch any late-rendering
  setTimeout(hideOldHomeSections, 100);
  setTimeout(hideOldHomeSections, 500);
})();
