import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  showGameOver,
  showTitleScreen,
  showInstructions,
  startGame,
} from "./screens.js";

// Mock all external dependencies
vi.mock("./config.js", () => ({
  scaling: {
    SCALE_X: 2,
    SCALE_Y: 3,
  },
  HERO_SPEED: 80,
}));

vi.mock("./score.js", () => ({
  isNewHighScore: vi.fn(),
  promptForInitials: vi.fn(),
  saveHighScore: vi.fn(),
  updateGameOverScoresList: vi.fn(),
  updateHighScoreDisplay: vi.fn(),
}));

vi.mock("./sound.js", () => ({
  initAudio: vi.fn(),
}));

vi.mock("./draw.js", () => ({
  getScaledHeroSize: vi.fn(() => ({ width: 20, height: 20 })),
}));

vi.mock("./worldgen.js", () => ({
  generateClouds: vi.fn(() => [
    { x: 100, y: 50, size: 30, speed: 0.2, opacity: 0.5 },
  ]),
  generateForegroundClouds: vi.fn(() => [
    { x: 200, y: 150, size: 40, speed: 0.3, opacity: 0.7 },
  ]),
  generateSkyline: vi.fn(() => [
    { x: 0, y: 180, width: 50, height: 20 },
  ]),
}));

// Import mocked dependencies
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

