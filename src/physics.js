// Physics and Math Utilities Module
// Pure functions for physics calculations, geometry, and collision detection

// Point creation utility
export function pt(x, y) {
  return { x: x, y: y };
}

// Point addition (immutable - creates new point)
export function addPt(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
}

// Point addition (mutable - modifies first parameter)
export function addToPt(a, b) {
  a.x += b.x;
  a.y += b.y;
  return a;
}

// Range checking utility - checks if b is between a and c
export function between(b, a, c) {
  return (a < b && b <= c) || (a >= b && b > c);
}

// Point-in-rectangle collision test
export function within(pt, b) {
  if (
    between(pt.x, b.pos.x, b.pos.x + b.size.width) &&
    between(pt.y, b.pos.y, b.pos.y + b.size.height)
  )
    return true;

  return false;
}

// Get the far corner point (bottom-right) of an entity
export function farPt(ent) {
  return {
    x: ent.pos.x + ent.size.width,
    y: ent.pos.y + ent.size.height,
  };
}

// Get all four corner points of an entity
export function allPts(ent) {
  return [
    pt(0, 0),
    pt(ent.size.width, 0),
    pt(0, ent.size.height),
    pt(ent.size.width, ent.size.height),
  ].map(function (d) {
    return addPt(ent.pos, d);
  });
}

// Check if any corner points of entity a are within entity b
export function anyPtsWithin(a, b) {
  var allPtsA = allPts(a);
  for (var i = 0; i < allPtsA.length; i++) {
    if (within(allPtsA[i], b)) return true;
  }
  return false;
}

// Create smaller collision bounds for hero (60% of visual size, centered)
export function getHeroCollisionBounds(hero) {
  // Create a smaller collision box (60% of visual size, centered)
  var collisionScale = 0.6;
  var visualW = hero.size.width;
  var visualH = hero.size.height;
  var collisionW = visualW * collisionScale;
  var collisionH = visualH * collisionScale;

  return {
    pos: {
      x: hero.pos.x + (visualW - collisionW) / 2,
      y: hero.pos.y + (visualH - collisionH) / 2,
    },
    size: {
      width: collisionW,
      height: collisionH,
    },
  };
}

// Main collision detection between two entities
export function collides(a, b) {
  // Use smaller collision bounds for hero
  var heroCollisionBounds = getHeroCollisionBounds(a);
  if (anyPtsWithin(heroCollisionBounds, b)) return true;
  if (anyPtsWithin(b, heroCollisionBounds)) return true;

  return false;
}

// Boundary checking utility that takes boundary as parameter (pure version)
export function isOutOfBounds(entity, boundary) {
  return entity.pos.y > boundary;
}

// Vector/point utilities
export const VectorUtils = {
  create: pt,
  add: addPt,
  addTo: addToPt,
  isEqual: function (a, b) {
    return a.x === b.x && a.y === b.y;
  },
  distance: function (a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  magnitude: function (v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },
};

// Geometry utilities
export const GeometryUtils = {
  between: between,
  within: within,
  farPt: farPt,
  allPts: allPts,
  anyPtsWithin: anyPtsWithin,
  collides: collides,
  isOutOfBounds: isOutOfBounds,
  getHeroCollisionBounds: getHeroCollisionBounds,
};

// Export all utilities as a single object for convenience
export const PhysicsUtils = {
  Vector: VectorUtils,
  Geometry: GeometryUtils,
  pt: pt,
  addPt: addPt,
  addToPt: addToPt,
  between: between,
  within: within,
  farPt: farPt,
  allPts: allPts,
  anyPtsWithin: anyPtsWithin,
  collides: collides,
  isOutOfBounds: isOutOfBounds,
  getHeroCollisionBounds: getHeroCollisionBounds,
};
