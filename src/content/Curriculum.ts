import { Choice, CustomProblem, EquationPuzzle, GateProblem, Level, Operator, Problem, Subject, SUBJECTS } from '../types';

/** Random integer in [min, max]. */
export const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const makeId = (): string => Math.random().toString(36).substring(2, 9);

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const numChoice = (n: number): Choice => ({ label: `${n}`, value: `${n}` });
const decChoice = (n: number, digits: number): Choice => {
  const label = n.toFixed(digits);
  return { label, value: label };
};
const fracChoice = (num: number, den: number): Choice => ({ label: `${num}/${den}`, value: `${num}/${den}` });

interface Draft {
  prompt: string;
  answer: Choice;
  distractors: Choice[];
  hint: string;
}

/**
 * Integer distractors that feel like real mistakes: off by one, off by ten,
 * the wrong operation, swapped digits. Always distinct, never negative.
 */
export function integerDistractors(answer: number, count: number, extras: number[] = [], min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number[] {
  const set = new Set<number>();
  const candidates = shuffle([...extras, answer + 1, answer - 1, answer + 2, answer - 2, answer + 10, answer - 10, answer * 2, Math.floor(answer / 2), answer + 3, answer - 3, answer + 5, answer - 5]);
  for (const c of candidates) {
    if (set.size >= count) break;
    if (Number.isInteger(c) && c !== answer && c >= min && c <= max) set.add(c);
  }
  let fallback = Math.max(min, answer - count - 1);
  while (set.size < count) {
    if (fallback !== answer && !set.has(fallback) && fallback >= min && fallback <= max) set.add(fallback);
    fallback++;
    if (fallback > max) fallback = min;
  }
  return Array.from(set);
}

function finalize(subject: Subject, level: Level, draft: Draft, choiceCount: number): Problem {
  const uniqueDistractors: Choice[] = [];
  const seen = new Set<string>([draft.answer.value]);
  for (const d of draft.distractors) {
    if (!seen.has(d.value)) {
      seen.add(d.value);
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length >= choiceCount - 1) break;
  }
  return {
    id: makeId(),
    subject,
    level,
    prompt: draft.prompt,
    answer: draft.answer,
    choices: shuffle([draft.answer, ...uniqueDistractors]),
    hint: draft.hint
  };
}

const intDraft = (prompt: string, answer: number, hint: string, extras: number[] = [], min: number = 0): Draft => ({
  prompt,
  answer: numChoice(answer),
  distractors: integerDistractors(answer, 5, extras, min).map(numChoice),
  hint
});

// ---------------------------------------------------------------- addition
function addition(level: Level): Draft {
  let a: number;
  let b: number;
  switch (level) {
    case 1:
      a = randInt(1, 9);
      b = randInt(1, Math.max(1, 10 - a));
      break;
    case 2:
      a = randInt(1, 12);
      b = randInt(1, 20 - a);
      break;
    case 3:
      a = randInt(10, 89);
      b = randInt(1, 9);
      break;
    case 4:
      a = randInt(10, 89);
      b = randInt(10, 99 - a > 10 ? 99 - a : 10);
      break;
    case 5:
      a = randInt(100, 899);
      b = randInt(10, 99);
      break;
    default:
      a = randInt(100, 599);
      b = randInt(100, 399);
  }
  const sum = a + b;
  if (level >= 3 && Math.random() < 0.3) {
    return intDraft(`${a} + ? = ${sum}`, b, `Count up from ${a} to ${sum}. That is ${b}!`, [a, sum, sum - a + 1]);
  }
  return intDraft(`${a} + ${b} = ?`, sum, `${a} plus ${b} makes ${sum}. Add the ones first, then the tens.`, [a - b, sum + 10, sum - 10]);
}

// ------------------------------------------------------------- subtraction
function subtraction(level: Level): Draft {
  let a: number;
  let b: number;
  switch (level) {
    case 1:
      a = randInt(1, 10);
      b = randInt(0, a);
      break;
    case 2:
      a = randInt(5, 20);
      b = randInt(1, a);
      break;
    case 3:
      a = randInt(11, 99);
      b = randInt(1, 9);
      break;
    case 4:
      a = randInt(20, 99);
      b = randInt(10, a);
      break;
    case 5:
      a = randInt(100, 999);
      b = randInt(10, 99);
      break;
    default:
      a = randInt(200, 999);
      b = randInt(100, a);
  }
  const diff = a - b;
  if (level >= 3 && Math.random() < 0.3) {
    return intDraft(`${a} - ? = ${diff}`, b, `${a} take away ${diff} leaves ${b}.`, [a + diff, diff, b + 10]);
  }
  return intDraft(`${a} - ${b} = ?`, diff, `Start at ${a} and count back ${b} to reach ${diff}.`, [a + b, diff + 10, diff - 10]);
}

// ---------------------------------------------------------- multiplication
function multiplication(level: Level): Draft {
  let a: number;
  let b: number;
  switch (level) {
    case 1:
      a = pick([1, 2, 5, 10]);
      b = randInt(0, 5);
      break;
    case 2:
      a = randInt(1, 5);
      b = randInt(1, 5);
      break;
    case 3:
      a = randInt(2, 10);
      b = randInt(2, 10);
      break;
    case 4:
      a = randInt(11, 49);
      b = randInt(2, 9);
      break;
    case 5:
      a = randInt(6, 12);
      b = randInt(6, 12);
      break;
    default:
      a = randInt(11, 40);
      b = randInt(11, 25);
  }
  const product = a * b;
  return intDraft(`${a} × ${b} = ?`, product, `${a} groups of ${b} make ${product}. Skip count by ${b}!`, [a + b, product + a, product - a, product + b]);
}

// ---------------------------------------------------------------- division
function division(level: Level): Draft {
  let divisor: number;
  let quotient: number;
  switch (level) {
    case 1:
      divisor = pick([1, 2]);
      quotient = randInt(1, 5);
      break;
    case 2:
      divisor = randInt(2, 5);
      quotient = randInt(1, 5);
      break;
    case 3:
      divisor = randInt(2, 10);
      quotient = randInt(1, 10);
      break;
    case 4:
      divisor = randInt(2, 9);
      quotient = randInt(11, 40);
      break;
    case 5:
      divisor = randInt(3, 9);
      quotient = randInt(25, 120);
      break;
    default:
      divisor = randInt(11, 25);
      quotient = randInt(12, 45);
  }
  const dividend = divisor * quotient;
  return intDraft(`${dividend} ÷ ${divisor} = ?`, quotient, `Think: ${divisor} times what makes ${dividend}? ${quotient}!`, [divisor, dividend - divisor, quotient + divisor]);
}

// -------------------------------------------------------------- estimation
const roundTo = (n: number, unit: number): number => Math.round(n / unit) * unit;

function roundedDistractors(answer: number, unit: number, exact: number): Choice[] {
  const set = new Set<number>();
  [answer + unit, answer - unit, answer + 2 * unit, answer - 2 * unit, exact, answer + 3 * unit].forEach((v) => {
    if (v !== answer && v >= 0 && Number.isInteger(v)) set.add(v);
  });
  let extra = answer + 4 * unit;
  while (set.size < 5) {
    if (extra !== answer) set.add(extra);
    extra += unit;
  }
  return Array.from(set).map(numChoice);
}

function estimation(level: Level): Draft {
  if (level === 1) {
    const n = randInt(11, 99);
    const ans = roundTo(n, 10);
    return { prompt: `Round ${n} to the nearest ten`, answer: numChoice(ans), distractors: roundedDistractors(ans, 10, n), hint: `${n} is closest to ${ans}. Look at the ones digit: 5 or more rounds up.` };
  }
  if (level === 5) {
    const n = randInt(101, 999);
    const ans = roundTo(n, 100);
    return { prompt: `Round ${n} to the nearest hundred`, answer: numChoice(ans), distractors: roundedDistractors(ans, 100, n), hint: `Look at the tens digit of ${n}: 5 or more rounds up to ${ans}.` };
  }
  let a: number;
  let b: number;
  let exact: number;
  let symbol: string;
  let unit = 10;
  if (level === 2) {
    a = randInt(10, 60);
    b = randInt(10, 60);
    exact = a + b;
    symbol = '+';
  } else if (level === 3) {
    a = randInt(40, 99);
    b = randInt(10, a - 5);
    exact = a - b;
    symbol = '-';
  } else if (level === 4) {
    a = randInt(2, 9);
    b = randInt(11, 49);
    exact = a * b;
    symbol = '×';
  } else {
    a = randInt(100, 700);
    b = randInt(100, 299);
    exact = a + b;
    symbol = '+';
    unit = 100;
  }
  const ans = roundTo(exact, unit);
  return {
    prompt: `About how much is ${a} ${symbol} ${b}?`,
    answer: numChoice(ans),
    distractors: roundedDistractors(ans, unit, exact),
    hint: `Round first: the exact answer is ${exact}, which is about ${ans}.`
  };
}

// --------------------------------------------- fractions, decimals, percents
function fractionDistractors(num: number, den: number): Choice[] {
  const cands: [number, number][] = [[num + 1, den], [num, den + 1], [1, den], [den - num, den], [num + 1, den + 1], [num, den * 2], [num * 2, den * 2 + 1]];
  const out: Choice[] = [];
  const seen = new Set<string>([`${num}/${den}`]);
  for (const [n, d] of cands) {
    if (n <= 0 || d <= 1 || n >= d) continue;
    const label = `${n}/${d}`;
    if (!seen.has(label)) {
      seen.add(label);
      out.push(fracChoice(n, d));
    }
  }
  let k = 2;
  while (out.length < 5) {
    const label = `1/${den + k}`;
    if (!seen.has(label)) {
      seen.add(label);
      out.push(fracChoice(1, den + k));
    }
    k++;
  }
  return out;
}

function decimalDistractors(answer: number, digits: number): Choice[] {
  const unit = digits === 1 ? 0.1 : 0.01;
  const out: Choice[] = [];
  const seen = new Set<string>([answer.toFixed(digits)]);
  [answer + unit, answer - unit, answer + 2 * unit, answer - 2 * unit, answer * 10, answer / 10, answer + 0.5, answer - 0.5].forEach((v) => {
    if (v < 0) return;
    const label = v.toFixed(digits);
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, value: label });
    }
  });
  let k = 3;
  while (out.length < 5) {
    const label = (answer + k * unit).toFixed(digits);
    if (!seen.has(label)) {
      seen.add(label);
      out.push({ label, value: label });
    }
    k++;
  }
  return out;
}

