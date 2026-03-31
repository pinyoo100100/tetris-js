/**
 * Sound manager using Web Audio API.
 */
export class Sound {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  init() {
    if (this.context || !this.enabled) {
      return;
    }
    this.context = new (window.AudioContext || window.webkitAudioContext)();
  }

  playTone(frequency, duration = 0.12, type = "sine") {
    if (!this.enabled) {
      return;
    }
    this.init();
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.12;

    oscillator.connect(gain);
    gain.connect(this.context.destination);

    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.stop(this.context.currentTime + duration);
  }

  lineClear() {
    this.playTone(720, 0.15, "triangle");
  }

  hardDrop() {
    this.playTone(220, 0.08, "square");
  }

  gameOver() {
    this.playTone(140, 0.4, "sawtooth");
  }
}
