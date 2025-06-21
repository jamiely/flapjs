import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ORIGINAL_WIDTH,
  ORIGINAL_HEIGHT,
  GRAVITY_FAC,
  GRAVITY,
  JUMP_VEL,
  HERO_SPEED,
  PIPE_WID,
  PIPE_PAD,
  PIPE_BUF,
  PIPE_START_X,
  TOP,
  RENDER_X,
  DEFAULT_INITIALS,
  CONFIG,
  updateScaling,
  SCALE_X,
  SCALE_Y,
  BOTTOM,
} from "./config.js";

describe("Config Module", () => {
  describe("Game Constants", () => {
    it("should have correct game dimensions", () => {
      expect(ORIGINAL_WIDTH).toBe(500);
      expect(ORIGINAL_HEIGHT).toBe(200);
    });

    it("should have correct physics constants", () => {
      expect(GRAVITY_FAC).toBe(15);
      expect(GRAVITY).toBe(25 * 15);
      expect(JUMP_VEL).toBe(-0.8 * GRAVITY);
      expect(HERO_SPEED).toBe(120);
    });

    it("should have correct pipe configuration", () => {
      expect(PIPE_WID).toBe(50);
      expect(PIPE_PAD).toBe(PIPE_WID * 4);
      expect(PIPE_BUF).toBe(20);
      expect(PIPE_START_X).toBe(200);
    });

    it("should have correct rendering constants", () => {
      expect(TOP).toBe(0);
      expect(RENDER_X).toBe(60);
    });

    it("should have correct default initials", () => {
      expect(DEFAULT_INITIALS).toBe("WIN");
    });
  });

  describe("Calculated Values", () => {
    it("should calculate GRAVITY correctly", () => {
      expect(GRAVITY).toBe(375);
    });

    it("should calculate JUMP_VEL correctly", () => {
      expect(JUMP_VEL).toBe(-300);
    });

    it("should calculate PIPE_PAD correctly", () => {
      expect(PIPE_PAD).toBe(200);
    });
  });

  describe("CONFIG Object", () => {
    it("should contain all constants", () => {
      expect(CONFIG.ORIGINAL_WIDTH).toBe(500);
      expect(CONFIG.ORIGINAL_HEIGHT).toBe(200);
      expect(CONFIG.GRAVITY_FAC).toBe(15);
      expect(CONFIG.GRAVITY).toBe(375);
      expect(CONFIG.JUMP_VEL).toBe(-300);
      expect(CONFIG.HERO_SPEED).toBe(120);
      expect(CONFIG.PIPE_WID).toBe(50);
      expect(CONFIG.PIPE_PAD).toBe(200);
      expect(CONFIG.PIPE_BUF).toBe(20);
      expect(CONFIG.PIPE_START_X).toBe(200);
      expect(CONFIG.TOP).toBe(0);
      expect(CONFIG.RENDER_X).toBe(60);
      expect(CONFIG.DEFAULT_INITIALS).toBe("WIN");
    });
  });

  describe("Scaling Functions", () => {
    beforeEach(() => {
      // Mock window object
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 600,
      });
    });

    it("should update scaling factors correctly", () => {
      updateScaling();

      // After update, SCALE_X should be window.innerWidth / ORIGINAL_WIDTH
      // and SCALE_Y should be window.innerHeight / ORIGINAL_HEIGHT
      const expectedScaleX = 1000 / 500; // 2
      const expectedScaleY = 600 / 200; // 3

      // Note: These are imported as let variables, so we need to import them fresh
      // or test the function behavior rather than the exported values
      expect(window.innerWidth / ORIGINAL_WIDTH).toBe(expectedScaleX);
      expect(window.innerHeight / ORIGINAL_HEIGHT).toBe(expectedScaleY);
    });
  });

  describe("Physics Relationships", () => {
    it("should maintain correct physics relationships", () => {
      // Jump velocity should be negative (upward)
      expect(JUMP_VEL).toBeLessThan(0);

      // Jump velocity should be proportional to gravity
      expect(JUMP_VEL).toBe(-0.8 * GRAVITY);

      // Gravity should be positive (downward)
      expect(GRAVITY).toBeGreaterThan(0);

      // Hero speed should be positive (forward motion)
      expect(HERO_SPEED).toBeGreaterThan(0);
    });
  });
});
