// Spot, Gelator and Freud.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat } from '../lib/svg.mjs';
import { P } from './palette.mjs';

/** Spot: Blasternaut's purple-pink pet (70x70). mood: 'happy' | 'scared' */
export function spot(mood = 'happy') {
  const scared = mood === 'scared';
  return svg(70, 70, [
    line(35, 22, 30, 6, { stroke: P.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    circle(30, 5, 5, cel(P.gem, { 'stroke-width': 2 })),
    path('M6,44 Q0,30 12,30 Q20,32 16,42 Z', cel(P.spotDark, { 'stroke-width': 2 })),
    ellipse(35, 44, 26, 22, cel(P.spot)),
    ellipse(35, 52, 16, 10, flat(P.spotBelly, { opacity: 0.85 })),
    circle(27, 38, 8, cel('#fff', { 'stroke-width': 2 })),
    circle(45, 38, 8, cel('#fff', { 'stroke-width': 2 })),
    circle(28, 39, scared ? 2.5 : 4, flat(P.ink)),
    circle(46, 39, scared ? 2.5 : 4, flat(P.ink)),
    scared ? ellipse(36, 54, 6, 5, cel('#5a0f3a', { 'stroke-width': 2 })) : path('M29,51 Q36,57 43,51', { fill: 'none', stroke: P.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
    ellipse(24, 66, 9, 4, cel(P.spotDark, { 'stroke-width': 2 })),
    ellipse(46, 66, 9, 4, cel(P.spotDark, { 'stroke-width': 2 })),
    circle(58, 30, 2, flat('#fff', { opacity: 0.6 }))
  ]);
}

/** Gelator: yellow slime with three eyes (180x180). mood: 'grin' | 'angry' */
export function gelator(mood = 'grin') {
  const angry = mood === 'angry';
  const eye = (x, y, r) =>
    circle(x, y, r, cel('#fff', { 'stroke-width': 2 })) +
    circle(x, y + 2, r * 0.5, flat('#c0392b')) +
    circle(x, y + 2, r * 0.25, flat(P.ink)) +
    (angry ? line(x - r, y - r * 0.9, x + r, y - r * 0.5, { stroke: P.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }) : '');
  const teeth = [0, 1, 2, 3, 4, 5].map((i) => polygon([[62 + i * 10, 112], [67 + i * 10, 124], [72 + i * 10, 112]], flat('#fff'))).join('');
  return svg(180, 180, [
    path('M30,150 Q10,90 40,56 Q70,20 118,30 Q166,44 160,100 Q166,140 140,156 Q90,176 30,150 Z', cel(P.gelator)),
    path('M50,60 Q70,42 100,46 Q80,54 66,70 Z', flat(P.gelatorLight, { opacity: 0.7 })),
    path('M40,150 Q44,176 50,150 M96,158 Q100,180 106,158 M130,152 Q132,172 138,152', { fill: 'none', stroke: P.gelatorDark, 'stroke-width': 6, 'stroke-linecap': 'round' }),
    eye(60, 74, 13),
    eye(92, 66, 15),
    eye(124, 74, 13),
    path(angry ? 'M56,118 Q92,96 130,118 L128,128 Q92,112 58,128 Z' : 'M54,108 Q92,146 132,108 L128,104 Q92,132 58,104 Z', cel('#5a0f18', { 'stroke-width': 2 })),
    angry ? '' : teeth,
    path('M18,110 Q0,120 14,134', cel(P.gelator, { 'stroke-width': 3 })),
    path('M164,104 Q184,112 172,130', cel(P.gelator, { 'stroke-width': 3 })),
    circle(150, 60, 4, flat(P.gelatorLight)),
    circle(36, 96, 3, flat(P.gelatorLight))
  ]);
}

/** Freud: Blasternaut's wrist analyzer (110x80), a green face with round glasses. */
export function freud() {
  return svg(110, 80, [
    rect(6, 10, 98, 62, cel(P.metal, { rx: 10 })),
    rect(16, 18, 66, 46, cel(P.screen, { rx: 6 })),
    circle(92, 30, 4, flat(P.laser)),
    circle(92, 44, 4, flat(P.screenGlow)),
    rect(88, 54, 10, 6, flat(P.metalDark, { rx: 2 })),
    ellipse(49, 42, 20, 18, flat(P.screenGlow, { opacity: 0.9 })),
    circle(41, 38, 6, { fill: 'none', stroke: P.ink, 'stroke-width': 2.5 }),
    circle(57, 38, 6, { fill: 'none', stroke: P.ink, 'stroke-width': 2.5 }),
    line(47, 38, 51, 38, { stroke: P.ink, 'stroke-width': 2.5 }),
    circle(41, 38, 2, flat(P.ink)),
    circle(57, 38, 2, flat(P.ink)),
    path('M40,48 Q49,44 58,48 Q49,54 40,48 Z', flat(P.ink)),
    path('M42,54 Q49,59 56,54', { fill: 'none', stroke: P.ink, 'stroke-width': 2 }),
    line(52, 10, 52, 2, { stroke: P.ink, 'stroke-width': 3 }),
    circle(52, 2, 3, flat(P.laser))
  ]);
}
