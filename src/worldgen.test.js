import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateClouds,
  generateForegroundClouds,
  generateSkyline,
  updateClouds,
  updateForegroundClouds,
  updateSkyline,
} from "./worldgen.js";

// Mock the config module
vi.mock("./config.js", () => ({
  scaling: {
    SCALE_X: 2.0,
    SCALE_Y: 1.5,
  },
}));

describe("WorldGen Module", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock window object with consistent dimensions
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

    // Mock Math.random to provide predictable results for some tests
    vi.spyOn(Math, "random").mockRestore();
  });

  describe("Cloud Generation", () => {
    describe("generateClouds()", () => {
      it("should generate exactly 8 clouds", () => {
        const clouds = generateClouds();
        expect(clouds).toHaveLength(8);
      });

      it("should create clouds with required properties", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          expect(cloud).toHaveProperty("x");
          expect(cloud).toHaveProperty("y");
          expect(cloud).toHaveProperty("size");
          expect(cloud).toHaveProperty("speed");
          expect(cloud).toHaveProperty("opacity");
          expect(cloud).toHaveProperty("color");
          expect(cloud).toHaveProperty("puffiness");
          expect(cloud).toHaveProperty("stretch");

          // Type checks
          expect(typeof cloud.x).toBe("number");
          expect(typeof cloud.y).toBe("number");
          expect(typeof cloud.size).toBe("number");
          expect(typeof cloud.speed).toBe("number");
          expect(typeof cloud.opacity).toBe("number");
          expect(typeof cloud.color).toBe("string");
          expect(typeof cloud.puffiness).toBe("number");
          expect(typeof cloud.stretch).toBe("number");
        });
      });

      it("should generate clouds with appropriate speed range", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          expect(cloud.speed).toBeGreaterThanOrEqual(0.05);
          expect(cloud.speed).toBeLessThanOrEqual(0.45);
        });
      });

      it("should generate clouds with appropriate opacity range", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          expect(cloud.opacity).toBeGreaterThanOrEqual(0.25);
          expect(cloud.opacity).toBeLessThanOrEqual(0.75);
        });
      });

      it("should generate clouds with appropriate puffiness range", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          expect(cloud.puffiness).toBeGreaterThanOrEqual(0.5);
          expect(cloud.puffiness).toBeLessThanOrEqual(1.0);
        });
      });

      it("should generate clouds with appropriate stretch range", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          expect(cloud.stretch).toBeGreaterThanOrEqual(0.8);
          expect(cloud.stretch).toBeLessThanOrEqual(1.2);
        });
      });

      it("should use valid cloud colors", () => {
        const clouds = generateClouds();
        const validColors = [
          "#FFFFFF",
          "#F8F8FF",
          "#F0F8FF",
          "#E6F3FF",
          "#F5F5F5",
          "#FFFAFA",
          "#F0FFFF",
          "#E0F6FF",
          "#F7F7F7",
          "#E8F4F8",
        ];

        clouds.forEach((cloud) => {
          expect(validColors).toContain(cloud.color);
        });
      });

      it("should generate different sized clouds based on size variation", () => {
        // Mock Math.random to test different size categories
        const mockRandom = vi.spyOn(Math, "random");
        
        // Set up mock sequence for first cloud (small)
        mockRandom
          .mockReturnValueOnce(0.1) // sizeVariation (< 0.3 = small)
          .mockReturnValueOnce(0.5) // baseSize calculation
          .mockReturnValueOnce(0.5) // x position
          .mockReturnValueOnce(0.5) // y position  
          .mockReturnValueOnce(0.5) // speed
          .mockReturnValueOnce(0.5) // opacity
          .mockReturnValueOnce(0) // color index
          .mockReturnValueOnce(0.5) // puffiness
          .mockReturnValueOnce(0.5) // stretch
          // Continue for remaining clouds...
          .mockReturnValue(0.5);

        const clouds = generateClouds();

        // Small cloud: baseSize = Math.random() * 20 + 8 = 0.5 * 20 + 8 = 18
        // Scaling factor: Math.min(2.0, 1.5) = 1.5
        expect(clouds[0].size).toBe(18 * 1.5); // Small = 27
      });

      it("should position clouds within extended viewport bounds", () => {
        const clouds = generateClouds();

        clouds.forEach((cloud) => {
          // Y position should be within upper half of viewport with some padding
          expect(cloud.y).toBeGreaterThanOrEqual(10 * 1.5); // 10 * SCALE_Y
          expect(cloud.y).toBeLessThanOrEqual(600 * 0.5 + 10 * 1.5); // viewport * 0.5 + padding

          // X position can extend beyond viewport for scrolling effect
          expect(cloud.x).toBeGreaterThanOrEqual(-100 * 2.0); // -100 * SCALE_X
          expect(cloud.x).toBeLessThanOrEqual(1000 + 200 * 2.0); // viewport + 200 * SCALE_X
        });
      });
    });

    describe("generateForegroundClouds()", () => {
      it("should generate exactly 4 foreground clouds", () => {
        const clouds = generateForegroundClouds();
        expect(clouds).toHaveLength(4);
      });

      it("should create foreground clouds with required properties", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud).toHaveProperty("x");
          expect(cloud).toHaveProperty("y");
          expect(cloud).toHaveProperty("size");
          expect(cloud).toHaveProperty("speed");
          expect(cloud).toHaveProperty("opacity");
          expect(cloud).toHaveProperty("color");
          expect(cloud).toHaveProperty("puffiness");
          expect(cloud).toHaveProperty("stretch");
        });
      });

      it("should generate foreground clouds with slower speed range", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud.speed).toBeGreaterThanOrEqual(0.1);
          expect(cloud.speed).toBeLessThanOrEqual(0.3);
        });
      });

      it("should generate foreground clouds with very light opacity", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud.opacity).toBeGreaterThanOrEqual(0.05);
          expect(cloud.opacity).toBeLessThanOrEqual(0.15);
        });
      });

      it("should generate foreground clouds with higher puffiness", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud.puffiness).toBeGreaterThanOrEqual(0.7);
          expect(cloud.puffiness).toBeLessThanOrEqual(1.0);
        });
      });

      it("should generate foreground clouds with wider stretch range", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud.stretch).toBeGreaterThanOrEqual(0.8);
          expect(cloud.stretch).toBeLessThanOrEqual(1.4);
        });
      });

      it("should use limited color palette for foreground clouds", () => {
        const clouds = generateForegroundClouds();
        const validColors = ["#FFFFFF", "#F8F8FF", "#F0F8FF", "#F5F5F5", "#FFFAFA"];

        clouds.forEach((cloud) => {
          expect(validColors).toContain(cloud.color);
        });
      });

      it("should generate different sized foreground clouds", () => {
        // Mock Math.random to test different size categories
        const mockRandom = vi.spyOn(Math, "random");
        
        // Set up mock sequence for first cloud (medium)
        mockRandom
          .mockReturnValueOnce(0.3) // sizeVariation (< 0.4 = medium)
          .mockReturnValueOnce(0.5) // baseSize calculation
          .mockReturnValueOnce(0.5) // x position
          .mockReturnValueOnce(0.5) // y position  
          .mockReturnValueOnce(0.5) // speed
          .mockReturnValueOnce(0.5) // opacity
          .mockReturnValueOnce(0) // color index
          .mockReturnValueOnce(0.5) // puffiness
          .mockReturnValueOnce(0.5) // stretch
          // Continue for remaining clouds...
          .mockReturnValue(0.5);

        const clouds = generateForegroundClouds();

        // Medium cloud: baseSize = Math.random() * 60 + 40 = 0.5 * 60 + 40 = 70
        expect(clouds[0].size).toBe(70 * 1.5); // Medium = 105
      });

      it("should position foreground clouds anywhere vertically", () => {
        const clouds = generateForegroundClouds();

        clouds.forEach((cloud) => {
          expect(cloud.y).toBeGreaterThanOrEqual(0);
          expect(cloud.y).toBeLessThanOrEqual(600); // window.innerHeight
        });
      });
    });
  });

  describe("Skyline Generation", () => {
    describe("generateSkyline()", () => {
      it("should generate appropriate number of buildings", () => {
        const buildings = generateSkyline();
        
        // numBuildings = Math.floor(viewportWidth / (40 * scaling.SCALE_X)) + 2
        // = Math.floor(1000 / (40 * 2.0)) + 2 = Math.floor(12.5) + 2 = 14
        expect(buildings).toHaveLength(14);
      });

      it("should create buildings with required properties", () => {
        const buildings = generateSkyline();

        buildings.forEach((building) => {
          expect(building).toHaveProperty("x");
          expect(building).toHaveProperty("y");
          expect(building).toHaveProperty("width");
          expect(building).toHaveProperty("height");
          expect(building).toHaveProperty("color");
          expect(building).toHaveProperty("windows");
          expect(building).toHaveProperty("antenna");
          expect(building).toHaveProperty("speed");

          // Type checks
          expect(typeof building.x).toBe("number");
          expect(typeof building.y).toBe("number");
          expect(typeof building.width).toBe("number");
          expect(typeof building.height).toBe("number");
          expect(typeof building.color).toBe("string");
          expect(typeof building.windows).toBe("boolean");
          expect(typeof building.antenna).toBe("boolean");
          expect(typeof building.speed).toBe("number");
        });
      });

      it("should generate buildings with appropriate speed range", () => {
        const buildings = generateSkyline();

        buildings.forEach((building) => {
          expect(building.speed).toBeGreaterThanOrEqual(0.4);
          expect(building.speed).toBeLessThanOrEqual(0.6);
        });
      });

      it("should use valid building colors", () => {
        const buildings = generateSkyline();
        const validColors = [
          "#3F4147",
          "#4B4D52",
          "#5A4741",
          "#6B5D56",
          "#525459",
          "#4A5451",
          "#3A4C4C",
          "#504C49",
        ];

        buildings.forEach((building) => {
          expect(validColors).toContain(building.color);
        });
      });

      it("should generate different height categories", () => {
        const mockRandom = vi.spyOn(Math, "random");
        
        // Set up mock sequence for first building (short)
        mockRandom
          .mockReturnValueOnce(0.5) // Building width
          .mockReturnValueOnce(0.5) // Short building (< 0.6)
          .mockReturnValueOnce(0.5) // Height calculation
          .mockReturnValueOnce(0) // Color index
          .mockReturnValueOnce(0.2) // Windows
          .mockReturnValueOnce(0.8) // Antenna
          .mockReturnValueOnce(0.5) // Speed
          .mockReturnValueOnce(0.5) // Gap
          // Continue for remaining buildings...
          .mockReturnValue(0.5);

        const buildings = generateSkyline();

        // Short: height = (Math.random() * 60 + 20) * SCALE_Y = (0.5 * 60 + 20) * 1.5 = 75
        expect(buildings[0].height).toBe(75); // Short
      });

      it("should make tall buildings narrower", () => {
        const mockRandom = vi.spyOn(Math, "random");
        
        // Set up mock sequence for first building (tall)
        mockRandom
          .mockReturnValueOnce(0.5) // Building width = (0.5 * 60 + 30) * 2.0 = 120
          .mockReturnValueOnce(0.9) // Tall building (> 0.85)
          .mockReturnValueOnce(0.5) // Height calculation
          .mockReturnValueOnce(0.8) // Width reduction factor
          .mockReturnValueOnce(0) // Color index
          .mockReturnValueOnce(0.2) // Windows
          .mockReturnValueOnce(0.8) // Antenna
          .mockReturnValueOnce(0.5) // Speed
          .mockReturnValueOnce(0.5) // Gap
          // Continue for remaining buildings...
          .mockReturnValue(0.5);

        const buildings = generateSkyline();

        // Original width: 120
        // Reduced width: 120 * (0.8 * 0.4 + 0.6) = 120 * 0.92 = 110.4
        expect(buildings[0].width).toBe(110.4);
      });

      it("should position buildings sequentially with gaps", () => {
        const buildings = generateSkyline();

        // First building should start at -50 * SCALE_X = -100
        expect(buildings[0].x).toBe(-100);

        // Each subsequent building should be positioned after the previous one
        for (let i = 1; i < buildings.length; i++) {
          expect(buildings[i].x).toBeGreaterThan(buildings[i - 1].x + buildings[i - 1].width);
        }
      });

      it("should position buildings at ground level", () => {
        const buildings = generateSkyline();

        buildings.forEach((building) => {
          // Building y position should be groundLevel - buildingHeight
          // groundLevel = window.innerHeight = 600
          expect(building.y).toBe(600 - building.height);
        });
      });
    });
  });

  describe("Cloud Updates", () => {
    let mockGame;

    beforeEach(() => {
      mockGame = {
        state: "playing",
        pause: false,
        isGameOver: false,
        hero: {
          vel: { x: 100 },
        },
        clouds: [
          {
            x: 100,
            y: 50,
            size: 30,
            speed: 0.2,
            opacity: 0.5,
            color: "#FFFFFF",
            puffiness: 0.7,
            stretch: 1.0,
          },
        ],
      };
    });

    describe("updateClouds()", () => {
      it("should not update clouds when game is not playing", () => {
        mockGame.state = "title";
        const originalX = mockGame.clouds[0].x;

        updateClouds(mockGame, 1.0);

        expect(mockGame.clouds[0].x).toBe(originalX);
      });

      it("should not update clouds when game is paused", () => {
        mockGame.pause = true;
        const originalX = mockGame.clouds[0].x;

        updateClouds(mockGame, 1.0);

        expect(mockGame.clouds[0].x).toBe(originalX);
      });

      it("should not update clouds when game is over", () => {
        mockGame.isGameOver = true;
        const originalX = mockGame.clouds[0].x;

        updateClouds(mockGame, 1.0);

        expect(mockGame.clouds[0].x).toBe(originalX);
      });

      it("should move clouds based on hero speed and cloud speed", () => {
        const delta = 1.0;
        const heroSpeed = mockGame.hero.vel.x * delta; // 100
        const cloudSpeed = mockGame.clouds[0].speed; // 0.2
        const originalX = mockGame.clouds[0].x; // 100

        updateClouds(mockGame, delta);

        const expectedX = originalX - heroSpeed * cloudSpeed; // 100 - 100 * 0.2 = 80
        expect(mockGame.clouds[0].x).toBe(expectedX);
      });

      it("should reset cloud when it goes off-screen", () => {
        // Position cloud far off-screen to the left
        mockGame.clouds[0].x = -1000;
        mockGame.clouds[0].size = 50;

        // Mock Math.random for regeneration
        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0.5) // New x position offset
          .mockReturnValueOnce(0.5) // New y position
          .mockReturnValueOnce(0.2) // Size variation (small)
          .mockReturnValueOnce(0.5) // Base size
          .mockReturnValueOnce(0.3) // New speed
          .mockReturnValueOnce(0.4) // New opacity
          .mockReturnValueOnce(2) // Color index
          .mockReturnValueOnce(0.3) // Puffiness
          .mockReturnValueOnce(0.6); // Stretch

        updateClouds(mockGame, 1.0);

        // Cloud should be repositioned to the right
        expect(mockGame.clouds[0].x).toBeGreaterThan(1000);
        
        // Y position should be regenerated
        expect(mockGame.clouds[0].y).toBeGreaterThanOrEqual(0);
        
        // Properties should be regenerated
        expect(mockGame.clouds[0].size).toBeGreaterThan(0);
        expect(mockGame.clouds[0].speed).toBeGreaterThanOrEqual(0.05);
        expect(mockGame.clouds[0].opacity).toBeGreaterThanOrEqual(0.25);
      });

      it("should regenerate cloud properties on reset", () => {
        mockGame.clouds[0].x = -1000;
        mockGame.clouds[0].size = 50;

        const originalSize = mockGame.clouds[0].size;
        const originalSpeed = mockGame.clouds[0].speed;
        const originalOpacity = mockGame.clouds[0].opacity;

        // Mock Math.random for regeneration to ensure different values
        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0.8) // New x position offset (different from default)
          .mockReturnValueOnce(0.8) // New y position
          .mockReturnValueOnce(0.2) // Size variation (small)
          .mockReturnValueOnce(0.8) // Base size (different)
          .mockReturnValueOnce(0.8) // New speed (different)
          .mockReturnValueOnce(0.8) // New opacity (different)
          .mockReturnValue(0.5);

        updateClouds(mockGame, 1.0);

        // Properties should be different after regeneration
        expect(mockGame.clouds[0].size).not.toBe(originalSize);
        expect(mockGame.clouds[0].speed).not.toBe(originalSpeed);
        expect(mockGame.clouds[0].opacity).not.toBe(originalOpacity);
      });
    });

    describe("updateForegroundClouds()", () => {
      beforeEach(() => {
        mockGame.foregroundClouds = [
          {
            x: 100,
            y: 50,
            size: 30,
            speed: 0.15,
            opacity: 0.1,
            color: "#FFFFFF",
            puffiness: 0.8,
            stretch: 1.2,
          },
        ];
      });

      it("should not update foreground clouds when game is not playing", () => {
        mockGame.state = "title";
        const originalX = mockGame.foregroundClouds[0].x;

        updateForegroundClouds(mockGame, 1.0);

        expect(mockGame.foregroundClouds[0].x).toBe(originalX);
      });

      it("should move foreground clouds with parallax effect", () => {
        const delta = 1.0;
        const heroSpeed = mockGame.hero.vel.x * delta; // 100
        const cloudSpeed = mockGame.foregroundClouds[0].speed; // 0.15
        const originalX = mockGame.foregroundClouds[0].x; // 100

        updateForegroundClouds(mockGame, delta);

        const expectedX = originalX - heroSpeed * cloudSpeed; // 100 - 100 * 0.15 = 85
        expect(mockGame.foregroundClouds[0].x).toBe(expectedX);
      });

      it("should reset foreground cloud when it goes off-screen", () => {
        mockGame.foregroundClouds[0].x = -2000;
        mockGame.foregroundClouds[0].size = 100;

        const originalX = mockGame.foregroundClouds[0].x;

        updateForegroundClouds(mockGame, 1.0);

        // Cloud should be repositioned to the right
        expect(mockGame.foregroundClouds[0].x).toBeGreaterThan(originalX);
        expect(mockGame.foregroundClouds[0].x).toBeGreaterThan(1000);
      });

      it("should regenerate foreground cloud size correctly", () => {
        mockGame.foregroundClouds[0].x = -2000;
        mockGame.foregroundClouds[0].size = 100;

        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0.5) // New x position offset
          .mockReturnValueOnce(0.5) // New y position
          .mockReturnValueOnce(0.3) // Size variation (medium, < 0.4)
          .mockReturnValueOnce(0.5) // Base size
          .mockReturnValue(0.5);

        updateForegroundClouds(mockGame, 1.0);

        // Medium cloud: baseSize = Math.random() * 60 + 40 = 0.5 * 60 + 40 = 70
        // Scaled size: 70 * Math.min(2.0, 1.5) = 70 * 1.5 = 105
        expect(mockGame.foregroundClouds[0].size).toBe(105);
      });
    });
  });

  describe("Skyline Updates", () => {
    let mockGame;

    beforeEach(() => {
      mockGame = {
        state: "playing",
        pause: false,
        isGameOver: false,
        hero: {
          vel: { x: 100 },
        },
        skyline: [
          {
            x: 100,
            y: 400,
            width: 80,
            height: 200,
            color: "#3F4147",
            windows: true,
            antenna: false,
            speed: 0.5,
          },
          {
            x: 300,
            y: 350,
            width: 60,
            height: 250,
            color: "#4B4D52",
            windows: false,
            antenna: true,
            speed: 0.45,
          },
        ],
      };
    });

    describe("updateSkyline()", () => {
      it("should not update skyline when game is not playing", () => {
        mockGame.state = "title";
        const originalX = mockGame.skyline[0].x;

        updateSkyline(mockGame, 1.0);

        expect(mockGame.skyline[0].x).toBe(originalX);
      });

      it("should not update skyline when game is paused", () => {
        mockGame.pause = true;
        const originalX = mockGame.skyline[0].x;

        updateSkyline(mockGame, 1.0);

        expect(mockGame.skyline[0].x).toBe(originalX);
      });

      it("should not update skyline when game is over", () => {
        mockGame.isGameOver = true;
        const originalX = mockGame.skyline[0].x;

        updateSkyline(mockGame, 1.0);

        expect(mockGame.skyline[0].x).toBe(originalX);
      });

      it("should move buildings based on hero speed and building speed", () => {
        const delta = 1.0;
        const heroSpeed = mockGame.hero.vel.x * delta; // 100
        const buildingSpeed = mockGame.skyline[0].speed; // 0.5
        const originalX = mockGame.skyline[0].x; // 100

        updateSkyline(mockGame, delta);

        const expectedX = originalX - heroSpeed * buildingSpeed; // 100 - 100 * 0.5 = 50
        expect(mockGame.skyline[0].x).toBe(expectedX);
      });

      it("should reset building when it goes off-screen", () => {
        // Position building far off-screen to the left
        mockGame.skyline[0].x = -1000;
        mockGame.skyline[0].width = 50;

        const rightmostX = mockGame.skyline[1].x + mockGame.skyline[1].width; // 300 + 60 = 360

        // Mock Math.random for building regeneration
        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0.5) // Building width
          .mockReturnValueOnce(0.5) // Height variation (short)
          .mockReturnValueOnce(0.5) // Height value
          .mockReturnValueOnce(0.5) // Gap size
          .mockReturnValueOnce(3) // Color index
          .mockReturnValueOnce(0.2) // Windows (< 0.3, so true)
          .mockReturnValueOnce(0.8) // Antenna (> 0.7, so false)
          .mockReturnValueOnce(0.3); // Speed

        updateSkyline(mockGame, 1.0);

        // Building should be repositioned after the rightmost building
        expect(mockGame.skyline[0].x).toBeGreaterThan(rightmostX);
        
        // Properties should be regenerated
        expect(mockGame.skyline[0].height).toBeGreaterThan(0);
        expect(mockGame.skyline[0].width).toBeGreaterThan(0);
        expect(mockGame.skyline[0].y).toBe(600 - mockGame.skyline[0].height);
      });

      it("should find rightmost building correctly", () => {
        // Position first building off-screen
        mockGame.skyline[0].x = -1000;
        mockGame.skyline[0].width = 50;

        // Second building is at x=300, width=60, so right edge is at 360
        const expectedRightmostX = 360;

        updateSkyline(mockGame, 1.0);

        // First building should be repositioned after the rightmost point
        expect(mockGame.skyline[0].x).toBeGreaterThan(expectedRightmostX);
      });

      it("should regenerate building with different height categories", () => {
        mockGame.skyline[0].x = -1000;
        mockGame.skyline[0].width = 50;

        vi.spyOn(Math, "random")
          .mockReturnValueOnce(0.5) // Building width
          .mockReturnValueOnce(0.9) // Height variation (tall, > 0.85)
          .mockReturnValueOnce(0.5) // Height value
          .mockReturnValueOnce(0.7) // Width reduction
          .mockReturnValue(0.5);

        updateSkyline(mockGame, 1.0);

        // Tall building: height = (0.5 * 200 + 150) * 1.5 = 375
        expect(mockGame.skyline[0].height).toBe(375);
        
        // Width should be reduced for tall buildings
        const baseWidth = (0.5 * 60 + 30) * 2.0; // 120
        const reducedWidth = baseWidth * (0.7 * 0.4 + 0.6); // 120 * 0.88 = 105.6
        expect(mockGame.skyline[0].width).toBe(reducedWidth);
      });
    });
  });
});