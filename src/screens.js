import { scaling, HERO_SPEED } from "./config.js";

import {
  isNewHighScore,
  promptForInitials,
  saveHighScore,
  updateGameOverScoresList,
  updateHighScoreDisplay,
} from "./score.js";

import { initAudio } from "./sound.js";

import { getScaledHeroSize } from "./draw.js";

import {
  generateClouds,
  generateForegroundClouds,
  generateSkyline,
} from "./worldgen.js";

export function showGameOver(game) {
  game.state = "gameover";

  // Check for new high score
  if (isNewHighScore(game.score)) {
    document.getElementById("newHighScoreMessage").style.display = "block";

    // Prompt for initials and save
    promptForInitials(function (initials) {
      saveHighScore(game.score, initials);
      updateHighScoreDisplay();
      // Show the player's new score in the list
      updateGameOverScoresList(game.score, initials);
    });
  } else {
    document.getElementById("newHighScoreMessage").style.display = "none";
    updateHighScoreDisplay();
    // Show player's score below ellipsis if not a high score
    updateGameOverScoresList(game.score, "");
  }

  // Show game over screen
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("instructionsScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "flex";
}

export function showTitleScreen(game) {
  game.state = "title";
  updateHighScoreDisplay();
  document.getElementById("titleScreen").style.display = "flex";
  document.getElementById("instructionsScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";
}

export function showInstructions(game) {
  game.state = "instructions";
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("instructionsScreen").style.display = "flex";
  document.getElementById("gameOverScreen").style.display = "none";
}

export function startGame(game) {
  game.state = "playing";
  game.isGameOver = false;
  game.pause = false;
  game.score = 0;
  game.pipes = [];
  game.clouds = generateClouds(); // Regenerate clouds for new game
  game.foregroundClouds = generateForegroundClouds(); // Regenerate foreground clouds for new game
  game.skyline = generateSkyline(); // Regenerate skyline for new game
  game.hero.pos = { x: 20 * scaling.SCALE_X, y: 20 * scaling.SCALE_Y };
  game.hero.size = getScaledHeroSize(); // Update hero size for current scale
  game.hero.vel = { x: HERO_SPEED * scaling.SCALE_X, y: 0 };
  game.lastHole = null;

  // Hide all overlays
  document.getElementById("titleScreen").style.display = "none";
  document.getElementById("instructionsScreen").style.display = "none";
  document.getElementById("gameOverScreen").style.display = "none";

  initAudio();
}
