import { scaling } from "./config.js";

export function generateClouds() {
  var clouds = [];
  var numClouds = 8;
  var viewportHeight = window.innerHeight;
  var viewportWidth = window.innerWidth;

  // Define cloud color options - various shades of white and light blue
  var cloudColors = [
    "#FFFFFF", // Pure white
    "#F8F8FF", // Ghost white
    "#F0F8FF", // Alice blue
    "#E6F3FF", // Very light blue
    "#F5F5F5", // White smoke
    "#FFFAFA", // Snow white
    "#F0FFFF", // Azure
    "#E0F6FF", // Light cyan
    "#F7F7F7", // Very light gray
    "#E8F4F8", // Very light blue-gray
  ];

  for (var i = 0; i < numClouds; i++) {
    // Much more varied size range - from tiny to huge clouds
    var sizeVariation = Math.random();
    var baseSize;

    if (sizeVariation < 0.3) {
      // Small clouds (30% chance)
      baseSize = Math.random() * 20 + 8;
    } else if (sizeVariation < 0.7) {
      // Medium clouds (40% chance)
      baseSize = Math.random() * 40 + 25;
    } else {
      // Large clouds (30% chance)
      baseSize = Math.random() * 80 + 45;
    }

    clouds.push({
      x:
        Math.random() * (viewportWidth + 200 * scaling.SCALE_X) -
        100 * scaling.SCALE_X,
      y: Math.random() * (viewportHeight * 0.5) + 10 * scaling.SCALE_Y, // Slightly more vertical range
      size: baseSize * Math.min(scaling.SCALE_X, scaling.SCALE_Y),
      speed: Math.random() * 0.4 + 0.05, // Varied speed between 0.05-0.45
      opacity: Math.random() * 0.5 + 0.25, // Opacity between 0.25-0.75
      color: cloudColors[Math.floor(Math.random() * cloudColors.length)], // Random color
      // Add shape variation properties
      puffiness: Math.random() * 0.5 + 0.5, // How puffy the cloud is (0.5-1.0)
      stretch: Math.random() * 0.4 + 0.8, // Horizontal stretch factor (0.8-1.2)
    });
  }

  return clouds;
}

export function generateForegroundClouds() {
  var clouds = [];
  var numClouds = 4; // Fewer foreground clouds to not obstruct gameplay
  var viewportHeight = window.innerHeight;
  var viewportWidth = window.innerWidth;

  // Use lighter colors for foreground clouds
  var cloudColors = [
    "#FFFFFF", // Pure white
    "#F8F8FF", // Ghost white
    "#F0F8FF", // Alice blue
    "#F5F5F5", // White smoke
    "#FFFAFA", // Snow white
  ];

  for (var i = 0; i < numClouds; i++) {
    // Larger clouds for foreground to create better depth effect
    var sizeVariation = Math.random();
    var baseSize;

    if (sizeVariation < 0.4) {
      // Medium clouds (40% chance)
      baseSize = Math.random() * 60 + 40;
    } else {
      // Large clouds (60% chance)
      baseSize = Math.random() * 120 + 60;
    }

    clouds.push({
      x:
        Math.random() * (viewportWidth + 300 * scaling.SCALE_X) -
        150 * scaling.SCALE_X,
      y: Math.random() * viewportHeight, // Can appear anywhere vertically
      size: baseSize * Math.min(scaling.SCALE_X, scaling.SCALE_Y),
      speed: Math.random() * 0.2 + 0.1, // Slower speed for foreground (0.1-0.3)
      opacity: Math.random() * 0.1 + 0.05, // Very light opacity (0.05-0.15)
      color: cloudColors[Math.floor(Math.random() * cloudColors.length)],
      // Add shape variation properties
      puffiness: Math.random() * 0.3 + 0.7, // More puffy for foreground (0.7-1.0)
      stretch: Math.random() * 0.6 + 0.8, // More stretched (0.8-1.4)
    });
  }

  return clouds;
}

