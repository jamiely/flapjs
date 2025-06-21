import { describe, it, expect, beforeEach, vi } from "vitest";
import { setupEventHandlers } from "./eventHandlers.js";

// Mock the screens module to avoid DOM dependency issues
vi.mock("./screens.js", () => ({
  showTitleScreen: vi.fn(),
}));

import { showTitleScreen } from "./screens.js";

describe("Event Handlers Module", () => {
  let game, mockEvent;

  beforeEach(() => {
    vi.clearAllMocks();

    game = {
      state: "playing",
      pause: false,
      isGameOver: false,
      jumpRequested: false,
    };

    mockEvent = {
      keyCode: 32,
      preventDefault: vi.fn(),
    };

    // Clear any existing event listeners
    document.removeEventListener = vi.fn();
    document.addEventListener = vi.fn();
  });

  describe("setupEventHandlers", () => {
    it("should add event listeners for keydown, touchstart, and mousedown", () => {
      setupEventHandlers(game);

      expect(document.addEventListener).toHaveBeenCalledTimes(3);
      expect(document.addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith("touchstart", expect.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
    });
  });

  describe("keydown events", () => {
    let keydownHandler;

    beforeEach(() => {
      setupEventHandlers(game);
      // Get the keydown handler function
      keydownHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "keydown"
      )[1];
    });

    it("should toggle pause on P key when playing", () => {
      game.state = "playing";
      game.pause = false;
      mockEvent.keyCode = 80; // P key

      keydownHandler(mockEvent);

      expect(game.pause).toBe(true);

      keydownHandler(mockEvent);

      expect(game.pause).toBe(false);
    });

    it("should request jump on space key when playing and not game over", () => {
      game.state = "playing";
      game.isGameOver = false;
      game.jumpRequested = false;
      mockEvent.keyCode = 32; // Space key

      keydownHandler(mockEvent);

      expect(game.jumpRequested).toBe(true);
    });

    it("should not request jump on space key when game is over", () => {
      game.state = "playing";
      game.isGameOver = true;
      game.jumpRequested = false;
      mockEvent.keyCode = 32; // Space key

      keydownHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });

    it("should not request jump on space key when not playing", () => {
      game.state = "title";
      game.isGameOver = false;
      game.jumpRequested = false;
      mockEvent.keyCode = 32; // Space key

      keydownHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });

    it("should show title screen on ESC key when in instructions", () => {
      game.state = "instructions";
      mockEvent.keyCode = 27; // ESC key

      keydownHandler(mockEvent);

      expect(showTitleScreen).toHaveBeenCalledWith(game);
    });

    it("should not show title screen on ESC key when not in instructions", () => {
      game.state = "playing";
      mockEvent.keyCode = 27; // ESC key

      keydownHandler(mockEvent);

      expect(showTitleScreen).not.toHaveBeenCalled();
    });

    it("should ignore other keys when playing", () => {
      game.state = "playing";
      game.pause = false;
      game.jumpRequested = false;
      mockEvent.keyCode = 65; // A key

      keydownHandler(mockEvent);

      expect(game.pause).toBe(false);
      expect(game.jumpRequested).toBe(false);
    });
  });

  describe("touchstart events", () => {
    let touchHandler;

    beforeEach(() => {
      setupEventHandlers(game);
      // Get the touchstart handler function
      touchHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "touchstart"
      )[1];
    });

    it("should prevent default behavior", () => {
      game.state = "playing";
      game.isGameOver = false;

      touchHandler(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it("should request jump when playing and not game over", () => {
      game.state = "playing";
      game.isGameOver = false;
      game.jumpRequested = false;

      touchHandler(mockEvent);

      expect(game.jumpRequested).toBe(true);
    });

    it("should not request jump when game is over", () => {
      game.state = "playing";
      game.isGameOver = true;
      game.jumpRequested = false;

      touchHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });

    it("should not request jump when not playing", () => {
      game.state = "title";
      game.isGameOver = false;
      game.jumpRequested = false;

      touchHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });
  });

  describe("mousedown events", () => {
    let mouseHandler;

    beforeEach(() => {
      setupEventHandlers(game);
      // Get the mousedown handler function
      mouseHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "mousedown"
      )[1];
    });

    it("should request jump when playing and not game over", () => {
      game.state = "playing";
      game.isGameOver = false;
      game.jumpRequested = false;

      mouseHandler(mockEvent);

      expect(game.jumpRequested).toBe(true);
    });

    it("should not request jump when game is over", () => {
      game.state = "playing";
      game.isGameOver = true;
      game.jumpRequested = false;

      mouseHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });

    it("should not request jump when not playing", () => {
      game.state = "title";
      game.isGameOver = false;
      game.jumpRequested = false;

      mouseHandler(mockEvent);

      expect(game.jumpRequested).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle multiple event types consistently", () => {
      setupEventHandlers(game);
      
      const keydownHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "keydown"
      )[1];
      const touchHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "touchstart"
      )[1];
      const mouseHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "mousedown"
      )[1];

      game.state = "playing";
      game.isGameOver = false;
      game.jumpRequested = false;

      // Test space key
      mockEvent.keyCode = 32;
      keydownHandler(mockEvent);
      expect(game.jumpRequested).toBe(true);

      game.jumpRequested = false;

      // Test touch
      touchHandler(mockEvent);
      expect(game.jumpRequested).toBe(true);

      game.jumpRequested = false;

      // Test mouse
      mouseHandler(mockEvent);
      expect(game.jumpRequested).toBe(true);
    });

    it("should handle game state changes correctly", () => {
      setupEventHandlers(game);
      
      const keydownHandler = document.addEventListener.mock.calls.find(
        call => call[0] === "keydown"
      )[1];

      // Start playing, can jump
      game.state = "playing";
      game.isGameOver = false;
      game.jumpRequested = false;
      mockEvent.keyCode = 32;
      keydownHandler(mockEvent);
      expect(game.jumpRequested).toBe(true);

      // Game over, can't jump
      game.isGameOver = true;
      game.jumpRequested = false;
      keydownHandler(mockEvent);
      expect(game.jumpRequested).toBe(false);

      // Not playing, can't jump
      game.state = "title";
      game.isGameOver = false;
      game.jumpRequested = false;
      keydownHandler(mockEvent);
      expect(game.jumpRequested).toBe(false);
    });
  });
});