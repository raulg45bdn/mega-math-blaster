// Space backdrops: starfield, cockpit overlay, Moldar's surface.
import { svg, g, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, seededRandom, rnd, pick } from '../lib/svg.mjs';
import { P } from './palette.mjs';

const W = 1024;
const H = 768;

/** Deep space with nebula wisps and a few hundred stars (1024x768). */
export function starfield(seed = 7) {
  const rng = seededRandom(seed);
  const stars = [];
  for (let i = 0; i < 260; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = rng() < 0.85 ? rnd(rng, 0.6, 1.6) : rnd(rng, 1.8, 3);
    const col = pick(rng, [P.starWhite, P.starWhite, P.starBlue, P.starGold]);
    stars.push(circle(x, y, r, flat(col, { opacity: rnd(rng, 0.5, 1) })));
    if (r > 2.2) stars.push(line(x - 8, y, x + 8, y, { stroke: col, 'stroke-width': 1, opacity: 0.6 }) + line(x, y - 8, x, y + 8, { stroke: col, 'stroke-width': 1, opacity: 0.6 }));
  }
  const defs = [
    linearGradient('spaceGrad', [[0, '#050716'], [0.5, P.space], [1, '#0d1030']]),
    radialGradient('nebA', [[0, '#5b2c8f', 0.5], [1, '#5b2c8f', 0]]),
    radialGradient('nebB', [[0, '#1f6f9c', 0.4], [1, '#1f6f9c', 0]]),
    radialGradient('nebC', [[0, '#b0306f', 0.35], [1, '#b0306f', 0]])
  ];
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#spaceGrad)')),
    ellipse(240, 220, 320, 180, flat('url(#nebA)')),
    ellipse(760, 520, 360, 200, flat('url(#nebB)')),
    ellipse(620, 140, 260, 120, flat('url(#nebC)')),
    ...stars
  ], defs);
}

/**
 * Cockpit overlay (1024x768, transparent centre). Curved window struts at the
 * sides, a pink-purple dashboard along the bottom with a dark equation display
 * and five laser-charge lamps. The game positions text over the display.
 */
export function cockpit() {
  const defs = [
    linearGradient('dashGrad', [[0, P.cockpitLight], [0.35, P.cockpit], [1, P.cockpitDark]]),
    linearGradient('dashGrad2', [[0, '#a37ee0'], [1, P.dashboardDark]]),
    linearGradient('strutGrad', [[0, P.cockpitDark], [0.5, P.cockpit], [1, P.cockpitDark]], { x1: 0, y1: 0, x2: 1, y2: 0 })
  ];
  const lamp = (x) => circle(x, 664, 14, cel('#3a1140', { 'stroke-width': 2 })) + circle(x, 664, 9, flat('#5a1a5e'));
  const gauge = (x, y) => circle(x, y, 26, cel(P.dashboardDark)) + circle(x, y, 20, flat('#2b2044')) + line(x, y, x + 12, y - 14, { stroke: P.screenGlow, 'stroke-width': 3, 'stroke-linecap': 'round' }) + circle(x, y, 3, flat(P.screenGlow));
  return svg(W, H, [
    // window struts
    path('M0,0 L110,0 Q40,300 110,560 L0,600 Z', cel('url(#strutGrad)')),
    path(`M${W},0 L${W - 110},0 Q${W - 40},300 ${W - 110},560 L${W},600 Z`, cel('url(#strutGrad)')),
    path('M0,0 L1024,0 L1024,70 Q512,30 0,70 Z', cel(P.cockpitDark)),
    // dashboard
    path('M0,560 Q512,500 1024,560 L1024,768 L0,768 Z', cel('url(#dashGrad)')),
    path('M0,600 Q512,540 1024,600 L1024,768 L0,768 Z', flat('url(#dashGrad2)', { opacity: 0.85 })),
    // left console with vents
    ...[0, 1, 2, 3].map((i) => rect(40, 612 + i * 22, 120, 10, cel(P.dashboardDark, { rx: 5, 'stroke-width': 2 }))),
    gauge(230, 690),
    gauge(794, 690),
    // right console with buttons
    ...[0, 1, 2, 3].map((i) => circle(880 + (i % 2) * 44, 620 + Math.floor(i / 2) * 44, 14, cel([P.laser, P.gold, P.screenGlow, P.crystalBlue][i]))),
    // equation display
    rect(322, 604, 380, 92, cel('#3a1140', { rx: 14 })),
    rect(334, 614, 356, 72, flat(P.screen, { rx: 10 })),
    rect(340, 620, 344, 4, flat(P.screenGlow, { opacity: 0.25 })),
    // laser charge lamps
    rect(300, 640, 20, 48, flat('#3a1140', { rx: 6 })),
    ...[380, 440, 500, 560, 620].map(lamp).map((s) => s.replace(/664/g, '724')),
    rect(340, 706, 344, 4, flat('#5a1a5e'))
  ], defs);
}

/** Surface of planet Moldar for the Math Blaster activity (1024x768). */
export function moldarSurface() {
  const rng = seededRandom(42);
  const defs = [
    linearGradient('moldSky', [[0, '#1b0f3a'], [0.5, '#4a1f6e'], [1, '#8e3b8e']]),
    linearGradient('moldGround', [[0, '#5aa04a'], [1, '#2a5a2a']]),
    radialGradient('moon', [[0, '#fff2c8'], [1, '#d9a95a']], { cx: 0.35, cy: 0.35 })
  ];
  const hills = path('M0,560 Q120,470 260,540 Q380,600 520,520 Q660,450 800,530 Q920,590 1024,520 L1024,640 L0,640 Z', flat('#3a1f5e'));
  const hills2 = path('M0,600 Q160,540 320,600 Q480,650 640,590 Q820,540 1024,600 L1024,660 L0,660 Z', flat('#2a3a5a'));
  const rocks = [];
  for (let i = 0; i < 9; i++) {
    const x = rnd(rng, 30, 1000);
    const y = rnd(rng, 655, 700);
    const w = rnd(rng, 30, 80);
    rocks.push(ellipse(x, y, w / 2, w / 4, cel('#7b5fb8', { 'stroke-width': 2 })));
  }
  const puddles = [];
  for (let i = 0; i < 6; i++) {
    const x = rnd(rng, 60, 960);
    const y = rnd(rng, 690, 740);
    puddles.push(ellipse(x, y, rnd(rng, 30, 70), rnd(rng, 6, 12), cel(P.ooze, { 'stroke-width': 2 })), ellipse(x - 8, y - 2, 10, 3, flat('#ffd28a', { opacity: 0.8 })));
  }
  const stars = [];
  for (let i = 0; i < 60; i++) stars.push(circle(rng() * W, rng() * 300, rnd(rng, 0.8, 2), flat('#fff', { opacity: rnd(rng, 0.4, 0.9) })));
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#moldSky)')),
    ...stars,
    circle(840, 120, 70, cel('url(#moon)')),
    circle(820, 100, 12, flat('#c9964a', { opacity: 0.5 })),
    circle(870, 140, 8, flat('#c9964a', { opacity: 0.5 })),
    hills,
    hills2,
    path('M0,640 Q512,610 1024,640 L1024,768 L0,768 Z', cel('url(#moldGround)')),
    ...rocks,
    ...puddles
  ], defs);
}
