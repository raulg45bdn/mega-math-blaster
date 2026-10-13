// Gelator's trolls and drones. Trolls are authored in a 90x90 box facing left
// (they patrol toward Blasternaut); drones in 120x70.
import { svg, g, rect, circle, ellipse, path, polygon, line, cel, flat, linearGradient, radialGradient } from '../lib/svg.mjs';
import { P } from './palette.mjs';

const eye = (x, y, r, angry = true) =>
  circle(x, y, r, cel('#fff', { 'stroke-width': 2 })) +
  circle(x - r * 0.25, y + r * 0.15, r * 0.45, flat(P.ink)) +
  (angry ? line(x - r, y - r * 0.9, x + r, y - r * 0.4, { stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }) : '');

/** Foot troll: squat yellow-green brute with enormous stomping feet. frame 0/1 = stomp cycle. */
export function footTroll(frame = 0) {
  const lift = frame === 0 ? 0 : -10;
  return svg(90, 90, [
    ellipse(60, 84, 24, 7, cel(P.footTrollDark, { transform: `translate(0,${lift})` })),
    ellipse(30, 84, 24, 7, cel(P.footTrollDark)),
    path('M22,70 Q10,40 30,26 Q45,14 62,26 Q80,42 66,70 Z', cel(P.footTroll)),
    ellipse(45, 58, 18, 10, flat(P.footTrollDark, { opacity: 0.5 })),
    eye(35, 40, 7),
    eye(55, 40, 7),
    path('M32,54 Q45,48 58,54 L56,60 Q45,56 34,60 Z', cel('#fff', { 'stroke-width': 2 })),
    polygon([[38, 54], [42, 61], [46, 54]], flat(P.ink)),
    polygon([[48, 54], [52, 61], [56, 54]], flat(P.ink)),
    polygon([[26, 30], [18, 12], [34, 24]], cel(P.footTrollDark, { 'stroke-width': 2 })),
    polygon([[64, 30], [72, 12], [56, 24]], cel(P.footTrollDark, { 'stroke-width': 2 })),
    ellipse(22, 78, 18, 10, cel(P.footTroll)),
    ellipse(66, 78 + lift, 18, 10, cel(P.footTroll)),
    circle(10, 80, 3, flat(P.ink)),
    circle(78, 80 + lift, 3, flat(P.ink))
  ]);
}

/** Nose troll: blue, all nose, sneezes. frame 1 = wind-up. */
export function noseTroll(frame = 0) {
  const squash = frame === 0 ? 1 : 0.92;
  return svg(90, 90, [
    g({ transform: `translate(45,88) scale(1,${squash}) translate(-45,-88)` }, [
      ellipse(45, 84, 26, 6, flat(P.ink, { opacity: 0.25 })),
      path('M20,82 Q8,44 32,30 Q46,22 60,30 Q82,44 70,82 Z', cel(P.noseTroll)),
      ellipse(45, 66, 16, 10, flat(P.noseTrollDark, { opacity: 0.45 })),
      eye(34, 42, 6),
      eye(58, 42, 6),
      ellipse(30, 58, 17, 13, cel(P.noseTrollDark)),
      circle(24, 56, 4, flat('#fff', { opacity: 0.4 })),
      circle(24, 66, 2.5, flat(P.ink)),
      circle(32, 68, 2.5, flat(P.ink)),
      path('M40,74 Q52,80 62,72', { fill: 'none', stroke: P.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      polygon([[30, 30], [26, 10], [40, 26]], cel(P.noseTrollDark, { 'stroke-width': 2 })),
      polygon([[62, 30], [66, 10], [52, 26]], cel(P.noseTrollDark, { 'stroke-width': 2 })),
      ellipse(28, 84, 12, 6, cel(P.noseTrollDark)),
      ellipse(62, 84, 12, 6, cel(P.noseTrollDark))
    ]),
    frame === 1 ? path('M6,52 Q0,58 8,62 M4,44 Q-4,48 2,54', { fill: 'none', stroke: P.noseTrollDark, 'stroke-width': 3, 'stroke-linecap': 'round' }) : ''
  ]);
}

/** Kissing troll: pink, winged, giant puckered lips. frame 0/1 = wing flap. */
export function kissingTroll(frame = 0) {
  const wingUp = frame === 0;
  const wing = (mirror) =>
    path(wingUp ? 'M0,0 Q-6,-34 -34,-30 Q-18,-18 -12,-4 Z' : 'M0,0 Q-10,10 -36,14 Q-20,2 -12,-2 Z', cel(P.kissTrollDark, { transform: mirror ? 'translate(58,42) scale(-1,1)' : 'translate(32,42)' }));
  return svg(90, 90, [
    wing(false),
    wing(true),
    path('M26,64 Q14,40 30,28 Q45,20 60,28 Q76,40 64,64 Q45,74 26,64 Z', cel(P.kissTroll)),
    eye(36, 40, 6, false),
    eye(54, 40, 6, false),
    path('M31,34 Q36,30 41,34', { fill: 'none', stroke: P.ink, 'stroke-width': 2 }),
    path('M49,34 Q54,30 59,34', { fill: 'none', stroke: P.ink, 'stroke-width': 2 }),
    ellipse(18, 56, 12, 9, cel('#e0262f')),
    ellipse(18, 53, 8, 3, flat('#ff8a92', { opacity: 0.8 })),
    line(18, 56, 30, 56, { stroke: P.ink, 'stroke-width': 3 }),
    circle(58, 26, 4, cel(P.kissTrollDark, { 'stroke-width': 2 })),
    line(56, 26, 52, 30, { stroke: P.ink, 'stroke-width': 2 }),
    ellipse(36, 70, 8, 5, cel(P.kissTrollDark)),
    ellipse(54, 70, 8, 5, cel(P.kissTrollDark)),
    circle(8, 40, 5, flat('#ff6fa5', { opacity: 0.8 })),
    circle(4, 32, 3, flat('#ff6fa5', { opacity: 0.6 }))
  ]);
}

/** Drone for the Math Blaster activity: silver saucer with a hanging number plate. */
export function drone() {
  const defs = [
    linearGradient('droneGrad', [[0, '#f4f7ff'], [0.5, P.metal], [1, P.metalDark]]),
    radialGradient('droneDome', [[0, '#d9fff2', 0.9], [1, '#3fbf9a', 0.9]], { cx: 0.35, cy: 0.3 })
  ];
  return svg(120, 70, [
    ellipse(60, 22, 20, 14, cel('url(#droneDome)')),
    ellipse(60, 34, 56, 14, cel('url(#droneGrad)')),
    ellipse(60, 40, 40, 8, flat(P.metalDark, { opacity: 0.6 })),
    circle(30, 34, 3, flat(P.laser)),
    circle(60, 44, 3, flat(P.screenGlow)),
    circle(90, 34, 3, flat(P.laser)),
    line(48, 46, 44, 58, { stroke: P.ink, 'stroke-width': 3 }),
    line(72, 46, 76, 58, { stroke: P.ink, 'stroke-width': 3 }),
    rect(34, 56, 52, 12, cel('#2b2b3d', { rx: 3 }))
  ], defs);
}

/** Goo drop released by drones. */
export function gooDrop() {
  return svg(30, 40, [
    path('M15,2 Q28,20 24,30 Q15,40 6,30 Q2,20 15,2 Z', cel('#7ce03a')),
    ellipse(11, 24, 3, 5, flat('#d8ff9a', { opacity: 0.8 }))
  ]);
}
