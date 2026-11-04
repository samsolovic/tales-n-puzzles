const MUTE_KEY = 'pnp.muted.v1';

class AudioBus {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambientGain = null;
    this.muted = false;
    this.adPaused = false;
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      this.muted = false;
    }
  }

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
      this.startAmbient();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  startAmbient() {
    if (!this.ctx || this.ambientGain) return;
    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const a = this.ctx.createOscillator();
    const b = this.ctx.createOscillator();
    const c = this.ctx.createOscillator();
    a.type = 'sine';
    b.type = 'sine';
    c.type = 'triangle';
    a.frequency.value = 55;
    b.frequency.value = 82.5;
    c.frequency.value = 110;
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(gain.gain);
    [a, b, c].forEach((osc, index) => {
      const g = this.ctx.createGain();
      g.gain.value = index === 2 ? 0.08 : 0.2;
      osc.connect(g).connect(filter);
      osc.start();
    });
    filter.connect(gain).connect(this.master);
    lfo.start();
    this.ambientGain = gain;
  }

  tone(freq, when, duration, type = 'sine', volume = 0.12, glide = null) {
    if (!this.ctx || this.muted || this.adPaused) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  }

  click() {
    this.tone(620, 0, 0.055, 'triangle', 0.055, 520);
  }

  correct() {
    this.tone(523.25, 0, 0.16, 'sine', 0.075);
    this.tone(783.99, 0.07, 0.24, 'sine', 0.06);
  }

  wrong() {
    this.tone(146.83, 0, 0.16, 'sine', 0.075, 110);
  }

  open() {
    this.tone(246.94, 0, 0.12, 'triangle', 0.055, 329.63);
    this.tone(369.99, 0.07, 0.2, 'sine', 0.035);
  }

  complete() {
    [392, 523.25, 659.25, 783.99].forEach((f, i) => {
      this.tone(f, i * 0.11, 0.55, 'sine', 0.07);
    });
    this.tone(261.63, 0, 0.9, 'triangle', 0.035);
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {
      // ignore storage failures
    }
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(muted || this.adPaused ? 0 : 0.55, this.ctx.currentTime + 0.16);
    }
  }

  setAdPaused(paused) {
    this.adPaused = Boolean(paused);
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(
      this.muted || this.adPaused ? 0 : 0.55,
      this.ctx.currentTime + 0.12
    );
  }

  toggle() {
    this.unlock();
    this.setMuted(!this.muted);
    if (!this.muted) this.click();
    return this.muted;
  }
}

export const audio = new AudioBus();

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => audio.unlock(), { once: true });
}
