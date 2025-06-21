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
  render,
} from './draw.js'

import {
  setupEventHandlers,
} from './eventHandlers.js'

(function(root, el){
  // Update scaling and bounds when window resizes
  function updateGameBounds(game) {
    var oldScaleX = scaling.SCALE_X;
    var oldScaleY = scaling.SCALE_Y;
    
    // Update scaling using the config module function
    updateScaling();
    
    // Update game elements if game exists
    if (game) {
      // Update hero size and position scaling
      game.hero.size = getScaledHeroSize();
      game.hero.vel.x = HERO_SPEED * scaling.SCALE_X; // Update horizontal velocity
      
      // Update existing pipes with new scaling
      var scaleRatioX = scaling.SCALE_X / oldScaleX;
      var scaleRatioY = scaling.SCALE_Y / oldScaleY;
      
      for (var i = 0; i < game.pipes.length; i++) {
        var pipe = game.pipes[i];
        // Scale pipe position and size
        pipe.pos.x *= scaleRatioX;
        pipe.pos.y *= scaleRatioY;
        pipe.size.width *= scaleRatioX;
        pipe.size.height *= scaleRatioY;
      }
      
      // Regenerate clouds and skyline with new scaling
      game.clouds = generateClouds();
      game.foregroundClouds = generateForegroundClouds();
      game.skyline = generateSkyline();
    }
  }
  
  // Helper function to get scaled hero size
  function getScaledHeroSize() {
    return {
      width: 15 * scaling.SCALE_X * 2, // Make hero twice as big
      height: 10 * scaling.SCALE_Y * 2 // Make hero twice as big
    };
  }
  // Creates the canvas
  function setupCanvas(parent, animationFunction) {
    var canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.style.cursor = 'none';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1';
    
    // Make canvas fullscreen
    function resizeCanvas() {
      var windowWidth = window.innerWidth;
      var windowHeight = window.innerHeight;
      
      // Set canvas to full viewport size
      canvas.width = windowWidth;
      canvas.height = windowHeight;
      canvas.style.width = windowWidth + 'px';
      canvas.style.height = windowHeight + 'px';
      
      // Update game bounds
      updateGameBounds(game);
      
      // Update overlay sizes to match canvas
      updateOverlaySizes(windowWidth, windowHeight);
      
      // Request a render after resize (especially important during pause)
      if (animationFunction && animationFunction.requestRender) {
        animationFunction.requestRender();
      }
    }
    
    resizeCanvas();
    parent.appendChild(canvas);
    
    // Add resize listener
    window.addEventListener('resize', resizeCanvas);
    
    return canvas;
  }
  
  function updateOverlaySizes(canvasWidth, canvasHeight) {
    // Overlays now take full window, but we still scale fonts based on canvas size
    var scaleFactor = Math.min(canvasWidth / 500, canvasHeight / 200);
    
    // Scale title screen
    var title = titleScreen.querySelector('h1');
    title.style.fontSize = (48 * scaleFactor) + 'px';
    
    var titleHighScore = document.getElementById('titleHighScore');
    titleHighScore.style.fontSize = (16 * scaleFactor) + 'px';
    document.getElementById('titleHighScoreValue').style.fontSize = (24 * scaleFactor) + 'px';
    document.getElementById('titleHighScoreInitials').style.fontSize = (14 * scaleFactor) + 'px';
    
    var startButton = document.getElementById('startButton');
    var instructionsButton = document.getElementById('instructionsButton');
    startButton.style.fontSize = (24 * scaleFactor) + 'px';
    startButton.style.padding = (15 * scaleFactor) + 'px ' + (30 * scaleFactor) + 'px';
    instructionsButton.style.fontSize = (24 * scaleFactor) + 'px';
    instructionsButton.style.padding = (15 * scaleFactor) + 'px ' + (30 * scaleFactor) + 'px';
    
    // Scale instructions screen
    var instructionsTitle = instructionsScreen.querySelector('h2');
    var instructionsList = instructionsScreen.querySelector('ul');
    var backButton = document.getElementById('backButton');
    
    instructionsTitle.style.fontSize = (24 * scaleFactor) + 'px';
    instructionsList.style.fontSize = (16 * scaleFactor) + 'px';
    backButton.style.fontSize = (18 * scaleFactor) + 'px';
    backButton.style.padding = (10 * scaleFactor) + 'px ' + (20 * scaleFactor) + 'px';
    
    // Scale game over screen
    var gameOverTitle = gameOverScreen.querySelector('h1');
    var newHighScoreMessage = document.getElementById('newHighScoreMessage');
    var gameOverHighScore = document.getElementById('gameOverHighScore');
    var restartButton = document.getElementById('restartButton');
    
    gameOverTitle.style.fontSize = (28 * scaleFactor) + 'px';
    newHighScoreMessage.style.fontSize = (18 * scaleFactor) + 'px';
    gameOverHighScore.style.fontSize = (14 * scaleFactor) + 'px';
    
    // Scale individual score entries in the high scores list
    var scoreEntries = gameOverHighScore.querySelectorAll('p');
    for (var i = 0; i < scoreEntries.length; i++) {
      if (i === 0) {
        // Title "High Scores"
        scoreEntries[i].style.fontSize = (14 * scaleFactor) + 'px';
      } else {
        // Individual score entries
        scoreEntries[i].style.fontSize = (12 * scaleFactor) + 'px';
      }
    }
    
    restartButton.style.fontSize = (20 * scaleFactor) + 'px';
    restartButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
    
    // Scale score display
    var scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.style.fontSize = (48 * scaleFactor) + 'px';
    scoreDisplay.style.top = (20 * scaleFactor) + 'px';
    scoreDisplay.style.right = (20 * scaleFactor) + 'px';
    
    // Scale initials screen
    var initialsScreen = document.getElementById('initialsScreen');
    var initialsTitle = initialsScreen.querySelector('h1');
    var initialsText = initialsScreen.querySelector('p');
    var initialsInput = document.getElementById('initialsInput');
    var submitButton = document.getElementById('submitInitials');
    var skipButton = document.getElementById('skipInitials');
    
    initialsTitle.style.fontSize = (32 * scaleFactor) + 'px';
    initialsText.style.fontSize = (18 * scaleFactor) + 'px';
    initialsInput.style.fontSize = (24 * scaleFactor) + 'px';
    initialsInput.style.padding = (10 * scaleFactor) + 'px ' + (15 * scaleFactor) + 'px';
    initialsInput.style.width = (150 * scaleFactor) + 'px';
    
    submitButton.style.fontSize = (20 * scaleFactor) + 'px';
    submitButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
    skipButton.style.fontSize = (20 * scaleFactor) + 'px';
    skipButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
  }

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



  function p(ent) {
    return "[size=" + ent.size.width + "," + ent.size.height + 
      " pos=" + ent.pos.x + "," + ent.pos.y +  "]";
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
  var canvas = setupCanvas(el, animationFunction);
  
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