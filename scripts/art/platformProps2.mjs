// Cave Runner / City Runner props part 2: hazards, exit, jetpack, bridge, cobweb, tube.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient } from '../lib/svg.mjs';
import { P } from './palette.mjs';

export function lavaPit() {
  const defs = [linearGradient('lavaGrad', [[0, P.lavaLight], [0.5, P.lava], [1, '#a32d00']])];
  return svg(128, 48, [rect(0, 8, 128, 40, flat('url(#lavaGrad)')), path('M0,10 Q16,2 32,10 Q48,18 64,10 Q80,2 96,10 Q112,18 128,10', { fill: 'none', stroke: P.lavaLight, 'stroke-width': 4 }), circle(30, 28, 5, flat(P.lavaLight, { opacity: 0.8 })), circle(90, 34, 4, flat(P.lavaLight, { opacity: 0.8 }))], defs);
}

export function fireStatue(zone = 'temple') {
  const stone = zone === 'ice' ? P.ice : P.temple;
  const dark = zone === 'ice' ? P.iceDark : P.templeDark;
  return svg(90, 130, [
    rect(20, 96, 50, 30, cel(dark, { rx: 3 })),
    path('M28,96 L30,40 Q45,20 60,40 L62,96 Z', cel(stone)),
    ellipse(38, 50, 5, 4, flat(P.ink)),
    ellipse(54, 50, 5, 4, flat(P.ink)),
    path('M36,70 Q45,62 54,70 L54,80 Q45,74 36,80 Z', cel(P.ink, { 'stroke-width': 2 })),
    path('M4,74 Q-6,60 14,58 Q6,50 24,54 Q16,44 34,58 L36,78 Q20,80 4,74 Z', cel(P.lava, { 'stroke-width': 2 })),
    path('M14,70 Q10,62 22,60 Q24,66 30,70 Z', flat(P.lavaLight))
  ]);
}

export function exitDoor() {
  return svg(110, 140, [
    path('M8,138 L8,60 Q55,4 102,60 L102,138 Z', cel(P.templeDark)),
    path('M22,138 L22,66 Q55,26 88,66 L88,138 Z', cel('#0b0810')),
    path('M28,134 L28,70 Q55,36 82,70 L82,134 Z', flat(P.screenGlow, { opacity: 0.2 })),
    rect(22, 12, 66, 26, cel('#ffd23f', { rx: 5 })),
    rect(26, 16, 58, 18, flat('#5a3a00', { rx: 3 }))
  ]);
}

export function jetpackPickup() {
  return svg(56, 64, [
    rect(8, 6, 18, 44, cel(P.jetpack, { rx: 6 })),
    rect(30, 6, 18, 44, cel(P.jetpack, { rx: 6 })),
    rect(12, 10, 10, 30, flat(P.jetpackDark, { rx: 4 })),
    rect(34, 10, 10, 30, flat(P.jetpackDark, { rx: 4 })),
    rect(24, 20, 8, 16, cel(P.trim, { 'stroke-width': 2 })),
    path('M13,52 Q17,64 21,52 M35,52 Q39,64 43,52', cel(P.flame, { 'stroke-width': 2 }))
  ]);
}

export function ropeBridge() {
  return svg(128, 34, [
    path('M0,8 Q64,26 128,8', { fill: 'none', stroke: P.rope, 'stroke-width': 4 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => rect(6 + i * 21, 12 + Math.sin((i / 5) * Math.PI) * 8, 16, 10, cel(P.wood, { rx: 2, 'stroke-width': 2 }))),
    path('M0,4 Q64,22 128,4', { fill: 'none', stroke: P.rope, 'stroke-width': 3 })
  ]);
}

export function cobwebTrampoline() {
  return svg(120, 44, [
    path('M4,40 Q60,0 116,40', { fill: 'none', stroke: '#e9e9f5', 'stroke-width': 4 }),
    path('M12,40 Q60,12 108,40', { fill: 'none', stroke: '#e9e9f5', 'stroke-width': 3 }),
    path('M24,40 Q60,24 96,40', { fill: 'none', stroke: '#e9e9f5', 'stroke-width': 2 }),
    ...[20, 40, 60, 80, 100].map((x) => line(x, 40, 60, 6, { stroke: '#e9e9f5', 'stroke-width': 1.5 })),
    rect(0, 40, 120, 4, flat(P.ink))
  ]);
}

/** Glass tube for the Equationator (90x320) with brass caps. */
export function glassTube() {
  const defs = [linearGradient('tubeGrad', [[0, '#ffffff', 0.55], [0.3, '#bfefff', 0.25], [0.7, '#7fd0ff', 0.25], [1, '#3a7fbf', 0.55]], { x1: 0, y1: 0, x2: 1, y2: 0 })];
  return svg(90, 320, [
    rect(10, 14, 70, 292, cel('url(#tubeGrad)', { rx: 22 })),
    rect(18, 24, 8, 270, flat('#ffffff', { opacity: 0.5, rx: 4 })),
    rect(4, 2, 82, 22, cel(P.goldDark, { rx: 6 })),
    rect(4, 296, 82, 22, cel(P.goldDark, { rx: 6 })),
    circle(14, 13, 3, flat(P.gold)),
    circle(76, 13, 3, flat(P.gold)),
    circle(14, 307, 3, flat(P.gold)),
    circle(76, 307, 3, flat(P.gold))
  ], defs);
}

/** Number token that sits inside a tube (60x60): brass ring, dark centre for text. */
export function tubeToken() {
  return svg(60, 60, [circle(30, 30, 27, cel(P.goldDark)), circle(30, 30, 21, flat('#2b2f45')), circle(22, 20, 5, flat('#fff', { opacity: 0.25 }))]);
}

/** Recycle bin below each tube (100x70). */
export function recycleBin() {
  return svg(100, 70, [
    path('M8,14 L92,14 L84,66 L16,66 Z', cel('#3f9a63')),
    rect(4, 6, 92, 12, cel('#2fbf5b', { rx: 4 })),
    path('M50,26 l10,6 l-6,0 l0,10 l-8,0 l0,-10 l-6,0 Z', flat('#d9ffe6')),
    path('M36,54 l0,-12 l8,0 M64,54 l0,-12 l-8,0', { fill: 'none', stroke: '#d9ffe6', 'stroke-width': 3 })
  ]);
}
