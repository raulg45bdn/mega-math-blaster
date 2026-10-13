import { describe, it, expect } from 'vitest';
import { generateProblem, generateGate, generateEquation, evaluate, integerDistractors } from '../src/content/Curriculum';
import { Level, Subject, SUBJECTS } from '../src/types';

const CYCLES = 1000;
const LEVELS: Level[] = [1, 2, 3, 4, 5, 6];

function parseValue(v: string): number {
  if (v.includes('/')) {
    const [n, d] = v.split('/').map(Number);
    return n / d;
  }
  return Number(v);
}

/** Recompute the answer from the prompt for the arithmetic subjects. */
function computeFromPrompt(prompt: string): number | null {
  const m = prompt.match(/^(\d+) ([+\-×÷]) (\d+) = \?$/);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[3]);
  switch (m[2]) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return a / b;
    default:
      return null;
  }
}

describe('Curriculum problems', () => {
  SUBJECTS.forEach((subject: Subject) => {
    LEVELS.forEach((level) => {
      it(`${subject} level ${level}: ${CYCLES / 6} problems are well-formed`, () => {
        for (let i = 0; i < CYCLES / 6; i++) {
          const p = generateProblem(subject, level);
          expect(p.level).toBe(level);
          expect(p.prompt.length).toBeGreaterThan(0);
          expect(p.hint.length).toBeGreaterThan(0);
          expect(p.choices).toHaveLength(4);
          expect(p.choices.map((c) => c.value)).toContain(p.answer.value);
          expect(new Set(p.choices.map((c) => c.value)).size).toBe(4);
          p.choices.forEach((c) => {
            expect(c.label.length).toBeGreaterThan(0);
            expect(Number.isFinite(parseValue(c.value))).toBe(true);
            expect(parseValue(c.value)).toBeGreaterThanOrEqual(0);
          });
          const computed = computeFromPrompt(p.prompt);
          if (computed !== null) {
            expect(Number.isInteger(computed)).toBe(true);
            expect(parseValue(p.answer.value)).toBe(computed);
          }
        }
      });
    });
  });

  it('division prompts never divide by zero and always divide evenly', () => {
    for (let i = 0; i < CYCLES; i++) {
      const p = generateProblem('division', (1 + (i % 6)) as Level);
      const m = p.prompt.match(/^(\d+) ÷ (\d+) = \?$/);
      expect(m).not.toBeNull();
      const dividend = Number(m![1]);
      const divisor = Number(m![2]);
      expect(divisor).toBeGreaterThanOrEqual(1);
      expect(dividend % divisor).toBe(0);
    }
  });

  it('subtraction never produces negative answers or choices', () => {
    for (let i = 0; i < CYCLES; i++) {
      const p = generateProblem('subtraction', (1 + (i % 6)) as Level);
      expect(Number(p.answer.value)).toBeGreaterThanOrEqual(0);
      p.choices.forEach((c) => expect(Number(c.value)).toBeGreaterThanOrEqual(0));
    }
  });

  it('review problems draw from real subjects', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateProblem('review', 3);
      expect(p.subject).not.toBe('review');
      expect(SUBJECTS).toContain(p.subject);
    }
  });

  it('supports six floating choices for the harder cockpit rounds', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateProblem('multiplication', 3, 6);
      expect(p.choices).toHaveLength(6);
      expect(new Set(p.choices.map((c) => c.value)).size).toBe(6);
    }
  });

  it('integer distractors are unique, bounded and never the answer', () => {
    for (let answer = 0; answer <= 300; answer++) {
      const d = integerDistractors(answer, 5, [], 0);
      expect(d).toHaveLength(5);
      expect(new Set(d).size).toBe(5);
      expect(d).not.toContain(answer);
      d.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    }
  });
});

