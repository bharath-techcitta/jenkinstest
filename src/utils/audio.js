// Web Audio API Synthesizer for instant, lag-free click feedback
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick(pitchMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startTime = this.ctx.currentTime;
      const baseFreq = 480 * pitchMultiplier;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, startTime + 0.08);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    } catch {
      // Audio playback silently caught if blocked
    }
  }

  playMilestone() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + index * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.22, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.28);
      });
    } catch {
      // Silently handled
    }
  }

  playReset() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380, startTime);
      osc.frequency.exponentialRampToValueAtTime(140, startTime + 0.16);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.17);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.17);
    } catch {
      // Silently handled
    }
  }
}

export const sound = new SoundFX();
