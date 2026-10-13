import { describe, it, expect } from 'vitest';
import { CAVE_LEVELS, CITY_LEVEL, validateLevel } from '../src/content/Levels';

describe('Level maps', () => {
  [...CAVE_LEVELS, CITY_LEVEL].forEach((level) => {
    it(`${level.name} is well-formed`, () => {
      expect(validateLevel(level)).toEqual([]);
    });
  });
});
