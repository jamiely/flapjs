import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  drawHero,
  drawCloud,
  drawBuilding,
  drawPipe,
  render,
  setupCanvas,
  updateGameBounds,
  getScaledHeroSize,
} from "./draw.js";

// Mock dependencies
vi.mock("./config.js", () => ({
  HERO_SPEED: 80,
  RENDER_X: 60,
  scaling: {
    SCALE_X: 2,
    SCALE_Y: 3,
  },
  updateScaling: vi.fn(),
}));

vi.mock("./worldgen.js", () => ({
  generateClouds: vi.fn(() => [{ x: 100, y: 100, size: 50 }]),
  generateForegroundClouds: vi.fn(() => [{ x: 200, y: 200, size: 30 }]),
  generateSkyline: vi.fn(() => [{ x: 0, y: 150, width: 100, height: 50 }]),
}));

import { scaling, updateScaling } from "./config.js";
import { generateClouds, generateForegroundClouds, generateSkyline } from "./worldgen.js";

describe("Draw Module", () => {
  let mockCanvas, mockContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock canvas and context
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      fillRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      drawImage: vi.fn(),
    };

    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 800,
      height: 600,
      style: {},
    };

    // Mock DOM elements
    global.document = {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => mockContext),
        width: 0,
        height: 0,
        style: {},
      })),
      getElementById: vi.fn(() => ({
        textContent: "",
        style: { display: "block" },
        querySelector: vi.fn(() => ({ style: {} })),
        querySelectorAll: vi.fn(() => []),
        appendChild: vi.fn(),
      })),
    };

    global.window = {
      innerWidth: 1000,
      innerHeight: 600,
      addEventListener: vi.fn(),
    };

    // Mock global UI elements that updateOverlaySizes references
    global.titleScreen = {
      querySelector: vi.fn(() => ({ style: {} })),
    };
    global.instructionsScreen = {
      querySelector: vi.fn(() => ({ style: {} })),
    };
    global.gameOverScreen = {
      querySelector: vi.fn(() => ({ style: {} })),
    };
  });

  describe("drawHero", () => {
    it("should draw hero with correct position and size", () => {
      const hero = {
        pos: { y: 100 },
        size: { width: 30, height: 20 },
        vel: { y: 50 },
      };

      drawHero(mockContext, hero);

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
      expect(mockContext.translate).toHaveBeenCalled();
      expect(mockContext.rotate).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalled();
      expect(mockContext.fill).toHaveBeenCalled();
    });

    it("should calculate rotation based on velocity", () => {
      const heroUpward = {
        pos: { y: 100 },
        size: { width: 30, height: 20 },
        vel: { y: -100 }, // Moving upward
      };

      const heroDownward = {
        pos: { y: 100 },
        size: { width: 30, height: 20 },
        vel: { y: 200 }, // Moving downward
      };

      drawHero(mockContext, heroUpward);
      drawHero(mockContext, heroDownward);

      expect(mockContext.rotate).toHaveBeenCalledTimes(2);
    });
  });

  describe("drawCloud", () => {
    it("should draw cloud with correct properties", () => {
      const cloud = {
        x: 100,
        y: 150,
        size: 50,
        puffiness: 1.2,
        stretch: 1.5,
        color: "#ffffff",
        opacity: 0.8,
      };

      drawCloud(mockContext, cloud);

      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it("should handle different cloud sizes", () => {
      const smallCloud = {
        x: 100, y: 150, size: 30, puffiness: 1, stretch: 1,
        color: "#ffffff", opacity: 0.5,
      };

      const largeCloud = {
        x: 200, y: 250, size: 80, puffiness: 1.5, stretch: 2,
        color: "#cccccc", opacity: 0.9,
      };

      drawCloud(mockContext, smallCloud);
      drawCloud(mockContext, largeCloud);

      expect(mockContext.drawImage).toHaveBeenCalledTimes(2);
    });
  });

  describe("drawBuilding", () => {
    it("should draw building with basic properties", () => {
      const building = {
        x: 0,
        y: 100,
        width: 80,
        height: 100,
        color: "#3F4147",
        windows: false,
        antenna: false,
      };

      drawBuilding(mockContext, building);

      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 100, 80, 100);
    });

    it("should draw windows when building has windows and is wide enough", () => {
      scaling.SCALE_X = 2;
      const building = {
        x: 0,
        y: 100,
        width: 50, // 50 > 20 * 2 = 40, so windows should be drawn
        height: 100,
        color: "#3F4147",
        windows: true,
        antenna: false,
      };

      drawBuilding(mockContext, building);

      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 100, 50, 100);
      // Should also draw window rectangles - expect more than just the building
      expect(mockContext.fillRect.mock.calls.length).toBeGreaterThan(1);
    });

    it("should draw antenna when building has antenna", () => {
      const building = {
        x: 0,
        y: 100,
        width: 80,
        height: 100,
        color: "#3F4147",
        windows: false,
        antenna: true,
      };

      drawBuilding(mockContext, building);

      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });
  });

  describe("drawPipe", () => {
    it("should draw pipe with correct positioning", () => {
      const pipe = {
        pos: { x: 300, y: 0 },
        size: { width: 50, height: 150 },
      };
      const adjX = 200;

      drawPipe(mockContext, pipe, adjX);

      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.strokeRect).toHaveBeenCalled();
      expect(mockContext.arc).toHaveBeenCalled(); // For rivets
    });

    it("should handle top and bottom pipes differently", () => {
      const topPipe = {
        pos: { x: 300, y: 0 }, // Top pipe has y = 0
        size: { width: 50, height: 150 },
      };

      const bottomPipe = {
        pos: { x: 300, y: 250 },
        size: { width: 50, height: 150 },
      };

      drawPipe(mockContext, topPipe, 200);
      drawPipe(mockContext, bottomPipe, 200);

      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe("render", () => {
    let game;

    beforeEach(() => {
      game = {
        state: "playing",
        score: 42,
        hero: {
          pos: { x: 100, y: 200 },
          size: { width: 30, height: 20 },
          vel: { y: 0 },
        },
        pipes: [
          {
            pos: { x: 400, y: 0 },
            size: { width: 50, height: 150 },
          },
        ],
        clouds: [
          {
            x: 100, y: 150, size: 50, puffiness: 1, stretch: 1,
            color: "#ffffff", opacity: 0.8,
          },
        ],
        skyline: [
          {
            x: 0, y: 100, width: 80, height: 100,
            color: "#3F4147", windows: false, antenna: false,
          },
        ],
        foregroundClouds: [
          {
            x: 200, y: 250, size: 30, puffiness: 1, stretch: 1,
            color: "#cccccc", opacity: 0.6,
          },
        ],
      };
    });

    it("should render all game elements when playing", () => {
      render(game, mockCanvas);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockContext.fillRect).toHaveBeenCalled(); // Buildings
      expect(mockContext.drawImage).toHaveBeenCalled(); // Clouds
      expect(mockContext.arc).toHaveBeenCalled(); // Hero
    });

    it("should hide score when not playing", () => {
      game.state = "title";
      const scoreElement = { style: { display: "block" } };
      document.getElementById = vi.fn(() => scoreElement);

      render(game, mockCanvas);

      expect(scoreElement.style.display).toBe("none");
    });

    it("should show and update score when playing", () => {
      const scoreElement = { textContent: "", style: { display: "none" } };
      document.getElementById = vi.fn(() => scoreElement);

      render(game, mockCanvas);

      expect(scoreElement.textContent).toBe(42);
      expect(scoreElement.style.display).toBe("block");
    });
  });

  describe("setupCanvas", () => {
    let mockParent, mockAnimationFunction;

    beforeEach(() => {
      mockParent = {
        appendChild: vi.fn(),
      };

      mockAnimationFunction = {
        requestRender: vi.fn(),
      };

      document.createElement = vi.fn(() => ({
        id: "",
        style: {},
        width: 0,
        height: 0,
      }));
    });

    it("should create and configure canvas", () => {
      const game = { 
        hero: { 
          size: { width: 20, height: 15 },
          vel: { x: 100 }
        },
        pipes: []
      };
      const canvas = setupCanvas(game, mockParent, mockAnimationFunction);

      expect(document.createElement).toHaveBeenCalledWith("canvas");
      expect(mockParent.appendChild).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
      expect(canvas.id).toBe("gameCanvas");
    });

    it("should set canvas to fullscreen", () => {
      const game = { 
        hero: { 
          size: { width: 20, height: 15 },
          vel: { x: 100 }
        },
        pipes: []
      };
      const canvas = setupCanvas(game, mockParent, mockAnimationFunction);

      expect(canvas.width).toBe(1000);
      expect(canvas.height).toBe(600);
      expect(canvas.style.width).toBe("1000px");
      expect(canvas.style.height).toBe("600px");
    });
  });

  describe("updateGameBounds", () => {
    it("should update scaling and game elements", () => {
      const game = {
        hero: {
          size: { width: 20, height: 15 },
          vel: { x: 100 },
        },
        pipes: [
          {
            pos: { x: 400, y: 100 },
            size: { width: 50, height: 150 },
          },
        ],
        clouds: [],
        foregroundClouds: [],
        skyline: [],
      };

      updateGameBounds(game);

      expect(updateScaling).toHaveBeenCalled();
      expect(generateClouds).toHaveBeenCalled();
      expect(generateForegroundClouds).toHaveBeenCalled();
      expect(generateSkyline).toHaveBeenCalled();
    });

    it("should handle null game gracefully", () => {
      expect(() => updateGameBounds(null)).not.toThrow();
      expect(updateScaling).toHaveBeenCalled();
    });
  });

  describe("getScaledHeroSize", () => {
    it("should return scaled hero size", () => {
      const size = getScaledHeroSize();

      expect(size).toEqual({
        width: 15 * scaling.SCALE_X * 2,
        height: 10 * scaling.SCALE_Y * 2,
      });
      expect(size.width).toBe(60); // 15 * 2 * 2
      expect(size.height).toBe(60); // 10 * 3 * 2
    });
  });
});