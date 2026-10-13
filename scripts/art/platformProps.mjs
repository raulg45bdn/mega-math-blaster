// Cave Runner / City Runner props part 1: gate machine, bubble, droplet, projectiles, platforms.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient } from '../lib/svg.mjs';
import { P } from './palette.mjs';

/**
 * Number gate machine (240x200): a carved stone face whose mouth is the doorway.
 * Two number plates hang at the sides; the game writes the values on them.
 * state: 'closed' (energy bars in the mouth) | 'open'
 */
export function gateMachine(state = 'closed') {
  const bars = state === 'closed' ? [0, 1, 2, 3].map((i) => rect(92 + i * 16, 112, 6, 74, cel(P.laser, { rx: 3, 'stroke-width': 2 }))).join('') : '';
  const glow = state === 'open' ? rect(86, 108, 68, 82, flat(P.screenGlow, { opacity: 0.25, rx: 6 })) : '';
  const plate = (x) => rect(x, 30, 64, 40, cel('#d8c9a8', { rx: 6 })) + rect(x + 5, 35, 54, 30, flat('#2b2f45', { rx: 4 })) + line(x + 32, 8, x + 32, 30, { stroke: P.ink, 'stroke-width': 4 });
  return svg(240, 200, [
    path('M40,196 L36,60 Q60,10 120,10 Q180,10 204,60 L200,196 Z', cel(P.templeDark)),
    path('M52,180 L50,70 Q70,28 120,26 Q170,28 190,70 L188,180 Z', flat(P.temple)),
    ellipse(88, 78, 18, 12, cel(P.ink)),
    ellipse(152, 78, 18, 12, cel(P.ink)),
    circle(90, 78, 6, flat(P.laser)),
    circle(154, 78, 6, flat(P.laser)),
    polygon([[120, 84], [108, 104], [132, 104]], cel(P.templeDark)),
    path('M84,108 L156,108 L154,194 L86,194 Z', cel('#141021')),
    glow,
    bars,
    polygon([[88, 108], [96, 122], [104, 108]], flat('#e8e0c8')),
    polygon([[112, 108], [120, 122], [128, 108]], flat('#e8e0c8')),
    polygon([[136, 108], [144, 122], [152, 108]], flat('#e8e0c8')),
    plate(4),
    plate(172),
    rect(0, 186, 240, 14, cel(P.templeDark))
  ]);
}

/** Thought bubble for Blasternaut's carried number (120x84). */
export function thoughtBubble() {
  return svg(120, 84, [
    circle(18, 76, 5, cel('#fff', { 'stroke-width': 2 })),
    circle(30, 64, 8, cel('#fff', { 'stroke-width': 2 })),
    path('M30,20 Q34,4 54,8 Q64,0 80,6 Q100,2 106,20 Q120,28 108,44 Q112,58 92,58 Q80,68 62,58 Q40,64 36,48 Q22,40 30,20 Z', cel('#fff'))
  ]);
}

/** Operation droplet (36x48): teal drop carrying +3, ×2 etc. (text drawn by game). */
export function droplet() {
  return svg(36, 48, [path('M18,2 Q34,24 30,36 Q18,50 6,36 Q2,24 18,2 Z', cel('#3fd0c9')), ellipse(12, 30, 3, 6, flat('#d9fffd', { opacity: 0.8 }))]);
}

export function bananaPeel() {
  return svg(44, 34, [path('M6,26 Q4,8 22,6 Q40,6 38,26 Q30,20 22,30 Q14,20 6,26 Z', cel('#f5d62c')), path('M12,22 Q22,12 32,22', { fill: 'none', stroke: '#b89a10', 'stroke-width': 2 }), circle(22, 8, 3, flat('#6b4f10'))]);
}

export function clothespin() {
  return svg(44, 22, [rect(2, 4, 40, 6, cel(P.wood, { rx: 2, 'stroke-width': 2 })), rect(2, 12, 40, 6, cel(P.wood, { rx: 2, 'stroke-width': 2 })), rect(18, 2, 10, 18, cel(P.metal, { rx: 3, 'stroke-width': 2 }))]);
}

