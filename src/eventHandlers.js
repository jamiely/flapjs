import {
  showTitleScreen
} from './screens.js'

export function setupEventHandlers(game) {
  document.addEventListener("keydown", function (evt) {
    if (game.state === "instructions" && evt.keyCode === 27) {
      // ESC key
      showTitleScreen(game);
    } else if (game.state === "playing") {
      if (evt.keyCode == 80) {
        // P key
        game.pause = !game.pause;
      } else if (evt.keyCode == 32 && !game.isGameOver) {
        // space
        game.jumpRequested = true; // Request a jump on next animation frame
      }
    }
  });

  // Touch/tap support for mobile devices
  document.addEventListener("touchstart", function (evt) {
    evt.preventDefault(); // Prevent default touch behavior (scrolling, zooming)
    if (game.state === "playing" && !game.isGameOver) {
      game.jumpRequested = true; // Request a jump on next animation frame
    }
  });

  // Mouse click support (also helps with mobile in some cases)
  document.addEventListener("mousedown", function (evt) {
    if (game.state === "playing" && !game.isGameOver) {
      game.jumpRequested = true; // Request a jump on next animation frame
    }
  });
}
