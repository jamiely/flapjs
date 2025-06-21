// Game State Management Module
// Functions for creating, updating, and managing game state

import { scaling } from './config.js';
import { HERO_SPEED, PIPE_WID, PIPE_PAD, PIPE_BUF, PIPE_START_X, TOP } from './config.js';
import { isOutOfBounds, collides, addToPt } from './physics.js';

// Creates a new game state object
export function newGame() {
  var game = {
    hero: {
      pos: {
        x: 20 * scaling.SCALE_X, y: 20 * scaling.SCALE_Y
      },
      size: {
        width: 15 * scaling.SCALE_X * 2, height: 10 * scaling.SCALE_Y * 2
      },
      vel: {
        x: HERO_SPEED * scaling.SCALE_X, y: 0
      }
    },
    pipes: [],
    clouds: [], // Will be populated by world generation
    foregroundClouds: [], // Will be populated by world generation
    skyline: [], // Will be populated by world generation
    score: 0,
    lastHole: null,
    state: 'title', // 'title', 'instructions', 'playing', 'gameover'
    isGameOver: false,
    pause: false
  };

  return game;
}

// Checks if the game should end
export function isGameOver(game) {
  if (isOutOfBounds(game.hero, scaling.BOTTOM)) return true;

  for (var i = 0; i < game.pipes.length; i++) {
    if (collides(game.hero, game.pipes[i])) return true;
  }
  return false;
}

// Generates a new pair of pipes with random hole positioning
export function newPipes(game) {
  var scaledPipeWidth = PIPE_WID * scaling.SCALE_X;
  var scaledPipePad = PIPE_PAD * scaling.SCALE_X;
  
  var holeSize = {
    width: scaledPipeWidth,
    height: game.hero.size.height * 2.5
  };

  var minHole = holeSize.height;
  var maxHole = scaling.BOTTOM - holeSize.height;
  var hole;
  
  // Prevent same gap position twice in a row (max 5 iterations)
  var iterations = 0;
  do {
    hole = Math.floor(Math.random() * (maxHole - minHole)) + minHole;
    iterations++;
  } while (game.lastHole && Math.abs(hole - game.lastHole) < holeSize.height * 0.5 && iterations < 5);
  
  game.lastHole = hole;

  var lastPipe = game.pipes[game.pipes.length - 1];
  var minX = game.hero.pos.x + PIPE_START_X * scaling.SCALE_X;
  var x = lastPipe ? lastPipe.pos.x + scaledPipePad : minX;
  
  // Ensure new pipe is at least PIPE_START_X distance ahead of hero
  if (x < minX) {
    x = minX;
  }
  var h2 = holeSize.height / 2;

  var p1 = {
    pos: {
      x: x,
      y: TOP
    },
    size: {
      width: scaledPipeWidth,
      height: (hole - h2)
    },
    passed: false
  };
  var p2 = {
    pos: {
      x: x,
      y: hole + h2
    },
    size: {
      width: scaledPipeWidth,
      height: (scaling.BOTTOM - (hole + h2))
    },
    passed: false
  };

  return [p1, p2];
}

// Removes pipes that have moved off-screen
export function cleanupPipes(game) {
  while (game.pipes.length > 0 && 
    game.pipes[0].pos.x + game.pipes[0].size.width < game.hero.pos.x - game.hero.size.width) {
    game.pipes.shift();
  }
}

// Adds new pipes to maintain the pipe buffer
export function addPipes(game) {
  while (game.pipes.length < PIPE_BUF) {
    game.pipes.push.apply(game.pipes, newPipes(game));
  }
}

// Checks if hero has passed pipes and increments score
export function checkScore(game) {
  var heroRight = game.hero.pos.x + game.hero.size.width;
  
  for (var i = 0; i < game.pipes.length; i += 2) {
    var topPipe = game.pipes[i];
    var bottomPipe = game.pipes[i + 1];
    
    if (topPipe && !topPipe.passed && heroRight > topPipe.pos.x + topPipe.size.width) {
      topPipe.passed = true;
      if (bottomPipe) bottomPipe.passed = true;
      game.score++;
    }
  }
}

// Orchestrates pipe management
export function handlePipes(game) {
  cleanupPipes(game);
  addPipes(game);
  checkScore(game);
}

// Updates hero physics (separated from main tick for testing)
export function updateHeroPhysics(game, delta, gravity, jumpVel) {
  var dAcel = {
    x: 0,
    y: gravity * delta
  };
  var dPt = {
    x: game.hero.vel.x * delta,
    y: game.hero.vel.y * delta + 0.5 * gravity * delta * delta
  };
  addToPt(game.hero.pos, dPt);
  addToPt(game.hero.vel, dAcel);
  
  // Keep horizontal velocity constant
  game.hero.vel.x = HERO_SPEED * scaling.SCALE_X;
}

// Handles jump input (separated for testing)
export function processJump(game, jumpVel) {
  if (!game.isGameOver && game.state === 'playing' && !game.pause) {
    game.hero.vel.y = jumpVel;
    return true; // Jump was processed
  }
  return false; // Jump was not processed
}

// Resets game state for a new game (pure function)
export function resetGameState(game) {
  game.state = 'playing';
  game.isGameOver = false;
  game.pause = false;
  game.score = 0;
  game.pipes = [];
  game.hero.pos = { x: 20 * scaling.SCALE_X, y: 20 * scaling.SCALE_Y };
  game.hero.size = { width: 15 * scaling.SCALE_X * 2, height: 10 * scaling.SCALE_Y * 2 };
  game.hero.vel = { x: HERO_SPEED * scaling.SCALE_X, y: 0 };
  game.lastHole = null;
  
  return game;
}

// Sets game state to game over
export function setGameOver(game) {
  game.isGameOver = true;
  game.state = 'gameover';
  return game;
}

// Pauses or unpauses the game
export function togglePause(game) {
  if (game.state === 'playing') {
    game.pause = !game.pause;
  }
  return game.pause;
}

// Game state utilities
export const GameStates = {
  TITLE: 'title',
  INSTRUCTIONS: 'instructions', 
  PLAYING: 'playing',
  GAMEOVER: 'gameover'
};

// Export all utilities as a single object for convenience
export const GameStateUtils = {
  newGame,
  isGameOver,
  newPipes,
  cleanupPipes,
  addPipes,
  checkScore,
  handlePipes,
  updateHeroPhysics,
  processJump,
  resetGameState,
  setGameOver,
  togglePause,
  GameStates
};