import { describe, it, expect, beforeEach, vi } from "vitest";
import { genRequestAnimFunction } from "./animationFunction.js";

// Mock the draw module
vi.mock("./draw.js", () => ({
  render: vi.fn(),
}));

import { render } from "./draw.js";

describe("Animation Function Module", () => {
  let mockRoot, mockGame, mockCanvas, mockCallback, mockTick;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRoot = {
      requestAnimationFrame: vi.fn(),
    };
    
    mockGame = {
      pause: false,
    };
    
    mockCanvas = document.createElement("canvas");
    mockCallback = vi.fn();
    mockTick = vi.fn();
  });

  describe("genRequestAnimFunction", () => {
    it("should return a function", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      expect(typeof animFunction).toBe("function");
    });

    it("should expose requestRender method", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      expect(typeof animFunction.requestRender).toBe("function");
    });

    it("should call tick with game and elapsed time", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      const timestamp = 1000;
      animFunction(timestamp);

      expect(mockTick).toHaveBeenCalledWith(mockGame, expect.any(Number));
    });

    it("should call render when game is not paused", () => {
      mockGame.pause = false;
      
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      animFunction(1000);

      expect(render).toHaveBeenCalledWith(mockGame, mockCanvas);
    });

    it("should not call render when game is paused", () => {
      mockGame.pause = true;
      
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      // First call to establish pause state
      animFunction(1000);
      vi.clearAllMocks();
      
      // Second call should not render since paused
      animFunction(2000);

      expect(render).not.toHaveBeenCalled();
    });

    it("should call render when pause state changes", () => {
      mockGame.pause = false;
      
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      // First call - not paused
      animFunction(1000);
      expect(render).toHaveBeenCalledTimes(1);
      
      // Change to paused
      mockGame.pause = true;
      animFunction(2000);
      expect(render).toHaveBeenCalledTimes(2); // Should render due to state change
      
      // Stay paused
      animFunction(3000);
      expect(render).toHaveBeenCalledTimes(2); // Should not render again
    });

    it("should calculate elapsed time correctly", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      animFunction(1000);
      animFunction(2500);

      // Second call should have elapsed time of 1.5 seconds
      expect(mockTick).toHaveBeenLastCalledWith(mockGame, 1.5);
    });

    it("should handle first call with zero elapsed time", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      animFunction(1000);

      // First call should have elapsed time of 0
      expect(mockTick).toHaveBeenCalledWith(mockGame, 0);
    });

    it("should call callback with itself", () => {
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      animFunction(1000);

      expect(mockCallback).toHaveBeenCalledWith(animFunction);
    });

    it("should render when requestRender is called", () => {
      mockGame.pause = true;
      
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      // First call to establish pause state
      animFunction(1000);
      vi.clearAllMocks();
      
      // Request render while paused
      animFunction.requestRender();
      animFunction(2000);

      expect(render).toHaveBeenCalledWith(mockGame, mockCanvas);
    });

    it("should reset needsRender flag after rendering", () => {
      mockGame.pause = true;
      
      const animFunction = genRequestAnimFunction({
        root: mockRoot,
        game: mockGame,
        canvas: mockCanvas,
        callback: mockCallback,
        tick: mockTick,
      });

      // First call to establish pause state
      animFunction(1000);
      vi.clearAllMocks();
      
      // Request render while paused
      animFunction.requestRender();
      animFunction(2000);
      expect(render).toHaveBeenCalledTimes(1);
      
      // Next call should not render (needsRender flag should be reset)
      animFunction(3000);
      expect(render).toHaveBeenCalledTimes(1);
    });
  });
});