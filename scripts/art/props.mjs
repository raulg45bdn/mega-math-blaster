// Space objects and pickups.
import { svg, g, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, seededRandom, blob, smoothClosed, star } from '../lib/svg.mjs';
import { P } from './palette.mjs';

/** Asteroid variants 0..2 (100x100). */
export function asteroid(variant = 0) {
  const rng = seededRandom(1000 + variant * 77);
  const outline = smoothClosed(blob(50, 50, 40, 36, 9, 0.22, rng, variant));
  const craters = [0, 1, 2, 3].map(() => {
    const cx = 30 + rng() * 40;
    const cy = 30 + rng() * 40;
    const r = 4 + rng() * 7;
    return ellipse(cx, cy, r, r * 0.7, flat(P.asteroidDark, { opacity: 0.8 })) + ellipse(cx - 1, cy - 2, r * 0.8, r * 0.4, flat(P.asteroidLight, { opacity: 0.35 }));
  }).join('');
  const defs = [radialGradient(`astGrad${variant}`, [[0, P.asteroidLight], [0.6, P.asteroid], [1, P.asteroidDark]], { cx: 0.35, cy: 0.3, r: 0.8 })];
  return svg(100, 100, [path(outline, cel(`url(#astGrad${variant})`)), craters], defs);
}

/** Satellite (110x70): body, solar wings, dish. */
export function satellite() {
  const panel = (x) => rect(x, 22, 30, 26, cel('#2c5fd6', { rx: 2 })) + [0, 1, 2].map((i) => line(x + 10 * i + 10, 22, x + 10 * i + 10, 48, { stroke: '#9ec4ff', 'stroke-width': 1.5 })).join('') + line(x, 35, x + 30, 35, { stroke: '#9ec4ff', 'stroke-width': 1.5 });
  return svg(110, 70, [
    line(30, 35, 80, 35, { stroke: P.ink, 'stroke-width': 6 }),
    panel(2),
    panel(78),
    rect(40, 20, 30, 30, cel(P.metal, { rx: 4 })),
    rect(44, 24, 22, 10, flat(P.metalDark, { rx: 2 })),
    circle(49, 44, 3, flat(P.laser)),
    circle(61, 44, 3, flat(P.screenGlow)),
    ellipse(55, 10, 14, 6, cel(P.metal, { 'stroke-width': 2 })),
    line(55, 10, 55, 20, { stroke: P.ink, 'stroke-width': 3 })
  ]);
}

/** Space mine (80x80): dark spiked sphere with a blinking light. */
export function spaceMine() {
  const spikes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i / 8) * Math.PI * 2;
    const x1 = 40 + Math.cos(a) * 22;
    const y1 = 40 + Math.sin(a) * 22;
    const x2 = 40 + Math.cos(a) * 38;
    const y2 = 40 + Math.sin(a) * 38;
    return line(x1, y1, x2, y2, { stroke: P.ink, 'stroke-width': 9, 'stroke-linecap': 'round' }) + line(x1, y1, x2, y2, { stroke: P.metalDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  }).join('');
  const defs = [radialGradient('mineGrad', [[0, '#6b7280'], [1, '#1f2430']], { cx: 0.35, cy: 0.3 })];
  return svg(80, 80, [spikes, circle(40, 40, 24, cel('url(#mineGrad)')), circle(40, 40, 7, cel(P.laser, { 'stroke-width': 2 })), circle(38, 38, 2.5, flat('#ffd0d0'))], defs);
}

/** Metal number plate (70x44). Numbers are drawn by the game on top. */
export function numberPlate() {
  const defs = [linearGradient('plateGrad', [[0, '#e6ebf5'], [1, '#9aa3b8']])];
  return svg(70, 44, [rect(2, 2, 66, 40, cel('url(#plateGrad)', { rx: 8 })), rect(8, 8, 54, 28, flat('#2b2f45', { rx: 5 })), circle(8, 8, 2.5, flat(P.metalDark)), circle(62, 8, 2.5, flat(P.metalDark)), circle(8, 36, 2.5, flat(P.metalDark)), circle(62, 36, 2.5, flat(P.metalDark))], defs);
}

/** Targeting crosshair (64x64). */
export function crosshair() {
  return svg(64, 64, [
    circle(32, 32, 24, { fill: 'none', stroke: P.ink, 'stroke-width': 6 }),
    circle(32, 32, 24, { fill: 'none', stroke: P.screenGlow, 'stroke-width': 3 }),
    circle(32, 32, 4, flat(P.screenGlow)),
    ...[[32, 2, 32, 16], [32, 48, 32, 62], [2, 32, 16, 32], [48, 32, 62, 32]].map(([x1, y1, x2, y2]) => line(x1, y1, x2, y2, { stroke: P.ink, 'stroke-width': 6, 'stroke-linecap': 'round' }) + line(x1, y1, x2, y2, { stroke: P.screenGlow, 'stroke-width': 3, 'stroke-linecap': 'round' }))
  ]);
}

