import { 
  HERO_SPEED,
  RENDER_X,
  scaling,
  updateScaling,
} from './config.js';

import {
  generateClouds,
  generateForegroundClouds,
  generateSkyline,
  updateClouds,
  updateForegroundClouds,
  updateSkyline,
} from './worldgen.js';

export function drawHero(cxt, hero) {
  var x = RENDER_X * scaling.SCALE_X;
  var y = hero.pos.y;
  var w = hero.size.width;
  var h = hero.size.height;
  var centerX = x + w/2;
  var centerY = y + h/2;
  var radius = Math.min(w, h)/2;
  
  // Calculate rotation based on velocity
  var maxUpwardTilt = -0.5; // Maximum upward tilt (radians)
  var maxDownwardTilt = 0.8; // Maximum downward tilt (radians)
  var maxVelocity = 300; // Velocity at which max tilt is reached
  
  var rotation = Math.max(maxUpwardTilt, Math.min(maxDownwardTilt, hero.vel.y / maxVelocity * maxDownwardTilt));
  
  // Save context and apply rotation
  cxt.save();
  cxt.translate(centerX, centerY);
  cxt.rotate(rotation);
  cxt.translate(-centerX, -centerY);
  
  // Draw shadow
  cxt.fillStyle = 'rgba(0, 0, 0, 0.2)';
  cxt.beginPath();
  cxt.arc(centerX + 3, centerY + 3, radius * 1.1, 0, 2 * Math.PI);
  cxt.fill();
  
  // Draw main body with enhanced gradient
  var bodyGradient = cxt.createRadialGradient(centerX - radius * 0.4, centerY - radius * 0.4, 0, centerX, centerY, radius * 1.2);
  bodyGradient.addColorStop(0, '#FFF59D'); // Very light yellow
  bodyGradient.addColorStop(0.3, '#FFEE58'); // Light yellow
  bodyGradient.addColorStop(0.7, '#FFD54F'); // Golden yellow
  bodyGradient.addColorStop(1, '#FFC107'); // Deep golden
  
  cxt.fillStyle = bodyGradient;
  cxt.beginPath();
  cxt.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  cxt.fill();
  
  // Add body outline
  cxt.strokeStyle = '#FF8F00';
  cxt.lineWidth = 2;
  cxt.beginPath();
  cxt.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  cxt.stroke();
  
  // Draw belly with gradient
  var bellyGradient = cxt.createRadialGradient(centerX, centerY + radius * 0.3, 0, centerX, centerY + radius * 0.3, radius * 0.6);
  bellyGradient.addColorStop(0, '#FFF8E1'); // Very light cream
  bellyGradient.addColorStop(1, '#FFECB3'); // Light cream
  
  cxt.fillStyle = bellyGradient;
  cxt.beginPath();
  cxt.arc(centerX, centerY + radius * 0.3, radius * 0.5, 0, 2 * Math.PI);
  cxt.fill();
  
  // Draw cheek blush with gradient
  var blushGradient = cxt.createRadialGradient(centerX - radius * 0.4, centerY + radius * 0.2, 0, centerX - radius * 0.4, centerY + radius * 0.2, radius * 0.25);
  blushGradient.addColorStop(0, 'rgba(255, 182, 193, 0.6)');
  blushGradient.addColorStop(1, 'rgba(255, 182, 193, 0.1)');
  
  cxt.fillStyle = blushGradient;
  cxt.beginPath();
  cxt.arc(centerX - radius * 0.4, centerY + radius * 0.2, radius * 0.2, 0, 2 * Math.PI);
  cxt.fill();
  
  // Draw enhanced beak with gradient and highlight
  var beakGradient = cxt.createLinearGradient(centerX + radius * 0.6, centerY - radius * 0.15, centerX + radius * 1.1, centerY + radius * 0.15);
  beakGradient.addColorStop(0, '#FF9800'); // Bright orange
  beakGradient.addColorStop(0.5, '#FF7043'); // Orange-red
  beakGradient.addColorStop(1, '#FF5722'); // Deep orange-red
  
  cxt.fillStyle = beakGradient;
  cxt.beginPath();
  cxt.moveTo(centerX + radius * 0.6, centerY - radius * 0.15);
  cxt.lineTo(centerX + radius * 1.1, centerY);
  cxt.lineTo(centerX + radius * 0.6, centerY + radius * 0.15);
  cxt.closePath();
  cxt.fill();
  
  // Add beak highlight
  cxt.fillStyle = '#FFB74D';
  cxt.beginPath();
  cxt.moveTo(centerX + radius * 0.6, centerY - radius * 0.15);
  cxt.lineTo(centerX + radius * 0.9, centerY - radius * 0.05);
  cxt.lineTo(centerX + radius * 0.6, centerY);
  cxt.closePath();
  cxt.fill();
  
  // Draw enhanced eyes with more detail
  // Left eye white base with gradient
  var eyeGradient = cxt.createRadialGradient(centerX + radius * 0.2, centerY - radius * 0.25, 0, centerX + radius * 0.2, centerY - radius * 0.25, radius * 0.25);
  eyeGradient.addColorStop(0, '#FFFFFF');
  eyeGradient.addColorStop(1, '#F5F5F5');
  
  cxt.fillStyle = eyeGradient;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.2, centerY - radius * 0.25, radius * 0.25, 0, 2 * Math.PI);
  cxt.fill();
  
  // Left eye outline
  cxt.strokeStyle = '#E0E0E0';
  cxt.lineWidth = 1;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.2, centerY - radius * 0.25, radius * 0.25, 0, 2 * Math.PI);
  cxt.stroke();
  
  // Left eye pupil with gradient
  var pupilGradient = cxt.createRadialGradient(centerX + radius * 0.25, centerY - radius * 0.2, 0, centerX + radius * 0.25, centerY - radius * 0.2, radius * 0.12);
  pupilGradient.addColorStop(0, '#1A1A1A');
  pupilGradient.addColorStop(1, '#000000');
  
  cxt.fillStyle = pupilGradient;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.25, centerY - radius * 0.2, radius * 0.12, 0, 2 * Math.PI);
  cxt.fill();
  
  // Left eye sparkles (multiple)
  cxt.fillStyle = 'white';
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.3, centerY - radius * 0.3, radius * 0.06, 0, 2 * Math.PI);
  cxt.fill();
  
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.28, centerY - radius * 0.15, radius * 0.03, 0, 2 * Math.PI);
  cxt.fill();
  
  // Right eye (smaller, similar treatment)
  var rightEyeGradient = cxt.createRadialGradient(centerX + radius * 0.5, centerY - radius * 0.35, 0, centerX + radius * 0.5, centerY - radius * 0.35, radius * 0.15);
  rightEyeGradient.addColorStop(0, '#FFFFFF');
  rightEyeGradient.addColorStop(1, '#F5F5F5');
  
  cxt.fillStyle = rightEyeGradient;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.5, centerY - radius * 0.35, radius * 0.15, 0, 2 * Math.PI);
  cxt.fill();
  
  // Right eye outline
  cxt.strokeStyle = '#E0E0E0';
  cxt.lineWidth = 1;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.5, centerY - radius * 0.35, radius * 0.15, 0, 2 * Math.PI);
  cxt.stroke();
  
  // Right eye pupil
  cxt.fillStyle = pupilGradient;
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.52, centerY - radius * 0.32, radius * 0.08, 0, 2 * Math.PI);
  cxt.fill();
  
  // Right eye sparkle
  cxt.fillStyle = 'white';
  cxt.beginPath();
  cxt.arc(centerX + radius * 0.56, centerY - radius * 0.38, radius * 0.04, 0, 2 * Math.PI);
  cxt.fill();
  
  // Draw enhanced wing with gradient and feather details
  var wingGradient = cxt.createLinearGradient(centerX - radius * 1.2, centerY, centerX + radius * 0.2, centerY + radius * 0.8);
  wingGradient.addColorStop(0, '#FFB74D'); // Light orange
  wingGradient.addColorStop(0.3, '#FF9800'); // Orange
  wingGradient.addColorStop(0.7, '#FF7043'); // Orange-red
  wingGradient.addColorStop(1, '#FF5722'); // Deep orange-red
  
  cxt.fillStyle = wingGradient;
  cxt.beginPath();
  cxt.ellipse(centerX - radius * 0.6, centerY + radius * 0.4, radius * 1.0, radius * 0.5, -0.3, 0, 2 * Math.PI);
  cxt.fill();
  
  // Add wing outline
  cxt.strokeStyle = '#E65100';
  cxt.lineWidth = 2;
  cxt.beginPath();
  cxt.ellipse(centerX - radius * 0.6, centerY + radius * 0.4, radius * 1.0, radius * 0.5, -0.3, 0, 2 * Math.PI);
  cxt.stroke();
  
  // Add feather details on wing
  cxt.strokeStyle = '#D84315';
  cxt.lineWidth = 1.5;
  for (var i = 0; i < 4; i++) {
    var featherAngle = -0.3 + (i * 0.15);
    var startX = centerX - radius * 0.6 + Math.cos(featherAngle) * radius * 0.5;
    var startY = centerY + radius * 0.4 + Math.sin(featherAngle) * radius * 0.2;
    var endX = startX + Math.cos(featherAngle) * radius * 0.6;
    var endY = startY + Math.sin(featherAngle) * radius * 0.3;
    
    cxt.beginPath();
    cxt.moveTo(startX, startY);
    cxt.lineTo(endX, endY);
    cxt.stroke();
  }
  
  // Add small tail feathers
  var tailGradient = cxt.createRadialGradient(centerX - radius * 0.8, centerY + radius * 0.2, 0, centerX - radius * 0.8, centerY + radius * 0.2, radius * 0.3);
  tailGradient.addColorStop(0, '#FF7043');
  tailGradient.addColorStop(1, '#FF5722');
  
  cxt.fillStyle = tailGradient;
  for (var i = 0; i < 3; i++) {
    var tailAngle = 0.3 + (i * 0.2);
    var tailX = centerX - radius * 0.9 + Math.cos(tailAngle) * radius * 0.2;
    var tailY = centerY + radius * 0.3 + Math.sin(tailAngle) * radius * 0.1;
    
    cxt.beginPath();
    cxt.ellipse(tailX, tailY, radius * 0.15, radius * 0.08, tailAngle, 0, 2 * Math.PI);
    cxt.fill();
  }
  
  // Restore context
  cxt.restore();
}

