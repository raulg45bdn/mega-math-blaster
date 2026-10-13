// Cave backdrops part 1 (1024x768): shared helpers, ice cave, temple cave.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, seededRandom, rnd, blob, smoothClosed, smoothOpen } from '../lib/svg.mjs';
import { P } from './palette.mjs';

export const W = 1024;
export const H = 768;

/** Stalactites along the top edge. */
export function stalactites(rng, colour, dark, count = 14, maxLen = 120) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = (i / count) * W + rnd(rng, -20, 20);
    const w = rnd(rng, 30, 70);
    const len = rnd(rng, 40, maxLen);
    out.push(polygon([[x - w / 2, 0], [x + w / 2, 0], [x + rnd(rng, -8, 8), len]], cel(colour)));
    out.push(polygon([[x - w / 2 + 6, 0], [x - w / 6, 0], [x - w / 8, len * 0.6]], flat(dark, { opacity: 0.35 })));
  }
  return out;
}

/** Rock wall texture: a field of soft blobs. */
export function rockField(rng, colour, dark, count, yMin, yMax) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const cx = rng() * W;
    const cy = rnd(rng, yMin, yMax);
    const r = rnd(rng, 30, 90);
    out.push(path(smoothClosed(blob(cx, cy, r, r * 0.7, 8, 0.25, rng)), flat(rng() < 0.5 ? colour : dark, { opacity: 0.55 })));
  }
  return out;
}

export function iceCave() {
  const rng = seededRandom(11);
  const defs = [linearGradient('iceSky', [[0, '#0b2a5c'], [0.5, '#1f5f9c'], [1, '#5fb3e6']]), radialGradient('iceGlow', [[0, '#ffffff', 0.5], [1, '#ffffff', 0]])];
  const crystals = [];
  for (let i = 0; i < 10; i++) {
    const x = rng() * W;
    const y = rnd(rng, 520, 700);
    const h = rnd(rng, 40, 110);
    crystals.push(polygon([[x - 14, y], [x, y - h], [x + 14, y]], cel('#bfefff', { opacity: 0.9 })), polygon([[x - 6, y], [x, y - h * 0.8], [x + 2, y]], flat('#ffffff', { opacity: 0.6 })));
  }
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#iceSky)')),
    ...rockField(rng, '#2f78b8', '#1a4f86', 30, 100, 700),
    ellipse(300, 200, 260, 140, flat('url(#iceGlow)')),
    ellipse(800, 420, 220, 120, flat('url(#iceGlow)')),
    ...stalactites(rng, P.ice, P.iceDeep, 16, 140),
    ...crystals,
    path('M0,720 Q256,700 512,724 Q768,748 1024,716 L1024,768 L0,768 Z', cel(P.iceDark)),
    path('M0,736 Q256,716 512,740 Q768,760 1024,732 L1024,768 L0,768 Z', flat(P.iceDeep, { opacity: 0.6 }))
  ], defs);
}

export function templeCave() {
  const rng = seededRandom(23);
  const defs = [linearGradient('templeSky', [[0, '#1a1410'], [0.6, '#3a3128'], [1, '#6b5f4a']])];
  const bricks = [];
  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 9; col++) {
      const x = col * 120 + (row % 2) * 60 - 40;
      const y = 80 + row * 58;
      bricks.push(rect(x, y, 116, 54, { fill: rng() < 0.15 ? P.templeDark : P.temple, stroke: P.templeDark, 'stroke-width': 3, opacity: 0.85, rx: 3 }));
    }
  }
  const moss = [];
  for (let i = 0; i < 24; i++) {
    const x = rng() * W;
    moss.push(path(smoothOpen([[x, rnd(rng, 80, 500)], [x + rnd(rng, -20, 20), rnd(rng, 520, 600)], [x + rnd(rng, -30, 30), rnd(rng, 620, 700)]]), { fill: 'none', stroke: P.templeMoss, 'stroke-width': rnd(rng, 3, 7), opacity: 0.7 }));
  }
  const torches = [220, 512, 800].map((x) => rect(x - 8, 300, 16, 60, cel(P.woodDark, { rx: 4 })) + path(`M${x - 14},300 Q${x},250 ${x + 14},300 Z`, cel(P.lava, { 'stroke-width': 2 })) + path(`M${x - 6},300 Q${x},270 ${x + 6},300 Z`, flat(P.lavaLight)) + circle(x, 290, 60, flat('#ffb347', { opacity: 0.12 })));
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#templeSky)')),
    ...bricks,
    ...moss,
    ...[140, 420, 700, 980].map((x) => rect(x - 30, 60, 60, 640, cel('#8f8670', { rx: 6 })) + rect(x - 40, 40, 80, 30, cel('#8f8670', { rx: 4 })) + rect(x - 40, 690, 80, 30, cel('#8f8670', { rx: 4 }))),
    ...torches,
    ...stalactites(rng, P.templeDark, '#2a241c', 10, 90),
    rect(0, 720, W, 48, cel(P.templeDark)),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => line(i * 128 + 64, 720, i * 128 + 64, 768, { stroke: '#2a241c', 'stroke-width': 3 }))
  ], defs);
}