describe('Cave Runner gates', () => {
  it('always has exactly one plate strictly between the gate values', () => {
    for (let i = 0; i < CYCLES; i++) {
      const subject = SUBJECTS[i % SUBJECTS.length];
      const level = (1 + (i % 6)) as Level;
      const gate = generateGate(subject, level);
      expect(gate.highValue - gate.lowValue).toBeGreaterThanOrEqual(2);
      expect(gate.plates).toHaveLength(3);
      expect(new Set(gate.plates).size).toBe(3);
      const inside = gate.plates.filter((p) => p > gate.lowValue && p < gate.highValue);
      expect(inside).toEqual([gate.correctPlate]);
      gate.plates.forEach((p) => expect(p).toBeGreaterThanOrEqual(0));
      expect(gate.lowLabel.length).toBeGreaterThan(0);
      expect(gate.highLabel.length).toBeGreaterThan(0);
    }
  });

  it('expression labels evaluate to the gate values', () => {
    for (let i = 0; i < CYCLES; i++) {
      const gate = generateGate(SUBJECTS[i % SUBJECTS.length], (3 + (i % 4)) as Level);
      [[gate.lowLabel, gate.lowValue], [gate.highLabel, gate.highValue]].forEach(([label, value]) => {
        const m = String(label).match(/^(\d+) ([+\-×÷]) (\d+)$/);
        if (m) {
          const result = evaluate(Number(m[1]), m[2] as '+' | '-' | '×' | '÷', Number(m[3]));
          expect(result).toBe(value);
        } else {
          expect(Number(label)).toBe(value);
        }
      });
    }
  });
});

describe('Equationator puzzles', () => {
  it('always contain a true equation using one number from each tube', () => {
    for (let i = 0; i < CYCLES; i++) {
      const subject = SUBJECTS[i % SUBJECTS.length];
      const level = (1 + (i % 6)) as Level;
      const puzzle = generateEquation(subject, level);
      expect(puzzle.tubes).toHaveLength(3);
      puzzle.tubes.forEach((tube) => {
        expect(tube).toHaveLength(4);
        expect(new Set(tube).size).toBe(4);
        tube.forEach((n) => expect(n).toBeGreaterThanOrEqual(0));
      });
      const [a, b, c] = puzzle.solution;
      expect(puzzle.tubes[0]).toContain(a);
      expect(puzzle.tubes[1]).toContain(b);
      expect(puzzle.tubes[2]).toContain(c);
      expect(evaluate(a, puzzle.operator, b)).toBe(c);
      if (puzzle.operator === '÷') expect(b).toBeGreaterThanOrEqual(1);
      if (subject === 'addition') expect(puzzle.operator).toBe('+');
      if (subject === 'division') expect(puzzle.operator).toBe('÷');
    }
  });
});

describe('evaluate', () => {
  it('rejects division by zero and inexact quotients', () => {
    expect(evaluate(6, '÷', 0)).toBeNull();
    expect(evaluate(7, '÷', 2)).toBeNull();
    expect(evaluate(8, '÷', 2)).toBe(4);
    expect(evaluate(3, '×', 4)).toBe(12);
    expect(evaluate(9, '-', 4)).toBe(5);
    expect(evaluate(9, '+', 4)).toBe(13);
  });
});

describe('Custom problems from the editor', () => {
  it('become well-formed multiple-choice problems', async () => {
    const { customToProblem } = await import('../src/content/Curriculum');
    for (let i = 0; i < 200; i++) {
      const answer = i % 60;
      const p = customToProblem({ prompt: `${answer} + 0`, answer: `${answer}` }, 2);
      expect(p.subject).toBe('review');
      expect(p.prompt).toBe(`${answer} + 0 = ?`);
      expect(p.answer.value).toBe(`${answer}`);
      expect(p.choices).toHaveLength(4);
      expect(new Set(p.choices.map((c) => c.value)).size).toBe(4);
      expect(p.choices.map((c) => c.value)).toContain(`${answer}`);
    }
    const junk = customToProblem({ prompt: 'weird', answer: 'abc' }, 1);
    expect(junk.answer.value).toBe('0');
  });
});