export function drawCloud(cxt, cloud) {
  var x = cloud.x;
  var y = cloud.y;
  var size = cloud.size;
  var puffiness = cloud.puffiness;
  var stretch = cloud.stretch;
  
  // Create an off-screen canvas for the cloud
  var cloudCanvas = document.createElement('canvas');
  var cloudBounds = size * Math.max(stretch, puffiness) * 2;
  cloudCanvas.width = cloudBounds;
  cloudCanvas.height = cloudBounds;
  var cloudCtx = cloudCanvas.getContext('2d');
  
  // Offset for drawing on the cloud canvas (center the cloud)
  var offsetX = cloudBounds / 2;
  var offsetY = cloudBounds / 2;
  
  // Draw cloud on off-screen canvas with solid color
  cloudCtx.fillStyle = cloud.color;
  
  // Draw cloud as multiple overlapping circles
  // Main body - larger and affected by stretch
  cloudCtx.beginPath();
  cloudCtx.arc(offsetX, offsetY, size * 0.5 * puffiness, 0, 2 * Math.PI);
  cloudCtx.fill();
  
  // Side puffs - affected by stretch and puffiness
  cloudCtx.beginPath();
  cloudCtx.arc(offsetX + size * 0.4 * stretch, offsetY, size * 0.4 * puffiness, 0, 2 * Math.PI);
  cloudCtx.fill();
  
  cloudCtx.beginPath();
  cloudCtx.arc(offsetX - size * 0.4 * stretch, offsetY, size * 0.4 * puffiness, 0, 2 * Math.PI);
  cloudCtx.fill();
  
  // Top puffs - more varied positioning
  cloudCtx.beginPath();
  cloudCtx.arc(offsetX + size * 0.2 * stretch, offsetY - size * 0.3 * puffiness, size * 0.35 * puffiness, 0, 2 * Math.PI);
  cloudCtx.fill();
  
  cloudCtx.beginPath();
  cloudCtx.arc(offsetX - size * 0.2 * stretch, offsetY - size * 0.3 * puffiness, size * 0.35 * puffiness, 0, 2 * Math.PI);
  cloudCtx.fill();
  
  // Add extra puffs for larger clouds
  if (size > 40) {
    cloudCtx.beginPath();
    cloudCtx.arc(offsetX + size * 0.1, offsetY + size * 0.2, size * 0.25 * puffiness, 0, 2 * Math.PI);
    cloudCtx.fill();
    
    cloudCtx.beginPath();
    cloudCtx.arc(offsetX - size * 0.1, offsetY + size * 0.2, size * 0.25 * puffiness, 0, 2 * Math.PI);
    cloudCtx.fill();
  }
  
  // Add even more puffs for very large clouds
  if (size > 70) {
    cloudCtx.beginPath();
    cloudCtx.arc(offsetX + size * 0.6 * stretch, offsetY - size * 0.1, size * 0.3 * puffiness, 0, 2 * Math.PI);
    cloudCtx.fill();
    
    cloudCtx.beginPath();
    cloudCtx.arc(offsetX - size * 0.6 * stretch, offsetY - size * 0.1, size * 0.3 * puffiness, 0, 2 * Math.PI);
    cloudCtx.fill();
    
    cloudCtx.beginPath();
    cloudCtx.arc(offsetX, offsetY - size * 0.5 * puffiness, size * 0.2 * puffiness, 0, 2 * Math.PI);
    cloudCtx.fill();
  }
  
  // Now draw the entire cloud canvas to the main canvas with opacity
  cxt.save();
  cxt.globalAlpha = cloud.opacity;
  cxt.drawImage(cloudCanvas, x - offsetX, y - offsetY);
  cxt.restore();
}

