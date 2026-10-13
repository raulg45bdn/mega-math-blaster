// Blasternaut (1996 redesign): green spacesuit, gold trim, glass bubble helmet
// with a visible smiling face, jetpack. Authored in an 80x120 box, facing right.
import { svg, g, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient, shade } from '../lib/svg.mjs';
import { P } from './palette.mjs';

const W = 80;
const H = 120;

/** A limb as a thick rounded segment from (x1,y1) to (x2,y2). */
function limb(x1, y1, x2, y2, width, fill) {
  return line(x1, y1, x2, y2, { stroke: P.ink, 'stroke-width': width + 6, 'stroke-linecap': 'round' }) + line(x1, y1, x2, y2, { stroke: fill, 'stroke-width': width, 'stroke-linecap': 'round' });
}

function boot(x, y, dir = 1) {
  return ellipse(x + 3 * dir, y + 2, 11, 6, cel(P.trim)) + ellipse(x + 3 * dir, y, 9, 3, flat(P.trimDark, { opacity: 0.6 }));
}

function glove(x, y) {
  return circle(x, y, 7, cel(P.trim));
}

/**
 * pose: 'stand' | 'walk' | 'jump' | 'throw' | 'jet' | 'hurt'
 * frame: walk cycle frame 0..3
 */
export function blasternaut({ pose = 'stand', frame = 0 } = {}) {
  const hipX = 42;
  const hipY = 86;
  const legLen = 28;
  let frontAngle = 0;
  let backAngle = 0;
  let armFront = [56, 58, 66, 76];
  let armBack = [30, 58, 22, 76];
  let bodyDy = 0;
  let flame = '';
  if (pose === 'walk') {
    const swing = [-28, 0, 28, 0][frame % 4];
    frontAngle = swing;
    backAngle = -swing;
    armFront = [56, 58, 62 - swing * 0.35, 78];
    armBack = [30, 58, 26 + swing * 0.35, 78];
    bodyDy = frame % 2 === 0 ? -2 : 0;
  } else if (pose === 'jump' || pose === 'jet') {
    frontAngle = 30;
    backAngle = -20;
    armFront = [56, 58, 70, 44];
    armBack = [30, 58, 18, 48];
    if (pose === 'jet') {
      flame = path(`M14,92 Q20,118 26,92`, cel(P.flame, { 'stroke-width': 2 })) + path(`M17,92 Q20,108 23,92`, flat(P.flameCore));
    }
  } else if (pose === 'throw') {
    armFront = [56, 56, 78, 46];
    armBack = [30, 58, 24, 78];
  } else if (pose === 'hurt') {
    armFront = [56, 58, 74, 40];
    armBack = [30, 58, 12, 42];
    frontAngle = 15;
    backAngle = -15;
  }
  const rad = (a) => (a * Math.PI) / 180;
  const frontFoot = [hipX + 6 + Math.sin(rad(frontAngle)) * legLen, hipY + Math.cos(rad(frontAngle)) * legLen];
  const backFoot = [hipX - 6 + Math.sin(rad(backAngle)) * legLen, hipY + Math.cos(rad(backAngle)) * legLen];

  const defs = [
    radialGradient('glassGrad', [[0, '#ffffff', 0.9], [0.55, P.glass, 0.55], [1, P.glassDark, 0.8]], { cx: 0.35, cy: 0.3, r: 0.75 }),
    linearGradient('suitGrad', [[0, P.suitLight], [0.5, P.suit], [1, P.suitDark]], { x1: 0, y1: 0, x2: 1, y2: 1 })
  ];

  const body = g({ transform: `translate(0,${bodyDy})` }, [
    // jetpack
    rect(8, 42, 18, 44, cel(P.jetpack, { rx: 6 })),
    rect(11, 46, 12, 30, flat(P.jetpackDark, { rx: 4 })),
    rect(12, 84, 10, 8, cel(P.jetpackDark, { rx: 2 })),
    flame,
    // back arm
    limb(armBack[0], armBack[1], armBack[2], armBack[3], 10, P.suitDark),
    glove(armBack[2], armBack[3]),
    // back leg
    limb(hipX - 6, hipY, backFoot[0], backFoot[1], 12, P.suitDark),
    boot(backFoot[0], backFoot[1], 1),
    // torso
    path(`M26,46 Q42,38 60,46 L62,84 Q42,92 24,84 Z`, cel('url(#suitGrad)')),
    rect(30, 60, 24, 10, flat(P.suitDark, { rx: 4, opacity: 0.5 })),
    rect(24, 80, 38, 8, cel(P.trim, { rx: 3 })),
    circle(43, 84, 4, cel(P.trimDark, { 'stroke-width': 2 })),
    // chest badge
    polygon([[46, 52], [50, 60], [42, 60]], cel(P.trim, { 'stroke-width': 2 })),
    // front leg
    limb(hipX + 6, hipY, frontFoot[0], frontFoot[1], 12, P.suit),
    boot(frontFoot[0], frontFoot[1], 1),
    // front arm
    limb(armFront[0], armFront[1], armFront[2], armFront[3], 10, P.suit),
    glove(armFront[2], armFront[3]),
    // neck ring
    ellipse(43, 46, 16, 5, cel(P.trim)),
    // helmet + face
    circle(43, 26, 23, cel('url(#glassGrad)')),
    circle(44, 29, 15, flat(P.skin)),
    path(`M30,22 Q36,10 50,12 Q58,14 58,22 Q52,18 44,20 Q36,20 30,22 Z`, flat(P.hair)),
    circle(39, 28, 3, flat(P.ink)),
    circle(49, 28, 3, flat(P.ink)),
    circle(40, 27, 1, flat('#fff')),
    circle(50, 27, 1, flat('#fff')),
    path(pose === 'hurt' ? 'M39,37 Q44,33 49,37' : 'M38,35 Q44,41 50,35', { fill: 'none', stroke: P.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }),
    ellipse(34, 18, 4, 7, flat('#ffffff', { opacity: 0.7, transform: 'rotate(-25 34 18)' }))
  ]);
  return svg(W, H, [body], defs);
}

