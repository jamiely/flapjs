# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript implementation of a Flappy Bird-style game created as a several-hour project. The entire game is contained within a single HTML file with embedded JavaScript.

## Running the Game

Open `index.html` in a web browser. The game has been tested on Chrome, Safari, and Firefox.

## Code Architecture

The game has been refactored from a single-file implementation into a modular JavaScript application. The entry point is `src/main.js` which imports and calls the main `setup()` function from `src/setup.js`. The codebase is organized into the following modules:

- `src/main.js`: Entry point that calls setup on DOM ready
- `src/setup.js`: Main initialization and game setup logic
- `src/gamestate.js`: Game state management
- `src/tick.js`: Game loop and physics updates
- `src/draw.js`: Canvas rendering functions
- `src/screens.js`: Game screen management (title, instructions, game over)
- `src/eventHandlers.js`: Input handling and event listeners
- `src/animationFunction.js`: Animation frame management
- `src/worldgen.js`: World generation (clouds, skyline)
- `src/score.js`: Score tracking and high score management

### Key Components

- **Game State**: Managed through a single game object containing hero and pipes arrays
- **Physics**: Gravity-based movement with jump mechanics using requestAnimationFrame
- **Collision Detection**: Point-based collision system between hero and pipe entities
- **Rendering**: HTML5 Canvas-based rendering with fixed hero position and scrolling pipes
- **Pipe Generation**: Dynamic pipe generation with randomized hole positions

### Core Functions

- `newGame()`: Initializes game state with hero and pipe objects
- `tick(game, delta)`: Updates game physics and state each frame
- `render(game, canvas)`: Draws the current game state to canvas
- `collides(a, b)`: Handles collision detection between entities
- `handlePipes(game)`: Manages pipe cleanup and generation

### Game Controls

- SPACE: Jump/flap
- P: Pause/unpause

The game uses a coordinate system where (0,0) is top-left, with gravity pulling the hero downward and pipes moving from right to left relative to the hero's fixed render position.

## Testing

The project includes a comprehensive test suite with 298 tests covering all modules:

### Running Tests

```bash
# Install dependencies (if not already done)
npm install

# Run all tests once
npm run test:run

# Run tests in watch mode for development
npm test

# Run tests for a specific module
npm run test:run src/[module].test.js
```

### Test Framework

- **Framework**: Vitest (modern, fast test runner)
- **Mocking**: Comprehensive mocking of DOM, Web APIs, and module dependencies
- **Coverage**: 100% function coverage across all JavaScript modules
- **Patterns**: Consistent testing patterns across all test files

### Test Files

All source modules have corresponding test files:

- `src/animationFunction.test.js` - Animation loop and render timing (11 tests)
- `src/config.test.js` - Game configuration and scaling (11 tests)
- `src/draw.test.js` - Canvas rendering and drawing functions (17 tests)
- `src/eventHandlers.test.js` - Input event handling (17 tests)
- `src/gamestate.test.js` - Game state and entity management (35 tests)
- `src/physics.test.js` - Physics calculations and collision detection (36 tests)
- `src/score.test.js` - High score system and localStorage (27 tests)
- `src/screens.test.js` - Screen management and transitions (42 tests)
- `src/sound.test.js` - Web Audio API integration (28 tests)
- `src/tick.test.js` - Main game loop functionality (31 tests)
- `src/worldgen.test.js` - World generation systems (43 tests)

### Testing Guidelines

When modifying code:
1. Run the relevant test file to ensure no regressions
2. Add new tests for new functionality
3. Update existing tests if behavior changes
4. Ensure all tests pass before committing changes

The test suite provides confidence that changes don't break existing functionality and helps maintain code quality.