export function drawBuilding(cxt, building) {
  var x = building.x;
  var y = building.y;
  var w = building.width;
  var h = building.height;
  
  // Draw building silhouette using its assigned color
  cxt.fillStyle = building.color;
  cxt.fillRect(x, y, w, h);
  
  // Add some subtle building details if the building has windows
  if (building.windows && w > 20 * scaling.SCALE_X) {
    // Make windows slightly lighter than the building color
    var windowColor = building.color === '#3F4147' ? '#4F5157' :
                      building.color === '#4B4D52' ? '#5B5D62' :
                      building.color === '#5A4741' ? '#6A5751' :
                      building.color === '#6B5D56' ? '#7B6D66' :
                      building.color === '#525459' ? '#626469' :
                      building.color === '#4A5451' ? '#5A6461' :
                      building.color === '#3A4C4C' ? '#4A5C5C' :
                      '#605C59'; // Default lighter for #504C49
    cxt.fillStyle = windowColor;
    
    // Draw simple window grid
    var windowSize = Math.max(2, w * 0.15);
    var windowSpacing = windowSize * 1.5;
    var startX = x + windowSpacing;
    var startY = y + windowSpacing;
    
    for (var row = startY; row < y + h - windowSize; row += windowSpacing) {
      for (var col = startX; col < x + w - windowSize; col += windowSpacing) {
        // Randomly skip some windows for variety
        if (Math.random() > 0.7) continue;
        cxt.fillRect(col, row, windowSize * 0.6, windowSize * 0.6);
      }
    }
  }
  
  // Add antenna if building has one
  if (building.antenna) {
    var antennaX = x + w * 0.5;
    var antennaHeight = h * 0.2;
    // Use the building color for antenna but slightly darker
    var antennaColor = building.color === '#3F4147' ? '#2F3137' :
                      building.color === '#4B4D52' ? '#3B3D42' :
                      building.color === '#5A4741' ? '#4A3731' :
                      building.color === '#6B5D56' ? '#5B4D46' :
                      building.color === '#525459' ? '#424449' :
                      building.color === '#4A5451' ? '#3A4441' :
                      building.color === '#3A4C4C' ? '#2A3C3C' :
                      '#403C39'; // Default darker for #504C49
    cxt.strokeStyle = antennaColor;
    cxt.lineWidth = Math.max(1, w * 0.02);
    cxt.beginPath();
    cxt.moveTo(antennaX, y);
    cxt.lineTo(antennaX, y - antennaHeight);
    cxt.stroke();
  }
}