/** Front-facing portrait bust for dialogue boxes (140x140). */
export function blasternautPortrait() {
  const defs = [radialGradient('glassGradP', [[0, '#ffffff', 0.9], [0.55, P.glass, 0.5], [1, P.glassDark, 0.8]], { cx: 0.35, cy: 0.3, r: 0.75 })];
  return svg(140, 140, [
    path('M20,140 L22,104 Q70,84 118,104 L120,140 Z', cel(P.suit)),
    ellipse(70, 100, 34, 10, cel(P.trim)),
    circle(70, 62, 46, cel('url(#glassGradP)')),
    circle(71, 66, 30, flat(P.skin)),
    path('M42,52 Q52,28 76,30 Q96,32 98,52 Q84,44 70,46 Q54,46 42,52 Z', flat(P.hair)),
    circle(59, 64, 5, flat(P.ink)),
    circle(81, 64, 5, flat(P.ink)),
    circle(61, 62, 2, flat('#fff')),
    circle(83, 62, 2, flat('#fff')),
    path('M56,78 Q70,92 84,78', { fill: 'none', stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }),
    ellipse(48, 42, 7, 14, flat('#ffffff', { opacity: 0.7, transform: 'rotate(-25 48 42)' }))
  ], defs);
}

// ---------------------------------------------------------------------------
// G.C. (Galactic Commander): green skin, huge magenta hair, big lashes, red lips.
// ---------------------------------------------------------------------------
function gcHead(cx, cy, s, expression) {
  const curls = [[-52, -20, 30], [-40, -50, 28], [0, -62, 32], [40, -50, 28], [52, -20, 30], [-56, 16, 22], [56, 16, 22], [-36, 40, 20], [36, 40, 20]]
    .map(([dx, dy, r]) => circle(cx + dx * s, cy + dy * s, r * s, cel(P.gcHair)))
    .join('');
  const highlights = [[-30, -44, 10], [22, -52, 9], [48, -12, 8]].map(([dx, dy, r]) => circle(cx + dx * s, cy + dy * s, r * s, flat('#f28ce0', { opacity: 0.7 }))).join('');
  let mouth;
  if (expression === 'talk') {
    mouth = ellipse(cx, cy + 32 * s, 11 * s, 8 * s, cel(P.gcLips)) + ellipse(cx, cy + 34 * s, 6 * s, 4 * s, flat('#5a0f18'));
  } else if (expression === 'worried') {
    mouth = path(`M${cx - 12 * s},${cy + 36 * s} Q${cx},${cy + 26 * s} ${cx + 12 * s},${cy + 36 * s}`, { fill: 'none', stroke: P.gcLips, 'stroke-width': 5 * s, 'stroke-linecap': 'round' });
  } else {
    mouth = path(`M${cx - 14 * s},${cy + 28 * s} Q${cx},${cy + 44 * s} ${cx + 14 * s},${cy + 28 * s} Q${cx},${cy + 34 * s} ${cx - 14 * s},${cy + 28 * s} Z`, cel(P.gcLips, { 'stroke-width': 2 }));
  }
  const eye = (ex) => {
    const side = ex < 0 ? -1 : 1;
    const lashes = [0, 1, 2].map((i) => line(cx + (ex + side * 9) * s, cy - 12 * s + i * 3 * s, cx + (ex + side * 16) * s, cy - 16 * s + i * 3 * s, { stroke: P.ink, 'stroke-width': 2, 'stroke-linecap': 'round' })).join('');
    return (
      ellipse(cx + ex * s, cy - 2 * s, 11 * s, 14 * s, cel('#fff', { 'stroke-width': 2 })) +
      circle(cx + ex * s + 2 * s, cy + 1 * s, 6 * s, flat('#1f6f3a')) +
      circle(cx + ex * s + 2 * s, cy + 1 * s, 3 * s, flat(P.ink)) +
      circle(cx + ex * s + 4 * s, cy - 2 * s, 1.5 * s, flat('#fff')) +
      lashes
    );
  };
  return [
    curls,
    highlights,
    ellipse(cx, cy + 6 * s, 36 * s, 42 * s, cel(P.gcSkin)),
    ellipse(cx, cy + 24 * s, 22 * s, 10 * s, flat(P.gcSkinDark, { opacity: 0.35 })),
    eye(-15),
    eye(15),
    path(`M${cx - 26 * s},${cy - 18 * s} Q${cx - 15 * s},${cy - 26 * s} ${cx - 4 * s},${cy - 20 * s}`, { fill: 'none', stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }),
    path(`M${cx + 4 * s},${cy - 20 * s} Q${cx + 15 * s},${cy - 26 * s} ${cx + 26 * s},${cy - 18 * s}`, { fill: 'none', stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }),
    path(`M${cx},${cy + 4 * s} Q${cx - 4 * s},${cy + 16 * s} ${cx + 2 * s},${cy + 18 * s}`, { fill: 'none', stroke: P.gcSkinDark, 'stroke-width': 2 }),
    mouth,
    circle(cx - 42 * s, cy - 44 * s, 4 * s, flat(P.gold)),
    circle(cx + 44 * s, cy - 40 * s, 4 * s, flat(P.gold))
  ].join('');
}

