# Mega Math Blaster Remake

A faithful fan recreation of **Mega Math Blaster** (Davidson & Associates, 1996), the
edutainment classic where Blasternaut and Galactic Commander chase the slime villain
Gelator to rescue Spot and free the planet Moldar. Built with Phaser 3, TypeScript and
Vite. All art, music and code are original; nothing is ripped from the CD.

## The game

| Mission | What you do |
| :-- | :-- |
| **Space Zapper** | First-person cockpit. Shoot the floating number that completes the dashboard equation. Five hits charge the lasers for a free-fire bonus. Earns the Blue Power Crystal. |
| **Math Blaster** | On the surface of Moldar, shoot the drone carrying the right answer and dodge the goo they drip. Earns the Red Power Crystal. |
| **Cave Runner** | Ice, temple and jungle caverns. Carry a number that fits *between* the two numbers on each gate, trip foot trolls with banana peels, stop nose trolls with clothespins, calm kissing trolls with pacifiers. Earns the Green Power Crystal. |
| **Equationator** | G.C.'s generator room: drop one number from each glass tube to build a true equation and charge the generator that de-oozes Moldar. |
| **Space Zapper II** | The chase through the asteroid field: mines and asteroids carry the answers. |
| **City Runner** | Bonus platformer after every mission: gems, gift boxes, crystal clusters, the key and the exit. Treasures decide which of the three endings you earn (Space Splat, High Noon, Parent Trap). |

Eight subjects on the mission console, six levels each: Addition, Subtraction,
Multiplication, Division, Estimation, Fractions/Decimals/Percents, Number Patterns
and Review. Spoken narration for G.C., Freud (the German-accented wrist analyzer),
Blasternaut and Gelator uses the browser's speech synthesis. A Parent/Teacher center
holds per-subject reports, audio options and a keypad-driven custom problem editor.

## Quick start

```bash
npm install
npm run assets        # regenerate the cartoon art into public/assets/
npm test              # 1,000-cycle curriculum stress suite + level map validation
npm run dev           # http://localhost:3000
npm run host          # serve on the LAN for tablets
npm run build         # type-check + production bundle in dist/
npm run build:single  # MegaMathBlaster.html: the whole game in one double-clickable file
```

## Sharing it

`npm run build:single` writes `MegaMathBlaster.html` (about 2 MB) with the code and every
asset inlined. Send that one file to anyone; they open it in a browser with a double-click.
No server, no account, no internet needed. Progress is saved in that browser.
To host it on the web instead, upload the `dist/` folder to any static host.

Controls: mouse or touch everywhere. Keyboard: arrows or WASD move, SPACE jumps or
fires, F throws, ESC opens Options. Keys 1-6 are not bound; use the console.

## Art pipeline

The 1996 game was smooth painted cartoon art, so every asset is authored as
cel-shaded SVG (thick ink outlines, flat fills, simple gradients) and rasterized by
the browser at load time:

- `scripts/art/characters.mjs`, `cast.mjs`, `creatures.mjs`: Blasternaut poses, G.C.,
  Spot, Gelator, Freud, the three troll types and the drones.
- `scripts/art/props.mjs`, `platformProps.mjs`, `platformProps2.mjs`: asteroids,
  satellites, mines, crystals, gates, platforms, hazards, projectiles, tubes.
- `scripts/art/bg*.mjs`: cockpit, Moldar's surface, ice/temple/jungle caves, the city,
  the generator chamber, the console, title and story backdrops.
- `scripts/art/ui.mjs`: the parchment score scroll, dialogue panel, buttons, logo.
- `scripts/generate-assets.mjs` writes `public/assets/*.svg`, a manifest the
  BootScene reads, and `docs/art-preview.html` (open it through the dev server at
  `/docs/art-preview.html`).

## Project layout

```
src/main.ts                 Phaser config and scene list
src/content/Curriculum.ts   Problem, gate and equation generators (all exact integer math)
src/content/Levels.ts       ASCII level maps for Cave Runner and City Runner
src/content/Story.ts        Intro script, mission briefs, crystal lines
src/content/Endings.ts      Three endings and Math Tips
src/systems/Progress.ts     Save file (localStorage, sanitized on read)
src/systems/Narrator.ts     Speech synthesis voices
src/audio/                  Chiptune music loops and sound effects
src/gfx/Ui.ts               Cartoon lettering, buttons, scroll HUD, dialogue boxes
src/scenes/                 Boot, Title, Intro, Console, Mission map, five activities,
                            City Runner, Ending, Parent/Teacher
tests/                      Vitest suites
```

## Play it online

The site is published with GitHub Pages from the `docs/` folder on `main`:

**https://raulg45bdn.github.io/mega-math-blaster/**

Anyone can open that link in any browser. No account, no install. Each player's
progress, crystals and reports are saved in their own browser.

`docs/MegaMathBlaster.html` is also served there, so anyone can download the
whole game as one file and play it offline later.

To publish an update: `npm run build:single && npm run build:pages`, then commit
and push. GitHub Pages picks up the new `docs/` within a minute or so.

## About this project

This is an unofficial, non-commercial fan recreation made for one family who grew
up with the original. It is not affiliated with, endorsed by, or connected to
Davidson & Associates or Knowledge Adventure. *Mega Math Blaster* and the
character names are trademarks of their respective owners, used here only to
describe what this tribute recreates.

Every asset in this repository is original work: the art is drawn in code
(`scripts/art/`), the music and sound effects are synthesized at runtime, and the
game logic was written from scratch. No code, art, audio or data from the
original CD-ROM is included.