export function generateSkyline() {
  var buildings = [];
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var groundLevel = viewportHeight; // Buildings touch the bottom of the viewport

  var numBuildings = Math.floor(viewportWidth / (40 * scaling.SCALE_X)) + 2; // Buildings every ~40 scaled pixels
  var currentX = -50 * scaling.SCALE_X; // Start slightly off-screen

  for (var i = 0; i < numBuildings; i++) {
    var buildingWidth = (Math.random() * 60 + 30) * scaling.SCALE_X; // Width between 30-90 scaled pixels

    // Create different building height categories
    var heightVariation = Math.random();
    var buildingHeight;

    if (heightVariation < 0.6) {
      // Short buildings (60% chance)
      buildingHeight = (Math.random() * 60 + 20) * scaling.SCALE_Y; // Height between 20-80 scaled pixels
    } else if (heightVariation < 0.85) {
      // Medium buildings (25% chance)
      buildingHeight = (Math.random() * 120 + 80) * scaling.SCALE_Y; // Height between 80-200 scaled pixels
    } else {
      // Tall skyscrapers (15% chance)
      buildingHeight = (Math.random() * 200 + 150) * scaling.SCALE_Y; // Height between 150-350 scaled pixels
      // Make skyscrapers a bit narrower
      buildingWidth = buildingWidth * (Math.random() * 0.4 + 0.6); // 60-100% of original width
    }

    // Generate muted colors with sky blue undertones
    var colorOptions = [
      "#3F4147", // Muted dark gray with blue undertone
      "#4B4D52", // Muted medium gray with blue undertone
      "#5A4741", // Muted dark brown with blue undertone
      "#6B5D56", // Muted light brown with blue undertone
      "#525459", // Muted gray with blue undertone
      "#4A5451", // Muted olive gray with blue undertone
      "#3A4C4C", // Muted slate gray with blue undertone
      "#504C49", // Muted brownish gray with blue undertone
    ];

    buildings.push({
      x: currentX,
      y: groundLevel - buildingHeight,
      width: buildingWidth,
      height: buildingHeight,
      color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      // Add some building details
      windows: Math.random() > 0.3, // 70% chance of having windows
      antenna: Math.random() > 0.7, // 30% chance of having antenna
      speed: 0.4 + Math.random() * 0.2, // Speed between 0.4-0.6 for parallax
    });

    currentX += buildingWidth + (Math.random() * 20 + 5) * scaling.SCALE_X; // Small gap between buildings
  }

  return buildings;
}