function fractions(level: Level): Draft {
  switch (level) {
    case 1: {
      const den = pick([2, 4]);
      const whole = den * randInt(1, 5);
      const ans = whole / den;
      return intDraft(`1/${den} of ${whole} = ?`, ans, `Share ${whole} into ${den} equal groups. Each group has ${ans}.`, [whole, den, whole - den]);
    }
    case 2: {
      const [num, den] = pick([[1, 2], [1, 3], [1, 4], [2, 3], [3, 4]]);
      const k = randInt(2, 4);
      return { prompt: `${num * k}/${den * k} = ?`, answer: fracChoice(num, den), distractors: fractionDistractors(num, den), hint: `Divide the top and bottom of ${num * k}/${den * k} by ${k}.` };
    }
    case 3: {
      const den = randInt(3, 8);
      const a = randInt(1, den - 2);
      const b = randInt(1, den - a - 1);
      return { prompt: `${a}/${den} + ${b}/${den} = ?`, answer: fracChoice(a + b, den), distractors: fractionDistractors(a + b, den), hint: `Same bottom number: just add the tops. ${a} + ${b} = ${a + b}.` };
    }
    case 4: {
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      const sum = (a + b) / 10;
      return { prompt: `0.${a} + 0.${b} = ?`, answer: decChoice(sum, 1), distractors: decimalDistractors(sum, 1), hint: `${a} tenths plus ${b} tenths is ${a + b} tenths.` };
    }
    case 5: {
      const pct = pick([10, 20, 25, 50, 75]);
      const whole = 20 * randInt(1, 10);
      const ans = (whole * pct) / 100;
      return intDraft(`${pct}% of ${whole} = ?`, ans, `${pct}% means ${pct} out of every 100. ${pct}% of ${whole} is ${ans}.`, [whole - ans, pct, whole]);
    }
    default: {
      if (Math.random() < 0.5) {
        const [num, den, dec] = pick([[1, 4, 0.25], [1, 2, 0.5], [3, 4, 0.75], [1, 5, 0.2], [2, 5, 0.4], [3, 5, 0.6], [1, 10, 0.1]]);
        return { prompt: `${num}/${den} as a decimal = ?`, answer: decChoice(dec, 2), distractors: decimalDistractors(dec, 2), hint: `${num} divided by ${den} is ${dec.toFixed(2)}.` };
      }
      const a = randInt(10, 199) / 100;
      const b = randInt(10, 199) / 100;
      const sum = Math.round((a + b) * 100) / 100;
      return { prompt: `${a.toFixed(2)} + ${b.toFixed(2)} = ?`, answer: decChoice(sum, 2), distractors: decimalDistractors(sum, 2), hint: `Line up the decimal points, then add: ${sum.toFixed(2)}.` };
    }
  }
}

