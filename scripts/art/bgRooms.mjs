// Room backdrops (1024x768): Equationator chamber, subject console, title backdrop.
import { svg, rect, circle, ellipse, path, polygon, line, text, cel, flat, linearGradient, radialGradient, seededRandom, rnd } from '../lib/svg.mjs';
import { P } from './palette.mjs';

const W = 1024;
const H = 768;

/** Generator room: brass machinery, pipes, a big power generator on the right. */
export function generatorChamber() {
  const rng = seededRandom(61);
  const defs = [linearGradient('chamberWall', [[0, '#2b1f3f'], [1, '#4a3a5e']]), linearGradient('brass', [[0, '#f0c860'], [0.5, '#b8860b'], [1, '#6b4f10']]), radialGradient('coreGlow', [[0, '#fff7a0', 0.9], [0.5, '#ff9a1f', 0.6], [1, '#ff9a1f', 0]])];
  const pipes = [];
  for (let i = 0; i < 6; i++) {
    const y = 40 + i * 24;
    pipes.push(rect(0, y, W, 14, cel('url(#brass)', { rx: 7, 'stroke-width': 2 })));
  }
  for (let i = 0; i < 5; i++) {
    const x = 60 + i * 200 + rnd(rng, -20, 20);
    pipes.push(rect(x, 40, 22, 620, cel('url(#brass)', { rx: 11, 'stroke-width': 2 })), circle(x + 11, 200 + i * 60, 16, cel('#3a2a1a')));
  }
  const rivets = [];
  for (let i = 0; i < 40; i++) rivets.push(circle(rng() * W, rnd(rng, 200, 700), 3, flat('#d9c27a', { opacity: 0.7 })));
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#chamberWall)')),
    ...pipes,
    ...rivets,
    // generator
    rect(700, 260, 280, 400, cel('#6b5a80', { rx: 18 })),
    rect(720, 280, 240, 60, cel('#3a2a4a', { rx: 10 })),
    circle(840, 470, 90, cel('#2a1f3a')),
    circle(840, 470, 70, flat('url(#coreGlow)')),
    ...[0, 1, 2].map((i) => rect(730 + i * 80, 560, 60, 80, cel('#2a1f3a', { rx: 8 }))),
    rect(0, 660, W, 108, cel('#3a2f4a')),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => rect(i * 128, 660, 128, 108, { fill: 'none', stroke: '#2a1f3a', 'stroke-width': 4 }))
  ], defs);
}

/** Subject / level selection console: green LCD panel in a tech frame. */
export function consolePanel() {
  const defs = [linearGradient('panelGrad', [[0, P.consoleLight], [0.5, P.console], [1, P.consoleDark]]), linearGradient('frameGrad', [[0, '#8892a8'], [1, '#3f4760']])];
  const vents = [];
  for (let i = 0; i < 14; i++) vents.push(rect(30, 90 + i * 40, 60, 14, cel('#2a3040', { rx: 7, 'stroke-width': 2 })), rect(934, 90 + i * 40, 60, 14, cel('#2a3040', { rx: 7, 'stroke-width': 2 })));
  return svg(W, H, [
    rect(0, 0, W, H, flat('#101426')),
    rect(10, 10, W - 20, H - 20, cel('url(#frameGrad)', { rx: 30, 'stroke-width': 5 })),
    ...vents,
    rect(110, 40, 804, 688, cel('url(#panelGrad)', { rx: 24, 'stroke-width': 5 })),
    rect(124, 54, 776, 660, { fill: 'none', stroke: '#7fd39a', 'stroke-width': 2, rx: 18, opacity: 0.6 }),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => line(124, 60 + i * 56, 900, 60 + i * 56, { stroke: '#7fd39a', 'stroke-width': 1, opacity: 0.12 })),
    ...[0, 1, 2, 3].map((i) => circle(140 + i * 36, 700, 8, cel([P.laser, P.gold, P.screenGlow, P.crystalBlue][i], { 'stroke-width': 2 }))),
    ...[0, 1, 2, 3].map((i) => circle(884 - i * 36, 700, 8, cel([P.laser, P.gold, P.screenGlow, P.crystalBlue][i], { 'stroke-width': 2 })))
  ], defs);
}

/** Title backdrop: Moldar hanging in space under the ooze, with Gelator's ship trail. */
export function titleBackdrop() {
  const rng = seededRandom(73);
  const defs = [linearGradient('titleSpace', [[0, '#0a0620'], [0.6, '#1c1250'], [1, '#3b1a6e']]), radialGradient('planetGrad', [[0, '#7fd35b'], [0.6, '#2f8f5b'], [1, '#123f2a']], { cx: 0.35, cy: 0.35 }), radialGradient('oozeGlow', [[0, P.ooze, 0.95], [1, P.oozeDark, 0.9]], { cx: 0.4, cy: 0.4 })];
  const stars = [];
  for (let i = 0; i < 220; i++) stars.push(circle(rng() * W, rng() * H, rnd(rng, 0.6, 2.2), flat('#fff', { opacity: rnd(rng, 0.4, 1) })));
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#titleSpace)')),
    ...stars,
    circle(760, 560, 190, cel('url(#planetGrad)', { 'stroke-width': 4 })),
    path('M600,470 Q700,400 820,430 Q900,480 880,560 Q840,600 760,580 Q680,560 600,470 Z', flat('url(#oozeGlow)')),
    path('M640,600 Q700,650 780,640 Q820,700 900,660', { fill: 'none', stroke: P.ooze, 'stroke-width': 14, 'stroke-linecap': 'round' }),
    ellipse(760, 560, 250, 40, { fill: 'none', stroke: '#c9b6ff', 'stroke-width': 8, opacity: 0.6, transform: 'rotate(-18 760 560)' }),
    path('M80,640 Q300,560 520,600', { fill: 'none', stroke: P.ooze, 'stroke-width': 6, 'stroke-dasharray': '18 14', opacity: 0.8 })
  ], defs);
}
