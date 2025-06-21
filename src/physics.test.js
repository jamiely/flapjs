import { describe, it, expect } from "vitest";
import {
  pt,
  addPt,
  addToPt,
  between,
  within,
  farPt,
  allPts,
  anyPtsWithin,
  getHeroCollisionBounds,
  collides,
  isOutOfBounds,
  VectorUtils,
  GeometryUtils,
  PhysicsUtils,
} from "./physics.js";

describe("Physics Module", () => {
  describe("Point Creation and Manipulation", () => {
    describe("pt()", () => {
      it("should create a point with x and y coordinates", () => {
        const point = pt(10, 20);
        expect(point).toEqual({ x: 10, y: 20 });
      });

      it("should handle negative coordinates", () => {
        const point = pt(-5, -10);
        expect(point).toEqual({ x: -5, y: -10 });
      });

      it("should handle zero coordinates", () => {
        const point = pt(0, 0);
        expect(point).toEqual({ x: 0, y: 0 });
      });

      it("should handle decimal coordinates", () => {
        const point = pt(1.5, 2.7);
        expect(point).toEqual({ x: 1.5, y: 2.7 });
      });
    });

    describe("addPt()", () => {
      it("should add two points and return a new point", () => {
        const a = pt(10, 20);
        const b = pt(5, 15);
        const result = addPt(a, b);

        expect(result).toEqual({ x: 15, y: 35 });
        // Original points should be unchanged
        expect(a).toEqual({ x: 10, y: 20 });
        expect(b).toEqual({ x: 5, y: 15 });
      });

      it("should handle negative values", () => {
        const a = pt(10, 5);
        const b = pt(-3, -2);
        const result = addPt(a, b);

        expect(result).toEqual({ x: 7, y: 3 });
      });

      it("should handle zero values", () => {
        const a = pt(10, 20);
        const b = pt(0, 0);
        const result = addPt(a, b);

        expect(result).toEqual({ x: 10, y: 20 });
      });
    });

    describe("addToPt()", () => {
      it("should add point b to point a and modify a", () => {
        const a = pt(10, 20);
        const b = pt(5, 15);
        const result = addToPt(a, b);

        expect(result).toEqual({ x: 15, y: 35 });
        expect(a).toEqual({ x: 15, y: 35 }); // a should be modified
        expect(b).toEqual({ x: 5, y: 15 }); // b should be unchanged
      });

      it("should return the modified point", () => {
        const a = pt(1, 2);
        const b = pt(3, 4);
        const result = addToPt(a, b);

        expect(result).toBe(a); // Should return reference to a
      });
    });
  });

  describe("Range and Boundary Checking", () => {
    describe("between()", () => {
      it("should return true when value is between bounds (ascending)", () => {
        expect(between(5, 0, 10)).toBe(true);
        expect(between(0.1, 0, 1)).toBe(true);
      });

      it("should return true when value is between bounds (descending)", () => {
        expect(between(5, 10, 0)).toBe(true);
        expect(between(7, 10, 5)).toBe(true);
      });

      it("should return false when value is outside bounds", () => {
        expect(between(-1, 0, 10)).toBe(false);
        expect(between(11, 0, 10)).toBe(false);
        expect(between(0, 1, 5)).toBe(false);
      });

      it("should handle boundary conditions correctly", () => {
        // Based on the implementation: (a < b && b <= c) || (a >= b && b > c)
        expect(between(10, 0, 10)).toBe(true); // b <= c case
        expect(between(0, 0, 10)).toBe(false); // a < b fails
        expect(between(0, 10, 0)).toBe(false); // Both conditions fail
        expect(between(10, 10, 0)).toBe(true); // (a >= b && b > c) = (10 >= 10 && 10 > 0) = true
      });
    });

    describe("within()", () => {
      it("should return true when point is within rectangle", () => {
        const point = pt(5, 5);
        const rect = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        expect(within(point, rect)).toBe(true);
      });

      it("should return false when point is outside rectangle", () => {
        const point = pt(15, 5);
        const rect = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        expect(within(point, rect)).toBe(false);
      });

      it("should handle rectangle with offset position", () => {
        const point = pt(15, 15);
        const rect = {
          pos: { x: 10, y: 10 },
          size: { width: 10, height: 10 },
        };

        expect(within(point, rect)).toBe(true);
      });
    });

    describe("isOutOfBounds()", () => {
      it("should return true when entity is below boundary", () => {
        const entity = { pos: { x: 10, y: 150 } };
        const boundary = 100;

        expect(isOutOfBounds(entity, boundary)).toBe(true);
      });

      it("should return false when entity is above boundary", () => {
        const entity = { pos: { x: 10, y: 50 } };
        const boundary = 100;

        expect(isOutOfBounds(entity, boundary)).toBe(false);
      });

      it("should return false when entity is exactly at boundary", () => {
        const entity = { pos: { x: 10, y: 100 } };
        const boundary = 100;

        expect(isOutOfBounds(entity, boundary)).toBe(false);
      });
    });
  });

  describe("Geometry Utilities", () => {
    describe("farPt()", () => {
      it("should return the bottom-right corner of an entity", () => {
        const entity = {
          pos: { x: 10, y: 20 },
          size: { width: 30, height: 40 },
        };

        const result = farPt(entity);
        expect(result).toEqual({ x: 40, y: 60 });
      });

      it("should handle entity at origin", () => {
        const entity = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 15 },
        };

        const result = farPt(entity);
        expect(result).toEqual({ x: 10, y: 15 });
      });
    });

    describe("allPts()", () => {
      it("should return all four corner points of an entity", () => {
        const entity = {
          pos: { x: 10, y: 20 },
          size: { width: 30, height: 40 },
        };

        const result = allPts(entity);
        expect(result).toEqual([
          { x: 10, y: 20 }, // top-left
          { x: 40, y: 20 }, // top-right
          { x: 10, y: 60 }, // bottom-left
          { x: 40, y: 60 }, // bottom-right
        ]);
      });

      it("should handle entity at origin", () => {
        const entity = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        const result = allPts(entity);
        expect(result).toEqual([
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 0, y: 10 },
          { x: 10, y: 10 },
        ]);
      });
    });

    describe("anyPtsWithin()", () => {
      it("should return true when entities overlap", () => {
        const entityA = {
          pos: { x: 5, y: 5 },
          size: { width: 10, height: 10 },
        };
        const entityB = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        expect(anyPtsWithin(entityA, entityB)).toBe(true);
      });

      it("should return false when entities do not overlap", () => {
        const entityA = {
          pos: { x: 20, y: 20 },
          size: { width: 10, height: 10 },
        };
        const entityB = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        expect(anyPtsWithin(entityA, entityB)).toBe(false);
      });
    });

    describe("getHeroCollisionBounds()", () => {
      it("should return collision bounds that are 60% of hero size and centered", () => {
        const hero = {
          pos: { x: 10, y: 20 },
          size: { width: 20, height: 30 },
        };

        const result = getHeroCollisionBounds(hero);

        // Expected: 60% of size = 12x18, centered offset = 4x6
        expect(result).toEqual({
          pos: { x: 14, y: 26 },
          size: { width: 12, height: 18 },
        });
      });

      it("should handle hero at origin", () => {
        const hero = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        const result = getHeroCollisionBounds(hero);

        // Expected: 60% of size = 6x6, centered offset = 2x2
        expect(result).toEqual({
          pos: { x: 2, y: 2 },
          size: { width: 6, height: 6 },
        });
      });
    });
  });

  describe("Collision Detection", () => {
    describe("collides()", () => {
      it("should detect collision between overlapping entities", () => {
        const hero = {
          pos: { x: 10, y: 10 },
          size: { width: 20, height: 20 },
        };
        const obstacle = {
          pos: { x: 15, y: 15 },
          size: { width: 10, height: 10 },
        };

        expect(collides(hero, obstacle)).toBe(true);
      });

      it("should not detect collision between non-overlapping entities", () => {
        const hero = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };
        const obstacle = {
          pos: { x: 20, y: 20 },
          size: { width: 10, height: 10 },
        };

        expect(collides(hero, obstacle)).toBe(false);
      });

      it("should use smaller collision bounds for hero", () => {
        // This test verifies that the hero collision bounds are smaller
        const hero = {
          pos: { x: 0, y: 0 },
          size: { width: 10, height: 10 },
        };

        // Hero collision bounds: 60% of 10x10 = 6x6, centered at 2,2 to 8,8
        // Test an obstacle that would collide with full bounds but not with reduced bounds
        const obstacleNoCollision = {
          pos: { x: 9, y: 9 },
          size: { width: 1, height: 1 },
        };

        expect(collides(hero, obstacleNoCollision)).toBe(false);

        // Test an obstacle that should collide with the reduced bounds
        const obstacleCollision = {
          pos: { x: 4, y: 4 },
          size: { width: 2, height: 2 },
        };

        expect(collides(hero, obstacleCollision)).toBe(true);
      });
    });
  });

  describe("Utility Objects", () => {
    describe("VectorUtils", () => {
      it("should contain all vector utility functions", () => {
        expect(typeof VectorUtils.create).toBe("function");
        expect(typeof VectorUtils.add).toBe("function");
        expect(typeof VectorUtils.addTo).toBe("function");
        expect(typeof VectorUtils.isEqual).toBe("function");
        expect(typeof VectorUtils.distance).toBe("function");
        expect(typeof VectorUtils.magnitude).toBe("function");
      });

      it("should calculate distance between two points", () => {
        const a = pt(0, 0);
        const b = pt(3, 4);
        expect(VectorUtils.distance(a, b)).toBe(5); // 3-4-5 triangle
      });

      it("should calculate magnitude of a vector", () => {
        const v = pt(3, 4);
        expect(VectorUtils.magnitude(v)).toBe(5);
      });

      it("should check if two points are equal", () => {
        const a = pt(5, 10);
        const b = pt(5, 10);
        const c = pt(5, 11);

        expect(VectorUtils.isEqual(a, b)).toBe(true);
        expect(VectorUtils.isEqual(a, c)).toBe(false);
      });
    });

    describe("GeometryUtils", () => {
      it("should contain all geometry utility functions", () => {
        expect(typeof GeometryUtils.between).toBe("function");
        expect(typeof GeometryUtils.within).toBe("function");
        expect(typeof GeometryUtils.farPt).toBe("function");
        expect(typeof GeometryUtils.allPts).toBe("function");
        expect(typeof GeometryUtils.anyPtsWithin).toBe("function");
        expect(typeof GeometryUtils.collides).toBe("function");
        expect(typeof GeometryUtils.isOutOfBounds).toBe("function");
        expect(typeof GeometryUtils.getHeroCollisionBounds).toBe("function");
      });
    });

    describe("PhysicsUtils", () => {
      it("should contain all physics utility functions and objects", () => {
        expect(PhysicsUtils.Vector).toBe(VectorUtils);
        expect(PhysicsUtils.Geometry).toBe(GeometryUtils);
        expect(typeof PhysicsUtils.pt).toBe("function");
        expect(typeof PhysicsUtils.collides).toBe("function");
      });
    });
  });
});
