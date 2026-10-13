// Story backdrops (1024x768): Lock-Em-Up prison, oozed Moldar, ship bridge, mission map.
import { svg, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, seededRandom, rnd } from '../lib/svg.mjs';
import { P } from './palette.mjs';

const W = 1024;
const H = 768;

function starLayer(rng, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(circle(rng() * W, rng() * H, rnd(rng, 0.6, 2), flat('#fff', { opacity: rnd(rng, 0.4, 1) })));
  return out;
}

/** Prison planet Lock-Em-Up with three cells and silhouetted villains behind bars. */
export function prisonPlanet() {
  const rng = seededRandom(83);
  const defs = [linearGradient('prisonSpace', [[0, '#05071a'], [1, '#1a1040']]), radialGradient('prisonRock', [[0, '#8a8fa8'], [1, '#2f3350']], { cx: 0.35, cy: 0.35 })];
  const cell = (x, silhouette) => rect(x, 300, 180, 220, cel('#1a1030', { rx: 8 })) + silhouette + [0, 1, 2, 3, 4].map((i) => rect(x + 14 + i * 36, 300, 10, 220, cel('#9aa3b8', { rx: 5, 'stroke-width': 2 }))).join('');
  const trashAlien = ellipse(240, 440, 60, 70, flat('#f6d72b')) + circle(220, 420, 9, flat('#fff')) + circle(260, 420, 9, flat('#fff')) + circle(220, 422, 4, flat(P.ink)) + circle(260, 422, 4, flat(P.ink));
  const illitera = ellipse(510, 430, 50, 80, flat('#7b3fc9')) + circle(510, 380, 30, flat('#c9b6ff')) + path('M490,372 Q510,352 530,372', { fill: 'none', stroke: '#e0262f', 'stroke-width': 6 });
  const drMinus = rect(740, 380, 90, 130, flat('#8892a8', { rx: 12 })) + circle(785, 372, 34, flat('#c7cdd9')) + rect(760, 360, 50, 14, flat('#1b1533')) + line(770, 440, 800, 440, { stroke: '#e0262f', 'stroke-width': 8 });
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#prisonSpace)')),
    ...starLayer(rng, 160),
    ellipse(512, 900, 900, 420, cel('url(#prisonRock)', { 'stroke-width': 4 })),
    rect(100, 240, 824, 320, cel('#3a3550', { rx: 20 })),
    rect(100, 200, 824, 60, cel('#5a5578', { rx: 12 })),
    ...[0, 1, 2, 3, 4, 5].map((i) => polygon([[130 + i * 140, 200], [160 + i * 140, 150], [190 + i * 140, 200]], cel('#5a5578'))),
    cell(150, trashAlien),
    cell(420, illitera),
    cell(690, drMinus),
    rect(100, 540, 824, 40, cel('#2a2540')),
    circle(880, 120, 40, cel('#c9d0e8'))
  ], defs);
}

/** Planet Moldar being swallowed by Gelator's orange ooze. */
export function oozedMoldar() {
  const rng = seededRandom(97);
  const defs = [linearGradient('moldSpace', [[0, '#05071a'], [1, '#12103a']]), radialGradient('moldPlanet', [[0, '#8fd45a'], [0.55, '#3f8f2f'], [1, '#123f2a']], { cx: 0.35, cy: 0.3 }), radialGradient('oozeBlob', [[0, '#ffc04a'], [0.6, P.ooze], [1, P.oozeDark]], { cx: 0.4, cy: 0.35 })];
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#moldSpace)')),
    ...starLayer(rng, 200),
    circle(512, 400, 300, cel('url(#moldPlanet)', { 'stroke-width': 5 })),
    path('M260,300 Q330,180 470,200 Q600,140 720,230 Q820,300 780,420 Q740,500 640,470 Q560,560 470,500 Q360,540 300,460 Q220,400 260,300 Z', cel('url(#oozeBlob)', { 'stroke-width': 4 })),
    path('M300,470 Q320,560 360,520 M640,480 Q660,600 700,540 M460,520 Q470,640 520,600', { fill: 'none', stroke: P.ooze, 'stroke-width': 18, 'stroke-linecap': 'round' }),
    circle(380, 260, 20, flat('#ffd28a', { opacity: 0.8 })),
    circle(600, 330, 26, flat('#ffd28a', { opacity: 0.6 }))
  ], defs);
}

/** Bridge of Blasternaut's ship: viewport with stars, consoles for G.C. briefings. */
export function shipBridge() {
  const rng = seededRandom(113);
  const defs = [linearGradient('bridgeWall', [[0, '#3f2b73'], [1, '#1f1440']]), linearGradient('bridgeFloor', [[0, '#4a3a7e'], [1, '#2a1f55']])];
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#bridgeWall)')),
    rect(120, 60, 784, 420, cel('#05071a', { rx: 40, 'stroke-width': 6 })),
    ...starLayer(rng, 140).map((s) => s),
    rect(0, 0, 120, H, flat('url(#bridgeWall)')),
    rect(904, 0, 120, H, flat('url(#bridgeWall)')),
    rect(0, 480, W, 40, flat('#2a1f55')),
    rect(120, 60, 784, 420, { fill: 'none', stroke: P.gold, 'stroke-width': 6, rx: 40 }),
    path('M0,520 Q512,470 1024,520 L1024,768 L0,768 Z', cel('url(#bridgeFloor)')),
    ...[0, 1, 2].map((i) => rect(150 + i * 280, 540, 220, 120, cel('#1a1030', { rx: 14 })) + rect(164 + i * 280, 554, 192, 70, flat(P.screen, { rx: 8 })) + rect(172 + i * 280, 562, 120, 6, flat(P.screenGlow, { opacity: 0.7 })) + rect(172 + i * 280, 576, 80, 6, flat(P.screenGlow, { opacity: 0.5 }))),
    ...[0, 1, 2, 3, 4, 5].map((i) => circle(170 + i * 140, 700, 10, cel([P.laser, P.gold, P.screenGlow, P.crystalBlue, P.gem, P.gold][i], { 'stroke-width': 2 })))
  ], defs);
}

/** Mission map: Moldar with five mission nodes along an ooze-free path. */
export function missionMap() {
  const rng = seededRandom(131);
  const defs = [linearGradient('mapSpace', [[0, '#070a1f'], [1, '#1b1050']]), radialGradient('mapPlanet', [[0, '#5fb35b'], [0.6, '#2a6f4a'], [1, '#0f3a2a']], { cx: 0.4, cy: 0.35 })];
  return svg(W, H, [
    rect(0, 0, W, H, flat('url(#mapSpace)')),
    ...starLayer(rng, 180),
    circle(512, 420, 320, cel('url(#mapPlanet)', { 'stroke-width': 5 })),
    path('M330,240 Q420,180 520,220 Q640,190 700,280 Q760,380 690,470 Q600,560 480,520 Q360,500 320,400 Q290,300 330,240 Z', flat(P.ooze, { opacity: 0.55 })),
    path('M180,600 Q300,520 420,560 Q540,620 660,540 Q760,470 840,520', { fill: 'none', stroke: '#fff7c2', 'stroke-width': 8, 'stroke-dasharray': '22 16', opacity: 0.9 }),
    ellipse(512, 420, 380, 60, { fill: 'none', stroke: '#c9b6ff', 'stroke-width': 8, opacity: 0.5, transform: 'rotate(-14 512 420)' })
  ], defs);
}