export function drawPipe(cxt, pipe, adjX) {
  var x = pipe.pos.x - (adjX - RENDER_X * scaling.SCALE_X);
  var y = pipe.pos.y;
  var w = pipe.size.width;
  var h = pipe.size.height;
  
  // Extend pipes to full viewport height
  var isTopPipe = y === 0;
  var drawY = isTopPipe ? 0 : y;
  var drawHeight = isTopPipe ? y + h : window.innerHeight - y;
  
  // Draw pipe shadow/outline
  cxt.fillStyle = 'rgba(0, 0, 0, 0.3)';
  cxt.fillRect(x + 3, drawY + 2, w - 4, drawHeight);
  
  // Main pipe body with gradient
  var gradient = cxt.createLinearGradient(x, 0, x + w, 0);
  gradient.addColorStop(0, '#2E8B57'); // Sea green
  gradient.addColorStop(0.3, '#32CD32'); // Lime green
  gradient.addColorStop(0.7, '#228B22'); // Forest green
  gradient.addColorStop(1, '#006400'); // Dark green
  
  cxt.fillStyle = gradient;
  cxt.fillRect(x + 2, drawY, w - 4, drawHeight);
  
  // Add vertical texture lines
  cxt.strokeStyle = 'rgba(0, 100, 0, 0.3)';
  cxt.lineWidth = 1;
  for (var i = 0; i < 3; i++) {
    var lineX = x + w * (0.25 + i * 0.25);
    cxt.beginPath();
    cxt.moveTo(lineX, drawY);
    cxt.lineTo(lineX, drawY + drawHeight);
    cxt.stroke();
  }
  
  // Pipe cap (wider section at the gap)
  var capHeight = Math.min(25, h * 0.25);
  var capWidth = w + 8;
  var capX = x - 4;
  var capY = isTopPipe ? y + h - capHeight : y;
  
  // Draw pipe cap shadow
  cxt.fillStyle = 'rgba(0, 0, 0, 0.3)';
  cxt.fillRect(capX + 2, capY + 2, capWidth, capHeight);
  
  // Draw pipe cap with gradient
  var capGradient = cxt.createLinearGradient(capX, 0, capX + capWidth, 0);
  capGradient.addColorStop(0, '#3CB371'); // Medium sea green
  capGradient.addColorStop(0.5, '#32CD32'); // Lime green
  capGradient.addColorStop(1, '#228B22'); // Forest green
  
  cxt.fillStyle = capGradient;
  cxt.fillRect(capX, capY, capWidth, capHeight);
  
  // Add cap border
  cxt.strokeStyle = '#006400';
  cxt.lineWidth = 2;
  cxt.strokeRect(capX, capY, capWidth, capHeight);
  
  // Add highlight on the left side of pipe body
  var highlightGradient = cxt.createLinearGradient(x + 2, 0, x + 8, 0);
  highlightGradient.addColorStop(0, 'rgba(144, 238, 144, 0.8)'); // Light green
  highlightGradient.addColorStop(1, 'rgba(144, 238, 144, 0)');
  
  cxt.fillStyle = highlightGradient;
  cxt.fillRect(x + 2, drawY, 6, drawHeight);
  
  // Add highlight on pipe cap
  var capHighlightGradient = cxt.createLinearGradient(capX, 0, capX + 8, 0);
  capHighlightGradient.addColorStop(0, 'rgba(152, 251, 152, 0.9)'); // Pale green
  capHighlightGradient.addColorStop(1, 'rgba(152, 251, 152, 0)');
  
  cxt.fillStyle = capHighlightGradient;
  cxt.fillRect(capX, capY, 8, capHeight);
  
  // Add rivets/bolts on the cap
  cxt.fillStyle = '#2F4F2F'; // Dark slate gray
  var rivetSize = Math.max(2, w * 0.08);
  var rivetY = capY + capHeight / 2;
  
  // Left rivet
  cxt.beginPath();
  cxt.arc(capX + rivetSize + 2, rivetY, rivetSize, 0, 2 * Math.PI);
  cxt.fill();
  
  // Right rivet
  cxt.beginPath();
  cxt.arc(capX + capWidth - rivetSize - 2, rivetY, rivetSize, 0, 2 * Math.PI);
  cxt.fill();
  
  // Add rivet highlights
  cxt.fillStyle = '#696969'; // Dim gray
  cxt.beginPath();
  cxt.arc(capX + rivetSize + 2, rivetY - 1, rivetSize * 0.6, 0, 2 * Math.PI);
  cxt.fill();
  
  cxt.beginPath();
  cxt.arc(capX + capWidth - rivetSize - 2, rivetY - 1, rivetSize * 0.6, 0, 2 * Math.PI);
  cxt.fill();
}

