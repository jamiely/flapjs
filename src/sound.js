// Audio context for sound effects
var audioContext = null;

export function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.log("Web Audio API not supported");
  }
}

export function playBounceSound() {
  if (!audioContext) return;

  var oscillator = audioContext.createOscillator();
  var gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Create a quick bounce sound
  oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    440,
    audioContext.currentTime + 0.1,
  );

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

export function playGameOverSound() {
  if (!audioContext) return;

  var oscillator = audioContext.createOscillator();
  var gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Create a descending game over sound
  oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    165,
    audioContext.currentTime + 0.5,
  );

  gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.8,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.8);
}
