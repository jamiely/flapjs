// Game Configuration Module
// All constants and configuration values for the Flappy Bird game

// Game dimensions and scaling
export const ORIGINAL_WIDTH = 500;    // Original game width for scaling reference
export const ORIGINAL_HEIGHT = 200;   // Original game height for scaling reference

// Physics constants
export const GRAVITY_FAC = 15;                    // Gravity multiplier factor
export const GRAVITY = 20 * GRAVITY_FAC;          // Downward acceleration force
export const JUMP_VEL = -0.8 * GRAVITY;           // Upward velocity when jumping/flapping
export const HERO_SPEED = 80;                     // Hero's constant horizontal velocity

// Pipe configuration
export const PIPE_WID = 50;           // Width of each pipe
export const PIPE_PAD = PIPE_WID * 4; // Horizontal spacing between pipes
export const PIPE_BUF = 20;           // Maximum number of pipes to maintain
export const PIPE_START_X = 200;      // Minimum distance pipes must spawn ahead of hero

// Rendering and boundaries
export const TOP = 0;                           // Top boundary of game area
export const RENDER_X = 60;                     // Fixed x position where hero is rendered

// Default initials for high scores
export const DEFAULT_INITIALS = 'WIN';

// Scaling state object - this will be updated dynamically
export const scaling = {
  SCALE_X: (typeof window !== 'undefined' ? window.innerWidth : 500) / ORIGINAL_WIDTH,
  SCALE_Y: (typeof window !== 'undefined' ? window.innerHeight : 200) / ORIGINAL_HEIGHT,
  BOTTOM: typeof window !== 'undefined' ? window.innerHeight : 200
};

// Legacy exports for backwards compatibility
export let SCALE_X = scaling.SCALE_X;
export let SCALE_Y = scaling.SCALE_Y;
export let BOTTOM = scaling.BOTTOM;

// Function to update scaling factors (called when window resizes)
export function updateScaling() {
  if (typeof window !== 'undefined') {
    scaling.SCALE_X = window.innerWidth / ORIGINAL_WIDTH;
    scaling.SCALE_Y = window.innerHeight / ORIGINAL_HEIGHT;
    scaling.BOTTOM = window.innerHeight;
    
    // Update legacy exports
    SCALE_X = scaling.SCALE_X;
    SCALE_Y = scaling.SCALE_Y;
    BOTTOM = scaling.BOTTOM;
  }
  return scaling;
}

// Export all constants as a single object for convenience
export const CONFIG = {
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
  DEFAULT_INITIALS
};