describe("Screens Module", () => {
  let mockGame;
  let mockElements;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset all mock implementations to their defaults
    initAudio.mockImplementation(() => {});
    generateClouds.mockImplementation(() => [
      { x: 100, y: 50, size: 30, speed: 0.2, opacity: 0.5 },
    ]);
    generateForegroundClouds.mockImplementation(() => [
      { x: 200, y: 150, size: 40, speed: 0.3, opacity: 0.7 },
    ]);
    generateSkyline.mockImplementation(() => [
      { x: 0, y: 180, width: 50, height: 20 },
    ]);

    // Create mock game object
    mockGame = {
      state: "playing",
      isGameOver: false,
      pause: false,
      score: 0,
      pipes: [],
      clouds: [],
      foregroundClouds: [],
      skyline: [],
      hero: {
        pos: { x: 40, y: 60 },
        size: { width: 10, height: 10 },
        vel: { x: 160, y: 0 },
      },
      lastHole: null,
    };

    // Mock DOM elements
    mockElements = {
      newHighScoreMessage: {
        style: { display: "none" },
      },
      titleScreen: {
        style: { display: "none" },
      },
      instructionsScreen: {
        style: { display: "none" },
      },
      gameOverScreen: {
        style: { display: "none" },
      },
    };

    // Mock document.getElementById
    vi.stubGlobal("document", {
      getElementById: vi.fn((id) => mockElements[id]),
    });

    // Set up default mock return values
    isNewHighScore.mockReturnValue(false);
    getScaledHeroSize.mockReturnValue({ width: 20, height: 20 });
    generateClouds.mockReturnValue([
      { x: 100, y: 50, size: 30, speed: 0.2, opacity: 0.5 },
    ]);
    generateForegroundClouds.mockReturnValue([
      { x: 200, y: 150, size: 40, speed: 0.3, opacity: 0.7 },
    ]);
    generateSkyline.mockReturnValue([
      { x: 0, y: 180, width: 50, height: 20 },
    ]);
  });

  describe("showGameOver()", () => {
    it("should set game state to gameover", () => {
      showGameOver(mockGame);
      expect(mockGame.state).toBe("gameover");
    });

    it("should check for new high score", () => {
      mockGame.score = 100;
      showGameOver(mockGame);
      expect(isNewHighScore).toHaveBeenCalledWith(100);
    });

    it("should show new high score message when score is a new high score", () => {
      isNewHighScore.mockReturnValue(true);
      mockGame.score = 100;

      showGameOver(mockGame);

      expect(mockElements.newHighScoreMessage.style.display).toBe("block");
      expect(promptForInitials).toHaveBeenCalled();
    });

    it("should hide new high score message when score is not a new high score", () => {
      isNewHighScore.mockReturnValue(false);
      mockGame.score = 5;

      showGameOver(mockGame);

      expect(mockElements.newHighScoreMessage.style.display).toBe("none");
      expect(promptForInitials).not.toHaveBeenCalled();
    });

    it("should update high score display regardless of new high score", () => {
      showGameOver(mockGame);
      expect(updateHighScoreDisplay).toHaveBeenCalled();
    });

    it("should update game over scores list with player initials when new high score", () => {
      isNewHighScore.mockReturnValue(true);
      mockGame.score = 100;
      const mockInitials = "ABC";

      // Mock promptForInitials to call its callback with initials
      promptForInitials.mockImplementation((callback) => {
        callback(mockInitials);
      });

      showGameOver(mockGame);

      expect(saveHighScore).toHaveBeenCalledWith(100, mockInitials);
      expect(updateGameOverScoresList).toHaveBeenCalledWith(100, mockInitials);
    });

    it("should update game over scores list with empty initials when not new high score", () => {
      isNewHighScore.mockReturnValue(false);
      mockGame.score = 5;

      showGameOver(mockGame);

      expect(updateGameOverScoresList).toHaveBeenCalledWith(5, "");
    });

    it("should show game over screen and hide other screens", () => {
      showGameOver(mockGame);

      expect(mockElements.titleScreen.style.display).toBe("none");
      expect(mockElements.instructionsScreen.style.display).toBe("none");
      expect(mockElements.gameOverScreen.style.display).toBe("flex");
    });

    it("should handle zero score", () => {
      mockGame.score = 0;
      isNewHighScore.mockReturnValue(false);

      showGameOver(mockGame);

      expect(mockGame.state).toBe("gameover");
      expect(isNewHighScore).toHaveBeenCalledWith(0);
      expect(updateGameOverScoresList).toHaveBeenCalledWith(0, "");
    });

    it("should handle negative score edge case", () => {
      mockGame.score = -1;
      isNewHighScore.mockReturnValue(false);

      showGameOver(mockGame);

      expect(mockGame.state).toBe("gameover");
      expect(isNewHighScore).toHaveBeenCalledWith(-1);
      expect(updateGameOverScoresList).toHaveBeenCalledWith(-1, "");
    });
  });

  describe("showTitleScreen()", () => {
    it("should set game state to title", () => {
      mockGame.state = "playing";
      showTitleScreen(mockGame);
      expect(mockGame.state).toBe("title");
    });

    it("should update high score display", () => {
      showTitleScreen(mockGame);
      expect(updateHighScoreDisplay).toHaveBeenCalled();
    });

    it("should show title screen and hide other screens", () => {
      showTitleScreen(mockGame);

      expect(mockElements.titleScreen.style.display).toBe("flex");
      expect(mockElements.instructionsScreen.style.display).toBe("none");
      expect(mockElements.gameOverScreen.style.display).toBe("none");
    });

    it("should work when transitioning from any state", () => {
      const states = ["playing", "gameover", "instructions", "paused"];
      
      states.forEach((state) => {
        mockGame.state = state;
        showTitleScreen(mockGame);
        expect(mockGame.state).toBe("title");
      });
    });
  });

  describe("showInstructions()", () => {
    it("should set game state to instructions", () => {
      mockGame.state = "title";
      showInstructions(mockGame);
      expect(mockGame.state).toBe("instructions");
    });

    it("should show instructions screen and hide other screens", () => {
      showInstructions(mockGame);

      expect(mockElements.titleScreen.style.display).toBe("none");
      expect(mockElements.instructionsScreen.style.display).toBe("flex");
      expect(mockElements.gameOverScreen.style.display).toBe("none");
    });

    it("should work when transitioning from any state", () => {
      const states = ["title", "playing", "gameover", "paused"];
      
      states.forEach((state) => {
        mockGame.state = state;
        showInstructions(mockGame);
        expect(mockGame.state).toBe("instructions");
      });
    });
  });

  describe("startGame()", () => {
    it("should set game state to playing", () => {
      mockGame.state = "title";
      startGame(mockGame);
      expect(mockGame.state).toBe("playing");
    });

    it("should reset game flags", () => {
      mockGame.isGameOver = true;
      mockGame.pause = true;

      startGame(mockGame);

      expect(mockGame.isGameOver).toBe(false);
      expect(mockGame.pause).toBe(false);
    });

    it("should reset score to zero", () => {
      mockGame.score = 100;
      startGame(mockGame);
      expect(mockGame.score).toBe(0);
    });

    it("should clear pipes array", () => {
      mockGame.pipes = [
        { pos: { x: 100, y: 0 }, size: { width: 50, height: 100 } },
        { pos: { x: 200, y: 0 }, size: { width: 50, height: 100 } },
      ];

      startGame(mockGame);
      expect(mockGame.pipes).toEqual([]);
    });

    it("should regenerate world elements", () => {
      startGame(mockGame);

      expect(generateClouds).toHaveBeenCalled();
      expect(generateForegroundClouds).toHaveBeenCalled();
      expect(generateSkyline).toHaveBeenCalled();
      
      expect(mockGame.clouds).toEqual([
        { x: 100, y: 50, size: 30, speed: 0.2, opacity: 0.5 },
      ]);
      expect(mockGame.foregroundClouds).toEqual([
        { x: 200, y: 150, size: 40, speed: 0.3, opacity: 0.7 },
      ]);
      expect(mockGame.skyline).toEqual([
        { x: 0, y: 180, width: 50, height: 20 },
      ]);
    });

    it("should reset hero position to initial coordinates", () => {
      mockGame.hero.pos = { x: 500, y: 300 };

      startGame(mockGame);

      expect(mockGame.hero.pos).toEqual({
        x: 20 * 2, // 20 * scaling.SCALE_X
        y: 20 * 3, // 20 * scaling.SCALE_Y
      });
    });

    it("should update hero size", () => {
      startGame(mockGame);

      expect(getScaledHeroSize).toHaveBeenCalled();
      expect(mockGame.hero.size).toEqual({ width: 20, height: 20 });
    });

    it("should reset hero velocity", () => {
      mockGame.hero.vel = { x: 0, y: -200 };

      startGame(mockGame);

      expect(mockGame.hero.vel).toEqual({
        x: 80 * 2, // HERO_SPEED * scaling.SCALE_X
        y: 0,
      });
    });

    it("should reset lastHole to null", () => {
      mockGame.lastHole = 100;
      startGame(mockGame);
      expect(mockGame.lastHole).toBe(null);
    });

    it("should hide all overlay screens", () => {
      startGame(mockGame);

      expect(mockElements.titleScreen.style.display).toBe("none");
      expect(mockElements.instructionsScreen.style.display).toBe("none");
      expect(mockElements.gameOverScreen.style.display).toBe("none");
    });

    it("should initialize audio", () => {
      startGame(mockGame);
      expect(initAudio).toHaveBeenCalled();
    });

    it("should handle missing hero object gracefully", () => {
      delete mockGame.hero;
      
      expect(() => startGame(mockGame)).toThrow();
    });

    it("should work when starting from any screen state", () => {
      const states = ["title", "instructions", "gameover"];
      
      states.forEach((state) => {
        mockGame.state = state;
        mockGame.score = 50;
        mockGame.isGameOver = true;
        mockGame.pause = true;
        
        startGame(mockGame);
        
        expect(mockGame.state).toBe("playing");
        expect(mockGame.score).toBe(0);
        expect(mockGame.isGameOver).toBe(false);
        expect(mockGame.pause).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw when DOM elements are missing in showGameOver", () => {
      document.getElementById.mockReturnValue(null);

      expect(() => showGameOver(mockGame)).toThrow();
    });

    it("should throw when DOM elements are missing in showTitleScreen", () => {
      document.getElementById.mockReturnValue(null);

      expect(() => showTitleScreen(mockGame)).toThrow();
    });

    it("should throw when DOM elements are missing in showInstructions", () => {
      document.getElementById.mockReturnValue(null);

      expect(() => showInstructions(mockGame)).toThrow();
    });

    it("should throw when DOM elements are missing in startGame", () => {
      document.getElementById.mockReturnValue(null);

      expect(() => startGame(mockGame)).toThrow();
    });

    it("should handle score function errors in showGameOver", () => {
      isNewHighScore.mockImplementation(() => {
        throw new Error("Score error");
      });

      expect(() => showGameOver(mockGame)).toThrow("Score error");
    });

    it("should handle world generation errors in startGame", () => {
      generateClouds.mockImplementationOnce(() => {
        throw new Error("World generation error");
      });

      expect(() => startGame(mockGame)).toThrow("World generation error");
    });

    it("should handle audio init errors in startGame", () => {
      initAudio.mockImplementationOnce(() => {
        throw new Error("Audio error");
      });

      expect(() => startGame(mockGame)).toThrow("Audio error");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete game flow: start -> game over -> restart", () => {
      // Start game
      startGame(mockGame);
      expect(mockGame.state).toBe("playing");
      expect(mockGame.score).toBe(0);

      // Simulate game over with high score
      mockGame.score = 100;
      isNewHighScore.mockReturnValue(true);
      promptForInitials.mockImplementation((callback) => {
        callback("WIN");
      });

      showGameOver(mockGame);
      expect(mockGame.state).toBe("gameover");
      expect(saveHighScore).toHaveBeenCalledWith(100, "WIN");

      // Restart game
      startGame(mockGame);
      expect(mockGame.state).toBe("playing");
      expect(mockGame.score).toBe(0);
    });

    it("should handle navigation through all screens", () => {
      // Start at title
      showTitleScreen(mockGame);
      expect(mockGame.state).toBe("title");

      // Go to instructions
      showInstructions(mockGame);
      expect(mockGame.state).toBe("instructions");

      // Start game
      startGame(mockGame);
      expect(mockGame.state).toBe("playing");

      // Game over
      showGameOver(mockGame);
      expect(mockGame.state).toBe("gameover");

      // Back to title
      showTitleScreen(mockGame);
      expect(mockGame.state).toBe("title");
    });
  });

  describe("Mock Verification", () => {
    it("should call all required external functions in startGame", () => {
      startGame(mockGame);

      expect(generateClouds).toHaveBeenCalledTimes(1);
      expect(generateForegroundClouds).toHaveBeenCalledTimes(1);
      expect(generateSkyline).toHaveBeenCalledTimes(1);
      expect(getScaledHeroSize).toHaveBeenCalledTimes(1);
      expect(initAudio).toHaveBeenCalledTimes(1);
    });

    it("should call required score functions in showGameOver", () => {
      mockGame.score = 50;
      isNewHighScore.mockReturnValue(false);

      showGameOver(mockGame);

      expect(isNewHighScore).toHaveBeenCalledWith(50);
      expect(updateHighScoreDisplay).toHaveBeenCalledTimes(1);
      expect(updateGameOverScoresList).toHaveBeenCalledWith(50, "");
    });

    it("should call updateHighScoreDisplay in showTitleScreen", () => {
      showTitleScreen(mockGame);
      expect(updateHighScoreDisplay).toHaveBeenCalledTimes(1);
    });
  });
});