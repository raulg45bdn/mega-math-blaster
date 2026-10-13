// UI chrome: parchment score scroll, dialogue panel, buttons, console widgets, logo.
import { svg, g, rect, circle, ellipse, path, polygon, line, text, cel, flat, linearGradient, radialGradient } from '../lib/svg.mjs';
import { P } from './palette.mjs';

/** Score / timer scroll (220x210). The game writes SCORE, TIME, MATH TIPS, OPTIONS on it. */
export function scrollHud() {
  const defs = [linearGradient('parch', [[0, '#fbe7b0'], [0.5, P.scroll], [1, '#e2bd70']], { x1: 0, y1: 0, x2: 1, y2: 0 })];
  const roll = (y) => rect(6, y, 208, 26, cel(P.scrollDark, { rx: 13 })) + ellipse(12, y + 13, 8, 13, cel('#8a6420')) + ellipse(208, y + 13, 8, 13, cel('#8a6420')) + rect(24, y + 6, 172, 14, flat('#d9a84c', { rx: 7 }));
  return svg(220, 210, [
    path('M22,26 Q110,14 198,26 L198,184 Q110,196 22,184 Z', cel('url(#parch)')),
    path('M30,40 Q110,32 190,40', { fill: 'none', stroke: '#c9a25a', 'stroke-width': 2 }),
    roll(4),
    roll(180)
  ], defs);
}

/** Dialogue panel (940x210) with a portrait window on the left. */
export function dialogPanel() {
  const defs = [linearGradient('dlgGrad', [[0, '#1d2a6e'], [1, '#0d1436']])];
  return svg(940, 210, [
    rect(4, 4, 932, 202, cel('url(#dlgGrad)', { rx: 22, 'stroke-width': 4 })),
    rect(10, 10, 920, 190, { fill: 'none', stroke: P.gold, 'stroke-width': 3, rx: 18 }),
    rect(22, 22, 166, 166, cel('#0a0f2a', { rx: 14 })),
    circle(920, 24, 6, flat(P.gold)),
    circle(24, 190, 6, flat(P.gold))
  ], defs);
}

/** Chunky rounded menu button (300x70). variant colours: green | red | blue | gold | purple */
export function menuButton(variant = 'green') {
  const base = { green: P.buttonGreen, red: P.buttonRed, blue: P.buttonBlue, gold: P.buttonGold, purple: '#8a4fd8' }[variant];
  const defs = [linearGradient(`btn${variant}`, [[0, '#ffffff', 0.35], [0.5, base, 1], [1, base, 1]]), linearGradient(`btnDark${variant}`, [[0, base], [1, '#000000']])];
  return svg(300, 70, [
    rect(4, 6, 292, 60, cel(`url(#btnDark${variant})`, { rx: 30, 'stroke-width': 4 })),
    rect(8, 6, 284, 50, flat(`url(#btn${variant})`, { rx: 25 })),
    rect(26, 12, 200, 12, flat('#ffffff', { opacity: 0.35, rx: 6 }))
  ], defs);
}

/** Green LCD console button (250x52) for the subject/level panel. lit = selected. */
export function consoleButton(lit = false) {
  const defs = [linearGradient(`cbtn${lit}`, [[0, lit ? '#7fe0a0' : P.consoleLight], [1, lit ? '#2fbf5b' : P.console]])];
  return svg(250, 52, [
    rect(3, 3, 244, 46, cel(`url(#cbtn${lit})`, { rx: 8 })),
    rect(8, 8, 234, 36, { fill: 'none', stroke: lit ? '#d9ffe6' : '#7fd39a', 'stroke-width': 2, rx: 5, opacity: 0.8 }),
    rect(14, 10, 160, 6, flat('#ffffff', { opacity: 0.18, rx: 3 }))
  ], defs);
}