// ---------------------------------------------------------------- patterns
function patterns(level: Level): Draft {
  let terms: number[] = [];
  let rule = '';
  const start = randInt(0, 12);
  switch (level) {
    case 1: {
      const step = pick([1, 2]);
      terms = [0, 1, 2, 3, 4].map((i) => start + i * step);
      rule = `The numbers go up by ${step} each time.`;
      break;
    }
    case 2: {
      const step = pick([5, 10]);
      const base = step * randInt(0, 4);
      terms = [0, 1, 2, 3, 4].map((i) => base + i * step);
      rule = `Count by ${step}s.`;
      break;
    }
    case 3: {
      const step = pick([3, 4, -2, -3]);
      const base = step > 0 ? randInt(0, 10) : randInt(20, 40);
      terms = [0, 1, 2, 3, 4].map((i) => base + i * step);
      rule = step > 0 ? `Add ${step} each time.` : `Take away ${-step} each time.`;
      break;
    }
    case 4: {
      if (Math.random() < 0.5) {
        const base = randInt(1, 3);
        terms = [base, base * 2, base * 4, base * 8, base * 16];
        rule = 'Each number is double the one before.';
      } else {
        terms = [1, 3, 6, 10, 15].map((t) => t + start);
        rule = 'The jumps grow by one each time: +2, +3, +4, +5.';
      }
      break;
    }
    case 5: {
      if (Math.random() < 0.5) {
        const base = randInt(1, 2);
        terms = [base, base * 3, base * 9, base * 27, base * 81];
        rule = 'Each number is three times the one before.';
      } else {
        const a = randInt(2, 4);
        terms = [0, 1, 2, 3, 4].map((i) => start + i * a + (i % 2 === 1 ? 1 : 0));
        rule = `The pattern alternates: +${a + 1}, then +${a - 1}.`;
      }
      break;
    }
    default: {
      if (Math.random() < 0.5) {
        terms = [1, 4, 9, 16, 25, 36].slice(0, 5).map((t) => t + start);
        rule = 'These are square numbers: 1x1, 2x2, 3x3, 4x4, 5x5.';
      } else {
        terms = [1, 1, 2, 3, 5, 8, 13].slice(0, 6);
        rule = 'Add the two numbers before to get the next one.';
      }
    }
  }
  const blank = terms.length - 1 - randInt(0, 1);
  const answer = terms[blank];
  const prompt = terms.map((t, i) => (i === blank ? '?' : `${t}`)).join(', ');
  const step = terms[1] - terms[0];
  return intDraft(prompt, answer, `${rule} The missing number is ${answer}.`, [answer + step, answer - step, answer + 1, answer - 1]);
}

