#!/usr/bin/env node
// Packs the single-chunk build plus every SVG asset into ONE html file that
// runs from a double-click (file://): no server, no network, no account.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'dist-single');
const assetDir = path.join(root, 'public', 'assets');
const outFile = path.join(root, 'MegaMathBlaster.html');

const jsFile = fs.readdirSync(buildDir).find((f) => f.endsWith('.js'));
if (!jsFile) {
  console.error('No bundle found in dist-single/. Run "npm run build:single" first.');
  process.exit(1);
}
const code = fs.readFileSync(path.join(buildDir, jsFile), 'utf8').replace(/<\/script/gi, '<\/script');
const manifest = JSON.parse(fs.readFileSync(path.join(assetDir, 'manifest.json'), 'utf8'));
const bundle = {
  assets: manifest.assets.map((entry) => {
    const svg = fs.readFileSync(path.join(assetDir, entry.file));
    return { key: entry.key, width: entry.width, height: entry.height, file: `data:image/svg+xml;base64,${svg.toString('base64')}` };
  })
};

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>Mega Math Blaster Remake</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
  html, body { height: 100%; width: 100%; background: #0b0c16; color: #e2e8f0; font-family: "Trebuchet MS", "Segoe UI", Arial, sans-serif; overflow: hidden; }
  body { display: flex; align-items: center; justify-content: center; touch-action: none; }
  #game-container { position: relative; width: 1024px; height: 768px; max-width: 98vw; max-height: 96vh; aspect-ratio: 4 / 3; border: 3px solid #38bdf8; border-radius: 12px; overflow: hidden; background: #000; box-shadow: 0 0 30px rgba(56, 189, 248, 0.3); }
  #game-note { position: fixed; left: 0; right: 0; bottom: 4px; text-align: center; font-size: 12px; font-weight: bold; color: #7f8aa3; pointer-events: none; }
</style>
</head>
<body>
<div id="game-container"></div>
<div id="game-note">Fan recreation of the 1996 Davidson classic. Original art and code. Click NEW GAME to begin.</div>
<script>window.MEGA_MATH_BLASTER_BUNDLE = ${JSON.stringify(bundle)};</script>
<script type="module">
${code}
</script>
</body>
</html>
`;
fs.writeFileSync(outFile, html);
console.log(`Wrote ${path.relative(root, outFile)} (${(html.length / 1024 / 1024).toFixed(1)} MB, ${bundle.assets.length} assets inlined)`);
