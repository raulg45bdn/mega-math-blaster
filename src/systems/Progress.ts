import { CrystalKey, CustomProblem, Level, MissionKey, Profile, Subject, SubjectStats, SUBJECTS } from '../types';

const STORAGE_KEY = 'mega_math_blaster_remake_save';

function emptyStats(): Record<Subject, SubjectStats> {
  const stats = {} as Record<Subject, SubjectStats>;
  SUBJECTS.forEach((s) => {
    stats[s] = { attempted: 0, correct: 0 };
  });
  return stats;
}

export function defaultProfile(): Profile {
  return {
    name: 'Blasternaut',
    subject: 'addition',
    level: 1,
    score: 0,
    crystals: { blue: false, red: false, green: false },
    missionsCleared: { spaceZapper1: false, mathBlaster: false, caveRunner: false, equationator: false, spaceZapper2: false },
    bonusItems: 0,
    bestBonus: 0,
    stats: emptyStats(),
    customProblems: [],
    voiceEnabled: true,
    musicEnabled: true,
    soundEnabled: true,
    introSeen: false,
    generatorCharge: 0
  };
}

const isLevel = (v: unknown): v is Level => typeof v === 'number' && v >= 1 && v <= 6 && Number.isInteger(v);
const isSubject = (v: unknown): v is Subject => typeof v === 'string' && (SUBJECTS as string[]).includes(v);
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
const nonNegInt = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback);

function sanitize(raw: unknown): Profile {
  const p = defaultProfile();
  if (!raw || typeof raw !== 'object') return p;
  const o = raw as Record<string, unknown>;
  if (typeof o.name === 'string' && o.name.trim()) p.name = o.name.trim().slice(0, 20);
  if (isSubject(o.subject)) p.subject = o.subject;
  if (isLevel(o.level)) p.level = o.level;
  p.score = nonNegInt(o.score, 0);
  p.bonusItems = nonNegInt(o.bonusItems, 0);
  p.bestBonus = nonNegInt(o.bestBonus, 0);
  p.generatorCharge = Math.min(100, nonNegInt(o.generatorCharge, 0));
  p.voiceEnabled = bool(o.voiceEnabled, true);
  p.musicEnabled = bool(o.musicEnabled, true);
  p.soundEnabled = bool(o.soundEnabled, true);
  p.introSeen = bool(o.introSeen, false);
  if (o.crystals && typeof o.crystals === 'object') {
    const c = o.crystals as Record<string, unknown>;
    (['blue', 'red', 'green'] as CrystalKey[]).forEach((k) => {
      p.crystals[k] = bool(c[k], false);
    });
  }
  if (o.missionsCleared && typeof o.missionsCleared === 'object') {
    const m = o.missionsCleared as Record<string, unknown>;
    (Object.keys(p.missionsCleared) as MissionKey[]).forEach((k) => {
      p.missionsCleared[k] = bool(m[k], false);
    });
  }
  if (o.stats && typeof o.stats === 'object') {
    const s = o.stats as Record<string, unknown>;
    SUBJECTS.forEach((subject) => {
      const entry = s[subject];
      if (entry && typeof entry === 'object') {
        const e = entry as Record<string, unknown>;
        p.stats[subject] = { attempted: nonNegInt(e.attempted, 0), correct: nonNegInt(e.correct, 0) };
        if (p.stats[subject].correct > p.stats[subject].attempted) p.stats[subject].correct = p.stats[subject].attempted;
      }
    });
  }
  if (Array.isArray(o.customProblems)) {
    p.customProblems = o.customProblems
      .filter((cp): cp is CustomProblem => !!cp && typeof cp === 'object' && typeof (cp as CustomProblem).prompt === 'string' && typeof (cp as CustomProblem).answer === 'string')
      .map((cp) => ({ prompt: cp.prompt.slice(0, 40), answer: cp.answer.slice(0, 12) }))
      .slice(0, 50);
  }
  return p;
}

/** Local save file for the single player, sanitized on every read. */
export class Progress {
  private static memory: Profile | null = null;

  static load(): Profile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return sanitize(JSON.parse(raw));
    } catch {
      // Fall through to the in-memory copy.
    }
    return sanitize(this.memory);
  }

  static save(profile: Profile): Profile {
    const clean = sanitize(profile);
    this.memory = clean;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch {
      // Storage unavailable: the in-memory copy keeps the session alive.
    }
    return clean;
  }

  static update(mutator: (profile: Profile) => void): Profile {
    const profile = this.load();
    mutator(profile);
    return this.save(profile);
  }

  static recordAnswer(subject: Subject, correct: boolean, points: number): Profile {
    return this.update((p) => {
      p.stats[subject].attempted += 1;
      if (correct) {
        p.stats[subject].correct += 1;
        p.score += points;
      }
    });
  }

  static awardCrystal(crystal: CrystalKey, mission: MissionKey): Profile {
    return this.update((p) => {
      p.crystals[crystal] = true;
      p.missionsCleared[mission] = true;
    });
  }

  static clearMission(mission: MissionKey): Profile {
    return this.update((p) => {
      p.missionsCleared[mission] = true;
    });
  }

  static addBonusItems(count: number): Profile {
    return this.update((p) => {
      p.bonusItems += count;
      p.bestBonus = Math.max(p.bestBonus, p.bonusItems);
    });
  }

  static reset(): Profile {
    const fresh = defaultProfile();
    return this.save(fresh);
  }

  /** Start a new adventure but keep settings, stats and custom problems. */
  static newGame(): Profile {
    return this.update((p) => {
      const fresh = defaultProfile();
      p.score = 0;
      p.crystals = fresh.crystals;
      p.missionsCleared = fresh.missionsCleared;
      p.bonusItems = 0;
      p.generatorCharge = 0;
      p.introSeen = false;
    });
  }

  static accuracy(profile: Profile, subject: Subject): number {
    const s = profile.stats[subject];
    return s.attempted === 0 ? 0 : Math.round((s.correct / s.attempted) * 100);
  }
}
