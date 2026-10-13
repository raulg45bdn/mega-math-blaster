/**
 * Spoken narration for G.C., Freud and Blasternaut using the browser's
 * built-in speech synthesis. The 1996 game was fully voiced, and reading the
 * prompts aloud is what made it usable for six-year-olds.
 */
export type Voice = 'gc' | 'freud' | 'blasternaut' | 'gelator';

interface VoiceStyle {
  pitch: number;
  rate: number;
  preferFemale: boolean;
  lang: string;
}

const STYLES: Record<Voice, VoiceStyle> = {
  gc: { pitch: 1.25, rate: 1.0, preferFemale: true, lang: 'en-US' },
  freud: { pitch: 0.8, rate: 0.92, preferFemale: false, lang: 'de-DE' },
  blasternaut: { pitch: 1.0, rate: 1.05, preferFemale: false, lang: 'en-US' },
  gelator: { pitch: 0.55, rate: 0.85, preferFemale: false, lang: 'en-US' }
};

export class Narrator {
  public enabled: boolean = true;
  private available: boolean;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.available = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
    if (this.available) {
      this.voices = window.speechSynthesis.getVoices();
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        this.voices = window.speechSynthesis.getVoices();
      });
    }
  }

  private pickVoice(style: VoiceStyle): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;
    const byLang = this.voices.filter((v) => v.lang.toLowerCase().startsWith(style.lang.slice(0, 2)));
    const pool = byLang.length > 0 ? byLang : this.voices;
    const femaleHints = /female|woman|zira|samantha|susan|karen|victoria|allison|ava|jenny|aria|linda|hazel/i;
    const maleHints = /male|man|david|mark|daniel|george|james|guy|ryan|tom|fred/i;
    const preferred = pool.find((v) => (style.preferFemale ? femaleHints.test(v.name) && !/^male/i.test(v.name) : maleHints.test(v.name)));
    return preferred ?? pool[0];
  }

  /** Speak a line, cancelling anything still being read. */
  say(text: string, voice: Voice = 'gc'): void {
    if (!this.enabled || !this.available || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const style = STYLES[voice];
      utterance.pitch = style.pitch;
      utterance.rate = style.rate;
      utterance.volume = 1;
      const chosen = this.pickVoice(style);
      if (chosen) utterance.voice = chosen;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.available = false;
    }
  }

  /** Read a math prompt aloud in child-friendly words ("seven plus five equals what?"). */
  sayProblem(prompt: string): void {
    const spoken = prompt
      .replace(/×/g, ' times ')
      .replace(/÷/g, ' divided by ')
      .replace(/\+/g, ' plus ')
      .replace(/(\d)\s*-\s*(\d|\?)/g, '$1 minus $2')
      .replace(/=\s*\?/g, ' equals what?')
      .replace(/\?/g, ' what ')
      .replace(/(\d+)\/(\d+)/g, '$1 over $2')
      .replace(/%/g, ' percent')
      .replace(/\s+/g, ' ')
      .trim();
    this.say(spoken, 'gc');
  }

  stop(): void {
    if (this.available) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Nothing to stop.
      }
    }
  }
}

export const narrator = new Narrator();
