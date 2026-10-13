// Tiny SVG authoring toolkit for the cartoon art generator.
// Everything is plain strings, so the output is deterministic and dependency-free.

export const INK = '#1b1533';

const fmt = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v);

function attrs(obj = {}) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${fmt(v)}"`)
    .join('');
}

export function el(tag, a = {}, children = '') {
  const body = Array.isArray(children) ? children.join('') : children;
  return body ? `<${tag}${attrs(a)}>${body}</${tag}>` : `<${tag}${attrs(a)}/>`;
}

export const g = (a, children) => el('g', a, children);
export const rect = (x, y, w, h, a = {}) => el('rect', { x, y, width: w, height: h, ...a });
export const circle = (cx, cy, r, a = {}) => el('circle', { cx, cy, r, ...a });
export const ellipse = (cx, cy, rx, ry, a = {}) => el('ellipse', { cx, cy, rx, ry, ...a });
export const line = (x1, y1, x2, y2, a = {}) => el('line', { x1, y1, x2, y2, ...a });
export const path = (d, a = {}) => el('path', { d, ...a });
export const polygon = (points, a = {}) => el('polygon', { points: Array.isArray(points) ? points.map((p) => p.map(fmt).join(',')).join(' ') : points, ...a });
export const polyline = (points, a = {}) => el('polyline', { points: points.map((p) => p.map(fmt).join(',')).join(' '), fill: 'none', ...a });
export const text = (x, y, str, a = {}) => el('text', { x, y, 'font-family': 'Arial Black, Arial, sans-serif', 'font-weight': 'bold', 'text-anchor': 'middle', ...a }, escapeText(str));

export function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Cel-shaded fill: flat colour with a thick ink outline and rounded joins. */
export function cel(fill, extra = {}) {
  return { fill, stroke: INK, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', ...extra };
}

/** Same as cel() but with no outline, for inner shading shapes. */
export const flat = (fill, extra = {}) => ({ fill, stroke: 'none', ...extra });

export function linearGradient(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  const s = stops.map(([offset, color, opacity]) => el('stop', { offset: `${offset * 100}%`, 'stop-color': color, 'stop-opacity': opacity })).join('');
  return el('linearGradient', { id, x1, y1, x2, y2 }, s);
}

export function radialGradient(id, stops, { cx = 0.5, cy = 0.5, r = 0.5, fx, fy } = {}) {
  const s = stops.map(([offset, color, opacity]) => el('stop', { offset: `${offset * 100}%`, 'stop-color': color, 'stop-opacity': opacity })).join('');
  return el('radialGradient', { id, cx, cy, r, fx, fy }, s);
}

/** Wrap children in a complete SVG document. */
export function svg(width, height, children, defs = '') {
  const body = Array.isArray(children) ? children.join('') : children;
  const defsBlock = defs ? el('defs', {}, Array.isArray(defs) ? defs.join('') : defs) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defsBlock}${body}</svg>`;
}

/** Deterministic PRNG (mulberry32). */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rnd = (rng, min, max) => min + rng() * (max - min);
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

/** Jagged rock / blob outline: n points around (cx, cy) with radius jitter. */
export function blob(cx, cy, rx, ry, n, jitter, rng, phase = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    const j = 1 + (rng() - 0.5) * 2 * jitter;
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  return pts;
}

/** Smooth closed path through points using quadratic midpoints (organic shapes). */
export function smoothClosed(points) {
  const n = points.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = points[i];
    const q = points[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    if (i === 0) d += `M${fmt(mx)},${fmt(my)}`;
    const next = points[(i + 1) % n];
    const nn = points[(i + 2) % n];
    const mx2 = (next[0] + nn[0]) / 2;
    const my2 = (next[1] + nn[1]) / 2;
    d += ` Q${fmt(next[0])},${fmt(next[1])} ${fmt(mx2)},${fmt(my2)}`;
  }
  return d + ' Z';
}

/** Open smooth polyline (vines, ropes, cracks). */
export function smoothOpen(points) {
  if (points.length < 2) return '';
  let d = `M${fmt(points[0][0])},${fmt(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    d += ` Q${fmt(p[0])},${fmt(p[1])} ${fmt((p[0] + q[0]) / 2)},${fmt((p[1] + q[1]) / 2)}`;
  }
  const last = points[points.length - 1];
  d += ` T${fmt(last[0])},${fmt(last[1])}`;
  return d;
}

/** Simple star polygon points. */
export function star(cx, cy, outer, inner, points = 5, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i / (points * 2)) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

/** Lighten / darken a hex colour by a factor (1.2 lighter, 0.8 darker). */
export function shade(hex, factor) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * factor)));
  const gg = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.min(255, Math.max(0, Math.round((n & 255) * factor)));
  return `#${((r << 16) | (gg << 8) | b).toString(16).padStart(6, '0')}`;
}