/** Portrait bust for dialogue (160x160). expression: 'smile' | 'talk' | 'worried' */
export function gcPortrait(expression = 'smile') {
  return svg(160, 160, [
    path('M18,160 L20,128 Q80,104 140,128 L142,160 Z', cel(P.gcDress)),
    path('M60,128 L80,150 L100,128 Z', cel(P.gold, { 'stroke-width': 2 })),
    gcHead(80, 70, 1, expression)
  ]);
}

/** Full-length G.C. for the Equationator chamber (140x300). */
export function gcFull(expression = 'smile') {
  const arm = (x1, y1, x2, y2) => line(x1, y1, x2, y2, { stroke: P.ink, 'stroke-width': 18, 'stroke-linecap': 'round' }) + line(x1, y1, x2, y2, { stroke: P.gcSkin, 'stroke-width': 12, 'stroke-linecap': 'round' });
  return svg(140, 300, [
    path('M46,120 Q70,110 94,120 L112,240 Q70,256 28,240 Z', cel(P.gcDress)),
    path('M60,128 L70,150 L80,128 Z', cel(P.gold, { 'stroke-width': 2 })),
    rect(28, 230, 84, 12, cel(P.gold, { rx: 4 })),
    arm(50, 130, 22, 200),
    arm(90, 130, 126, 186),
    circle(20, 206, 9, cel(P.gcSkin)),
    circle(128, 190, 9, cel(P.gcSkin)),
    rect(42, 240, 24, 48, cel(P.gcDressDark, { rx: 6 })),
    rect(74, 240, 24, 48, cel(P.gcDressDark, { rx: 6 })),
    ellipse(54, 290, 20, 8, cel(P.ink)),
    ellipse(86, 290, 20, 8, cel(P.ink)),
    gcHead(70, 60, 0.72, expression)
  ]);
}
