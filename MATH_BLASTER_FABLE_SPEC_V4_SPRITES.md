# Master Engineering Specification: Galactic Math Blaster (v4 - Retro Art Generation)
### Autonomous Build Directive for Claude Fable 5.1
**Target Audience:** Children ages 3 to 10+ (adaptive difficulty)  
**Genre:** 1990s Retro Sci-Fi Educational Arcade & Puzzle  
**Inspiration:** *Mega Math Blaster* (Davidson & Associates, 1996)  
**Target Platform:** Modern Web Browsers (Desktop & Tablet / Touch)  

---

## 1. Executive Directive to Claude Fable 5.1

You are acting as the Autonomous Lead Game Architect and Senior Educational Software Engineer. Your mission is to build, verify, and deliver **Galactic Math Blaster**, a 2D web-based edutainment game honoring the classic 1996 PC title *Mega Math Blaster*.

### Non-Negotiable Operational Rules:
1. **Zero Stubs or Placeholders:** Write complete, production-grade code. Never emit `// TODO`, placeholder comments, or unhandled errors.
2. **Autonomous Asset Generation (1996 Aesthetic):** Do NOT use boring, flat HTML5 canvas shapes. Your first task is to use your imagination and coding capabilities (e.g., Python `Pillow` scripts, Node.js canvas, or intricate Base64 SVGs) to generate authentic, 1996-style 16-bit pixel art assets. 
   - Create a `public/assets/` directory.
   - Generate and save actual `.png` or `.svg` files for Blasternaut, Spot the alien, the rocket ship, space debris, and cavern tiles.
   - The art must mimic the vibrant, chunky, pixelated aesthetic of the original 90s CD-ROM game.
   - Delete the `TextureFactory.ts` file provided below and update `BootScene.ts` to preload your newly generated retro image files.
3. **Rigorous Math Guardrails:**
   - Division by zero is strictly prohibited.
   - Non-integer division is strictly prohibited.
   - Negative arithmetic answers are prohibited in Tiers 0, 1, and 2.
   - Multiple-choice distractors must always be distinct from each other and the correct answer.
4. **Child-First UX:**
   - No harsh failure states or punishing "Game Over" resets.
   - If a child makes a mistake, provide audio-visual reassurance and an educational hint (e.g., visual counters, number bonds).
   - Generous touch hitboxes (minimum 48x48 px).
5. **Automated Verification:** All math logic and distractor generation must pass 100% of the Vitest unit tests across 1,000 randomized cycles.

---

## 2. Project Architecture & Directory Structure

```text
galactic-math-blaster/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tests/
│   └── MathEngine.test.ts
└── src/
    ├── main.ts
    ├── types/
    │   └── index.ts
    ├── audio/
    │   └── SoundSynthesizer.ts
    ├── gfx/
    │   └── TextureFactory.ts
    ├── systems/
    │   ├── MathEngine.ts
    │   └── SaveManager.ts
    └── scenes/
        ├── BootScene.ts
        ├── MenuScene.ts
        ├── TrashZapperScene.ts
        ├── RecyclerScene.ts
        ├── CaveRunnerScene.ts
        └── ParentPortalScene.ts
```

---

## 3. Mathematical Curriculum & Difficulty Tiers

| Tier | Name | Target Ages | Topics Covered | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| **0** | **Preschool Explorer** | Ages 3–5 | Visual crystal counting (1–10), basic sums $\le 10$ | No subtraction; visual counting counters displayed on screen. |
| **1** | **Cadet** | Ages 5–7 | Addition & subtraction within 20, missing operands ($4 + ? = 11$) | Strictly $A \ge B$ for subtraction (no negative results). |
| **2** | **Commander** | Ages 7–9 | Multiplication facts ($1\times 1$ to $10\times 10$), division facts | Pure integer division; divisor $\ge 2$; no remainders. |
| **3** | **Galactic Master** | Ages 9+ | Multi-digit arithmetic, order of operations $(A \times B) + C$ | Answers within $[1, 200]$. |

---

## 4. Complete Code Implementation

### `package.json`
```json
{
  "name": "galactic-math-blaster",
  "version": "1.0.0",
  "private": true,
  "description": "Retro 90s educational sci-fi math arcade game inspired by Mega Math Blaster",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "host": "vite --host 0.0.0.0"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.2.11",
    "vitest": "^1.6.0"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests"]
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3000,
    open: true
  },
  build: {
    assetsInlineLimit: 0,
    target: 'esnext'
  }
});
```

### `index.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Galactic Math Blaster</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body {
      background-color: #0b0c16;
      color: #e2e8f0;
      font-family: 'Courier New', Courier, monospace;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
    }
    #game-container {
      position: relative;
      width: 1024px;
      height: 768px;
      max-width: 98vw;
      max-height: 98vh;
      aspect-ratio: 4 / 3;
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.3), 0 0 10px rgba(168, 85, 247, 0.2);
      border: 3px solid #38bdf8;
      border-radius: 12px;
      overflow: hidden;
      background: #000;
    }
    #game-container::after {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
      background-size: 100% 4px;
      z-index: 10;
      pointer-events: none;
      opacity: 0.4;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### `src/types/index.ts`
```typescript
export type Operator = '+' | '-' | '*' | '/';

export type DifficultyTier = 0 | 1 | 2 | 3;

export interface MathProblem {
  id: string;
  tier: DifficultyTier;
  operator: Operator | 'count';
  operand1: number;
  operand2?: number;
  targetAnswer: number;
  displayPrompt: string;
  missingPosition?: 'first' | 'second' | 'result';
  distractors: number[];
  choices: number[];
  visualCount?: number;
  scaffoldText: string;
}

export interface PlayerProfile {
  name: string;
  ageTier: DifficultyTier;
  stars: number;
  highScores: {
    trashZapper: number;
    recycler: number;
    caveRunner: number;
  };
  allowedOperators: Operator[];
  soundVolume: number;
  musicEnabled: boolean;
  parentPin: string;
}

```

### `src/audio/SoundSynthesizer.ts`
```typescript
export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.4;

  constructor() {
    // Initialized on first user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1990s Arcade Laser Shot: Fast high-to-low pitch plunge with square wave
  playLaser(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(this.volume * 0.4, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Celebratory Arpeggio: C5 -> E5 -> G5 -> C6 (Major triad)
  playCorrect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    const t = ctx.currentTime;

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = t + idx * 0.07;
      const duration = 0.18;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Gentle, Non-Punishing Error Tone: Low playful boing rather than a harsh buzzer
  playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.22);

    gain.gain.setValueAtTime(this.volume * 0.3, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // Jetpack Thruster Sound: Soft filtered noise burst
  playJetpack(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Sparkle / Gem Pickup: Bright crystalline chirp
  playGem(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1174.66, t); // D6
    osc.frequency.exponentialRampToValueAtTime(1760.00, t + 0.1); // A6

    gain.gain.setValueAtTime(this.volume * 0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }
}

export const soundManager = new SoundSynthesizer();

```

