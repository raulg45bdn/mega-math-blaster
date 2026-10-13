import Phaser from 'phaser';
import { ActivityBase } from './ActivityBase';
import { K, SCENE } from '../gfx/Keys';
import { banner, outlinedText, popText, textStyle } from '../gfx/Ui';
import { Choice, Problem } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';
import { music } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';

interface Target {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text | null;
  choice: Choice | null;
  vx: number;
  vy: number;
  spin: number;
  alive: boolean;
}

const WINDOW_TOP = 90;
const WINDOW_BOTTOM = 540;
const WINDOW_LEFT = 120;
const WINDOW_RIGHT = 904;
const LAMP_X = [380, 440, 500, 560, 620];
const LAMP_Y = 724;
const CORRECT_TO_WIN = 10;
const FREE_FIRE_SECONDS = 15;

/**
 * Space Zapper (missions 1 and 5): first-person cockpit. Shoot the floating
 * number that completes the dashboard equation. Five correct answers light the
 * laser lamps and open a free-fire bonus on asteroids and satellites.
 */
export class SpaceZapperScene extends ActivityBase {
  private mode: 1 | 2 = 1;
  private problem!: Problem;
  private targets: Target[] = [];
  private crosshair!: Phaser.GameObjects.Image;
  private equationText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private lamps: Phaser.GameObjects.Image[] = [];
  private charges: number = 0;
  private correctCount: number = 0;
  private wrongStreak: number = 0;
  private freeFire: boolean = false;
  private freeFireLeft: number = 0;
  private locked: boolean = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireKey?: Phaser.Input.Keyboard.Key;
  private stars!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: SCENE.SPACE_ZAPPER });
  }

  init(data: { mode?: 1 | 2 }): void {
    this.mode = data?.mode === 2 ? 2 : 1;
  }

  create(): void {
    const { width, height } = this.scale;
    this.targets = [];
    this.lamps = [];
    this.charges = 0;
    this.correctCount = 0;
    this.wrongStreak = 0;
    this.freeFire = false;
    this.freeFireLeft = 0;
    this.locked = false;

    this.stars = this.add.tileSprite(width / 2, height / 2, width, height, K.BG_STARFIELD).setDepth(-10);
    this.add.image(width / 2, height / 2, K.BG_COCKPIT).setDepth(10);
    this.setupActivity(14, 80);
    this.hud.container.setScale(0.78).setDepth(30);
    music.play('space');

    this.equationText = this.add.text(512, 650, '', textStyle(38, '#39ff9a', { stroke: '#0e2a22', strokeThickness: 4 })).setOrigin(0.5).setDepth(20);
    this.statusText = this.add.text(512, 600, '', textStyle(16, '#ffcc33', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setDepth(20);
    LAMP_X.forEach((x) => this.lamps.push(this.add.image(x, LAMP_Y, K.LAMP_OFF).setDepth(20).setScale(0.8)));
    outlinedText(this, 512, 52, this.mode === 1 ? 'SPACE ZAPPER' : 'SPACE ZAPPER II: THE CHASE', 26, '#ffcc33', 4).setDepth(20);

    this.crosshair = this.add.image(width / 2, height / 2 - 80, K.CROSSHAIR).setDepth(25);
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.moveCrosshair(p.x, p.y));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.moveCrosshair(p.x, p.y);
      if (p.y < WINDOW_BOTTOM + 20) this.fire();
    });
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.fireKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.nextProblem();
  }

  private moveCrosshair(x: number, y: number): void {
    this.crosshair.setPosition(Phaser.Math.Clamp(x, WINDOW_LEFT, WINDOW_RIGHT), Phaser.Math.Clamp(y, WINDOW_TOP, WINDOW_BOTTOM + 30));
  }

  protected override currentHint(): string {
    return this.freeFire ? 'Free fire! Blast every asteroid and satellite you can before the timer runs out.' : this.problem.hint;
  }

  private clearTargets(): void {
    this.targets.forEach((t) => t.container.destroy());
    this.targets = [];
  }

  private spawnTarget(choice: Choice | null): Target {
    const textureKey = this.mode === 2 ? (Math.random() < 0.5 ? K.SPACE_MINE : K.ASTEROIDS[Phaser.Math.Between(0, 2)]) : Math.random() < 0.3 ? K.SATELLITE : K.ASTEROIDS[Phaser.Math.Between(0, 2)];
    const x = Phaser.Math.Between(WINDOW_LEFT + 60, WINDOW_RIGHT - 60);
    const y = Phaser.Math.Between(WINDOW_TOP + 50, WINDOW_BOTTOM - 60);
    const container = this.add.container(x, y).setDepth(5);
    const scale = 0.7 + Math.random() * 0.5;
    const sprite = this.add.image(0, 0, textureKey).setScale(scale);
    container.add(sprite);
    let label: Phaser.GameObjects.Text | null = null;
    if (choice) {
      const plate = this.add.image(0, 44 * scale, K.NUMBER_PLATE).setScale(1.1);
      label = this.add.text(0, 44 * scale, choice.label, textStyle(22, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5);
      container.add([plate, label]);
    }
    const speed = (this.freeFire ? 90 : 40) + this.level * 6 + (this.mode === 2 ? 25 : 0);
    const angle = Math.random() * Math.PI * 2;
    const target: Target = { container, sprite, label, choice, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.6, spin: (Math.random() - 0.5) * 40, alive: true };
    this.targets.push(target);
    return target;
  }

  private nextProblem(): void {
    this.clearTargets();
    this.locked = false;
    this.freeFire = false;
    this.problem = this.makeProblem(this.level >= 4 || this.mode === 2 ? 6 : 4);
    this.equationText.setText(this.problem.prompt);
    this.statusText.setText('Zap the answer!');
    narrator.sayProblem(this.problem.prompt);
    this.problem.choices.forEach((choice) => this.spawnTarget(choice));
  }

  private startFreeFire(): void {
    this.clearTargets();
    this.freeFire = true;
    this.locked = false;
    this.freeFireLeft = FREE_FIRE_SECONDS;
    this.equationText.setText('FREE FIRE!');
    banner(this, 'LASERS CHARGED!', '#ff3d3d', 1200, 48);
    narrator.say('Lasers charged! Free fire! Blast the space trash!', 'gc');
    for (let i = 0; i < 6; i++) this.spawnTarget(null);
  }

  private endFreeFire(): void {
    this.charges = 0;
    this.lamps.forEach((l) => l.setTexture(K.LAMP_OFF));
    if (this.correctCount >= CORRECT_TO_WIN) {
      this.clearTargets();
      this.completeMission(this.mode === 1 ? 'spaceZapper1' : 'spaceZapper2', this.mode === 1 ? 'blue' : null);
      return;
    }
    this.nextProblem();
  }

  private fire(): void {
    if (this.paused || this.finished || this.locked) return;
    soundManager.playLaser();
    const { x, y } = this.crosshair;
    const bolt = this.add.image(512, 590, K.LASER_BOLT).setDepth(15).setRotation(Phaser.Math.Angle.Between(512, 590, x, y));
    this.tweens.add({ targets: bolt, x, y, scale: 0.35, duration: 180, ease: 'Quad.easeIn', onComplete: () => {
      bolt.destroy();
      this.resolveShot(x, y);
    } });
  }

  private resolveShot(x: number, y: number): void {
    if (this.finished) return;
    let best: Target | null = null;
    let bestDist = 70;
    this.targets.forEach((t) => {
      if (!t.alive) return;
      const d = Phaser.Math.Distance.Between(x, y, t.container.x, t.container.y + (t.choice ? 12 : 0));
      if (d < bestDist) {
        bestDist = d;
        best = t;
      }
    });
    if (!best) return;
    const target: Target = best;
    if (this.freeFire) {
      this.destroyTarget(target);
      this.addScore(50);
      popText(this, target.container.x, target.container.y, '+50', '#ffcc33', 22);
      this.spawnTarget(null);
      return;
    }
    if (target.choice && target.choice.value === this.problem.answer.value) {
      this.locked = true;
      this.wrongStreak = 0;
      this.correctCount++;
      this.charges++;
      this.recordAnswer(true, 100 + this.level * 20);
      popText(this, target.container.x, target.container.y - 20, `+${100 + this.level * 20}`, '#39ff9a');
      this.destroyTarget(target);
      this.equationText.setText(this.problem.prompt.replace('?', this.problem.answer.label));
      this.statusText.setText('Correct! Laser charged.');
      soundManager.playCorrect();
      if (this.charges <= this.lamps.length) this.lamps[this.charges - 1].setTexture(K.LAMP_ON);
      this.time.delayedCall(900, () => {
        if (this.finished) return;
        if (this.charges >= this.lamps.length) this.startFreeFire();
        else this.nextProblem();
      });
      return;
    }
    // Wrong target: gentle wobble, hint, and after two misses point at the answer.
    this.wrongStreak++;
    this.recordAnswer(false, 0);
    soundManager.playError();
    this.tweens.add({ targets: target.container, angle: 12, duration: 70, yoyo: true, repeat: 3 });
    this.statusText.setText(this.wrongStreak >= 2 ? this.problem.hint : `Not ${target.choice?.label}. Try again!`);
    if (this.wrongStreak >= 2) {
      narrator.say(this.problem.hint, 'gc');
      const correct = this.targets.find((t) => t.alive && t.choice?.value === this.problem.answer.value);
      if (correct) this.tweens.add({ targets: correct.container, scale: 1.25, duration: 220, yoyo: true, repeat: 4 });
    }
  }

  private destroyTarget(target: Target): void {
    target.alive = false;
    soundManager.playExplosion();
    this.tweens.add({ targets: target.container, scale: 1.6, alpha: 0, angle: 90, duration: 260, onComplete: () => target.container.destroy() });
    const burst = this.add.particles(target.container.x, target.container.y, K.GEM, { speed: { min: 120, max: 320 }, scale: { start: 0.5, end: 0 }, lifespan: 450, emitting: false }).setDepth(9);
    burst.explode(14);
    this.time.delayedCall(700, () => burst.destroy());
    this.targets = this.targets.filter((t) => t !== target);
  }

  override update(_time: number, delta: number): void {
    this.tickTimer(delta);
    this.stars.tilePositionX += delta * 0.01;
    this.stars.tilePositionY += delta * 0.004;
    if (this.paused || this.finished) return;

    if (this.cursors) {
      const step = delta * 0.45;
      let dx = 0;
      let dy = 0;
      if (this.cursors.left.isDown) dx -= step;
      if (this.cursors.right.isDown) dx += step;
      if (this.cursors.up.isDown) dy -= step;
      if (this.cursors.down.isDown) dy += step;
      if (dx !== 0 || dy !== 0) this.moveCrosshair(this.crosshair.x + dx, this.crosshair.y + dy);
      if (this.fireKey && Phaser.Input.Keyboard.JustDown(this.fireKey)) this.fire();
    }

    const dt = delta / 1000;
    this.targets.forEach((t) => {
      if (!t.alive) return;
      t.container.x += t.vx * dt;
      t.container.y += t.vy * dt;
      t.sprite.angle += t.spin * dt;
      if (t.container.x < WINDOW_LEFT + 30 || t.container.x > WINDOW_RIGHT - 30) t.vx *= -1;
      if (t.container.y < WINDOW_TOP + 30 || t.container.y > WINDOW_BOTTOM - 40) t.vy *= -1;
    });

    if (this.freeFire) {
      this.freeFireLeft -= dt;
      this.statusText.setText(`Free fire: ${Math.ceil(this.freeFireLeft)} seconds!`);
      if (this.freeFireLeft <= 0) this.endFreeFire();
    }
  }
}
