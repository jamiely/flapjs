import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getHighScores,
  getTopScore,
  saveHighScore,
  isNewHighScore,
  promptForInitials,
  updateHighScoreDisplay,
  updateGameOverScoresList,
} from "./score.js";

// Mock config module
vi.mock("./config.js", () => ({
  DEFAULT_INITIALS: "WIN",
}));

describe("Score Module", () => {
  let mockLocalStorage;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    mockLocalStorage = {
      data: {},
      getItem: vi.fn((key) => mockLocalStorage.data[key] || null),
      setItem: vi.fn((key, value) => {
        mockLocalStorage.data[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete mockLocalStorage.data[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage.data = {};
      }),
    };

    global.localStorage = mockLocalStorage;
    global.console = { log: vi.fn() };

    // Mock DOM elements
    global.document = {
      getElementById: vi.fn((id) => {
        const mockElement = {
          textContent: "",
          innerHTML: "",
          value: "",
          style: { display: "none" },
          focus: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        };
        return mockElement;
      }),
    };
  });

  describe("getHighScores", () => {
    it("should return scores from localStorage when they exist", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 50, initials: "FLY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      const scores = getHighScores();

      expect(scores).toEqual(testScores);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("flapjs_highscores");
    });

    it("should return default scores when localStorage is empty", () => {
      const scores = getHighScores();

      expect(scores).toEqual([
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 25, initials: "SKY" },
        { score: 10, initials: "WIN" },
        { score: 1, initials: "TRY" },
      ]);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "flapjs_highscores",
        expect.any(String)
      );
    });

    it("should handle localStorage errors gracefully", () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const scores = getHighScores();

      expect(scores).toEqual([
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 25, initials: "SKY" },
        { score: 10, initials: "WIN" },
        { score: 1, initials: "TRY" },
      ]);
      expect(console.log).toHaveBeenCalledWith("Error reading high scores from localStorage");
    });

    it("should handle JSON parse errors gracefully", () => {
      mockLocalStorage.data["flapjs_highscores"] = "invalid json";

      const scores = getHighScores();

      expect(scores).toEqual([
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 25, initials: "SKY" },
        { score: 10, initials: "WIN" },
        { score: 1, initials: "TRY" },
      ]);
    });
  });

  describe("getTopScore", () => {
    it("should return the highest score", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 50, initials: "FLY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      const topScore = getTopScore();

      expect(topScore).toEqual({ score: 100, initials: "ACE" });
    });

    it("should return default when no scores exist", () => {
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify([]);

      const topScore = getTopScore();

      expect(topScore).toEqual({ score: 0, initials: "" });
    });
  });

  describe("saveHighScore", () => {
    it("should save a new high score and maintain top 5", () => {
      const existingScores = [
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 30, initials: "SKY" },
        { score: 20, initials: "WIN" },
        { score: 10, initials: "TRY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(existingScores);

      const result = saveHighScore(75, "NEW");

      expect(result).toBe(true);
      const savedData = JSON.parse(mockLocalStorage.data["flapjs_highscores"]);
      expect(savedData).toEqual([
        { score: 75, initials: "NEW" },
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 30, initials: "SKY" },
        { score: 20, initials: "WIN" },
      ]);
      expect(savedData.length).toBe(5);
    });

    it("should handle empty initials", () => {
      const result = saveHighScore(100, "");

      expect(result).toBe(true);
      const savedData = JSON.parse(mockLocalStorage.data["flapjs_highscores"]);
      expect(savedData[0]).toEqual({ score: 100, initials: "" });
    });

    it("should handle undefined initials", () => {
      const result = saveHighScore(100);

      expect(result).toBe(true);
      const savedData = JSON.parse(mockLocalStorage.data["flapjs_highscores"]);
      expect(savedData[0]).toEqual({ score: 100, initials: "" });
    });

    it("should handle localStorage save errors", () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const result = saveHighScore(100, "ACE");

      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith("Error saving high scores to localStorage");
    });

    it("should sort scores correctly", () => {
      const result = saveHighScore(25, "MID");

      expect(result).toBe(true);
      const savedData = JSON.parse(mockLocalStorage.data["flapjs_highscores"]);
      expect(savedData.map(s => s.score)).toEqual([50, 40, 25, 25, 10]);
    });
  });

  describe("isNewHighScore", () => {
    beforeEach(() => {
      const testScores = [
        { score: 50, initials: "ACE" },
        { score: 40, initials: "FLY" },
        { score: 30, initials: "SKY" },
        { score: 20, initials: "WIN" },
        { score: 10, initials: "TRY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);
    });

    it("should return true for score higher than lowest", () => {
      expect(isNewHighScore(15)).toBe(true);
      expect(isNewHighScore(60)).toBe(true);
    });

    it("should return false for score lower than or equal to lowest", () => {
      expect(isNewHighScore(10)).toBe(false);
      expect(isNewHighScore(5)).toBe(false);
    });

    it("should return true when fewer than 5 scores exist", () => {
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify([
        { score: 50, initials: "ACE" },
      ]);

      expect(isNewHighScore(1)).toBe(true);
    });
  });

  describe("promptForInitials", () => {
    let mockElements;

    beforeEach(() => {
      mockElements = {
        initialsScreen: {
          style: { display: "none" },
        },
        initialsInput: {
          value: "",
          focus: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        submitButton: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
        skipButton: {
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        },
      };

      document.getElementById = vi.fn((id) => {
        switch (id) {
          case "initialsScreen": return mockElements.initialsScreen;
          case "initialsInput": return mockElements.initialsInput;
          case "submitInitials": return mockElements.submitButton;
          case "skipInitials": return mockElements.skipButton;
          default: return null;
        }
      });

      global.setTimeout = vi.fn((fn) => fn());
    });

    it("should display initials screen and setup event listeners", () => {
      const callback = vi.fn();

      promptForInitials(callback);

      expect(mockElements.initialsScreen.style.display).toBe("flex");
      expect(mockElements.initialsInput.value).toBe("");
      expect(mockElements.initialsInput.focus).toHaveBeenCalled();
      expect(mockElements.submitButton.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
      expect(mockElements.skipButton.addEventListener).toHaveBeenCalledWith("click", expect.any(Function));
      expect(mockElements.initialsInput.addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
    });

    it("should handle submit with valid initials", () => {
      const callback = vi.fn();
      
      promptForInitials(callback);
      
      // Set value after promptForInitials is called but before submit
      mockElements.initialsInput.value = "TEST";

      // Get the submit handler and call it
      const submitHandler = mockElements.submitButton.addEventListener.mock.calls[0][1];
      submitHandler();

      expect(callback).toHaveBeenCalledWith("TEST");
      expect(mockElements.initialsScreen.style.display).toBe("none");
    });

    it("should handle submit with empty initials", () => {
      const callback = vi.fn();
      
      promptForInitials(callback);
      
      // Set empty value after promptForInitials is called
      mockElements.initialsInput.value = "   ";

      const submitHandler = mockElements.submitButton.addEventListener.mock.calls[0][1];
      submitHandler();

      expect(callback).toHaveBeenCalledWith("WIN");
    });

    it("should handle skip button", () => {
      const callback = vi.fn();

      promptForInitials(callback);

      const skipHandler = mockElements.skipButton.addEventListener.mock.calls[0][1];
      skipHandler();

      expect(callback).toHaveBeenCalledWith("WIN");
      expect(mockElements.initialsScreen.style.display).toBe("none");
    });

    it("should handle Enter key", () => {
      const callback = vi.fn();
      
      promptForInitials(callback);
      
      // Set value after promptForInitials is called
      mockElements.initialsInput.value = "KEY";

      const keyHandler = mockElements.initialsInput.addEventListener.mock.calls[0][1];
      const mockEvent = {
        key: "Enter",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      keyHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith("KEY");
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it("should handle Escape key", () => {
      const callback = vi.fn();

      promptForInitials(callback);

      const keyHandler = mockElements.initialsInput.addEventListener.mock.calls[0][1];
      const mockEvent = {
        key: "Escape",
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      keyHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith("WIN");
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it("should trim and limit initials to 5 characters", () => {
      const callback = vi.fn();
      
      promptForInitials(callback);
      
      // Set long value after promptForInitials is called
      mockElements.initialsInput.value = "  TOOLONG  ";

      const submitHandler = mockElements.submitButton.addEventListener.mock.calls[0][1];
      submitHandler();

      expect(callback).toHaveBeenCalledWith("TOOLO");
    });
  });

  describe("updateHighScoreDisplay", () => {
    it("should update title screen elements with top score", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 50, initials: "FLY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      const mockValueElement = { textContent: "" };
      const mockInitialsElement = { textContent: "" };

      document.getElementById = vi.fn((id) => {
        switch (id) {
          case "titleHighScoreValue": return mockValueElement;
          case "titleHighScoreInitials": return mockInitialsElement;
          default: return null;
        }
      });

      updateHighScoreDisplay();

      expect(mockValueElement.textContent).toBe(100);
      expect(mockInitialsElement.textContent).toBe("ACE");
    });
  });

  describe("updateGameOverScoresList", () => {
    let mockGameOverElement;

    beforeEach(() => {
      mockGameOverElement = { innerHTML: "" };
      document.getElementById = vi.fn(() => mockGameOverElement);
    });

    it("should display message when no scores exist", () => {
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify([]);

      updateGameOverScoresList(25, "PLR");

      expect(mockGameOverElement.innerHTML).toBe('<p style="margin: 0;">No High Scores Yet</p>');
    });

    it("should highlight player score when they made the list", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 75, initials: "PLR" },
        { score: 50, initials: "FLY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      updateGameOverScoresList(75, "PLR");

      expect(mockGameOverElement.innerHTML).toContain("color: #00FF00");
      expect(mockGameOverElement.innerHTML).toContain("PLR 👈");
    });

    it("should show player score below ellipsis when they didn't make the list", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 90, initials: "FLY" },
        { score: 80, initials: "SKY" },
        { score: 70, initials: "WIN" },
        { score: 60, initials: "TRY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      updateGameOverScoresList(25, "PLR");

      expect(mockGameOverElement.innerHTML).toContain("...");
      expect(mockGameOverElement.innerHTML).toContain("PLR 👈");
      expect(mockGameOverElement.innerHTML).toContain("25");
    });

    it("should not show player score when score is 0 and not in list", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
        { score: 50, initials: "FLY" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      updateGameOverScoresList(0, "PLR");

      expect(mockGameOverElement.innerHTML).not.toContain("...");
      expect(mockGameOverElement.innerHTML).not.toContain("PLR 👈");
    });

    it("should use 'You' when no initials provided and not in list", () => {
      const testScores = [
        { score: 100, initials: "ACE" },
      ];
      mockLocalStorage.data["flapjs_highscores"] = JSON.stringify(testScores);

      updateGameOverScoresList(25, "");

      expect(mockGameOverElement.innerHTML).toContain("You 👈");
    });
  });
});