export function pacifier() {
  return svg(40, 40, [circle(20, 26, 12, cel('#5aa9f0')), circle(20, 26, 5, cel('#f0f4ff', { 'stroke-width': 2 })), ellipse(20, 10, 8, 8, cel('#ffb3c1', { 'stroke-width': 2 })), rect(16, 14, 8, 6, flat('#ffb3c1'))]);
}

/** Platforms (all 128 wide, tileable end to end). */
export function plankPlatform() {
  return svg(128, 28, [rect(2, 4, 124, 20, cel(P.wood, { rx: 3 })), line(2, 12, 126, 12, { stroke: P.woodDark, 'stroke-width': 2, opacity: 0.6 }), line(40, 4, 42, 24, { stroke: P.woodDark, 'stroke-width': 2 }), line(88, 4, 86, 24, { stroke: P.woodDark, 'stroke-width': 2 }), circle(12, 9, 2, flat(P.metalDark)), circle(116, 9, 2, flat(P.metalDark))]);
}

export function icePlatform() {
  const defs = [linearGradient('iceGrad', [[0, '#ffffff'], [0.4, P.ice], [1, P.iceDark]])];
  return svg(128, 32, [path('M4,6 L124,4 L126,26 Q100,32 64,28 Q30,32 2,26 Z', cel('url(#iceGrad)')), line(20, 10, 60, 8, { stroke: '#fff', 'stroke-width': 2, opacity: 0.8 }), polygon([[30, 26], [36, 40], [42, 26]], flat(P.ice)), polygon([[90, 26], [94, 36], [98, 26]], flat(P.ice))], defs);
}

export function templePlatform() {
  return svg(128, 32, [rect(2, 2, 124, 28, cel(P.temple, { rx: 2 })), line(2, 16, 126, 16, { stroke: P.templeDark, 'stroke-width': 2 }), line(64, 2, 64, 16, { stroke: P.templeDark, 'stroke-width': 2 }), line(32, 16, 32, 30, { stroke: P.templeDark, 'stroke-width': 2 }), line(96, 16, 96, 30, { stroke: P.templeDark, 'stroke-width': 2 }), path('M6,6 Q20,2 30,8', { fill: 'none', stroke: P.templeMoss, 'stroke-width': 3 })]);
}

export function junglePlatform() {
  return svg(128, 32, [rect(2, 8, 124, 18, cel(P.wood, { rx: 9 })), path('M0,10 Q30,0 60,12 Q90,22 128,8', { fill: 'none', stroke: P.jungle, 'stroke-width': 5 }), ellipse(24, 8, 8, 5, cel(P.jungleLight, { 'stroke-width': 2 })), ellipse(100, 10, 8, 5, cel(P.jungleLight, { 'stroke-width': 2 })), ellipse(62, 6, 7, 4, cel(P.jungleLight, { 'stroke-width': 2 }))]);
}

export function mushroomPlatform() {
  return svg(128, 44, [path('M4,30 Q64,-10 124,30 Z', cel('#e04a6a')), circle(30, 16, 6, flat('#fff', { opacity: 0.9 })), circle(70, 10, 7, flat('#fff', { opacity: 0.9 })), circle(102, 20, 5, flat('#fff', { opacity: 0.9 })), rect(48, 30, 32, 12, cel('#f3e2c2', { rx: 4 }))]);
}

export function girderPlatform() {
  return svg(128, 28, [rect(2, 2, 124, 24, cel('#c94f2b', { rx: 2 })), ...[0, 1, 2, 3].map((i) => polygon([[8 + i * 30, 6], [22 + i * 30, 22], [36 + i * 30, 6]], { fill: 'none', stroke: P.ink, 'stroke-width': 3 })), circle(8, 8, 2, flat(P.gold)), circle(120, 8, 2, flat(P.gold))]);
}