/** Round metal machine button (110x60) for OK / RESET / UNDO. colour: red | green | gold */
export function machineButton(colour = 'red') {
  const fill = { red: P.buttonRed, green: P.buttonGreen, gold: P.buttonGold }[colour];
  const defs = [radialGradient(`mbtn${colour}`, [[0, '#ffffff', 0.6], [0.4, fill, 1], [1, fill, 1]], { cx: 0.3, cy: 0.3 })];
  return svg(110, 60, [rect(2, 2, 106, 56, cel(P.metalDark, { rx: 12 })), rect(8, 8, 94, 44, flat(`url(#mbtn${colour})`, { rx: 10, stroke: P.ink, 'stroke-width': 2 })), circle(10, 10, 3, flat(P.metal)), circle(100, 10, 3, flat(P.metal)), circle(10, 50, 3, flat(P.metal)), circle(100, 50, 3, flat(P.metal))], defs);
}

/** Laser charge lamp (36x36). lit or dark. */
export function chargeLamp(lit = false) {
  const defs = [radialGradient(`lamp${lit}`, [[0, lit ? '#ffffff' : '#7a2a80'], [0.5, lit ? '#ff5e5e' : '#4a1a50'], [1, lit ? '#b00020' : '#2a0a30']], { cx: 0.35, cy: 0.35 })];
  return svg(36, 36, [circle(18, 18, 16, cel(`url(#lamp${lit})`)), lit ? circle(12, 12, 4, flat('#fff', { opacity: 0.8 })) : ''], defs);
}

/** Empty crystal socket (70x100). */
export function crystalSocket() {
  return svg(70, 100, [polygon([[35, 8], [62, 34], [54, 92], [16, 92], [8, 34]], cel('#141a33', { 'stroke-dasharray': '6 5', 'stroke-width': 3, stroke: '#6c7bb8' })), circle(35, 50, 6, flat('#2a3560'))]);
}

/** Wooden sign (260x80) for level names / EXIT posts. */
export function woodSign() {
  return svg(260, 80, [rect(4, 4, 252, 60, cel(P.wood, { rx: 8 })), rect(12, 12, 236, 44, { fill: 'none', stroke: P.woodDark, 'stroke-width': 3, rx: 5 }), rect(120, 62, 20, 16, cel(P.woodDark))]);
}

/** Title logo (760x200): MEGA MATH BLASTER with a 3D extrusion. */
export function logo() {
  const defs = [linearGradient('logoGrad', [[0, '#fff7c2'], [0.45, P.gold], [1, '#e0641c']]), linearGradient('logoGrad2', [[0, '#8ff0ff'], [0.5, '#2fa8ff'], [1, '#1b3fbf']])];
  const extrude = (str, x, y, size, depth) => Array.from({ length: depth }, (_, i) => text(x + depth - i, y + depth - i, str, { 'font-size': size, fill: '#3a1a66', stroke: P.ink, 'stroke-width': 8, 'paint-order': 'stroke' })).join('');
  return svg(760, 200, [
    extrude('MEGA', 380, 78, 64, 7),
    text(380, 78, 'MEGA', { 'font-size': 64, fill: 'url(#logoGrad2)', stroke: P.ink, 'stroke-width': 5, 'paint-order': 'stroke', 'letter-spacing': 4 }),
    extrude('MATH BLASTER', 380, 168, 88, 9),
    text(380, 168, 'MATH BLASTER', { 'font-size': 88, fill: 'url(#logoGrad)', stroke: P.ink, 'stroke-width': 6, 'paint-order': 'stroke', 'letter-spacing': 2 }),
    polygon([[30, 60], [50, 66], [30, 72], [24, 66]], flat('#fff')),
    polygon([[730, 40], [750, 46], [730, 52], [724, 46]], flat('#fff'))
  ], defs);
}

/** Energy meter frame (400x40) used by the Equationator generator. */
export function energyMeter() {
  return svg(400, 40, [rect(2, 2, 396, 36, cel(P.metalDark, { rx: 10 })), rect(10, 10, 380, 20, flat('#0c1020', { rx: 6 })), ...[0, 1, 2, 3].map((i) => line(86 + i * 76, 10, 86 + i * 76, 30, { stroke: P.metalDark, 'stroke-width': 2 }))]);
}
