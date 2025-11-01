# Simple Home Page Interactions
class SimpleHome
  constructor:(@app)->
    @init()

  init:()->
    # Begin Building card
    begin_card = document.getElementById("card-begin-building")
    begin_card?.addEventListener "click", ()=>
      @showLoginOverlay()
    
    # Original microStudio site card
    original_card = document.getElementById("card-original-site")
    original_card?.addEventListener "click", ()=>
      window.open "https://microstudio.dev", "_blank"
    
    # MIFF Repository card
    miff_card = document.getElementById("card-miff-repo")
    miff_card?.addEventListener "click", ()=>
      window.open "https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free", "_blank"
    
    # Auto-show login overlay if user clicks begin building
    # (handled above)

  showLoginOverlay:()->
    overlay = document.getElementById("login-overlay")
    guest_panel = document.getElementById("guest-panel")
    
    if overlay and guest_panel
      overlay.style.display = "flex"
      guest_panel.style.display = "block"
      # Highlight guest button
      guest_button = document.getElementById("guest-action-guest")
      if guest_button
        setTimeout ()=>
          guest_button.focus()
        , 100

# Initialize when ready
window.addEventListener "load", ()->
  if window.app
    window.simple_home = new SimpleHome(window.app)
