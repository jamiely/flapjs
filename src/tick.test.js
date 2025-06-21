import { describe, it, expect, beforeEach, vi } from "vitest";
import { tick } from "./tick.js";

// Mock all external dependencies
vi.mock("./config.js", () => ({
  GRAVITY: 300,
  JUMP_VEL: -240,
  HERO_SPEED: 80,
  scaling: {
    SCALE_X: 1,
    SCALE_Y: 1,
  },
}));

vi.mock("./physics.js", () => ({
  addToPt: vi.fn(),
}));

vi.mock("./gamestate.js", () => ({
  isGameOver: vi.fn(),
  handlePipes: vi.fn(),
}));

vi.mock("./worldgen.js", () => ({
  updateClouds: vi.fn(),
  updateForegroundClouds: vi.fn(),
  updateSkyline: vi.fn(),
}));

vi.mock("./sound.js", () => ({
  playBounceSound: vi.fn(),
  playGameOverSound: vi.fn(),
}));

vi.mock("./screens.js", () => ({
  showGameOver: vi.fn(),
}));

// Import mocked functions
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

describe("Tick Module", () => {
  let game;
  let delta;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Set up a standard game object
    game = {
      state: "playing",
      pause: false,
      isGameOver: false,
      jumpRequested: false,
      hero: {
        pos: { x: 20, y: 20 },
        vel: { x: 80, y: 0 },
        size: { width: 20, height: 20 },
      },
      pipes: [],
      score: 0,
      clouds: [],
      foregroundClouds: [],
      skyline: [],
    };

    delta = 0.016; // ~60fps
  });

  describe("World Updates", () => {
    it("should always update world elements regardless of game state", () => {
      game.state = "title";
      
      tick(game, delta);

      expect(updateClouds).toHaveBeenCalledWith(game, delta);
      expect(updateForegroundClouds).toHaveBeenCalledWith(game, delta);
      expect(updateSkyline).toHaveBeenCalledWith(game, delta);
    });

    it("should update world elements when game is paused", () => {
      game.pause = true;
      
      tick(game, delta);

      expect(updateClouds).toHaveBeenCalledWith(game, delta);
      expect(updateForegroundClouds).toHaveBeenCalledWith(game, delta);
      expect(updateSkyline).toHaveBeenCalledWith(game, delta);
    });

    it("should update world elements when game is over", () => {
      game.isGameOver = true;
      
      tick(game, delta);

      expect(updateClouds).toHaveBeenCalledWith(game, delta);
      expect(updateForegroundClouds).toHaveBeenCalledWith(game, delta);
      expect(updateSkyline).toHaveBeenCalledWith(game, delta);
    });
  });

  describe("Game State Early Returns", () => {
    it("should return early when game state is not playing", () => {
      game.state = "title";
      
      tick(game, delta);

      // Should not call game logic functions
      expect(isGameOver).not.toHaveBeenCalled();
      expect(handlePipes).not.toHaveBeenCalled();
      expect(addToPt).not.toHaveBeenCalled();
    });

    it("should return early when game is paused", () => {
      game.pause = true;
      
      tick(game, delta);

      expect(isGameOver).not.toHaveBeenCalled();
      expect(handlePipes).not.toHaveBeenCalled();
      expect(addToPt).not.toHaveBeenCalled();
    });

    it("should return early when game is already over", () => {
      game.isGameOver = true;
      
      tick(game, delta);

      expect(isGameOver).not.toHaveBeenCalled();
      expect(handlePipes).not.toHaveBeenCalled();
      expect(addToPt).not.toHaveBeenCalled();
    });
  });

  describe("Game Over Detection", () => {
    it("should detect game over and trigger game over sequence", () => {
      isGameOver.mockReturnValue(true);
      
      tick(game, delta);

      expect(isGameOver).toHaveBeenCalledWith(game);
      expect(game.isGameOver).toBe(true);
      expect(playGameOverSound).toHaveBeenCalled();
      expect(showGameOver).toHaveBeenCalledWith(game);
    });

    it("should not continue game logic after game over is detected", () => {
      isGameOver.mockReturnValue(true);
      
      tick(game, delta);

      expect(addToPt).not.toHaveBeenCalled();
      expect(handlePipes).not.toHaveBeenCalled();
    });

    it("should continue game logic when game is not over", () => {
      isGameOver.mockReturnValue(false);
      
      tick(game, delta);

      expect(addToPt).toHaveBeenCalled();
      expect(handlePipes).toHaveBeenCalled();
    });
  });

  describe("Jump Mechanics", () => {
    it("should process jump when requested and game is active", () => {
      game.jumpRequested = true;
      isGameOver.mockReturnValue(false);
      
      tick(game, delta);

      expect(game.hero.vel.y).toBe(JUMP_VEL);
      expect(playBounceSound).toHaveBeenCalled();
      expect(game.jumpRequested).toBe(false);
    });

    it("should not process jump when game is over", () => {
      game.jumpRequested = true;
      game.isGameOver = true;
      const initialVelY = game.hero.vel.y;
      
      tick(game, delta);

      expect(game.hero.vel.y).toBe(initialVelY);
      expect(playBounceSound).not.toHaveBeenCalled();
      expect(game.jumpRequested).toBe(true); // Should remain true
    });

    it("should not process jump when no jump is requested", () => {
      game.jumpRequested = false;
      isGameOver.mockReturnValue(false);
      const initialVelY = game.hero.vel.y;
      
      tick(game, delta);

      expect(game.hero.vel.y).toBe(initialVelY);
      expect(playBounceSound).not.toHaveBeenCalled();
    });

    it("should only process jump once per request", () => {
      game.jumpRequested = true;
      isGameOver.mockReturnValue(false);
      
      tick(game, delta);
      
      expect(game.jumpRequested).toBe(false);
      expect(playBounceSound).toHaveBeenCalledTimes(1);
      
      // Second tick should not process jump again
      tick(game, delta);
      expect(playBounceSound).toHaveBeenCalledTimes(1);
    });
  });

  describe("Physics Updates", () => {
    beforeEach(() => {
      isGameOver.mockReturnValue(false);
      game.hero.vel.x = 50;
      game.hero.vel.y = -100;
    });

    it("should calculate and apply gravity acceleration", () => {
      tick(game, delta);

      const expectedAcceleration = {
        x: 0,
        y: GRAVITY * delta,
      };

      expect(addToPt).toHaveBeenCalledWith(game.hero.vel, expectedAcceleration);
    });

    it("should calculate and apply position delta with physics formula", () => {
      const initialVelX = game.hero.vel.x;
      const initialVelY = game.hero.vel.y;
      
      tick(game, delta);

      const expectedPositionDelta = {
        x: initialVelX * delta,
        y: initialVelY * delta + 0.5 * GRAVITY * delta * delta,
      };

      expect(addToPt).toHaveBeenCalledWith(game.hero.pos, expectedPositionDelta);
    });

    it("should maintain constant horizontal velocity", () => {
      const initialVelX = game.hero.vel.x;
      
      tick(game, delta);

      expect(game.hero.vel.x).toBe(HERO_SPEED * scaling.SCALE_X);
      expect(game.hero.vel.x).not.toBe(initialVelX); // Should be overridden
    });

    it("should call addToPt twice for position and velocity updates", () => {
      tick(game, delta);

      expect(addToPt).toHaveBeenCalledTimes(2);
    });

    it("should handle pipes after physics update", () => {
      tick(game, delta);

      expect(handlePipes).toHaveBeenCalledWith(game);
    });
  });

  describe("Delta Time Variations", () => {
    beforeEach(() => {
      isGameOver.mockReturnValue(false);
    });

    it("should handle small delta times", () => {
      const smallDelta = 0.001;
      
      tick(game, smallDelta);

      expect(addToPt).toHaveBeenCalledTimes(2);
      // Verify the physics calculations are still called with the small delta
      const positionCall = addToPt.mock.calls[0];
      const velocityCall = addToPt.mock.calls[1];
      
      expect(positionCall[1].y).toBe(game.hero.vel.y * smallDelta + 0.5 * GRAVITY * smallDelta * smallDelta);
      expect(velocityCall[1].y).toBe(GRAVITY * smallDelta);
    });

    it("should handle large delta times", () => {
      const largeDelta = 0.1;
      
      tick(game, largeDelta);

      expect(addToPt).toHaveBeenCalledTimes(2);
      // Verify the physics calculations scale with larger delta
      const positionCall = addToPt.mock.calls[0];
      const velocityCall = addToPt.mock.calls[1];
      
      expect(velocityCall[1].y).toBe(GRAVITY * largeDelta);
      expect(positionCall[1].y).toBe(game.hero.vel.y * largeDelta + 0.5 * GRAVITY * largeDelta * largeDelta);
    });

    it("should handle zero delta time", () => {
      const zeroDelta = 0;
      
      tick(game, zeroDelta);

      expect(addToPt).toHaveBeenCalledTimes(2);
      const positionCall = addToPt.mock.calls[0];
      const velocityCall = addToPt.mock.calls[1];
      
      expect(positionCall[1].x).toBe(0);
      expect(positionCall[1].y).toBe(0);
      expect(velocityCall[1].x).toBe(0);
      expect(velocityCall[1].y).toBe(0);
    });
  });

  describe("Complex Game State Scenarios", () => {
    it("should handle game over detection preventing jump processing", () => {
      game.jumpRequested = true;
      isGameOver.mockReturnValue(true);
      const initialVelY = game.hero.vel.y;
      
      tick(game, delta);

      // Game over should be detected first, preventing jump processing
      expect(game.isGameOver).toBe(true);
      expect(playGameOverSound).toHaveBeenCalled();
      expect(showGameOver).toHaveBeenCalledWith(game);
      
      // Jump should not be processed
      expect(game.hero.vel.y).toBe(initialVelY);
      expect(playBounceSound).not.toHaveBeenCalled();
      expect(game.jumpRequested).toBe(true); // Should remain true
    });

    it("should handle multiple state transitions", () => {
      // First tick: normal gameplay
      isGameOver.mockReturnValue(false);
      tick(game, delta);
      expect(addToPt).toHaveBeenCalledTimes(2);
      
      // Second tick: game over
      vi.clearAllMocks();
      isGameOver.mockReturnValue(true);
      tick(game, delta);
      expect(game.isGameOver).toBe(true);
      expect(addToPt).not.toHaveBeenCalled();
      
      // Third tick: already game over
      vi.clearAllMocks();
      tick(game, delta);
      expect(isGameOver).not.toHaveBeenCalled();
    });

    it("should handle game state changes during tick", () => {
      // Start with different state
      game.state = "instructions";
      tick(game, delta);
      
      // Only world updates should happen
      expect(updateClouds).toHaveBeenCalled();
      expect(updateForegroundClouds).toHaveBeenCalled();
      expect(updateSkyline).toHaveBeenCalled();
      expect(isGameOver).not.toHaveBeenCalled();
    });
  });

  describe("Scaling Integration", () => {
    it("should apply scaling to horizontal velocity", () => {
      const customScaling = { SCALE_X: 2, SCALE_Y: 1 };
      // Update the mock to return custom scaling
      vi.mocked(scaling).SCALE_X = 2;
      
      isGameOver.mockReturnValue(false);
      tick(game, delta);

      expect(game.hero.vel.x).toBe(HERO_SPEED * 2);
    });

    it("should work with different scaling ratios", () => {
      vi.mocked(scaling).SCALE_X = 0.5;
      
      isGameOver.mockReturnValue(false);
      tick(game, delta);

      expect(game.hero.vel.x).toBe(HERO_SPEED * 0.5);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing game properties gracefully", () => {
      const incompleteGame = {
        state: "playing",
        pause: false,
        isGameOver: false,
        hero: {
          pos: { x: 20, y: 20 },
          vel: { x: 80, y: 0 },
        },
      };
      
      isGameOver.mockReturnValue(false);
      
      expect(() => tick(incompleteGame, delta)).not.toThrow();
    });

    it("should handle negative delta values", () => {
      isGameOver.mockReturnValue(false);
      
      expect(() => tick(game, -0.016)).not.toThrow();
      expect(addToPt).toHaveBeenCalledTimes(2);
    });

    it("should handle NaN delta values", () => {
      isGameOver.mockReturnValue(false);
      
      expect(() => tick(game, NaN)).not.toThrow();
      expect(addToPt).toHaveBeenCalledTimes(2);
    });
  });

  describe("Integration with Dependencies", () => {
    it("should call all required functions when game is playing", () => {
      isGameOver.mockReturnValue(false);
      
      tick(game, delta);

      // All world update functions should be called
      expect(updateClouds).toHaveBeenCalledWith(game, delta);
      expect(updateForegroundClouds).toHaveBeenCalledWith(game, delta);
      expect(updateSkyline).toHaveBeenCalledWith(game, delta);
      
      // Game logic functions should be called
      expect(isGameOver).toHaveBeenCalledWith(game);
      expect(handlePipes).toHaveBeenCalledWith(game);
    });

    it("should pass correct parameters to dependencies", () => {
      isGameOver.mockReturnValue(false);
      
      tick(game, delta);

      expect(updateClouds).toHaveBeenCalledWith(game, delta);
      expect(updateForegroundClouds).toHaveBeenCalledWith(game, delta);
      expect(updateSkyline).toHaveBeenCalledWith(game, delta);
      expect(isGameOver).toHaveBeenCalledWith(game);
      expect(handlePipes).toHaveBeenCalledWith(game);
    });
  });
});