#!/usr/bin/env node
// Mega Math Blaster remake: cartoon asset generator.
// Every sprite and backdrop is authored as cel-shaded SVG (the 1996 game was
// smooth painted art at 640x480, so vector art reproduces it far better than
// pixels). Writes public/assets/*.svg, a manifest, and docs/art-preview.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog } from './art/catalog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const OUT_DIR = path.join(root, 'public', 'assets');
const DOCS_DIR = path.join(root, 'tools');

function dims(svgText) {
  const m = svgText.match(/width="(\d+)" height="(\d+)"/);
  return { width: Number(m[1]), height: Number(m[2]) };
}

function writeAll(list) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const stale of fs.readdirSync(OUT_DIR)) {
    if (stale.endsWith('.svg') || stale.endsWith('.png')) fs.unlinkSync(path.join(OUT_DIR, stale));
  }
  const manifest = { generated: new Date().toISOString(), assets: [] };
  list.forEach(({ key, svg: svgText, group }) => {
    const file = `${key}.svg`;
    fs.writeFileSync(path.join(OUT_DIR, file), svgText);
    manifest.assets.push({ key, file, group, ...dims(svgText) });
  });
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

function writePreview(manifest) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const groups = [...new Set(manifest.assets.map((a) => a.group))];
  const sections = groups.map((gname) => {
    const items = manifest.assets
      .filter((a) => a.group === gname)
      .map((a) => {
        const scale = a.width > 600 ? 0.3 : 1;
        return `<figure><img src="/assets/${a.file}" width="${Math.round(a.width * scale)}" height="${Math.round(a.height * scale)}" alt="${a.key}"><figcaption>${a.key}<br><small>${a.width}x${a.height}</small></figcaption></figure>`;
      })
      .join('\n');
    return `<h2>${gname}</h2><div class="grid">${items}</div>`;
  });
  const css = 'body{background:#22263a;color:#eee;font-family:Arial,sans-serif;padding:20px}h2{color:#ffd23f;border-bottom:2px solid #444}.grid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end}figure{margin:0;text-align:center;background:#151827;padding:10px;border-radius:8px}figcaption{font-size:12px;margin-top:6px}img{background:repeating-conic-gradient(#2a2e44 0 25%,#1c1f30 0 50%) 0 0/16px 16px}';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Art preview</title><style>${css}</style></head><body><h1>Mega Math Blaster remake: generated art (${manifest.assets.length} files)</h1>${sections.join('\n')}</body></html>`;
  fs.writeFileSync(path.join(DOCS_DIR, 'art-preview.html'), html);
}

const list = buildCatalog();
const manifest = writeAll(list);
writePreview(manifest);
const bytes = list.reduce((acc, a) => acc + a.svg.length, 0);
console.log(`Wrote ${manifest.assets.length} SVG assets (${Math.round(bytes / 1024)} KB) to public/assets/ and tools/art-preview.html`);
