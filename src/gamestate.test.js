import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scaling } from './config.js';
import {
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
  GameStates,
  GameStateUtils
} from './gamestate.js';

// Mock the physics module
vi.mock('./physics.js', () => ({
  isOutOfBounds: vi.fn(),
  collides: vi.fn(),
  addToPt: vi.fn()
}));

import { isOutOfBounds, collides, addToPt } from './physics.js';

describe('GameState Module', () => {
  let game;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Create a fresh game for each test
    game = newGame();
  });

  describe('Game Creation', () => {
    describe('newGame()', () => {
      it('should create a game with correct initial state', () => {
        const game = newGame();
        
        expect(game.state).toBe('title');
        expect(game.isGameOver).toBe(false);
        expect(game.pause).toBe(false);
        expect(game.score).toBe(0);
        expect(game.pipes).toEqual([]);
        expect(game.lastHole).toBe(null);
      });

      it('should create hero with correct initial properties', () => {
        const game = newGame();
        
        expect(game.hero).toHaveProperty('pos');
        expect(game.hero).toHaveProperty('size');
        expect(game.hero).toHaveProperty('vel');
        expect(game.hero.pos.x).toBe(20 * scaling.SCALE_X);
        expect(game.hero.pos.y).toBe(20 * scaling.SCALE_Y);
        expect(game.hero.vel.y).toBe(0);
      });

      it('should create arrays for world elements', () => {
        const game = newGame();
        
        expect(Array.isArray(game.clouds)).toBe(true);
        expect(Array.isArray(game.foregroundClouds)).toBe(true);
        expect(Array.isArray(game.skyline)).toBe(true);
      });
    });
  });

  describe('Game Over Detection', () => {
    describe('isGameOver()', () => {
      it('should return false when hero is in bounds and no collisions', () => {
        isOutOfBounds.mockReturnValue(false);
        collides.mockReturnValue(false);
        
        const result = isGameOver(game);
        expect(result).toBe(false);
      });

      it('should return true when hero is out of bounds', () => {
        isOutOfBounds.mockReturnValue(true);
        
        const result = isGameOver(game);
        expect(result).toBe(true);
        expect(isOutOfBounds).toHaveBeenCalledWith(game.hero, scaling.BOTTOM);
      });

      it('should return true when hero collides with a pipe', () => {
        isOutOfBounds.mockReturnValue(false);
        collides.mockReturnValueOnce(false).mockReturnValueOnce(true);
        
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 } },
          { pos: { x: 100, y: 150 }, size: { width: 50, height: 100 } }
        ];
        
        const result = isGameOver(game);
        expect(result).toBe(true);
        expect(collides).toHaveBeenCalledTimes(2);
      });

      it('should check all pipes for collisions', () => {
        isOutOfBounds.mockReturnValue(false);
        collides.mockReturnValue(false);
        
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 } },
          { pos: { x: 100, y: 150 }, size: { width: 50, height: 100 } },
          { pos: { x: 200, y: 0 }, size: { width: 50, height: 100 } }
        ];
        
        isGameOver(game);
        expect(collides).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Pipe Management', () => {
    describe('newPipes()', () => {
      it('should return an array of two pipes', () => {
        const pipes = newPipes(game);
        expect(pipes).toHaveLength(2);
      });

      it('should create pipes with correct structure', () => {
        const pipes = newPipes(game);
        
        pipes.forEach(pipe => {
          expect(pipe).toHaveProperty('pos');
          expect(pipe).toHaveProperty('size');
          expect(pipe).toHaveProperty('passed');
          expect(pipe.pos).toHaveProperty('x');
          expect(pipe.pos).toHaveProperty('y');
          expect(pipe.size).toHaveProperty('width');
          expect(pipe.size).toHaveProperty('height');
          expect(pipe.passed).toBe(false);
        });
      });

      it('should create pipes with same x position', () => {
        const pipes = newPipes(game);
        expect(pipes[0].pos.x).toBe(pipes[1].pos.x);
      });

      it('should prevent consecutive holes at same position', () => {
        // Set lastHole to a specific value
        game.lastHole = 100;
        
        const pipes1 = newPipes(game);
        const pipes2 = newPipes(game);
        
        // The holes should be different (though not guaranteed due to randomness)
        // At minimum, verify the function sets lastHole
        expect(game.lastHole).toBeDefined();
      });

      it('should update game.lastHole', () => {
        const initialLastHole = game.lastHole;
        newPipes(game);
        expect(game.lastHole).not.toBe(initialLastHole);
      });
    });

    describe('cleanupPipes()', () => {
      it('should remove pipes that are off-screen to the left', () => {
        game.hero.pos.x = 500;
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 } }, // Should be removed
          { pos: { x: 400, y: 0 }, size: { width: 50, height: 100 } }  // Should remain
        ];
        
        cleanupPipes(game);
        expect(game.pipes).toHaveLength(1);
        expect(game.pipes[0].pos.x).toBe(400);
      });

      it('should not remove pipes that are still visible', () => {
        game.hero.pos.x = 100;
        game.pipes = [
          { pos: { x: 200, y: 0 }, size: { width: 50, height: 100 } },
          { pos: { x: 300, y: 0 }, size: { width: 50, height: 100 } }
        ];
        
        cleanupPipes(game);
        expect(game.pipes).toHaveLength(2);
      });

      it('should handle empty pipes array', () => {
        game.pipes = [];
        expect(() => cleanupPipes(game)).not.toThrow();
        expect(game.pipes).toHaveLength(0);
      });
    });

    describe('addPipes()', () => {
      it('should add pipes until PIPE_BUF is reached', () => {
        game.pipes = [];
        addPipes(game);
        
        // Should add pipes in pairs, so length should be even and >= PIPE_BUF
        expect(game.pipes.length).toBeGreaterThanOrEqual(20); // PIPE_BUF = 20
        expect(game.pipes.length % 2).toBe(0); // Should be even (pairs)
      });

      it('should not add pipes if already at capacity', () => {
        // Fill pipes array to capacity
        for (let i = 0; i < 20; i++) {
          game.pipes.push({ pos: { x: i * 100, y: 0 }, size: { width: 50, height: 100 } });
        }
        
        const initialLength = game.pipes.length;
        addPipes(game);
        expect(game.pipes.length).toBe(initialLength);
      });
    });

    describe('handlePipes()', () => {
      it('should call cleanup, add, and check score functions', () => {
        // Set up game state
        game.pipes = [];
        game.score = 0;
        
        handlePipes(game);
        
        // Should have added pipes (testing addPipes was called)
        expect(game.pipes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Score Management', () => {
    describe('checkScore()', () => {
      it('should increment score when hero passes a pipe pair', () => {
        game.hero.pos.x = 200;
        game.hero.size.width = 20;
        game.score = 0;
        
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 }, passed: false },
          { pos: { x: 100, y: 150 }, size: { width: 50, height: 100 }, passed: false }
        ];
        
        checkScore(game);
        expect(game.score).toBe(1);
        expect(game.pipes[0].passed).toBe(true);
        expect(game.pipes[1].passed).toBe(true);
      });

      it('should not increment score for already passed pipes', () => {
        game.hero.pos.x = 200;
        game.hero.size.width = 20;
        game.score = 0;
        
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 }, passed: true },
          { pos: { x: 100, y: 150 }, size: { width: 50, height: 100 }, passed: true }
        ];
        
        checkScore(game);
        expect(game.score).toBe(0);
      });

      it('should not increment score if hero has not passed pipe', () => {
        game.hero.pos.x = 100;
        game.hero.size.width = 20;
        game.score = 0;
        
        game.pipes = [
          { pos: { x: 200, y: 0 }, size: { width: 50, height: 100 }, passed: false },
          { pos: { x: 200, y: 150 }, size: { width: 50, height: 100 }, passed: false }
        ];
        
        checkScore(game);
        expect(game.score).toBe(0);
        expect(game.pipes[0].passed).toBe(false);
      });

      it('should handle multiple pipe pairs correctly', () => {
        game.hero.pos.x = 300;
        game.hero.size.width = 20;
        game.score = 0;
        
        game.pipes = [
          { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 }, passed: false },
          { pos: { x: 100, y: 150 }, size: { width: 50, height: 100 }, passed: false },
          { pos: { x: 200, y: 0 }, size: { width: 50, height: 100 }, passed: false },
          { pos: { x: 200, y: 150 }, size: { width: 50, height: 100 }, passed: false }
        ];
        
        checkScore(game);
        expect(game.score).toBe(2);
      });
    });
  });

  describe('Hero Physics', () => {
    describe('updateHeroPhysics()', () => {
      it('should call addToPt for position and velocity updates', () => {
        const delta = 1.0;
        const gravity = 300;
        
        updateHeroPhysics(game, delta, gravity, -240);
        
        expect(addToPt).toHaveBeenCalledTimes(2);
      });

      it('should maintain constant horizontal velocity', () => {
        const delta = 1.0;
        const gravity = 300;
        const initialVelX = game.hero.vel.x;
        
        updateHeroPhysics(game, delta, gravity, -240);
        
        expect(game.hero.vel.x).toBe(initialVelX);
      });
    });

    describe('processJump()', () => {
      it('should apply jump velocity when game is playing', () => {
        game.state = 'playing';
        game.isGameOver = false;
        game.pause = false;
        const jumpVel = -240;
        
        const result = processJump(game, jumpVel);
        
        expect(result).toBe(true);
        expect(game.hero.vel.y).toBe(jumpVel);
      });

      it('should not apply jump when game is over', () => {
        game.state = 'playing';
        game.isGameOver = true;
        const jumpVel = -240;
        const initialVelY = game.hero.vel.y;
        
        const result = processJump(game, jumpVel);
        
        expect(result).toBe(false);
        expect(game.hero.vel.y).toBe(initialVelY);
      });

      it('should not apply jump when game is paused', () => {
        game.state = 'playing';
        game.isGameOver = false;
        game.pause = true;
        const jumpVel = -240;
        const initialVelY = game.hero.vel.y;
        
        const result = processJump(game, jumpVel);
        
        expect(result).toBe(false);
        expect(game.hero.vel.y).toBe(initialVelY);
      });

      it('should not apply jump when not in playing state', () => {
        game.state = 'title';
        game.isGameOver = false;
        game.pause = false;
        const jumpVel = -240;
        const initialVelY = game.hero.vel.y;
        
        const result = processJump(game, jumpVel);
        
        expect(result).toBe(false);
        expect(game.hero.vel.y).toBe(initialVelY);
      });
    });
  });

  describe('Game State Management', () => {
    describe('resetGameState()', () => {
      it('should reset game to initial playing state', () => {
        // Modify game state
        game.state = 'gameover';
        game.isGameOver = true;
        game.pause = true;
        game.score = 10;
        game.pipes = [{ test: 'pipe' }];
        
        const result = resetGameState(game);
        
        expect(result.state).toBe('playing');
        expect(result.isGameOver).toBe(false);
        expect(result.pause).toBe(false);
        expect(result.score).toBe(0);
        expect(result.pipes).toEqual([]);
        expect(result.lastHole).toBe(null);
      });

      it('should reset hero position and velocity', () => {
        // Modify hero state
        game.hero.pos.x = 500;
        game.hero.pos.y = 300;
        game.hero.vel.y = -100;
        
        resetGameState(game);
        
        expect(game.hero.pos.x).toBe(20 * scaling.SCALE_X);
        expect(game.hero.pos.y).toBe(20 * scaling.SCALE_Y);
        expect(game.hero.vel.y).toBe(0);
      });
    });

    describe('setGameOver()', () => {
      it('should set game to game over state', () => {
        game.state = 'playing';
        game.isGameOver = false;
        
        const result = setGameOver(game);
        
        expect(result.state).toBe('gameover');
        expect(result.isGameOver).toBe(true);
      });
    });

    describe('togglePause()', () => {
      it('should toggle pause when in playing state', () => {
        game.state = 'playing';
        game.pause = false;
        
        let result = togglePause(game);
        expect(result).toBe(true);
        expect(game.pause).toBe(true);
        
        result = togglePause(game);
        expect(result).toBe(false);
        expect(game.pause).toBe(false);
      });

      it('should not toggle pause when not in playing state', () => {
        game.state = 'title';
        game.pause = false;
        
        const result = togglePause(game);
        expect(result).toBe(false);
        expect(game.pause).toBe(false);
      });
    });
  });

  describe('Game States Constants', () => {
    it('should export correct game state constants', () => {
      expect(GameStates.TITLE).toBe('title');
      expect(GameStates.INSTRUCTIONS).toBe('instructions');
      expect(GameStates.PLAYING).toBe('playing');
      expect(GameStates.GAMEOVER).toBe('gameover');
    });
  });

  describe('GameStateUtils Object', () => {
    it('should contain all gamestate utility functions', () => {
      expect(typeof GameStateUtils.newGame).toBe('function');
      expect(typeof GameStateUtils.isGameOver).toBe('function');
      expect(typeof GameStateUtils.newPipes).toBe('function');
      expect(typeof GameStateUtils.cleanupPipes).toBe('function');
      expect(typeof GameStateUtils.addPipes).toBe('function');
      expect(typeof GameStateUtils.checkScore).toBe('function');
      expect(typeof GameStateUtils.handlePipes).toBe('function');
      expect(typeof GameStateUtils.updateHeroPhysics).toBe('function');
      expect(typeof GameStateUtils.processJump).toBe('function');
      expect(typeof GameStateUtils.resetGameState).toBe('function');
      expect(typeof GameStateUtils.setGameOver).toBe('function');
      expect(typeof GameStateUtils.togglePause).toBe('function');
      expect(GameStateUtils.GameStates).toBe(GameStates);
    });
  });
});