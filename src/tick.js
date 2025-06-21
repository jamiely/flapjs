import { GRAVITY, JUMP_VEL, HERO_SPEED, scaling } from "./config.js";

import { addToPt } from "./physics.js";

import { isGameOver, handlePipes } from "./gamestate.js";

import {
  updateClouds,
  updateForegroundClouds,
  updateSkyline,
} from "./worldgen.js";

import { playBounceSound, playGameOverSound } from "./sound.js";

import { showGameOver } from "./screens.js";

// tick the game by delta seconds
export function tick(game, delta) {
  // Always update clouds and skyline, even when not playing
  updateClouds(game, delta);
  updateForegroundClouds(game, delta);
  updateSkyline(game, delta);

  if (game.state !== "playing") {
    return;
  }

  if (game.pause || game.isGameOver) {
    return;
  } else if (isGameOver(game)) {
    game.isGameOver = true;
    playGameOverSound();
    showGameOver(game);
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
    y: GRAVITY * delta,
  };
  var dPt = {
    x: game.hero.vel.x * delta,
    y: game.hero.vel.y * delta + 0.5 * GRAVITY * delta * delta,
  };
  addToPt(game.hero.pos, dPt);
  addToPt(game.hero.vel, dAcel);

  // Keep horizontal velocity constant
  game.hero.vel.x = HERO_SPEED * scaling.SCALE_X;
  handlePipes(game);
}
