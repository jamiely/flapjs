import {
  newGame} from './gamestate.js';

import {
  generateClouds,
  generateForegroundClouds,
  generateSkyline,
} from './worldgen.js';


import {
  updateHighScoreDisplay,
} from './score.js'

import {
  setupCanvas,
  updateGameBounds,
} from './draw.js'

import {
  setupEventHandlers,
} from './eventHandlers.js'

import {
  showInstructions,
  showTitleScreen,
  startGame,
} from './screens.js'

import {
  genRequestAnimFunction,
} from './animationFunction.js'

import {
  tick,
} from './tick.js'

(function(root, el){


  var game; // Global reference for resize handler
  var animationFunction; // Global reference for animation function
  
  // Create game first
  game = newGame();
  // Populate world generation arrays
  game.clouds = generateClouds();
  game.foregroundClouds = generateForegroundClouds();
  game.skyline = generateSkyline();
  
  // Create animation function
  if(root.requestAnimationFrame) {
    animationFunction = genRequestAnimFunction({root, game, canvas: null, callback: function(funRequest) {
      root.requestAnimationFrame(funRequest);
    }, tick});
  }
  
  // Create canvas with animation function reference
  var canvas = setupCanvas(game, el, animationFunction);
  
  // Update animation function with canvas reference
  if (animationFunction) {
    animationFunction = genRequestAnimFunction({root, game, canvas, callback: function(funRequest) {
      root.requestAnimationFrame(funRequest);
    }, tick});
  }
  
  // Initial scaling update
  updateGameBounds(game);
  
  // Initialize high score display
  updateHighScoreDisplay();
  
  setupEventHandlers(game);
  
  var startButton = document.getElementById('startButton');
  var instructionsButton = document.getElementById('instructionsButton');
  var backButton = document.getElementById('backButton');
  var restartButton = document.getElementById('restartButton');
  
  startButton.addEventListener('click', function() {
    if (game.state === 'title') {
      startGame(game);
    } else if (game.state === 'instructions') {
      showTitleScreen(game);
    }
  });
  
  instructionsButton.addEventListener('click', function() {
    showInstructions(game);
  });
  
  backButton.addEventListener('click', function() {
    showTitleScreen(game);
  });
  
  restartButton.addEventListener('click', function() {
    startGame(game);
  });
  
  // Global Enter key listener for starting/restarting game
  document.addEventListener('keydown', function(evt) {
    if (evt.keyCode == 13) { // Enter key
      // Don't handle Enter if initials screen is visible
      var initialsScreen = document.getElementById('initialsScreen');
      if (initialsScreen.style.display === 'flex') {
        return;
      }
      
      if (game.state === 'title' || game.state === 'gameover') {
        startGame(game);
      } else if (game.state === 'instructions') {
        showTitleScreen(game);
      }
    }
  });
  
  // Start the animation loop
  if(animationFunction) {
    root.requestAnimationFrame(animationFunction);
  }

})(window, document.getElementById('game'));