### `src/gfx/TextureFactory.ts`
```typescript
import Phaser from 'phaser';

export class TextureFactory {
  public static generateAll(scene: Phaser.Scene): void {
    this.createPlayerShip(scene);
    this.createLaser(scene);
    this.createAsteroid(scene);
    this.createBlasternaut(scene);
    this.createSpotPet(scene);
    this.createEnergyGem(scene);
    this.createPlatform(scene);
    this.createBarrier(scene);
    this.createParticle(scene);
    this.createButton(scene);
  }

  private static createPlayerShip(scene: Phaser.Scene): void {
    if (scene.textures.exists('player_ship')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Main fuselage (sleek 90s sci-fi fighter)
    g.fillStyle(0x38bdf8, 1);
    g.beginPath();
    g.moveTo(56, 24);
    g.lineTo(8, 6);
    g.lineTo(16, 24);
    g.lineTo(8, 42);
    g.closePath();
    g.fillPath();

    // Fuselage highlight
    g.fillStyle(0xf8fafc, 1);
    g.beginPath();
    g.moveTo(52, 24);
    g.lineTo(24, 18);
    g.lineTo(24, 30);
    g.closePath();
    g.fillPath();

    // Cockpit dome
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(36, 24, 6);

    // Laser cannons
    g.fillStyle(0x64748b, 1);
    g.fillRect(16, 4, 16, 4);
    g.fillRect(16, 40, 16, 4);

    // Thruster exhaust glow
    g.fillStyle(0xf43f5e, 1);
    g.beginPath();
    g.moveTo(12, 20);
    g.lineTo(0, 24);
    g.lineTo(12, 28);
    g.closePath();
    g.fillPath();

    g.generateTexture('player_ship', 60, 48);
    g.destroy();
  }

  private static createLaser(scene: Phaser.Scene): void {
    if (scene.textures.exists('laser')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x22c55e, 1);
    g.fillRoundedRect(0, 2, 24, 6, 3);
    g.fillStyle(0x86efac, 1);
    g.fillRoundedRect(4, 3, 16, 4, 2);
    g.generateTexture('laser', 24, 10);
    g.destroy();
  }

  private static createAsteroid(scene: Phaser.Scene): void {
    if (scene.textures.exists('asteroid')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Jagged space rock
    g.fillStyle(0x475569, 1);
    g.beginPath();
    g.moveTo(32, 4);
    g.lineTo(54, 16);
    g.lineTo(60, 38);
    g.lineTo(44, 58);
    g.lineTo(18, 56);
    g.lineTo(4, 36);
    g.lineTo(10, 14);
    g.closePath();
    g.fillPath();

    // Craters & texture
    g.fillStyle(0x334155, 1);
    g.fillCircle(24, 22, 7);
    g.fillCircle(42, 38, 9);
    g.fillCircle(20, 42, 5);

    // Rim highlight
    g.lineStyle(2, 0x94a3b8, 0.8);
    g.strokeCircle(42, 38, 9);

    g.generateTexture('asteroid', 64, 64);
    g.destroy();
  }

  private static createBlasternaut(scene: Phaser.Scene): void {
    if (scene.textures.exists('blasternaut')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Jetpack body
    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(2, 12, 10, 26, 3);

    // Spacesuit body (classic blue & white)
    g.fillStyle(0x0284c7, 1);
    g.fillRoundedRect(10, 14, 20, 24, 4);

    // White chest plate
    g.fillStyle(0xf8fafc, 1);
    g.fillRoundedRect(14, 18, 12, 14, 2);

    // Helmet & golden visor
    g.fillStyle(0x0284c7, 1);
    g.fillCircle(20, 10, 9);
    g.fillStyle(0xfbbf24, 1);
    g.fillRoundedRect(16, 7, 10, 7, 3);

    // Legs & boots
    g.fillStyle(0x0f172a, 1);
    g.fillRect(12, 38, 6, 10);
    g.fillRect(22, 38, 6, 10);

    g.generateTexture('blasternaut', 36, 50);
    g.destroy();
  }

  private static createSpotPet(scene: Phaser.Scene): void {
    if (scene.textures.exists('spot_pet')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    // Friendly green alien pet
    g.fillStyle(0x10b981, 1);
    g.fillCircle(20, 22, 14);

    // Antennae
    g.lineStyle(3, 0x10b981, 1);
    g.beginPath();
    g.moveTo(14, 10);
    g.lineTo(8, 2);
    g.moveTo(26, 10);
    g.lineTo(32, 2);
    g.strokePath();

    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(8, 2, 4);
    g.fillCircle(32, 2, 4);

    // Big playful eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(15, 18, 5);
    g.fillCircle(25, 18, 5);
    g.fillStyle(0x047857, 1);
    g.fillCircle(16, 18, 2.5);
    g.fillCircle(26, 18, 2.5);

    // Cheerful smile
    g.lineStyle(2, 0x064e3b, 1);
    g.beginPath();
    g.arc(20, 24, 6, 0.2, Math.PI - 0.2, false);
    g.strokePath();

    g.generateTexture('spot_pet', 40, 40);
    g.destroy();
  }

  private static createEnergyGem(scene: Phaser.Scene): void {
    if (scene.textures.exists('gem_fuel')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x06b6d4, 1);
    g.beginPath();
    g.moveTo(14, 0);
    g.lineTo(28, 10);
    g.lineTo(14, 28);
    g.lineTo(0, 10);
    g.closePath();
    g.fillPath();

    g.fillStyle(0xa5f3fc, 0.8);
    g.beginPath();
    g.moveTo(14, 3);
    g.lineTo(24, 10);
    g.lineTo(14, 20);
    g.lineTo(4, 10);
    g.closePath();
    g.fillPath();

    g.generateTexture('gem_fuel', 28, 28);
    g.destroy();
  }

  private static createPlatform(scene: Phaser.Scene): void {
    if (scene.textures.exists('platform_cave')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x3b0764, 1);
    g.fillRect(0, 0, 120, 24);
    // Bioluminescent moss top ledge
    g.fillStyle(0xc084fc, 1);
    g.fillRect(0, 0, 120, 6);
    g.generateTexture('platform_cave', 120, 24);
    g.destroy();
  }

  private static createBarrier(scene: Phaser.Scene): void {
    if (scene.textures.exists('barrier')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xef4444, 0.75);
    g.fillRoundedRect(0, 0, 16, 96, 4);
    g.fillStyle(0xfecaca, 0.9);
    g.fillRect(6, 4, 4, 88);
    g.generateTexture('barrier', 16, 96);
    g.destroy();
  }

  private static createParticle(scene: Phaser.Scene): void {
    if (scene.textures.exists('particle_star')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle_star', 8, 8);
    g.destroy();
  }

  private static createButton(scene: Phaser.Scene): void {
    if (scene.textures.exists('ui_button')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(0, 0, 220, 52, 8);
    g.lineStyle(2, 0x38bdf8, 1);
    g.strokeRoundedRect(0, 0, 220, 52, 8);
    g.generateTexture('ui_button', 220, 52);
    g.destroy();
  }
}

```

