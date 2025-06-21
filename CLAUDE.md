# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript implementation of a Flappy Bird-style game created as a several-hour project. The entire game is contained within a single HTML file with embedded JavaScript.

## Running the Game

Open `index.html` in a web browser. The game has been tested on Chrome, Safari, and Firefox.

## Code Architecture

The game is implemented as a single-file JavaScript application using an immediately invoked function expression (IIFE) pattern. All game logic is contained within `index.html` starting at line 12.

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
