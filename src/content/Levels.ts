/**
 * ASCII level maps for Cave Runner and City Runner. One character per 64px tile,
 * 12 rows tall (768px). Legend:
 *   #  solid block            =  one-way platform (bridge / mushroom)
 *   L  lava pit               S  fire statue
 *   T  troll                  G  number gate (blocks the only path)
 *   1 2 3  number plates for the next gate to the right
 *   D  operation droplet      J  jetpack pickup
 *   E  exit door              K  key (City Runner: unlocks the exit)
 *   g  gem   b  gift box   c  crystal cluster   e  egg token   p  computer pad
 *   W  cobweb trampoline      B  Blasternaut start
 */
export type Zone = 'ice' | 'temple' | 'jungle' | 'city';

export interface LevelDef {
  zone: Zone;
  name: string;
  rows: string[];
}

export const CAVE_LEVELS: LevelDef[] = [
  {
    zone: 'ice',
    name: 'ICE CAVES',
    rows: [
      '.....................................#............#.....',
      '.....................................#............#.....',
      '..................g..................#..g.........#.....',
      '.................###.................#.###........#.....',
      '..........g.................2........#..........c.#.....',
      '.........###...............###.......#..3......####.....',
      '......................1..............#...........1#.....',
      '......J.......T..3...................#.....2..T...#.....',
      '....#####....######.........#####....#......#####.#.....',
      '........................................................',
      '..B.........g............D.....g.....G.....c...g..G..E..',
      '########################LLL#############################'
    ]
  },
  {
    zone: 'temple',
    name: 'TEMPLE CAVES',
    rows: [
      '..............................#...................#.....',
      '..............................#...................#.....',
      '........g.....................#.........g.........#.....',
      '.......###....................#........###........#.....',
      '...............2..............#..................1#.....',
      '..............###.............#.....2...........###.....',
      '........1.............3.......#....###..3.........#.....',
      '.......###...........###......#..................c#.....',
      '....###..........###..........#.......#####.......###...',
      '........................................................',
      '..B.......T.....g....D..S.....G....T.......g.S....G...E.',
      '#################LLL####################LL##############'
    ]
  },
  {
    zone: 'jungle',
    name: 'JUNGLE CAVES',
    rows: [
      '..................................................#.....',
      '.....................#............................#.....',
      '.........g.......3...#..........g.................#.....',
      '........###..........#.........###.......g........#.....',
      '..............1......#..................###......2#.....',
      '.............###.....#....3.....................###.....',
      '......T..............#...###...1.......g.....T....#.....',
      '....###....=====..2..#.........###.....##.........#c....',
      '...............###...#......................###...#.....',
      '........................................................',
      '..B.....g....D.......G.....g....W....T.......g....G...E.',
      '#####################################LLL################'
    ]
  }
];

export const CITY_LEVEL: LevelDef = {
  zone: 'city',
  name: 'CITY RUNNER BONUS',
  rows: [
    '...................................................E....',
    '..................................................####..',
    '...........g............b......................c........',
    '..........###..........###..............g.....###.......',
    '.....................................g.###..............',
    '....g..........c..........g..........###..........e.....',
    '...###........###........###....................####....',
    '..........................................T.............',
    '..............T...........=====.......#####.............',
    '..........####..........................................',
    '..B.....g......b.....K......g.......g.....p.....c.......',
    '########################################################'
  ]
};

export const TILE = 64;
export const LEVEL_ROWS = 12;

/** Validate a level: rectangular, 12 rows, one start, plates in threes before each gate. */
export function validateLevel(level: LevelDef): string[] {
  const problems: string[] = [];
  if (level.rows.length !== LEVEL_ROWS) problems.push(`${level.name}: expected ${LEVEL_ROWS} rows, got ${level.rows.length}`);
  const width = level.rows[0].length;
  level.rows.forEach((row, i) => {
    if (row.length !== width) problems.push(`${level.name}: row ${i} has width ${row.length}, expected ${width}`);
  });
  const starts = level.rows.join('').split('B').length - 1;
  if (starts !== 1) problems.push(`${level.name}: expected exactly one start, found ${starts}`);
  const exits = level.rows.join('').split('E').length - 1;
  if (exits !== 1) problems.push(`${level.name}: expected exactly one exit, found ${exits}`);
  // Plates are assigned to the next gate to their right; each gate needs exactly three.
  const gateCols: number[] = [];
  const plateCols: number[] = [];
  level.rows.forEach((row) => {
    [...row].forEach((ch, col) => {
      if (ch === 'G') gateCols.push(col);
      if (ch === '1' || ch === '2' || ch === '3') plateCols.push(col);
    });
  });
  gateCols.sort((a, b) => a - b);
  let previous = -1;
  gateCols.forEach((gateCol) => {
    const count = plateCols.filter((c) => c > previous && c < gateCol).length;
    if (count !== 3) problems.push(`${level.name}: gate at column ${gateCol} has ${count} plates before it, expected 3`);
    previous = gateCol;
  });
  if (level.zone === 'city') {
    const keys = level.rows.join('').split('K').length - 1;
    if (keys !== 1) problems.push(`${level.name}: city level needs exactly one key, found ${keys}`);
  }
  return problems;
}