### `src/systems/MathEngine.ts`
```typescript
import { DifficultyTier, MathProblem, Operator } from '../types';

export class MathEngine {
  private currentTier: DifficultyTier = 1;
  private consecutiveCorrect: number = 0;
  private consecutiveWrong: number = 0;

  constructor(tier: DifficultyTier = 1) {
    this.currentTier = tier;
  }

  public setTier(tier: DifficultyTier): void {
    this.currentTier = tier;
    this.consecutiveCorrect = 0;
    this.consecutiveWrong = 0;
  }

  public getTier(): DifficultyTier {
    return this.currentTier;
  }

  public registerResult(isCorrect: boolean): void {
    if (isCorrect) {
      this.consecutiveCorrect++;
      this.consecutiveWrong = 0;
    } else {
      this.consecutiveWrong++;
      this.consecutiveCorrect = 0;
    }
  }

  public generateProblem(allowedOps?: Operator[]): MathProblem {
    const tier = this.currentTier;
    switch (tier) {
      case 0:
        return this.generateTier0();
      case 1:
        return this.generateTier1(allowedOps);
      case 2:
        return this.generateTier2(allowedOps);
      case 3:
      default:
        return this.generateTier3(allowedOps);
    }
  }

  // Tier 0 (Ages 3-5): Visual counting 1 to 10 or basic single-digit addition <= 10
  private generateTier0(): MathProblem {
    const isCounting = Math.random() < 0.6;
    if (isCounting) {
      const target = Math.floor(Math.random() * 8) + 1; // 1 to 8
      const distractors = this.generateDistractors(target, 0, 10);
      const choices = this.shuffle([target, ...distractors]);
      return {
        id: Math.random().toString(36).substring(2, 9),
        tier: 0,
        operator: 'count',
        operand1: target,
        targetAnswer: target,
        displayPrompt: `Count the energy crystals!`,
        distractors,
        choices,
        visualCount: target,
        scaffoldText: `Count out ${target} crystal${target > 1 ? 's' : ''} one by one!`
      };
    } else {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * (9 - a)) + 1;
      const target = a + b;
      const distractors = this.generateDistractors(target, 1, 10);
      const choices = this.shuffle([target, ...distractors]);
      return {
        id: Math.random().toString(36).substring(2, 9),
        tier: 0,
        operator: '+',
        operand1: a,
        operand2: b,
        targetAnswer: target,
        displayPrompt: `${a} + ${b} = ?`,
        missingPosition: 'result',
        distractors,
        choices,
        visualCount: target,
        scaffoldText: `Put ${a} and ${b} together to make ${target}!`
      };
    }
  }

  // Tier 1 (Ages 5-7): Addition & Subtraction within 20, missing operands, no negative results
  private generateTier1(allowedOps?: Operator[]): MathProblem {
    const ops: Operator[] = (allowedOps && allowedOps.length > 0)
      ? allowedOps.filter(op => op === '+' || op === '-')
      : ['+', '-'];
    const op = ops.length > 0 ? ops[Math.floor(Math.random() * ops.length)] : '+';
    const isMissingOperand = Math.random() < 0.35;

    if (op === '+') {
      const a = Math.floor(Math.random() * 11) + 1; // 1 to 11
      const b = Math.floor(Math.random() * (19 - a)) + 1; // Sum <= 20
      const sum = a + b;

      if (isMissingOperand) {
        // e.g., 4 + ? = 11 -> target is b
        const distractors = this.generateDistractors(b, 0, 20);
        const choices = this.shuffle([b, ...distractors]);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 1,
          operator: '+',
          operand1: a,
          operand2: b,
          targetAnswer: b,
          displayPrompt: `${a} + ? = ${sum}`,
          missingPosition: 'second',
          distractors,
          choices,
          scaffoldText: `Start at ${a} and count forward to ${sum}!`
        };
      } else {
        const distractors = this.generateDistractors(sum, 0, 20);
        const choices = this.shuffle([sum, ...distractors]);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 1,
          operator: '+',
          operand1: a,
          operand2: b,
          targetAnswer: sum,
          displayPrompt: `${a} + ${b} = ?`,
          missingPosition: 'result',
          distractors,
          choices,
          scaffoldText: `${a} plus ${b} makes ${sum}!`
        };
      }
    } else {
      // Subtraction: strictly A >= B, so result >= 0
      const a = Math.floor(Math.random() * 18) + 2; // 2 to 20
      const b = Math.floor(Math.random() * a) + 1; // 1 to a
      const diff = a - b;

      if (isMissingOperand) {
        // e.g., 12 - ? = 8 -> target is b
        const distractors = this.generateDistractors(b, 0, 20);
        const choices = this.shuffle([b, ...distractors]);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 1,
          operator: '-',
          operand1: a,
          operand2: b,
          targetAnswer: b,
          displayPrompt: `${a} - ? = ${diff}`,
          missingPosition: 'second',
          distractors,
          choices,
          scaffoldText: `Subtract ${b} from ${a} leaves ${diff}!`
        };
      } else {
        const distractors = this.generateDistractors(diff, 0, 20);
        const choices = this.shuffle([diff, ...distractors]);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 1,
          operator: '-',
          operand1: a,
          operand2: b,
          targetAnswer: diff,
          displayPrompt: `${a} - ${b} = ?`,
          missingPosition: 'result',
          distractors,
          choices,
          scaffoldText: `Take away ${b} from ${a} to get ${diff}!`
        };
      }
    }
  }

  // Tier 2 (Ages 7-9): Multiplication & Division facts (1-10), no remainder, no zero division
  private generateTier2(allowedOps?: Operator[]): MathProblem {
    const ops: Operator[] = (allowedOps && allowedOps.length > 0)
      ? allowedOps
      : ['+', '-', '*', '/'];
    const op = ops[Math.floor(Math.random() * ops.length)];

    if (op === '*') {
      const a = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const b = Math.floor(Math.random() * 10) + 1; // 1 to 10
      const prod = a * b;
      const distractors = this.generateDistractors(prod, 1, 100);
      const choices = this.shuffle([prod, ...distractors]);
      return {
        id: Math.random().toString(36).substring(2, 9),
        tier: 2,
        operator: '*',
        operand1: a,
        operand2: b,
        targetAnswer: prod,
        displayPrompt: `${a} × ${b} = ?`,
        missingPosition: 'result',
        distractors,
        choices,
        scaffoldText: `${a} groups of ${b} equals ${prod}!`
      };
    } else if (op === '/') {
      // Guaranteed clean integer division
      const b = Math.floor(Math.random() * 9) + 2; // divisor 2 to 10
      const target = Math.floor(Math.random() * 10) + 1; // quotient 1 to 10
      const a = b * target; // dividend
      const distractors = this.generateDistractors(target, 1, 15);
      const choices = this.shuffle([target, ...distractors]);
      return {
        id: Math.random().toString(36).substring(2, 9),
        tier: 2,
        operator: '/',
        operand1: a,
        operand2: b,
        targetAnswer: target,
        displayPrompt: `${a} ÷ ${b} = ?`,
        missingPosition: 'result',
        distractors,
        choices,
        scaffoldText: `How many ${b}s fit inside ${a}? Exactly ${target}!`
      };
    } else {
      // 2-digit addition or subtraction
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 40) + 5;
      if (op === '+') {
        const sum = a + b;
        const distractors = this.generateDistractors(sum, 15, 100);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 2,
          operator: '+',
          operand1: a,
          operand2: b,
          targetAnswer: sum,
          displayPrompt: `${a} + ${b} = ?`,
          missingPosition: 'result',
          distractors,
          choices: this.shuffle([sum, ...distractors]),
          scaffoldText: `Add tens then ones: ${a} + ${b} = ${sum}!`
        };
      } else {
        const high = Math.max(a, b);
        const low = Math.min(a, b);
        const diff = high - low;
        const distractors = this.generateDistractors(diff, 0, 90);
        return {
          id: Math.random().toString(36).substring(2, 9),
          tier: 2,
          operator: '-',
          operand1: high,
          operand2: low,
          targetAnswer: diff,
          displayPrompt: `${high} - ${low} = ?`,
          missingPosition: 'result',
          distractors,
          choices: this.shuffle([diff, ...distractors]),
          scaffoldText: `${high} minus ${low} leaves ${diff}!`
        };
      }
    }
  }

  // Tier 3 (Ages 9+): Multi-digit, order of operations, higher range
  private generateTier3(allowedOps?: Operator[]): MathProblem {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 12) + 2;
    const c = Math.floor(Math.random() * 10) + 1;
    // (a * b) + c
    const target = (a * b) + c;
    const distractors = this.generateDistractors(target, 5, 200);
    const choices = this.shuffle([target, ...distractors]);
    return {
      id: Math.random().toString(36).substring(2, 9),
      tier: 3,
      operator: '+',
      operand1: a,
      operand2: b,
      targetAnswer: target,
      displayPrompt: `(${a} × ${b}) + ${c} = ?`,
      missingPosition: 'result',
      distractors,
      choices,
      scaffoldText: `Multiply first: ${a} × ${b} = ${a * b}, then add ${c} = ${target}!`
    };
  }

  // Distractor Generation: 3 strictly unique, bounded, non-colliding numbers
  public generateDistractors(target: number, minBound: number = 0, maxBound: number = 100): number[] {
    const set = new Set<number>();
    const offsets = [-1, 1, -2, 2, -3, 3, -10, 10, -5, 5, 4, -4];
    this.shuffle(offsets);

    for (const offset of offsets) {
      const candidate = target + offset;
      if (candidate !== target && candidate >= minBound && candidate <= maxBound) {
        set.add(candidate);
        if (set.size === 3) break;
      }
    }

    // Fallback if bounds are tight
    let fallback = minBound;
    while (set.size < 3) {
      if (fallback !== target && !set.has(fallback)) {
        set.add(fallback);
      }
      fallback++;
    }

    return Array.from(set);
  }

  public shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

```