export function updateClouds(game, delta) {
  // Only update clouds if game is playing and not paused
  if (game.state !== "playing" || game.pause || game.isGameOver) {
    return;
  }

  // Update cloud positions based on hero's movement and their own speed
  var heroSpeed = game.hero.vel.x * delta;

  for (var i = 0; i < game.clouds.length; i++) {
    var cloud = game.clouds[i];
    // Move clouds relative to hero movement (parallax effect)
    cloud.x -= heroSpeed * cloud.speed;

    // Reset cloud position if it goes off screen
    if (cloud.x < -cloud.size - 50 * scaling.SCALE_X) {
      cloud.x = window.innerWidth + Math.random() * 100 * scaling.SCALE_X;
      cloud.y =
        Math.random() * (window.innerHeight * 0.5) + 10 * scaling.SCALE_Y;

      // Regenerate varied size
      var sizeVariation = Math.random();
      var baseSize;
      if (sizeVariation < 0.3) {
        baseSize = Math.random() * 20 + 8; // Small clouds
      } else if (sizeVariation < 0.7) {
        baseSize = Math.random() * 40 + 25; // Medium clouds
      } else {
        baseSize = Math.random() * 80 + 45; // Large clouds
      }
      cloud.size = baseSize * Math.min(scaling.SCALE_X, scaling.SCALE_Y);

      cloud.speed = Math.random() * 0.4 + 0.05;
      cloud.opacity = Math.random() * 0.5 + 0.25;

      // Regenerate color and shape properties
      var cloudColors = [
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
      cloud.color = cloudColors[Math.floor(Math.random() * cloudColors.length)];
      cloud.puffiness = Math.random() * 0.5 + 0.5;
      cloud.stretch = Math.random() * 0.4 + 0.8;
    }
  }
}

export function updateForegroundClouds(game, delta) {
  // Only update clouds if game is playing and not paused
  if (game.state !== "playing" || game.pause || game.isGameOver) {
    return;
  }

  // Update foreground cloud positions based on hero's movement and their own speed
  var heroSpeed = game.hero.vel.x * delta;

  for (var i = 0; i < game.foregroundClouds.length; i++) {
    var cloud = game.foregroundClouds[i];
    // Move clouds relative to hero movement (parallax effect - slower for foreground)
    cloud.x -= heroSpeed * cloud.speed;

    // Reset cloud position if it goes off screen
    if (cloud.x < -cloud.size - 100 * scaling.SCALE_X) {
      cloud.x = window.innerWidth + Math.random() * 200 * scaling.SCALE_X;
      cloud.y = Math.random() * window.innerHeight;

      // Regenerate varied size for foreground
      var sizeVariation = Math.random();
      var baseSize;
      if (sizeVariation < 0.4) {
        baseSize = Math.random() * 60 + 40; // Medium clouds
      } else {
        baseSize = Math.random() * 120 + 60; // Large clouds
      }
      cloud.size = baseSize * Math.min(scaling.SCALE_X, scaling.SCALE_Y);

      cloud.speed = Math.random() * 0.2 + 0.1;
      cloud.opacity = Math.random() * 0.1 + 0.05; // Very light opacity

      // Regenerate color and shape properties for foreground
      var cloudColors = ["#FFFFFF", "#F8F8FF", "#F0F8FF", "#F5F5F5", "#FFFAFA"];
      cloud.color = cloudColors[Math.floor(Math.random() * cloudColors.length)];
      cloud.puffiness = Math.random() * 0.3 + 0.7;
      cloud.stretch = Math.random() * 0.6 + 0.8;
    }
  }
}

export function updateSkyline(game, delta) {
  // Only update skyline if game is playing and not paused
  if (game.state !== "playing" || game.pause || game.isGameOver) {
    return;
  }

  // Update building positions based on hero's movement and parallax speed
  var heroSpeed = game.hero.vel.x * delta;

  for (var i = 0; i < game.skyline.length; i++) {
    var building = game.skyline[i];
    // Move buildings relative to hero movement (parallax effect - slower than hero)
    building.x -= heroSpeed * building.speed;

    // Reset building position if it goes off screen
    if (building.x + building.width < -100 * scaling.SCALE_X) {
      // Find the rightmost building to place new one after it
      var rightmostX = building.x;
      for (var j = 0; j < game.skyline.length; j++) {
        if (game.skyline[j].x + game.skyline[j].width > rightmostX) {
          rightmostX = game.skyline[j].x + game.skyline[j].width;
        }
      }

      var viewportHeight = window.innerHeight;
      var groundLevel = viewportHeight;
      var buildingWidth = (Math.random() * 60 + 30) * scaling.SCALE_X;

      // Create different building height categories (same as generateSkyline)
      var heightVariation = Math.random();
      var buildingHeight;

      if (heightVariation < 0.6) {
        // Short buildings (60% chance)
        buildingHeight = (Math.random() * 60 + 20) * scaling.SCALE_Y;
      } else if (heightVariation < 0.85) {
        // Medium buildings (25% chance)
        buildingHeight = (Math.random() * 120 + 80) * scaling.SCALE_Y;
      } else {
        // Tall skyscrapers (15% chance)
        buildingHeight = (Math.random() * 200 + 150) * scaling.SCALE_Y;
        // Make skyscrapers a bit narrower
        buildingWidth = buildingWidth * (Math.random() * 0.4 + 0.6);
      }

      // Generate muted colors with sky blue undertones for new buildings
      var colorOptions = [
        "#3F4147", // Muted dark gray with blue undertone
        "#4B4D52", // Muted medium gray with blue undertone
        "#5A4741", // Muted dark brown with blue undertone
        "#6B5D56", // Muted light brown with blue undertone
        "#525459", // Muted gray with blue undertone
        "#4A5451", // Muted olive gray with blue undertone
        "#3A4C4C", // Muted slate gray with blue undertone
        "#504C49", // Muted brownish gray with blue undertone
      ];

      building.x = rightmostX + (Math.random() * 20 + 5) * scaling.SCALE_X;
      building.y = groundLevel - buildingHeight;
      building.width = buildingWidth;
      building.height = buildingHeight;
      building.color =
        colorOptions[Math.floor(Math.random() * colorOptions.length)];
      building.windows = Math.random() > 0.3;
      building.antenna = Math.random() > 0.7;
      building.speed = 0.4 + Math.random() * 0.2;
    }
  }
}
