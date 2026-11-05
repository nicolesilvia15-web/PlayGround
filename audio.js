export class Soundscape {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.started = false;
    this.timer = null;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.enabled ? 0.22 : 0;
    this.master.connect(this.ctx.destination);
    this.started = true;
    this.startAmbient();
  }

  resume() {
    this.init();
    if (this.ctx?.state === "suspended") this.ctx.resume();
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(on ? 0.22 : 0, this.ctx.currentTime + 0.12);
    }
  }

  startAmbient() {
    if (!this.ctx || this.timer) return;
    const ctx = this.ctx;
    // A soft, slowly breathing pad.
    const padGain = ctx.createGain();
    padGain.gain.value = 0.024;
    padGain.connect(this.master);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.4;
    filter.connect(padGain);
    const notes = [146.83, 220.0, 293.66, 369.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 ? "sine" : "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 0.12 : 0.055;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.011;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.025;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(filter);
      osc.start();
      lfo.start();
    });
    // Occasional tiny pentatonic pluck, like a wind chime.
    const scale = [392, 440, 523.25, 587.33, 659.25, 783.99];
    const pluck = () => {
      if (!this.enabled || !this.ctx) return;
      const now = ctx.currentTime;
      const freq = scale[Math.floor(Math.random() * scale.length)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan = ctx.createStereoPanner();
      osc.type = "sine";
      osc.frequency.value = freq;
      pan.pan.value = (Math.random() - 0.5) * 0.7;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.022, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      osc.connect(gain);
      gain.connect(pan);
      pan.connect(this.master);
      osc.start(now);
      osc.stop(now + 1.9);
      this.timer = setTimeout(pluck, 2800 + Math.random() * 6000);
    };
    this.timer = setTimeout(pluck, 2400);
  }

  tone(freq, duration = 0.25, type = "sine", volume = 0.12, delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  click() {
    this.tone(520, 0.09, "sine", 0.05);
    this.tone(780, 0.08, "sine", 0.025, 0.025);
  }

  collect() {
    this.tone(698, 0.16, "sine", 0.08);
    this.tone(1046, 0.24, "sine", 0.045, 0.045);
  }

  pet() {
    this.tone(440, 0.22, "sine", 0.07);
    this.tone(554, 0.3, "sine", 0.05, 0.08);
    this.tone(659, 0.35, "triangle", 0.025, 0.16);
  }

  feed() {
    this.tone(330, 0.1, "triangle", 0.07);
    this.tone(494, 0.18, "sine", 0.06, 0.07);
  }

  play() {
    this.tone(523, 0.11, "triangle", 0.06);
    this.tone(659, 0.11, "triangle", 0.05, 0.06);
    this.tone(784, 0.2, "triangle", 0.05, 0.12);
  }

  build() {
    this.tone(392, 0.13, "triangle", 0.07);
    this.tone(523, 0.16, "sine", 0.06, 0.06);
    this.tone(784, 0.25, "sine", 0.05, 0.14);
  }

  level() {
    const seq = [392, 493.88, 587.33, 783.99, 987.77];
    seq.forEach((f, i) => this.tone(f, 0.38, "sine", 0.07, i * 0.1));
  }

  quest() {
    this.tone(659, 0.18, "sine", 0.06);
    this.tone(880, 0.28, "sine", 0.05, 0.07);
  }

  error() {
    this.tone(220, 0.1, "sine", 0.04);
    this.tone(196, 0.14, "sine", 0.03, 0.07);
  }
}
