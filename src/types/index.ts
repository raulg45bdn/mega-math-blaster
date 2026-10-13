/** Curriculum subjects exactly as the 1996 console listed them. */
export type Subject =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'estimation'
  | 'fractions'
  | 'patterns'
  | 'review';

export type Level = 1 | 2 | 3 | 4 | 5 | 6;

export const SUBJECTS: Subject[] = ['addition', 'subtraction', 'multiplication', 'division', 'estimation', 'fractions', 'patterns', 'review'];

export const SUBJECT_LABELS: Record<Subject, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  estimation: 'Estimation',
  fractions: 'Fractions & Decimals',
  patterns: 'Number Patterns',
  review: 'Review (Mixed)'
};

/** One answer option. `label` is what the child sees; `value` is used for exact comparison. */
export interface Choice {
  label: string;
  value: string;
}

/** A multiple-choice problem used by Space Zapper and Math Blaster. */
export interface Problem {
  id: string;
  subject: Subject;
  level: Level;
  prompt: string;
  answer: Choice;
  choices: Choice[];
  hint: string;
}

/** Cave Runner gate: the carried number must be strictly between low and high. */
export interface GateProblem {
  id: string;
  lowLabel: string;
  lowValue: number;
  highLabel: string;
  highValue: number;
  /** Number plates scattered before the gate; exactly one lies inside the range. */
  plates: number[];
  correctPlate: number;
  hint: string;
}

export type Operator = '+' | '-' | '×' | '÷';

/** Equationator puzzle: three tubes of numbers, build a true equation. */
export interface EquationPuzzle {
  id: string;
  operator: Operator;
  tubes: number[][];
  /** One guaranteed solution [a, b, c] with a op b = c. */
  solution: [number, number, number];
  hint: string;
}

export type MissionKey = 'spaceZapper1' | 'mathBlaster' | 'caveRunner' | 'equationator' | 'spaceZapper2';

export type CrystalKey = 'blue' | 'red' | 'green';

export interface SubjectStats {
  attempted: number;
  correct: number;
}

export interface CustomProblem {
  prompt: string;
  answer: string;
}

export interface Profile {
  name: string;
  subject: Subject;
  level: Level;
  score: number;
  crystals: Record<CrystalKey, boolean>;
  missionsCleared: Record<MissionKey, boolean>;
  bonusItems: number;
  bestBonus: number;
  stats: Record<Subject, SubjectStats>;
  customProblems: CustomProblem[];
  voiceEnabled: boolean;
  musicEnabled: boolean;
  soundEnabled: boolean;
  introSeen: boolean;
  generatorCharge: number;
}

export const MISSION_ORDER: MissionKey[] = ['spaceZapper1', 'mathBlaster', 'caveRunner', 'equationator', 'spaceZapper2'];

export const MISSION_LABELS: Record<MissionKey, string> = {
  spaceZapper1: 'Space Zapper',
  mathBlaster: 'Math Blaster',
  caveRunner: 'Cave Runner',
  equationator: 'Equationator',
  spaceZapper2: 'Space Zapper II'
};
