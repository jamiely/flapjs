import { 
  GRAVITY, 
  JUMP_VEL, 
  HERO_SPEED,
  scaling,
  updateScaling
} from './config.js';

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
  initAudio,
  playBounceSound,
  playGameOverSound,
} from './sound.js'

import {
  isNewHighScore,
  promptForInitials,
  saveHighScore,
  updateGameOverScoresList,
  updateHighScoreDisplay,
} from './score.js'

import {
  getScaledHeroSize,
  render,
  setupCanvas,
  updateGameBounds,
} from './draw.js'

import {
  setupEventHandlers,
} from './eventHandlers.js'

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


  // Remove border functions - canvas is now fullscreen
  
  function startGame(game) {
    game.state = 'playing';
    game.isGameOver = false;
    game.pause = false;
    game.score = 0;
    game.pipes = [];
    game.clouds = generateClouds(); // Regenerate clouds for new game
    game.foregroundClouds = generateForegroundClouds(); // Regenerate foreground clouds for new game
    game.skyline = generateSkyline(); // Regenerate skyline for new game
    game.hero.pos = {x: 20 * scaling.SCALE_X, y: 20 * scaling.SCALE_Y};
    game.hero.size = getScaledHeroSize(); // Update hero size for current scale
    game.hero.vel = {x: HERO_SPEED * scaling.SCALE_X, y: 0};
    game.lastHole = null;
    
    // Hide all overlays
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('instructionsScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    initAudio();
  }
  
  function showInstructions(game) {
    game.state = 'instructions';
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('instructionsScreen').style.display = 'flex';
    document.getElementById('gameOverScreen').style.display = 'none';
  }
  
  function showTitleScreen(game) {
    game.state = 'title';
    updateHighScoreDisplay();
    document.getElementById('titleScreen').style.display = 'flex';
    document.getElementById('instructionsScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
  }
  
  function showGameOver(game) {
    game.state = 'gameover';
    
    // Check for new high score
    if (isNewHighScore(game.score)) {
      document.getElementById('newHighScoreMessage').style.display = 'block';
      
      // Prompt for initials and save
      promptForInitials(function(initials) {
        saveHighScore(game.score, initials);
        updateHighScoreDisplay();
        // Show the player's new score in the list
        updateGameOverScoresList(game.score, initials);
      });
    } else {
      document.getElementById('newHighScoreMessage').style.display = 'none';
      updateHighScoreDisplay();
      // Show player's score below ellipsis if not a high score
      updateGameOverScoresList(game.score, '');
    }
    
    // Show game over screen
    document.getElementById('titleScreen').style.display = 'none';
    document.getElementById('instructionsScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'flex';
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