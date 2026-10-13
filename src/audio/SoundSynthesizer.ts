type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Procedural 1990s-style sound effects built from raw Web Audio oscillators.
 * The AudioContext is created lazily on the first user gesture to satisfy
 * browser autoplay policies.
 */
export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.4;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const win = window as WebkitWindow;
      const AudioContextClass = window.AudioContext || win.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        this.ctx = new AudioContextClass();
      } catch {
        this.enabled = false;
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  /** Called from the first pointer event so the context is unlocked early. */
  public unlock(): void {
    this.getContext();
  }

  public setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
  }

  private tone(
    type: OscillatorType,
    startFreq: number,
    endFreq: number,
    startTime: number,
    duration: number,
    peakGain: number,
    ramp: 'linear' | 'exponential' = 'exponential'
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    if (endFreq !== startFreq) {
      if (ramp === 'exponential') {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), startTime + duration);
      } else {
        osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
      }
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(this.volume * peakGain, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  /** 1990s arcade laser: fast high-to-low square-wave plunge. */
  playLaser(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('square', 880, 110, ctx.currentTime, 0.12, 0.4);
  }

  /** Celebratory arpeggio: C5 -> E5 -> G5 -> C6. */
  playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    const t = ctx.currentTime;
    freqs.forEach((f, idx) => {
      this.tone('triangle', f, f, t + idx * 0.07, 0.18, 0.4);
    });
  }

  /** Big fanfare for clearing a whole level or opening a gate. */
  playFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    const melody = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
    const timing = [0, 0.1, 0.2, 0.32, 0.46, 0.62];
    melody.forEach((f, idx) => {
      this.tone('square', f, f, t + timing[idx], 0.16, 0.22);
      this.tone('triangle', f / 2, f / 2, t + timing[idx], 0.16, 0.2);
    });
  }

  /** Gentle, non-punishing "boing" instead of a harsh buzzer. */
  playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('sawtooth', 180, 90, ctx.currentTime, 0.22, 0.3, 'linear');
  }

  /** Soft jetpack thruster puff. */
  playJetpack(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('triangle', 90, 140, ctx.currentTime, 0.08, 0.2, 'linear');
  }

  /** Bright crystalline chirp for picking up gems. */
  playGem(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('sine', 1174.66, 1760, ctx.currentTime, 0.15, 0.35);
  }

  /** Chunky explosion: low sawtooth thump with a square-wave rumble. */
  playExplosion(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.tone('sawtooth', 160, 40, t, 0.3, 0.35);
    this.tone('square', 70, 30, t + 0.03, 0.25, 0.2);
  }

  /** Mechanical clunk for levers and machinery. */
  playClunk(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('square', 220, 140, ctx.currentTime, 0.09, 0.25, 'linear');
  }

  /** Soft UI blip for menu selection. */
  playBlip(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.tone('square', 660, 880, ctx.currentTime, 0.06, 0.18, 'linear');
  }
}

export const soundManager = new SoundSynthesizer();
