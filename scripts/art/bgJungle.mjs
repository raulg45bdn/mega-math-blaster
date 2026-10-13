// Cave backdrops part 2 (1024x768): jungle cave and the City Runner bonus skyline.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, seededRandom, rnd, pick, smoothOpen } from '../lib/svg.mjs';
import { P } from './palette.mjs';
import { W, H, rockField } from './bgCaves.mjs';

export function jungleCave() {
  const rng = seededRandom(37);
  const defs = [linearGradient('jungleSky', [[0, '#0f2f14'], [0.5, '#1e5a22'], [1, '#3f8f2f']]), radialGradient('sunGlow', [[0, '#fff7a0', 0.7], [1, '#fff7a0', 0]])];
  const leaves = [];
  for (let i = 0; i < 40; i++) {
    const x = rng() * W;
    const y = rnd(rng, 0, 260);
    const r = rnd(rng, 30, 80);
    leaves.push(ellipse(x, y, r, r * 0.5, cel(pick(rng, [P.jungle, P.jungleDark, P.jungleLight]), { transform: `rotate(${rnd(rng, -40, 40)} ${x} ${y})`, opacity: 0.9 })));
  }
  const vines = [];
  for (let i = 0; i < 14; i++) {
    const x = rng() * W;
    vines.push(path(smoothOpen([[x, 0], [x + rnd(rng, -30, 30), 150], [x + rnd(rng, -40, 40), 320], [x + rnd(rng, -20, 20), rnd(rng, 400, 620)]]), { fill: 'none', stroke: P.jungleDark, 'stroke-width': rnd(rng, 4, 9), 'stroke-linecap': 'round' }));
  }
  const flowers = [];
  for (let i = 0; i < 12; i++) {
    const x = rng() * W;
    const y = rnd(rng, 560, 700);
    flowers.push(circle(x, y, 10, cel('#ff4d6d', { 'stroke-width': 2 })), circle(x, y, 4, flat(P.gold)));
  }
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#jungleSky)')),
    ellipse(760, 90, 320, 200, flat('url(#sunGlow)')),
    ...rockField(rng, '#2f6b2a', '#183f16', 24, 300, 720),
    ...[90, 350, 640, 930].map((x) => rect(x - 26, 100, 52, 660, cel('#5a3a1a', { rx: 10 })) + path(`M${x - 26},220 Q${x - 60},180 ${x - 90},240`, { fill: 'none', stroke: '#5a3a1a', 'stroke-width': 12, 'stroke-linecap': 'round' })),
    ...vines,
    ...leaves,
    ...flowers,
    path('M0,724 Q256,704 512,728 Q768,752 1024,720 L1024,768 L0,768 Z', cel(P.jungleDark))
  ], defs);
}

export function cityBonus() {
  const rng = seededRandom(51);
  const defs = [linearGradient('citySky', [[0, '#1a0f3a'], [0.5, '#5a2d8e'], [1, '#e08a4a']])];
  const towers = [];
  for (let i = 0; i < 12; i++) {
    const x = i * 90 + rnd(rng, -20, 20);
    const h = rnd(rng, 200, 520);
    const w = rnd(rng, 60, 110);
    towers.push(rect(x, 720 - h, w, h, cel(pick(rng, ['#3a2a6e', '#4a3a8e', '#2a1f55']), { rx: 4 })));
    for (let wy = 720 - h + 20; wy < 700; wy += 34) {
      for (let wx = x + 12; wx < x + w - 14; wx += 24) towers.push(rect(wx, wy, 12, 18, flat(rng() < 0.6 ? P.gold : '#1a1030', { opacity: 0.9 })));
    }
    towers.push(ellipse(x + w / 2, 720 - h - 14, w / 2 + 10, 14, cel('#7b4fd8', { 'stroke-width': 2 })));
  }
  const mushrooms = [];
  for (let i = 0; i < 6; i++) {
    const x = rnd(rng, 40, 980);
    const r = rnd(rng, 40, 90);
    mushrooms.push(rect(x - r * 0.25, 720 - r, r * 0.5, r, cel('#f3e2c2', { rx: 8 })), path(`M${x - r},${720 - r} Q${x},${720 - r * 2.1} ${x + r},${720 - r} Z`, cel('#e04a6a')), circle(x - r * 0.4, 720 - r * 1.4, r * 0.15, flat('#fff')), circle(x + r * 0.3, 720 - r * 1.5, r * 0.12, flat('#fff')));
  }
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#citySky)')),
    circle(180, 140, 60, cel('#fff2c8')),
    ...towers,
    ...mushrooms,
    rect(0, 720, W, 48, cel('#3b2f6e')),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => rect(i * 128 + 20, 736, 88, 6, flat('#f3d38a', { rx: 3 })))
  ], defs);
}