export function render(game, canvas) {
  var cxt = canvas.getContext('2d');

  cxt.clearRect(0, 0, canvas.width, canvas.height);
  
  // Always draw skyline first (background layer)
  game.skyline.forEach(function(building) {
    drawBuilding(cxt, building);
  });
  
  // Always draw clouds, regardless of game state
  game.clouds.forEach(function(cloud) {
    drawCloud(cxt, cloud);
  });
  
  if (game.state === 'playing') {
    drawHero(cxt, game.hero);

    game.pipes.forEach(function(pipe) {
      drawPipe(cxt, pipe, game.hero.pos.x);
    });

    // Update score display
    var scoreElement = document.getElementById('scoreDisplay');
    scoreElement.textContent = game.score;
    scoreElement.style.display = 'block';
  } else {
    // Hide score when not playing
    document.getElementById('scoreDisplay').style.display = 'none';
  }
  
  // Always draw foreground clouds last (on top of everything)
  game.foregroundClouds.forEach(function(cloud) {
    drawCloud(cxt, cloud);
  });
}

// Creates the canvas
export function setupCanvas(game, parent, animationFunction) {
  var canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.style.cursor = 'none';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';
  
  // Make canvas fullscreen
  function resizeCanvas() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    
    // Set canvas to full viewport size
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    canvas.style.width = windowWidth + 'px';
    canvas.style.height = windowHeight + 'px';
    
    // Update game bounds
    updateGameBounds(game);
    
    // Update overlay sizes to match canvas
    updateOverlaySizes(windowWidth, windowHeight);
    
    // Request a render after resize (especially important during pause)
    if (animationFunction && animationFunction.requestRender) {
      animationFunction.requestRender();
    }
  }
  
  resizeCanvas();
  parent.appendChild(canvas);
  
  // Add resize listener
  window.addEventListener('resize', resizeCanvas);
  
  return canvas;
}

