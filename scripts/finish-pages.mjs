#!/usr/bin/env node
// Post-build touches for the GitHub Pages site in docs/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');

// Tell GitHub Pages to serve the files as-is instead of running them through Jekyll.
fs.writeFileSync(path.join(docs, '.nojekyll'), '');

// Ship the single-file version next to the site so anyone can download and keep it.
const single = path.join(root, 'MegaMathBlaster.html');
if (fs.existsSync(single)) {
  fs.copyFileSync(single, path.join(docs, 'MegaMathBlaster.html'));
}

const files = fs.readdirSync(docs).length;
console.log(`Pages site ready in docs/ (${files} entries). Serve from: main branch, /docs folder.`);