### `src/systems/SaveManager.ts`
```typescript
import { DifficultyTier, PlayerProfile } from '../types';

const STORAGE_KEY = 'galactic_math_blaster_save';

const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Blasternaut Cadet',
  ageTier: 1,
  stars: 0,
  highScores: {
    trashZapper: 0,
    recycler: 0,
    caveRunner: 0
  },
  allowedOperators: ['+', '-'],
  soundVolume: 0.5,
  musicEnabled: true,
  parentPin: '1234'
};

export class SaveManager {
  public static load(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch {
      // LocalStorage unavailable
    }
    return { ...DEFAULT_PROFILE };
  }

  public static save(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // LocalStorage error fallback
    }
  }

  public static updateHighScore(game: 'trashZapper' | 'recycler' | 'caveRunner', score: number): boolean {
    const profile = this.load();
    if (score > profile.highScores[game]) {
      profile.highScores[game] = score;
      this.save(profile);
      return true;
    }
    return false;
  }

  public static addStars(amount: number): number {
    const profile = this.load();
    profile.stars += amount;
    this.save(profile);
    return profile.stars;
  }
}

```

### `tests/MathEngine.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { MathEngine } from '../src/systems/MathEngine';

describe('MathEngine Comprehensive Stress Test', () => {
  const engine = new MathEngine();

  it('Tier 0: Visual counting and sums never exceed bounds', () => {
    engine.setTier(0);
    for (let i = 0; i < 200; i++) {
      const problem = engine.generateProblem();
      expect(problem.targetAnswer).toBeGreaterThanOrEqual(1);
      expect(problem.targetAnswer).toBeLessThanOrEqual(10);
      expect(problem.choices).toHaveLength(4);
      expect(problem.choices).toContain(problem.targetAnswer);
      // Choices must be distinct
      const uniqueChoices = new Set(problem.choices);
      expect(uniqueChoices.size).toBe(4);
    }
  });

  it('Tier 1: Subtraction never produces negative numbers', () => {
    engine.setTier(1);
    for (let i = 0; i < 200; i++) {
      const problem = engine.generateProblem(['-']);
      expect(problem.targetAnswer).toBeGreaterThanOrEqual(0);
      expect(problem.choices).toHaveLength(4);
      expect(problem.choices).toContain(problem.targetAnswer);
      for (const choice of problem.choices) {
        expect(choice).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('Tier 2: Division never divides by zero and always yields integers', () => {
    engine.setTier(2);
    for (let i = 0; i < 200; i++) {
      const problem = engine.generateProblem(['/']);
      expect(problem.operand2).toBeGreaterThan(0);
      expect(Number.isInteger(problem.targetAnswer)).toBe(true);
      expect(problem.choices).toContain(problem.targetAnswer);
      const uniqueChoices = new Set(problem.choices);
      expect(uniqueChoices.size).toBe(4);
    }
  });

  it('Tier 2: Multiplication always remains within facts grid', () => {
    engine.setTier(2);
    for (let i = 0; i < 200; i++) {
      const problem = engine.generateProblem(['*']);
      expect(problem.targetAnswer).toBeLessThanOrEqual(100);
      expect(problem.choices).toHaveLength(4);
      expect(new Set(problem.choices).size).toBe(4);
    }
  });

  it('Distractor generation produces strictly unique options', () => {
    for (let target = 0; target <= 50; target++) {
      const distractors = engine.generateDistractors(target, 0, 100);
      expect(distractors).toHaveLength(3);
      expect(distractors).not.toContain(target);
      expect(new Set(distractors).size).toBe(3);
    }
  });
});

```

### `src/scenes/BootScene.ts`
```typescript
import Phaser from 'phaser';
import { TextureFactory } from '../gfx/TextureFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate all procedural retro textures
    TextureFactory.generateAll(this);
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}

```

### `src/scenes/MenuScene.ts`
```typescript
import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { soundManager } from '../audio/SoundSynthesizer';
import { DifficultyTier } from '../types';

export class MenuScene extends Phaser.Scene {
  private profile = SaveManager.load();

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background starfield
    const stars = this.add.particles(0, 0, 'particle_star', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { min: 0.3, max: 1.2 },
      alpha: { min: 0.2, max: 0.9 },
      lifespan: 3000,
      quantity: 1
    });

    // Title text with retro drop shadow
    this.add.text(width / 2 + 3, 93, 'GALACTIC MATH BLASTER', {
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#0369a1',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, 'GALACTIC MATH BLASTER', {
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.add.text(width / 2, 140, '★ In Search of Spot ★', {
      fontSize: '22px',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    // Mascot Display: Blasternaut & Spot floating
    const astronaut = this.add.image(width / 2 - 50, 230, 'blasternaut').setScale(1.8);
    const spot = this.add.image(width / 2 + 50, 225, 'spot_pet').setScale(1.8);

    this.tweens.add({
      targets: [astronaut, spot],
      y: '+=12',
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Game Mode Buttons
    this.createGameButton(width / 2, 340, '1. TRASH ZAPPER (ARCADE)', () => {
      soundManager.playCorrect();
      this.scene.start('TrashZapperScene');
    });

    this.createGameButton(width / 2, 420, '2. NUMBER RECYCLER (PUZZLE)', () => {
      soundManager.playCorrect();
      this.scene.start('RecyclerScene');
    });

    this.createGameButton(width / 2, 500, '3. CAVERN RUNNER (PLATFORMER)', () => {
      soundManager.playCorrect();
      this.scene.start('CaveRunnerScene');
    });

    this.createGameButton(width / 2, 580, '★ PARENT & LEARNING PORTAL', () => {
      soundManager.playLaser();
      this.scene.start('ParentPortalScene');
    }, 0x475569);

    // Difficulty Indicator Footer
    const tierLabels = ['Preschool (3-5)', 'Cadet (5-7)', 'Commander (7-9)', 'Galactic Master (9+)'];
    this.add.text(width / 2, 690, `Current Tier: ${tierLabels[this.profile.ageTier]} | Total Stars: ${this.profile.stars} ★`, {
      fontSize: '18px',
      color: '#94a3b8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);
  }

  private createGameButton(x: number, y: number, text: string, onClick: () => void, tint: number = 0x0284c7): void {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 480, 56, tint, 0.9)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x38bdf8);

    const label = this.add.text(0, 0, text, {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    container.add([bg, label]);

    bg.on('pointerover', () => {
      bg.setFillStyle(0x0ea5e9, 1);
      container.setScale(1.03);
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(tint, 0.9);
      container.setScale(1);
    });

    bg.on('pointerdown', onClick);
  }
}

```

### `src/scenes/TrashZapperScene.ts`
```typescript
import Phaser from 'phaser';
import { MathEngine } from '../systems/MathEngine';
import { SaveManager } from '../systems/SaveManager';
import { soundManager } from '../audio/SoundSynthesizer';
import { MathProblem, PlayerProfile } from '../types';

interface DebrisObject {
  container: Phaser.GameObjects.Container;
  value: number;
}

export class TrashZapperScene extends Phaser.Scene {
  private mathEngine!: MathEngine;
  private profile!: PlayerProfile;
  private currentProblem!: MathProblem;
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private lasers!: Phaser.Physics.Arcade.Group;
  private debrisGroup: DebrisObject[] = [];
  private crystalContainer!: Phaser.GameObjects.Container;
  private promptText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey!: Phaser.Input.Keyboard.Key;
  private lastFired: number = 0;

  constructor() {
    super({ key: 'TrashZapperScene' });
  }

  create(): void {
    this.profile = SaveManager.load();
    this.mathEngine = new MathEngine(this.profile.ageTier);
    this.score = 0;
    this.debrisGroup = [];

    const { width, height } = this.scale;

    this.add.particles(0, 0, 'particle_star', {
      x: width + 20,
      y: { min: 0, max: height },
      speedX: { min: -180, max: -80 },
      scale: { min: 0.4, max: 1 },
      alpha: { min: 0.3, max: 0.8 },
      lifespan: 12000,
      quantity: 2
    });

    // Top HUD
    this.add.rectangle(width / 2, 45, width, 90, 0x0f172a, 0.95).setStrokeStyle(2, 0x38bdf8);

    this.promptText = this.add.text(width / 2, 28, 'LOADING MISSION...', {
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.crystalContainer = this.add.container(width / 2, 64);

    this.scoreText = this.add.text(30, 40, 'SCORE: 0', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0, 0.5);

    const exitBtn = this.add.text(width - 30, 40, '[EXIT]', {
      fontSize: '18px',
      color: '#f43f5e',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.feedbackText = this.add.text(width / 2, 115, '', {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#4ade80',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.player = this.physics.add.image(100, height / 2, 'player_ship');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(48, 32);

    this.lasers = this.physics.add.group({ defaultKey: 'laser', maxSize: 10 });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y > 100) this.fireLaser();
    });

    this.nextWave();
  }

  private nextWave(): void {
    this.debrisGroup.forEach(d => d.container.destroy());
    this.debrisGroup = [];
    this.crystalContainer.removeAll(true);

    this.currentProblem = this.mathEngine.generateProblem(this.profile.allowedOperators);
    this.promptText.setText(`ZAP TARGET: ${this.currentProblem.displayPrompt}`);
    this.feedbackText.setText('');

    // Preschool Tier 0: Display physical crystals to count
    if (this.currentProblem.visualCount && this.currentProblem.visualCount > 0) {
      const count = this.currentProblem.visualCount;
      const spacing = 28;
      const startX = -((count - 1) * spacing) / 2;
      for (let i = 0; i < count; i++) {
        const gem = this.add.image(startX + i * spacing, 0, 'gem_fuel').setScale(0.85);
        this.crystalContainer.add(gem);
      }
    }

    const { width } = this.scale;
    const ySlots = [180, 310, 440, 570];

    this.currentProblem.choices.forEach((choiceVal, idx) => {
      const container = this.add.container(width + 40 + idx * 30, ySlots[idx]);
      const rock = this.add.image(0, 0, 'asteroid').setScale(1.2);
      const valText = this.add.text(0, 0, choiceVal.toString(), {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      container.add([rock, valText]);
      this.physics.world.enable(container);
      const body = container.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-85);
      body.setSize(64, 64);

      this.debrisGroup.push({ container, value: choiceVal });
    });
  }

  private fireLaser(): void {
    const time = this.time.now;
    if (time - this.lastFired < 280) return;
    this.lastFired = time;

    const laser = this.lasers.get(this.player.x + 30, this.player.y) as Phaser.Physics.Arcade.Image;
    if (laser) {
      laser.setActive(true);
      laser.setVisible(true);
      laser.body.reset(this.player.x + 30, this.player.y);
      laser.setVelocityX(750);
      soundManager.playLaser();
    }
  }

  override update(): void {
    const speed = 320;
    let vy = 0;
    let vx = 0;

    if (this.cursors) {
      if (this.cursors.up.isDown) vy = -speed;
      else if (this.cursors.down.isDown) vy = speed;
      if (this.cursors.left.isDown) vx = -speed * 0.7;
      else if (this.cursors.right.isDown) vx = speed * 0.7;

      if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
        this.fireLaser();
      }
    }

    if (this.input.activePointer.isDown && this.input.activePointer.y > 100) {
      const dy = this.input.activePointer.y - this.player.y;
      if (Math.abs(dy) > 10) vy = Math.sign(dy) * speed;
    }

    this.player.setVelocity(vx, vy);
    if (this.player.x > 320) this.player.x = 320;

    this.lasers.children.iterate((c) => {
      const laser = c as Phaser.Physics.Arcade.Image;
      if (laser.active) {
        if (laser.x > this.scale.width + 50) {
          laser.setActive(false);
          laser.setVisible(false);
        }

        for (let i = this.debrisGroup.length - 1; i >= 0; i--) {
          const debris = this.debrisGroup[i];
          const dist = Phaser.Math.Distance.Between(laser.x, laser.y, debris.container.x, debris.container.y);
          if (dist < 40) {
            laser.setActive(false);
            laser.setVisible(false);
            this.handleDebrisHit(debris, i);
            break;
          }
        }
      }
      return null;
    });

    this.debrisGroup.forEach(d => {
      if (d.container.x < -60) d.container.x = this.scale.width + 40;
    });
  }

  private handleDebrisHit(debris: DebrisObject, index: number): void {
    if (debris.value === this.currentProblem.targetAnswer) {
      soundManager.playCorrect();
      this.score += 100;
      this.scoreText.setText(`SCORE: ${this.score}`);
      this.feedbackText.setColor('#4ade80').setText('★ EXCELLENT! BLAST OFF! ★');
      this.mathEngine.registerResult(true);
      SaveManager.addStars(1);
      SaveManager.updateHighScore('trashZapper', this.score);

      this.add.particles(debris.container.x, debris.container.y, 'particle_star', {
        speed: { min: 80, max: 240 },
        scale: { start: 1.5, end: 0 },
        lifespan: 600,
        quantity: 20
      });

      debris.container.destroy();
      this.debrisGroup.splice(index, 1);
      this.time.delayedCall(1200, () => this.nextWave());
    } else {
      soundManager.playError();
      this.mathEngine.registerResult(false);
      this.feedbackText.setColor('#f87171').setText(`HINT: ${this.currentProblem.scaffoldText}`);
      debris.container.destroy();
      this.debrisGroup.splice(index, 1);
    }
  }
}
```

### `src/scenes/RecyclerScene.ts`
```typescript
import Phaser from 'phaser';
import { MathEngine } from '../systems/MathEngine';
import { SaveManager } from '../systems/SaveManager';
import { soundManager } from '../audio/SoundSynthesizer';
import { MathProblem } from '../types';

interface RecyclerChute {
  container: Phaser.GameObjects.Container;
  lever: Phaser.GameObjects.Rectangle;
  value: number;
}

export class RecyclerScene extends Phaser.Scene {
  private mathEngine!: MathEngine;
  private currentProblem!: MathProblem;
  private slotA: number | null = null;
  private slotB: number | null = null;
  private chutes: RecyclerChute[] = [];
  private slotAText!: Phaser.GameObjects.Text;
  private slotBText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;
  private operatorText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'RecyclerScene' });
  }

  create(): void {
    const profile = SaveManager.load();
    this.mathEngine = new MathEngine(profile.ageTier);
    this.chutes = [];

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x111827);

    this.add.text(width / 2, 40, 'CORE MATRIX NUMBER RECYCLER', {
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const exitBtn = this.add.text(width - 40, 40, '[EXIT]', {
      fontSize: '18px',
      color: '#f43f5e',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    this.statusText = this.add.text(width / 2, 85, 'Pull levers to load numbers and balance the reactor!', {
      fontSize: '18px',
      color: '#cbd5e1',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const boxY = 190;
    this.add.rectangle(width / 2, boxY, 600, 100, 0x1e293b).setStrokeStyle(3, 0x38bdf8);

    this.slotAText = this.add.text(width / 2 - 160, boxY, '[ ? ]', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.operatorText = this.add.text(width / 2 - 80, boxY, '+', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.slotBText = this.add.text(width / 2, boxY, '[ ? ]', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.add.text(width / 2 + 80, boxY, '=', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ffffff',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.targetText = this.add.text(width / 2 + 160, boxY, '10', {
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#4ade80',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.newPuzzle();
  }

  private newPuzzle(): void {
    this.slotA = null;
    this.slotB = null;
    this.slotAText.setText('[ ? ]');
    this.slotBText.setText('[ ? ]');

    const profile = SaveManager.load();
    this.currentProblem = this.mathEngine.generateProblem(profile.allowedOperators);
    const op = this.currentProblem.operator === 'count' ? '+' : this.currentProblem.operator;
    this.operatorText.setText(op);
    this.targetText.setText(this.currentProblem.targetAnswer.toString());

    const a = this.currentProblem.operand1;
    const b = this.currentProblem.operand2 ?? Math.max(1, this.currentProblem.targetAnswer - a);
    const candidates = this.mathEngine.shuffle([a, b, a + 3, Math.max(1, b - 2)]);

    const { width } = this.scale;
    const chuteY = 460;

    this.chutes.forEach(c => c.container.destroy());
    this.chutes = [];

    candidates.forEach((val, i) => {
      const cx = width / 2 - 225 + i * 150;
      const container = this.add.container(cx, chuteY);
      const tube = this.add.rectangle(0, 0, 110, 140, 0x334155).setStrokeStyle(2, 0x64748b);
      const label = this.add.text(0, -10, val.toString(), {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#38bdf8',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      const lever = this.add.rectangle(0, 45, 90, 32, 0x0284c7).setInteractive({ useHandCursor: true }).setStrokeStyle(2, 0x38bdf8);
      const leverText = this.add.text(0, 45, 'LOAD', { fontSize: '16px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Courier New' }).setOrigin(0.5);

      container.add([tube, label, lever, leverText]);

      const chuteObj: RecyclerChute = { container, lever, value: val };
      this.chutes.push(chuteObj);

      lever.on('pointerdown', () => {
        soundManager.playLaser();
        lever.disableInteractive();
        container.setAlpha(0.4);
        this.selectNumber(val);
      });
    });
  }

  private selectNumber(num: number): void {
    if (this.slotA === null) {
      this.slotA = num;
      this.slotAText.setText(num.toString());
    } else if (this.slotB === null) {
      this.slotB = num;
      this.slotBText.setText(num.toString());
      this.verifySolution();
    }
  }

  private verifySolution(): void {
    if (this.slotA === null || this.slotB === null) return;
    const op = this.currentProblem.operator;
    let result = 0;
    if (op === '*') result = this.slotA * this.slotB;
    else if (op === '/') result = Math.floor(this.slotA / this.slotB);
    else if (op === '-') result = this.slotA - this.slotB;
    else result = this.slotA + this.slotB;

    if (result === this.currentProblem.targetAnswer) {
      soundManager.playCorrect();
      this.statusText.setColor('#4ade80').setText('★ POWER BALANCED! CELL RECHARGED! ★');
      SaveManager.addStars(1);
      this.time.delayedCall(1600, () => this.scene.restart());
    } else {
      soundManager.playError();
      this.statusText.setColor('#f87171').setText(`OVERLOAD! ${this.slotA} ${op} ${this.slotB} = ${result}. Try again!`);
      this.time.delayedCall(1400, () => {
        this.slotA = null;
        this.slotB = null;
        this.slotAText.setText('[ ? ]');
        this.slotBText.setText('[ ? ]');
        this.chutes.forEach(c => {
          c.lever.setInteractive({ useHandCursor: true });
          c.container.setAlpha(1.0);
        });
      });
    }
  }
}
```

### `src/scenes/CaveRunnerScene.ts`
```typescript
import Phaser from 'phaser';
import { MathEngine } from '../systems/MathEngine';
import { SaveManager } from '../systems/SaveManager';
import { soundManager } from '../audio/SoundSynthesizer';
import { MathProblem } from '../types';

interface FuelCanister {
  container: Phaser.GameObjects.Container;
  value: number;
}

export class CaveRunnerScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private mathEngine!: MathEngine;
  private currentProblem!: MathProblem;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private promptText!: Phaser.GameObjects.Text;
  private carriedValueText!: Phaser.GameObjects.Text;
  private carriedValue: number | null = null;
  private canisters: FuelCanister[] = [];
  private barrierGate!: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  private touchMoveLeft: boolean = false;
  private touchMoveRight: boolean = false;
  private touchJump: boolean = false;

  constructor() {
    super({ key: 'CaveRunnerScene' });
  }

  create(): void {
    const profile = SaveManager.load();
    this.mathEngine = new MathEngine(profile.ageTier);
    this.currentProblem = this.mathEngine.generateProblem(profile.allowedOperators);
    this.carriedValue = null;
    this.canisters = [];

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x180b26);

    // Top HUD
    this.add.rectangle(width / 2, 45, width, 90, 0x0f172a, 0.9).setStrokeStyle(2, 0xa855f7);

    this.promptText = this.add.text(width / 2, 30, `GATE LOCK: ${this.currentProblem.displayPrompt}`, {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.carriedValueText = this.add.text(width / 2, 65, 'CARRIED ISOTOPE: [ NONE ]', {
      fontSize: '18px',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const exitBtn = this.add.text(width - 30, 40, '[EXIT]', {
      fontSize: '18px',
      color: '#f43f5e',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(width / 2, height - 20, 'platform_cave').setScale(9, 2).refreshBody();
    this.platforms.create(250, 580, 'platform_cave');
    this.platforms.create(520, 460, 'platform_cave');
    this.platforms.create(780, 340, 'platform_cave');
    this.platforms.create(920, 220, 'platform_cave');

    // Player
    this.player = this.physics.add.image(80, height - 90, 'blasternaut');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(750);
    this.physics.add.collider(this.player, this.platforms);

    // Barrier Gate
    this.barrierGate = this.physics.add.staticImage(920, 150, 'barrier');
    this.physics.add.overlap(this.player, this.barrierGate, () => this.handleGateTouch());

    // Spawn numbered fuel canisters on ledges
    const ledgeCoords = [[250, 540], [520, 420], [780, 300], [400, height - 60]];
    this.currentProblem.choices.forEach((choice, idx) => {
      const pos = ledgeCoords[idx];
      const container = this.add.container(pos[0], pos[1]);
      const gem = this.add.image(0, 0, 'gem_fuel').setScale(1.2);
      const text = this.add.text(0, -2, choice.toString(), {
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#0f172a',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      container.add([gem, text]);
      this.physics.world.enable(container);
      const body = container.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      this.canisters.push({ container, value: choice });
    });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Touch controls for tablets
    this.createTouchControls(width, height);
  }

  private createTouchControls(width: number, height: number): void {
    const leftBtn = this.add.circle(80, height - 70, 36, 0x1e293b, 0.8).setInteractive();
    this.add.text(80, height - 70, '◄', { fontSize: '24px', color: '#38bdf8' }).setOrigin(0.5);
    leftBtn.on('pointerdown', () => this.touchMoveLeft = true);
    leftBtn.on('pointerup', () => this.touchMoveLeft = false);
    leftBtn.on('pointerout', () => this.touchMoveLeft = false);

    const rightBtn = this.add.circle(180, height - 70, 36, 0x1e293b, 0.8).setInteractive();
    this.add.text(180, height - 70, '►', { fontSize: '24px', color: '#38bdf8' }).setOrigin(0.5);
    rightBtn.on('pointerdown', () => this.touchMoveRight = true);
    rightBtn.on('pointerup', () => this.touchMoveRight = false);
    rightBtn.on('pointerout', () => this.touchMoveRight = false);

    const jumpBtn = this.add.circle(width - 90, height - 70, 42, 0x0284c7, 0.8).setInteractive();
    this.add.text(width - 90, height - 70, 'JET', { fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    jumpBtn.on('pointerdown', () => this.touchJump = true);
    jumpBtn.on('pointerup', () => this.touchJump = false);
    jumpBtn.on('pointerout', () => this.touchJump = false);
  }

  override update(): void {
    const speed = 220;
    let vx = 0;

    if ((this.cursors && this.cursors.left.isDown) || this.touchMoveLeft) {
      vx = -speed;
    } else if ((this.cursors && this.cursors.right.isDown) || this.touchMoveRight) {
      vx = speed;
    }

    this.player.setVelocityX(vx);

    const isJumpPressed = (this.cursors && (this.cursors.up.isDown || this.cursors.space.isDown)) || this.touchJump;
    if (isJumpPressed && this.player.body.touching.down) {
      this.player.setVelocityY(-520);
      soundManager.playJetpack();
    }

    // Canister pickup check
    for (let i = this.canisters.length - 1; i >= 0; i--) {
      const c = this.canisters[i];
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, c.container.x, c.container.y);
      if (dist < 40) {
        soundManager.playGem();
        this.carriedValue = c.value;
        this.carriedValueText.setText(`CARRIED ISOTOPE: [ ${this.carriedValue} ]`);
        c.container.destroy();
        this.canisters.splice(i, 1);
        break;
      }
    }
  }

  private handleGateTouch(): void {
    if (this.carriedValue === this.currentProblem.targetAnswer) {
      soundManager.playCorrect();
      SaveManager.addStars(2);
      this.promptText.setColor('#4ade80').setText('★ GATE OPENED! CAVERN CLEARED! ★');
      this.barrierGate.destroy();
      this.time.delayedCall(1600, () => this.scene.restart());
    } else {
      soundManager.playError();
      this.player.setVelocityX(-250);
      this.player.setVelocityY(-150);
      this.promptText.setColor('#f87171').setText(`DOOR LOCKED! ${this.currentProblem.scaffoldText}`);
    }
  }
}
```

### `src/scenes/ParentPortalScene.ts`
```typescript
import Phaser from 'phaser';
import { SaveManager } from '../systems/SaveManager';
import { DifficultyTier, Operator } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';

export class ParentPortalScene extends Phaser.Scene {
  private isUnlocked: boolean = false;

  constructor() {
    super({ key: 'ParentPortalScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0f172a);

    this.add.text(width / 2, 50, '★ PARENT & LEARNING DASHBOARD ★', {
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const exitBtn = this.add.text(width - 40, 50, '[RETURN]', {
      fontSize: '18px',
      color: '#f43f5e',
      fontFamily: 'Courier New'
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    if (!this.isUnlocked) {
      this.renderMathGate();
    } else {
      this.renderControls();
    }
  }

  private renderMathGate(): void {
    const { width, height } = this.scale;
    const challengeA = Math.floor(Math.random() * 5) + 4;
    const challengeB = Math.floor(Math.random() * 6) + 3;
    const answer = challengeA * challengeB;

    this.add.text(width / 2, height / 2 - 60, 'PARENT VERIFICATION GATE', {
      fontSize: '20px',
      color: '#e2e8f0',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, `Solve: ${challengeA} × ${challengeB} = ?`, {
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#facc15',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const options = [answer, answer + 2, Math.max(1, answer - 3), answer + 7].sort(() => Math.random() - 0.5);

    options.forEach((opt, idx) => {
      const btn = this.add.rectangle(width / 2 - 210 + idx * 140, height / 2 + 50, 110, 48, 0x1e293b)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x38bdf8);

      this.add.text(width / 2 - 210 + idx * 140, height / 2 + 50, opt.toString(), {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      btn.on('pointerdown', () => {
        if (opt === answer) {
          soundManager.playCorrect();
          this.isUnlocked = true;
          this.scene.restart();
        } else {
          soundManager.playError();
          this.scene.restart();
        }
      });
    });
  }

  private renderControls(): void {
    const { width } = this.scale;
    const profile = SaveManager.load();

    // 1. Difficulty Tiers
    this.add.text(width / 2, 110, 'SELECT ACTIVE DIFFICULTY TIER', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const tiers: { tier: DifficultyTier; label: string; desc: string }[] = [
      { tier: 0, label: 'Tier 0: Preschool (Ages 3-5)', desc: 'Counting crystals (1-10) and visual single-digit sums' },
      { tier: 1, label: 'Tier 1: Cadet (Ages 5-7)', desc: 'Addition and Subtraction up to 20, missing numbers' },
      { tier: 2, label: 'Tier 2: Commander (Ages 7-9)', desc: 'Multiplication facts (1-10) and clean division' },
      { tier: 3, label: 'Tier 3: Master (Ages 9+)', desc: 'Multi-digit arithmetic and order of operations' }
    ];

    tiers.forEach((t, i) => {
      const y = 160 + i * 62;
      const isSelected = profile.ageTier === t.tier;

      const card = this.add.rectangle(width / 2, y, 640, 52, isSelected ? 0x0284c7 : 0x1e293b)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, isSelected ? 0x38bdf8 : 0x475569);

      this.add.text(width / 2 - 300, y - 10, t.label, { fontSize: '16px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Courier New' });
      this.add.text(width / 2 - 300, y + 10, t.desc, { fontSize: '12px', color: '#94a3b8', fontFamily: 'Courier New' });

      card.on('pointerdown', () => {
        soundManager.playLaser();
        profile.ageTier = t.tier;
        SaveManager.save(profile);
        this.scene.restart();
      });
    });

    // 2. Allowed Operation Toggles
    this.add.text(width / 2, 435, 'CURRICULUM OPERATOR TOGGLES', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#38bdf8',
      fontFamily: 'Courier New'
    }).setOrigin(0.5);

    const ops: { op: Operator; label: string }[] = [
      { op: '+', label: 'ADD (+)' },
      { op: '-', label: 'SUB (-)' },
      { op: '*', label: 'MULT (×)' },
      { op: '/', label: 'DIV (÷)' }
    ];

    ops.forEach((item, idx) => {
      const x = width / 2 - 210 + idx * 140;
      const y = 480;
      const active = profile.allowedOperators.includes(item.op);

      const pill = this.add.rectangle(x, y, 110, 42, active ? 0x16a34a : 0x334155)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, active ? 0x86efac : 0x64748b);

      this.add.text(x, y, item.label, { fontSize: '15px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Courier New' }).setOrigin(0.5);

      pill.on('pointerdown', () => {
        soundManager.playLaser();
        if (active) {
          if (profile.allowedOperators.length > 1) {
            profile.allowedOperators = profile.allowedOperators.filter(o => o !== item.op);
          }
        } else {
          profile.allowedOperators.push(item.op);
        }
        SaveManager.save(profile);
        this.scene.restart();
      });
    });

    // 3. Reset High Scores
    const resetBtn = this.add.rectangle(width / 2, 570, 240, 44, 0x991b1b)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xf87171);

    this.add.text(width / 2, 570, 'RESET HIGH SCORES', { fontSize: '15px', fontStyle: 'bold', color: '#ffffff', fontFamily: 'Courier New' }).setOrigin(0.5);

    resetBtn.on('pointerdown', () => {
      profile.highScores = { trashZapper: 0, recycler: 0, caveRunner: 0 };
      profile.stars = 0;
      SaveManager.save(profile);
      soundManager.playError();
      this.scene.restart();
    });
  }
}
```

### `src/main.ts`
```typescript
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { TrashZapperScene } from './scenes/TrashZapperScene';
import { RecyclerScene } from './scenes/RecyclerScene';
import { CaveRunnerScene } from './scenes/CaveRunnerScene';
import { ParentPortalScene } from './scenes/ParentPortalScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#05070f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    TrashZapperScene,
    RecyclerScene,
    CaveRunnerScene,
    ParentPortalScene
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});

```

---

## 5. Execution & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests to verify mathematical bounds
npm test

# 3. Launch the development server (Local)
npm run dev

# 4. Launch the development server (Networked for Tablets)
npm run host

# 5. Verify production bundle builds cleanly
npm run build
```