const GENERATORS: Record<Exclude<Subject, 'review'>, (level: Level) => Draft> = {
  addition,
  subtraction,
  multiplication,
  division,
  estimation,
  fractions,
  patterns
};

/** Generate one multiple-choice problem. Review draws from every other subject. */
export function generateProblem(subject: Subject, level: Level, choiceCount: number = 4): Problem {
  const actual: Exclude<Subject, 'review'> = subject === 'review' ? pick(SUBJECTS.filter((s) => s !== 'review') as Exclude<Subject, 'review'>[]) : subject;
  const draft = GENERATORS[actual](level);
  return finalize(actual, level, draft, Math.max(2, Math.min(6, choiceCount)));
}

// -------------------------------------------------------- Cave Runner gates
function expressionFor(value: number, subject: Subject, level: Level): string {
  if (level < 3 || Math.random() < 0.35) return `${value}`;
  if (subject === 'subtraction') {
    const b = randInt(1, 20);
    return `${value + b} - ${b}`;
  }
  if (subject === 'multiplication' || subject === 'division') {
    for (const d of shuffle([2, 3, 4, 5, 6, 7, 8, 9])) {
      if (value % d === 0 && value > 0) return subject === 'division' ? `${value * d} ÷ ${d}` : `${d} × ${value / d}`;
    }
  }
  const a = randInt(0, value);
  return `${a} + ${value - a}`;
}

