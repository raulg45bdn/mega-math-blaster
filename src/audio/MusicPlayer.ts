/**
 * Looping chip-tune background music built from Web Audio oscillators.
 * Each track is a short bass line + melody in the spirit of the 1996 MIDI score.
 */
export type TrackKey = 'title' | 'space' | 'cave' | 'jungle' | 'temple' | 'machine' | 'city' | 'ending';

interface Track {
  bpm: number;
  bass: (number | 0)[];
  melody: (number | 0)[];
  bassWave: OscillatorType;
  melodyWave: OscillatorType;
}

// MIDI note numbers (0 = rest).
const N = { C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59, C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, Bb4: 70, Eb4: 63, Ab4: 68, Bb3: 58, Eb3: 51, Ab3: 56 };

const TRACKS: Record<TrackKey, Track> = {
  title: {
    bpm: 128,
    bass: [N.C3, 0, N.C3, N.G3, N.F3, 0, N.F3, N.G3, N.A3, 0, N.A3, N.E3, N.F3, N.G3, N.C3, 0],
    melody: [N.C5, N.E5, N.G5, N.E5, N.F5, N.A5, N.F5, N.D5, N.E5, N.C5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5],
    bassWave: 'triangle',
    melodyWave: 'square'
  },
  space: {
    bpm: 110,
    bass: [N.A3, 0, N.A3, 0, N.F3, 0, N.F3, 0, N.G3, 0, N.G3, 0, N.E3, 0, N.E3, 0],
    melody: [N.A4, 0, N.C5, N.E5, 0, N.D5, N.C5, 0, N.B4, 0, N.D5, N.G5, 0, N.E5, N.B4, 0],
    bassWave: 'sawtooth',
    melodyWave: 'triangle'
  },
  cave: {
    bpm: 120,
    bass: [N.D3, N.D3, N.A3, N.D3, N.F3, N.F3, N.C4, N.F3, N.G3, N.G3, N.D4, N.G3, N.A3, N.A3, N.E4, N.A3],
    melody: [N.D5, 0, N.F5, N.A5, N.G5, 0, N.F5, N.E5, N.D5, 0, N.C5, N.D5, N.E5, N.F5, N.E5, 0],
    bassWave: 'square',
    melodyWave: 'square'
  },
  jungle: {
    bpm: 132,
    bass: [N.E3, 0, N.E3, N.E3, N.G3, 0, N.G3, N.G3, N.A3, 0, N.A3, N.A3, N.B3, 0, N.B3, N.B3],
    melody: [N.E5, N.G5, N.E5, N.B4, N.G4, N.B4, N.D5, N.B4, N.A4, N.C5, N.E5, N.C5, N.B4, N.D5, N.E5, N.G5],
    bassWave: 'triangle',
    melodyWave: 'square'
  },
  temple: {
    bpm: 100,
    bass: [N.C3, 0, 0, N.C3, N.Eb3, 0, 0, N.Eb3, N.F3, 0, 0, N.F3, N.G3, 0, N.Bb3, 0],
    melody: [N.C5, 0, N.Eb4, N.G4, N.C5, 0, N.Bb4, N.G4, N.Ab4, 0, N.F4, N.Ab4, N.G4, 0, N.Eb4, 0],
    bassWave: 'sawtooth',
    melodyWave: 'triangle'
  },
  machine: {
    bpm: 116,
    bass: [N.G3, N.G3, 0, N.G3, N.Bb3, 0, N.G3, 0, N.C4, N.C4, 0, N.C4, N.Bb3, 0, N.G3, 0],
    melody: [N.G4, N.Bb4, N.D5, 0, N.C5, N.Bb4, N.G4, 0, N.F4, N.G4, N.Bb4, 0, N.D5, N.C5, N.Bb4, 0],
    bassWave: 'square',
    melodyWave: 'sawtooth'
  },
  city: {
    bpm: 140,
    bass: [N.C3, N.C3, N.G3, N.G3, N.A3, N.A3, N.E3, N.E3, N.F3, N.F3, N.C3, N.C3, N.G3, N.G3, N.G3, 0],
    melody: [N.E5, N.E5, N.G5, N.E5, N.C5, N.C5, N.E5, N.C5, N.A4, N.C5, N.E5, N.C5, N.D5, N.B4, N.G4, 0],
    bassWave: 'triangle',
    melodyWave: 'square'
  },
  ending: {
    bpm: 96,
    bass: [N.F3, 0, N.C4, 0, N.G3, 0, N.D4, 0, N.A3, 0, N.E4, 0, N.F3, 0, N.C4, 0],
    melody: [N.A4, N.C5, N.F5, 0, N.G5, N.E5, N.D5, 0, N.C5, N.E5, N.A5, 0, N.G5, N.F5, N.C5, 0],
    bassWave: 'triangle',
    melodyWave: 'triangle'
  }
};

const midiToFreq = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

export class MusicPlayer {
  public enabled: boolean = true;
  public volume: number = 0.12;
  private ctx: AudioContext | null = null;
  private timer: number | null = null;
  private current: TrackKey | null = null;
  private step: number = 0;
  private nextTime: number = 0;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      try {
        this.ctx = new Ctor();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    return this.ctx;
  }

  play(track: TrackKey): void {
    if (this.current === track && this.timer !== null) return;
    this.stop();
    this.current = track;
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.05;
    this.timer = window.setInterval(() => this.schedule(), 90);
  }

  /** Re-start the current track after the user toggles music on. */
  resume(): void {
    if (this.current && this.timer === null && this.enabled) {
      const track = this.current;
      this.current = null;
      this.play(track);
    }
  }

  stop(): void {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private schedule(): void {
    const ctx = this.ctx;
    if (!ctx || !this.current) return;
    const track = TRACKS[this.current];
    const stepDur = 60 / track.bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.25) {
      const i = this.step % track.bass.length;
      this.note(ctx, track.bass[i], this.nextTime, stepDur * 0.9, track.bassWave, this.volume);
      this.note(ctx, track.melody[i], this.nextTime, stepDur * 0.6, track.melodyWave, this.volume * 0.55);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  private note(ctx: AudioContext, midi: number, at: number, dur: number, wave: OscillatorType, gainValue: number): void {
    if (midi === 0) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(midiToFreq(midi), at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(gainValue, at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }
}

export const music = new MusicPlayer();
