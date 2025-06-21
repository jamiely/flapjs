import { DEFAULT_INITIALS } from "./config.js";

// High Score Management
export function getHighScores() {
  try {
    var highScoresData = localStorage.getItem("flapjs_highscores");
    if (highScoresData) {
      return JSON.parse(highScoresData);
    }
  } catch (e) {
    console.log("Error reading high scores from localStorage");
  }

  // Initialize with default high scores if none exist
  var defaultScores = [
    { score: 50, initials: "ACE" },
    { score: 40, initials: "FLY" },
    { score: 25, initials: "SKY" },
    { score: 10, initials: DEFAULT_INITIALS },
    { score: 1, initials: "TRY" },
  ];

  // Save the default scores to localStorage
  try {
    localStorage.setItem("flapjs_highscores", JSON.stringify(defaultScores));
  } catch (e) {
    console.log("Error saving default high scores to localStorage");
  }

  return defaultScores;
}

export function getTopScore() {
  var scores = getHighScores();
  return scores.length > 0 ? scores[0] : { score: 0, initials: "" };
}

export function saveHighScore(score, initials) {
  try {
    var scores = getHighScores();
    var newEntry = { score: score, initials: initials || "" };

    // Add new score and sort by score (descending)
    scores.push(newEntry);
    scores.sort(function (a, b) {
      return b.score - a.score;
    });

    // Keep only top 5 scores
    scores = scores.slice(0, 5);

    localStorage.setItem("flapjs_highscores", JSON.stringify(scores));
    return true;
  } catch (e) {
    console.log("Error saving high scores to localStorage");
    return false;
  }
}

export function isNewHighScore(score) {
  var scores = getHighScores();
  return scores.length < 5 || score > scores[scores.length - 1].score;
}

export function promptForInitials(callback) {
  var initialsScreen = document.getElementById("initialsScreen");
  var initialsInput = document.getElementById("initialsInput");
  var submitButton = document.getElementById("submitInitials");
  var skipButton = document.getElementById("skipInitials");

  // Clear previous input and show screen
  initialsInput.value = "";
  initialsScreen.style.display = "flex";

  // Focus on input
  setTimeout(function () {
    initialsInput.focus();
  }, 100);

  // Handle submit
  function handleSubmit() {
    var initials = initialsInput.value.trim().substring(0, 5);
    if (!initials) {
      initials = DEFAULT_INITIALS;
    }
    initialsScreen.style.display = "none";
    callback(initials);
    cleanup();
  }

  // Handle skip
  function handleSkip() {
    initialsScreen.style.display = "none";
    callback(DEFAULT_INITIALS);
    cleanup();
  }

  // Handle enter key
  function handleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleSubmit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      handleSkip();
    }
  }

  // Cleanup export function to remove event listeners
  function cleanup() {
    submitButton.removeEventListener("click", handleSubmit);
    skipButton.removeEventListener("click", handleSkip);
    initialsInput.removeEventListener("keydown", handleKeyPress);
  }

  // Add event listeners
  submitButton.addEventListener("click", handleSubmit);
  skipButton.addEventListener("click", handleSkip);
  initialsInput.addEventListener("keydown", handleKeyPress);
}

export function updateHighScoreDisplay() {
  var topScore = getTopScore();

  // Update title screen (only top score)
  document.getElementById("titleHighScoreValue").textContent = topScore.score;
  document.getElementById("titleHighScoreInitials").textContent =
    topScore.initials;

  // Game over screen will be updated separately with player context
}

export function updateGameOverScoresList(playerScore, playerInitials) {
  var scores = getHighScores();
  var gameOverHighScore = document.getElementById("gameOverHighScore");

  if (scores.length === 0) {
    gameOverHighScore.innerHTML =
      '<p style="margin: 0;">No High Scores Yet</p>';
    return;
  }

  var html =
    '<p style="margin: 0; margin-bottom: 15px; font-weight: bold;">High Scores</p>';
  html +=
    '<div style="display: grid; grid-template-columns: minmax(100px, auto) auto minmax(100px, 1fr); gap: 0px 8px; font-family: monospace;">';

  var playerMadeList = false;
  var playerEntryIndex = -1;

  // Find the most recent player entry (should be the first match since scores are sorted by score desc)
  for (var i = 0; i < scores.length; i++) {
    if (
      scores[i].score === playerScore &&
      scores[i].initials === playerInitials
    ) {
      playerMadeList = true;
      playerEntryIndex = i;
      break;
    }
  }

  // Display the high score list with grid layout
  for (var i = 0; i < scores.length; i++) {
    var score = scores[i];
    var initialsText = score.initials || "";
    var isPlayerScore = i === playerEntryIndex; // Only highlight the specific entry

    var rowStyle = isPlayerScore
      ? "color: #00FF00; font-weight: bold; margin: 2px 0; padding: 2px 4px;"
      : "margin: 2px 0; padding: 2px 4px;";

    // Score cell (right-aligned)
    html +=
      '<div style="text-align: right; ' +
      rowStyle +
      '">' +
      score.score +
      "</div>";
    // Dash cell (center-aligned)
    html += '<div style="text-align: center; ' + rowStyle + '">-</div>';
    // Initials cell (left-aligned) with emoji if player score
    html +=
      '<div style="text-align: left; ' +
      rowStyle +
      '">' +
      initialsText +
      (isPlayerScore ? " 👈" : "") +
      "</div>";
  }

  // If player didn't make the list, show ellipsis and their score (unless score is 0)
  if (!playerMadeList && playerScore > 0) {
    // Ellipsis row spanning all columns
    html +=
      '<div style="grid-column: 1 / -1; text-align: center; color: #666; margin: 2px 0; padding: 2px 4px;">...</div>';

    var rowStyle =
      "color: #00FF00; font-weight: bold; margin: 2px 0; padding: 2px 4px;";
    var playerInitialsText = (playerInitials || "You") + " 👈";

    // Player score row
    html +=
      '<div style="text-align: right; ' +
      rowStyle +
      '">' +
      playerScore +
      "</div>";
    html += '<div style="text-align: center; ' + rowStyle + '">-</div>';
    html +=
      '<div style="text-align: left; ' +
      rowStyle +
      '">' +
      playerInitialsText +
      "</div>";
  }

  html += "</div>";
  gameOverHighScore.innerHTML = html;
}