/** Gate values plus three number plates; exactly one plate lies strictly inside the range. */
export function generateGate(subject: Subject, level: Level): GateProblem {
  const max = level <= 2 ? 20 : level <= 4 ? 100 : 200;
  const gap = level <= 2 ? randInt(3, 6) : level <= 4 ? randInt(5, 20) : randInt(10, 40);
  const low = randInt(0, max - gap);
  const high = low + gap;
  const correct = randInt(low + 1, high - 1);
  const below = randInt(Math.max(0, low - 12), low);
  const above = randInt(high, high + 12);
  const lowLabel = expressionFor(low, subject, level);
  const highLabel = expressionFor(high, subject, level);
  return {
    id: makeId(),
    lowLabel,
    lowValue: low,
    highLabel,
    highValue: high,
    plates: shuffle([correct, below, above]),
    correctPlate: correct,
    hint: `You need a number bigger than ${low} and smaller than ${high}. ${correct} fits!`
  };
}

// --------------------------------------------------------- Equationator
export function evaluate(a: number, op: Operator, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b !== 0 && a % b === 0 ? a / b : null;
    default:
      return null;
  }
}

function fillTube(required: number, rng: () => number, max: number): number[] {
  const tube = new Set<number>([required]);
  let guard = 0;
  while (tube.size < 4 && guard < 100) {
    const candidate = Math.max(0, required + Math.floor((rng() - 0.5) * Math.max(6, max * 0.3)));
    tube.add(candidate);
    guard++;
  }
  while (tube.size < 4) tube.add(tube.size + max + 1);
  return shuffle(Array.from(tube));
}

/** Three tubes of four numbers; the bottom-most (index 3) of each is ready to drop. */
export function generateEquation(subject: Subject, level: Level): EquationPuzzle {
  const ops: Operator[] = subject === 'addition' ? ['+'] : subject === 'subtraction' ? ['-'] : subject === 'multiplication' ? ['×'] : subject === 'division' ? ['÷'] : level < 3 ? ['+', '-'] : ['+', '-', '×', '÷'];
  const op = pick(ops);
  const maxAdd = [10, 20, 50, 100, 500, 999][level - 1];
  const maxMul = [5, 5, 10, 12, 12, 25][level - 1];
  let a: number;
  let b: number;
  let c: number;
  if (op === '+') {
    a = randInt(1, maxAdd - 1);
    b = randInt(1, maxAdd - a);
    c = a + b;
  } else if (op === '-') {
    a = randInt(2, maxAdd);
    b = randInt(1, a - 1);
    c = a - b;
  } else if (op === '×') {
    a = randInt(1, maxMul);
    b = randInt(1, maxMul);
    c = a * b;
  } else {
    b = randInt(1, maxMul);
    c = randInt(1, maxMul);
    a = b * c;
  }
  const scale = op === '+' || op === '-' ? maxAdd : maxMul * maxMul;
  return {
    id: makeId(),
    operator: op,
    tubes: [fillTube(a, Math.random, scale), fillTube(b, Math.random, scale), fillTube(c, Math.random, scale)],
    solution: [a, b, c],
    hint: `${a} ${op} ${b} = ${c}. Recycle a tube until the number you need reaches the bottom.`
  };
}

/** Turn a parent-made problem (integer answer) into a playable multiple-choice problem. */
export function customToProblem(custom: CustomProblem, level: Level, choiceCount: number = 4): Problem {
  const answer = Math.max(0, Math.floor(Number(custom.answer)) || 0);
  const draft: Draft = {
    prompt: custom.prompt.includes('?') ? custom.prompt : `${custom.prompt} = ?`,
    answer: numChoice(answer),
    distractors: integerDistractors(answer, 5, [], 0).map(numChoice),
    hint: `This one was written by your teacher or parent. The answer is ${answer}.`
  };
  return finalize('review', level, draft, Math.max(2, Math.min(6, choiceCount)));
}