/** Laser bolt (48x14). */
export function laserBolt() {
  return svg(48, 14, [rect(2, 3, 44, 8, cel(P.laser, { rx: 4, 'stroke-width': 2 })), rect(8, 5, 28, 3, flat('#ffd6d6', { rx: 2 }))]);
}

/** Power Crystal of Moldar (60x90). colour key: blue | red | green. */
export function powerCrystal(colour) {
  const fill = { blue: P.crystalBlue, red: P.crystalRed, green: P.crystalGreen }[colour];
  const defs = [linearGradient(`crys${colour}`, [[0, '#ffffff'], [0.35, fill], [1, '#1b1533']], { x1: 0, y1: 0, x2: 1, y2: 1 })];
  return svg(60, 90, [
    polygon([[30, 4], [54, 30], [46, 84], [14, 84], [6, 30]], cel(`url(#crys${colour})`)),
    polygon([[30, 4], [30, 84], [14, 84], [6, 30]], flat('#ffffff', { opacity: 0.18 })),
    line(30, 4, 30, 84, { stroke: '#ffffff', 'stroke-width': 1.5, opacity: 0.5 }),
    line(6, 30, 54, 30, { stroke: '#ffffff', 'stroke-width': 1.5, opacity: 0.4 }),
    polygon(star(16, 22, 6, 2.5, 4), flat('#ffffff', { opacity: 0.9 }))
  ], defs);
}

/** Bonus pickups. */
export function gem() {
  return svg(40, 40, [polygon([[20, 3], [37, 15], [20, 37], [3, 15]], cel(P.gem)), polygon([[20, 3], [37, 15], [3, 15]], flat('#ffb3dc', { opacity: 0.8 })), line(3, 15, 37, 15, { stroke: P.ink, 'stroke-width': 2 })]);
}

export function giftBox() {
  return svg(44, 44, [rect(4, 16, 36, 26, cel('#e04646', { rx: 3 })), rect(2, 10, 40, 10, cel('#ff6b6b', { rx: 3 })), rect(19, 10, 6, 32, flat(P.gold)), rect(2, 13, 40, 4, flat(P.gold)), circle(15, 8, 5, cel(P.gold, { 'stroke-width': 2 })), circle(29, 8, 5, cel(P.gold, { 'stroke-width': 2 }))]);
}

export function crystalCluster() {
  const shard = (x, h, w) => polygon([[x, 44], [x + w / 2, 44 - h], [x + w, 44]], cel('#5fe0ff'));
  return svg(56, 48, [shard(4, 26, 18), shard(30, 30, 20), shard(16, 40, 22), polygon([[27, 4], [30, 24], [24, 24]], flat('#d9fbff', { opacity: 0.8 })), ellipse(28, 45, 26, 3, flat(P.ink, { opacity: 0.3 }))]);
}

export function goldKey() {
  return svg(48, 26, [circle(12, 13, 9, { fill: P.gold, stroke: P.ink, 'stroke-width': 3 }), circle(12, 13, 3.5, flat('#5a3a00')), rect(20, 10, 26, 6, cel(P.gold, { 'stroke-width': 2 })), rect(38, 16, 4, 6, cel(P.gold, { 'stroke-width': 2 })), rect(31, 16, 4, 5, cel(P.gold, { 'stroke-width': 2 }))]);
}

export function eggToken() {
  return svg(36, 46, [ellipse(18, 25, 15, 20, cel('#f5f0d8')), circle(12, 16, 2.5, flat('#e0788f')), circle(22, 30, 3, flat('#8fc7e0')), circle(20, 12, 2, flat('#8fe08f')), circle(10, 30, 2, flat('#f0c060')), ellipse(13, 14, 3, 6, flat('#fff', { opacity: 0.7, transform: 'rotate(-20 13 14)' }))]);
}

export function computerPad() {
  return svg(50, 40, [rect(3, 3, 44, 34, cel(P.metal, { rx: 5 })), rect(8, 8, 34, 20, flat(P.screen, { rx: 3 })), rect(11, 11, 12, 3, flat(P.screenGlow)), rect(11, 17, 20, 3, flat(P.screenGlow)), circle(14, 33, 2, flat(P.laser)), circle(22, 33, 2, flat(P.screenGlow)), circle(30, 33, 2, flat(P.gold))]);
}
