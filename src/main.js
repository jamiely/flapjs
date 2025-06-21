import { 
  GRAVITY, 
  JUMP_VEL, 
  HERO_SPEED,
  scaling} from './config.js';

import {
  addToPt} from './physics.js';

import {
  newGame,
  isGameOver,
  handlePipes} from './gamestate.js';

import {
  generateClouds,
  generateForegroundClouds,
  generateSkyline,
  updateClouds,
  updateForegroundClouds,
  updateSkyline,
} from './worldgen.js';

import {
  playBounceSound,
  playGameOverSound,
} from './sound.js'

import {
  updateHighScoreDisplay,
} from './score.js'

import {
  render,
  setupCanvas,
  updateGameBounds,
} from './draw.js'

import {
  setupEventHandlers,
} from './eventHandlers.js'

import {
  showGameOver,
  showInstructions,
  showTitleScreen,
  startGame,
} from './screens.js'

(function(root, el){

  // tick the game by delta seconds
  function tick(game, delta) {
    // Always update clouds and skyline, even when not playing
    updateClouds(game, delta);
    updateForegroundClouds(game, delta);
    updateSkyline(game, delta);
    
    if(game.state !== 'playing') {
      return;
    }
    
    if(game.pause || game.isGameOver) {
      return;
    } else if(isGameOver(game)) {
      game.isGameOver = true;
      playGameOverSound();
      enableStartButton(game);
      return;
    }

    // Process jump request if one is pending
    if (game.jumpRequested && !game.isGameOver) {
      game.hero.vel.y = JUMP_VEL;
      
      playBounceSound();
      game.jumpRequested = false; // Reset the jump request
    }

    var dAcel = {
      x: 0,
      y: GRAVITY * delta
    };
    var dPt = {
      x: game.hero.vel.x * delta,
      y: game.hero.vel.y * delta + 0.5 * GRAVITY * delta * delta
    };
    addToPt(game.hero.pos, dPt);
    addToPt(game.hero.vel, dAcel);
    
    // Keep horizontal velocity constant
    game.hero.vel.x = HERO_SPEED * scaling.SCALE_X;
    handlePipes(game);
  }

  function genRequestAnimFunction(root, game, canvas, callback) {
    var lastTimestamp = 0;
    var needsRender = true;
    var lastPauseState = false;
    
    var requestAnim = function (timestamp) {
      var elapsed = timestamp - (lastTimestamp || timestamp);
      elapsed = elapsed / 1000.0;
      
      // Check if pause state changed
      var pauseStateChanged = (game.pause !== lastPauseState);
      lastPauseState = game.pause;
      
      tick(game, elapsed);
      
      // Only render if game is not paused, or if pause state just changed, or if we need to render
      if (!game.pause || pauseStateChanged || needsRender) {
        render(game, canvas);
        needsRender = false;
      }
      
      lastTimestamp = timestamp;
      callback(requestAnim);
    };
    
    // Expose function to request render (for resize events)
    requestAnim.requestRender = function() {
      needsRender = true;
    };
    
    return requestAnim;
  }


  function enableStartButton(game) {
    showGameOver(game);
  }

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
    animationFunction = genRequestAnimFunction(root, game, null, function(funRequest) {
      root.requestAnimationFrame(funRequest);
    });
  }
  
  // Create canvas with animation function reference
  var canvas = setupCanvas(game, el, animationFunction);
  
  // Update animation function with canvas reference
  if (animationFunction) {
    animationFunction = genRequestAnimFunction(root, game, canvas, function(funRequest) {
      root.requestAnimationFrame(funRequest);
    });
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