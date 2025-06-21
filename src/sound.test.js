import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { initAudio, playBounceSound, playGameOverSound } from "./sound.js";

describe("Sound Module", () => {
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock oscillator
    mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    // Mock gain node
    mockGainNode = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    // Mock AudioContext
    mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      currentTime: 1.5,
    };

    // Mock global window object and Audio APIs
    global.window = {
      AudioContext: vi.fn(() => mockAudioContext),
      webkitAudioContext: vi.fn(() => mockAudioContext),
    };

    // Mock console.log to test error cases
    global.console = {
      log: vi.fn(),
    };
  });

  afterEach(() => {
    // Reset the audio context module variable
    // We need to access the internal audioContext variable through re-import
    vi.resetModules();
  });

  describe("initAudio()", () => {
    it("should initialize AudioContext successfully", () => {
      initAudio();

      expect(window.AudioContext).toHaveBeenCalledTimes(1);
    });

    it("should fallback to webkitAudioContext if AudioContext is not available", () => {
      // Remove AudioContext, keep webkitAudioContext
      global.window = {
        webkitAudioContext: vi.fn(() => mockAudioContext),
      };

      initAudio();

      expect(window.webkitAudioContext).toHaveBeenCalledTimes(1);
    });

    it("should handle missing Audio API gracefully", () => {
      // Remove all audio context constructors
      global.window = {};

      initAudio();

      expect(console.log).toHaveBeenCalledWith("Web Audio API not supported");
    });

    it("should handle AudioContext constructor throwing an error", () => {
      global.window = {
        AudioContext: vi.fn(() => {
          throw new Error("AudioContext not supported");
        }),
        webkitAudioContext: vi.fn(() => {
          throw new Error("webkitAudioContext not supported");
        }),
      };

      initAudio();

      expect(console.log).toHaveBeenCalledWith("Web Audio API not supported");
    });

    it("should handle partial Audio API support", () => {
      // The implementation uses (window.AudioContext || window.webkitAudioContext)
      // So if AudioContext is undefined, it will try webkitAudioContext
      global.window = {
        AudioContext: undefined,
        webkitAudioContext: vi.fn(() => mockAudioContext),
      };

      initAudio();

      expect(window.webkitAudioContext).toHaveBeenCalledTimes(1);
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("playBounceSound()", () => {
    beforeEach(() => {
      // Initialize audio context before each test
      initAudio();
    });

    it("should create and configure bounce sound when audio context is available", () => {
      playBounceSound();

      // Verify oscillator and gain node creation
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);

      // Verify connections
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it("should set correct frequency values for bounce sound", () => {
      playBounceSound();

      // Verify frequency settings (220Hz to 440Hz)
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        220,
        mockAudioContext.currentTime
      );
      expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        440,
        mockAudioContext.currentTime + 0.1
      );
    });

    it("should set correct gain values for bounce sound", () => {
      playBounceSound();

      // Verify gain settings (0.3 to 0.01)
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0.3,
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.01,
        mockAudioContext.currentTime + 0.2
      );
    });

    it("should start and stop oscillator with correct timing for bounce sound", () => {
      playBounceSound();

      expect(mockOscillator.start).toHaveBeenCalledWith(mockAudioContext.currentTime);
      expect(mockOscillator.stop).toHaveBeenCalledWith(mockAudioContext.currentTime + 0.2);
    });

    it("should do nothing when audio context is not initialized", async () => {
      // Don't initialize audio context
      vi.resetModules();
      const { playBounceSound: uninitializedPlayBounceSound } = await import("./sound.js");
      
      uninitializedPlayBounceSound();

      // No audio context methods should be called
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
      expect(mockAudioContext.createGain).not.toHaveBeenCalled();
    });

    it("should handle multiple rapid calls correctly", () => {
      playBounceSound();
      playBounceSound();
      playBounceSound();

      // Each call should create its own oscillator and gain node
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3);
      expect(mockOscillator.start).toHaveBeenCalledTimes(3);
      expect(mockOscillator.stop).toHaveBeenCalledTimes(3);
    });
  });

  describe("playGameOverSound()", () => {
    beforeEach(() => {
      // Initialize audio context before each test
      initAudio();
    });

    it("should create and configure game over sound when audio context is available", () => {
      playGameOverSound();

      // Verify oscillator and gain node creation
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);

      // Verify connections
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });

    it("should set correct frequency values for game over sound", () => {
      playGameOverSound();

      // Verify frequency settings (330Hz to 165Hz - descending)
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
        330,
        mockAudioContext.currentTime
      );
      expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        165,
        mockAudioContext.currentTime + 0.5
      );
    });

    it("should set correct gain values for game over sound", () => {
      playGameOverSound();

      // Verify gain settings (0.4 to 0.01)
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(
        0.4,
        mockAudioContext.currentTime
      );
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.01,
        mockAudioContext.currentTime + 0.8
      );
    });

    it("should start and stop oscillator with correct timing for game over sound", () => {
      playGameOverSound();

      expect(mockOscillator.start).toHaveBeenCalledWith(mockAudioContext.currentTime);
      expect(mockOscillator.stop).toHaveBeenCalledWith(mockAudioContext.currentTime + 0.8);
    });

    it("should do nothing when audio context is not initialized", async () => {
      // Don't initialize audio context
      vi.resetModules();
      const { playGameOverSound: uninitializedPlayGameOverSound } = await import("./sound.js");
      
      uninitializedPlayGameOverSound();

      // No audio context methods should be called
      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
      expect(mockAudioContext.createGain).not.toHaveBeenCalled();
    });

    it("should handle multiple rapid calls correctly", () => {
      playGameOverSound();
      playGameOverSound();

      // Each call should create its own oscillator and gain node
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
      expect(mockOscillator.start).toHaveBeenCalledTimes(2);
      expect(mockOscillator.stop).toHaveBeenCalledTimes(2);
    });

    it("should have longer duration than bounce sound", () => {
      playBounceSound();
      const bounceStopTime = mockOscillator.stop.mock.calls[0][0];
      
      vi.clearAllMocks();
      
      playGameOverSound();
      const gameOverStopTime = mockOscillator.stop.mock.calls[0][0];

      // Game over sound should play longer (0.8s vs 0.2s)
      expect(gameOverStopTime - mockAudioContext.currentTime).toBeGreaterThan(
        bounceStopTime - mockAudioContext.currentTime
      );
    });
  });

  describe("Sound Characteristics", () => {
    beforeEach(() => {
      initAudio();
    });

    it("should have different frequency characteristics for bounce vs game over", () => {
      playBounceSound();
      const bounceStartFreq = mockOscillator.frequency.setValueAtTime.mock.calls[0][0];
      const bounceEndFreq = mockOscillator.frequency.exponentialRampToValueAtTime.mock.calls[0][0];

      vi.clearAllMocks();

      playGameOverSound();
      const gameOverStartFreq = mockOscillator.frequency.setValueAtTime.mock.calls[0][0];
      const gameOverEndFreq = mockOscillator.frequency.exponentialRampToValueAtTime.mock.calls[0][0];

      // Bounce sound goes up (220 -> 440), game over goes down (330 -> 165)
      expect(bounceEndFreq).toBeGreaterThan(bounceStartFreq);
      expect(gameOverEndFreq).toBeLessThan(gameOverStartFreq);
    });

    it("should have different volume characteristics for bounce vs game over", () => {
      playBounceSound();
      const bounceVolume = mockGainNode.gain.setValueAtTime.mock.calls[0][0];

      vi.clearAllMocks();

      playGameOverSound();
      const gameOverVolume = mockGainNode.gain.setValueAtTime.mock.calls[0][0];

      // Game over sound should be louder (0.4 vs 0.3)
      expect(gameOverVolume).toBeGreaterThan(bounceVolume);
    });

    it("should have different duration for bounce vs game over", () => {
      playBounceSound();
      const bounceFreqRampTime = mockOscillator.frequency.exponentialRampToValueAtTime.mock.calls[0][1];
      const bounceGainRampTime = mockGainNode.gain.exponentialRampToValueAtTime.mock.calls[0][1];
      const bounceStopTime = mockOscillator.stop.mock.calls[0][0];

      vi.clearAllMocks();

      playGameOverSound();
      const gameOverFreqRampTime = mockOscillator.frequency.exponentialRampToValueAtTime.mock.calls[0][1];
      const gameOverGainRampTime = mockGainNode.gain.exponentialRampToValueAtTime.mock.calls[0][1];
      const gameOverStopTime = mockOscillator.stop.mock.calls[0][0];

      // Game over sound should have longer durations
      expect(gameOverFreqRampTime - mockAudioContext.currentTime).toBeGreaterThan(
        bounceFreqRampTime - mockAudioContext.currentTime
      );
      expect(gameOverGainRampTime - mockAudioContext.currentTime).toBeGreaterThan(
        bounceGainRampTime - mockAudioContext.currentTime
      );
      expect(gameOverStopTime - mockAudioContext.currentTime).toBeGreaterThan(
        bounceStopTime - mockAudioContext.currentTime
      );
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should throw error when audio context creation methods return null", () => {
      mockAudioContext.createOscillator = vi.fn(() => null);
      mockAudioContext.createGain = vi.fn(() => null);
      
      initAudio();

      // The original code doesn't handle null returns, so it should throw
      expect(() => playBounceSound()).toThrow();
      expect(() => playGameOverSound()).toThrow();
    });

    it("should throw error when audio context methods throw errors", () => {
      mockOscillator.start = vi.fn(() => {
        throw new Error("Start failed");
      });
      
      initAudio();

      // The original code doesn't have try-catch, so errors should propagate
      expect(() => playBounceSound()).toThrow("Start failed");
    });

    it("should work with valid audio context and destination", () => {
      initAudio();

      expect(() => playBounceSound()).not.toThrow();
      expect(() => playGameOverSound()).not.toThrow();
    });

    it("should use currentTime in calculations when available", () => {
      mockAudioContext.currentTime = 2.5;
      
      initAudio();
      playBounceSound();

      // Check that currentTime was used in timing calculations
      expect(mockOscillator.start).toHaveBeenCalledWith(2.5);
      expect(mockOscillator.stop).toHaveBeenCalledWith(2.7); // 2.5 + 0.2
    });
  });

  describe("Module State Management", () => {
    it("should maintain separate audio context instance across function calls", () => {
      initAudio();
      
      playBounceSound();
      const firstCallContext = mockAudioContext.createOscillator.mock.calls[0];
      
      playGameOverSound();
      const secondCallContext = mockAudioContext.createOscillator.mock.calls[1];

      // Both calls should use the same audio context instance
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    });

    it("should allow re-initialization of audio context", () => {
      initAudio();
      initAudio(); // Second call

      expect(window.AudioContext).toHaveBeenCalledTimes(2);
    });

    it("should handle audio context being null after failed initialization", () => {
      // First, fail initialization
      global.window = {};
      initAudio();

      // Then try to play sounds
      expect(() => playBounceSound()).not.toThrow();
      expect(() => playGameOverSound()).not.toThrow();
    });
  });
});