// Update scaling and bounds when window resizes
export function updateGameBounds(game) {
  var oldScaleX = scaling.SCALE_X;
  var oldScaleY = scaling.SCALE_Y;
  
  // Update scaling using the config module function
  updateScaling();
  
  // Update game elements if game exists
  if (game) {
    // Update hero size and position scaling
    game.hero.size = getScaledHeroSize();
    game.hero.vel.x = HERO_SPEED * scaling.SCALE_X; // Update horizontal velocity
    
    // Update existing pipes with new scaling
    var scaleRatioX = scaling.SCALE_X / oldScaleX;
    var scaleRatioY = scaling.SCALE_Y / oldScaleY;
    
    for (var i = 0; i < game.pipes.length; i++) {
      var pipe = game.pipes[i];
      // Scale pipe position and size
      pipe.pos.x *= scaleRatioX;
      pipe.pos.y *= scaleRatioY;
      pipe.size.width *= scaleRatioX;
      pipe.size.height *= scaleRatioY;
    }
    
    // Regenerate clouds and skyline with new scaling
    game.clouds = generateClouds();
    game.foregroundClouds = generateForegroundClouds();
    game.skyline = generateSkyline();
  }
}

function updateOverlaySizes(canvasWidth, canvasHeight) {
  // Overlays now take full window, but we still scale fonts based on canvas size
  var scaleFactor = Math.min(canvasWidth / 500, canvasHeight / 200);
  
  // Scale title screen
  var title = titleScreen.querySelector('h1');
  title.style.fontSize = (48 * scaleFactor) + 'px';
  
  var titleHighScore = document.getElementById('titleHighScore');
  titleHighScore.style.fontSize = (16 * scaleFactor) + 'px';
  document.getElementById('titleHighScoreValue').style.fontSize = (24 * scaleFactor) + 'px';
  document.getElementById('titleHighScoreInitials').style.fontSize = (14 * scaleFactor) + 'px';
  
  var startButton = document.getElementById('startButton');
  var instructionsButton = document.getElementById('instructionsButton');
  startButton.style.fontSize = (24 * scaleFactor) + 'px';
  startButton.style.padding = (15 * scaleFactor) + 'px ' + (30 * scaleFactor) + 'px';
  instructionsButton.style.fontSize = (24 * scaleFactor) + 'px';
  instructionsButton.style.padding = (15 * scaleFactor) + 'px ' + (30 * scaleFactor) + 'px';
  
  // Scale instructions screen
  var instructionsTitle = instructionsScreen.querySelector('h2');
  var instructionsList = instructionsScreen.querySelector('ul');
  var backButton = document.getElementById('backButton');
  
  instructionsTitle.style.fontSize = (24 * scaleFactor) + 'px';
  instructionsList.style.fontSize = (16 * scaleFactor) + 'px';
  backButton.style.fontSize = (18 * scaleFactor) + 'px';
  backButton.style.padding = (10 * scaleFactor) + 'px ' + (20 * scaleFactor) + 'px';
  
  // Scale game over screen
  var gameOverTitle = gameOverScreen.querySelector('h1');
  var newHighScoreMessage = document.getElementById('newHighScoreMessage');
  var gameOverHighScore = document.getElementById('gameOverHighScore');
  var restartButton = document.getElementById('restartButton');
  
  gameOverTitle.style.fontSize = (28 * scaleFactor) + 'px';
  newHighScoreMessage.style.fontSize = (18 * scaleFactor) + 'px';
  gameOverHighScore.style.fontSize = (14 * scaleFactor) + 'px';
  
  // Scale individual score entries in the high scores list
  var scoreEntries = gameOverHighScore.querySelectorAll('p');
  for (var i = 0; i < scoreEntries.length; i++) {
    if (i === 0) {
      // Title "High Scores"
      scoreEntries[i].style.fontSize = (14 * scaleFactor) + 'px';
    } else {
      // Individual score entries
      scoreEntries[i].style.fontSize = (12 * scaleFactor) + 'px';
    }
  }
  
  restartButton.style.fontSize = (20 * scaleFactor) + 'px';
  restartButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
  
  // Scale score display
  var scoreDisplay = document.getElementById('scoreDisplay');
  scoreDisplay.style.fontSize = (48 * scaleFactor) + 'px';
  scoreDisplay.style.top = (20 * scaleFactor) + 'px';
  scoreDisplay.style.right = (20 * scaleFactor) + 'px';
  
  // Scale initials screen
  var initialsScreen = document.getElementById('initialsScreen');
  var initialsTitle = initialsScreen.querySelector('h1');
  var initialsText = initialsScreen.querySelector('p');
  var initialsInput = document.getElementById('initialsInput');
  var submitButton = document.getElementById('submitInitials');
  var skipButton = document.getElementById('skipInitials');
  
  initialsTitle.style.fontSize = (32 * scaleFactor) + 'px';
  initialsText.style.fontSize = (18 * scaleFactor) + 'px';
  initialsInput.style.fontSize = (24 * scaleFactor) + 'px';
  initialsInput.style.padding = (10 * scaleFactor) + 'px ' + (15 * scaleFactor) + 'px';
  initialsInput.style.width = (150 * scaleFactor) + 'px';
  
  submitButton.style.fontSize = (20 * scaleFactor) + 'px';
  submitButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
  skipButton.style.fontSize = (20 * scaleFactor) + 'px';
  skipButton.style.padding = (12 * scaleFactor) + 'px ' + (24 * scaleFactor) + 'px';
}

// Helper function to get scaled hero size
export function getScaledHeroSize() {
  return {
    width: 15 * scaling.SCALE_X * 2, // Make hero twice as big
    height: 10 * scaling.SCALE_Y * 2 // Make hero twice as big
  };
}
