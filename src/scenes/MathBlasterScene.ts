import Phaser from 'phaser';
import { ActivityBase } from './ActivityBase';
import { K, SCENE } from '../gfx/Keys';
import { outlinedText, popText, textStyle } from '../gfx/Ui';
import { Choice, Problem } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';
import { music } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';

interface Drone {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  choice: Choice;
  vx: number;
  alive: boolean;
  nextGoo: number;
}

const GROUND_Y = 640;
const CORRECT_TO_WIN = 10;
const DRONE_ROWS = [170, 250, 330];

/**
 * Math Blaster (mission 2): Blasternaut on the surface of Moldar shoots the
 * drone carrying the answer while dodging the goo the drones drip.
 */
export class MathBlasterScene extends ActivityBase {
  private problem!: Problem;
  private drones: Drone[] = [];
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private bolts!: Phaser.Physics.Arcade.Group;
  private goo!: Phaser.Physics.Arcade.Group;
  private equationText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private correctCount: number = 0;
  private wrongStreak: number = 0;
  private locked: boolean = false;
  private stunUntil: number = 0;
  private lastShot: number = 0;
  private targetX: number | null = null;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  private walkTimer: number = 0;

  constructor() {
    super({ key: SCENE.MATH_BLASTER });
  }

  create(): void {
    const { width, height } = this.scale;
    this.drones = [];
    this.correctCount = 0;
    this.wrongStreak = 0;
    this.locked = false;
    this.stunUntil = 0;
    this.lastShot = 0;
    this.targetX = null;

    this.add.image(width / 2, height / 2, K.BG_MOLDAR).setDepth(-10);
    this.setupActivity(14, 10);
    this.hud.container.setScale(0.78);
    music.play('space');

    const panel = this.add.image(width / 2, 60, K.DIALOG_PANEL).setScale(0.6, 0.42).setDepth(15);
    panel.setAlpha(0.92);
    this.equationText = this.add.text(width / 2, 52, '', textStyle(36, '#ffffff', { stroke: '#1b1533', strokeThickness: 5 })).setOrigin(0.5).setDepth(16);
    this.statusText = this.add.text(width / 2, 92, '', textStyle(16, '#ffcc33', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setDepth(16);

    this.physics.world.setBounds(0, 0, width, height);
    this.physics.world.gravity.y = 0;
    this.player = this.physics.add.sprite(width / 2, GROUND_Y, K.BLASTERNAUT_STAND).setScale(1.3).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(50, 100).setOffset(15, 12);

    this.bolts = this.physics.add.group({ allowGravity: false });
    this.goo = this.physics.add.group({ allowGravity: false });

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.keys = {
        a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      };
    }
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.paused || this.finished) return;
      this.targetX = p.x;
      if (p.y < 560) this.shoot();
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.targetX = p.x;
    });
    this.input.on('pointerup', () => {
      this.targetX = null;
    });

    outlinedText(this, width / 2, height - 30, 'Arrows / A D move   -   SPACE or click fires   -   dodge the goo!', 15, '#ffffff', 3).setDepth(16);
    this.nextProblem();
  }

  protected override currentHint(): string {
    return this.problem.hint;
  }

  private clearDrones(): void {
    this.drones.forEach((d) => d.container.destroy());
    this.drones = [];
    this.goo.clear(true, true);
  }

  private nextProblem(): void {
    this.clearDrones();
    this.locked = false;
    this.problem = this.makeProblem(this.level >= 4 ? 5 : 4);
    this.equationText.setText(this.problem.prompt);
    this.statusText.setText('Shoot the drone with the right answer!');
    narrator.sayProblem(this.problem.prompt);
    const speed = 60 + this.level * 12;
    this.problem.choices.forEach((choice, i) => {
      const x = 140 + ((i * 230 + Phaser.Math.Between(0, 80)) % 760);
      const y = DRONE_ROWS[i % DRONE_ROWS.length];
      const container = this.add.container(x, y).setDepth(5);
      const sprite = this.add.image(0, 0, K.DRONE);
      const label = this.add.text(0, 28, choice.label, textStyle(20, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5);
      container.add([sprite, label]);
      const dir = i % 2 === 0 ? 1 : -1;
      this.drones.push({ container, sprite, label, choice, vx: dir * (speed + Phaser.Math.Between(0, 30)), alive: true, nextGoo: this.time.now + Phaser.Math.Between(1500, 4000) });
    });
  }

  private shoot(): void {
    const now = this.time.now;
    if (this.locked || now < this.stunUntil || now - this.lastShot < 320) return;
    this.lastShot = now;
    soundManager.playLaser();
    const bolt = this.bolts.create(this.player.x, this.player.y - 60, K.LASER_BOLT) as Phaser.Physics.Arcade.Image;
    bolt.setAngle(-90).setDepth(8);
    bolt.setVelocityY(-820);
    this.player.setTexture(K.BLASTERNAUT_THROW);
    this.time.delayedCall(180, () => {
      if (this.player.active && this.time.now >= this.stunUntil) this.player.setTexture(K.BLASTERNAUT_STAND);
    });
  }

  private dropGoo(drone: Drone): void {
    const goo = this.goo.create(drone.container.x, drone.container.y + 30, K.GOO_DROP) as Phaser.Physics.Arcade.Image;
    goo.setVelocityY(180 + this.level * 25).setDepth(7);
  }

  private slimePlayer(): void {
    if (this.time.now < this.stunUntil) return;
    this.stunUntil = this.time.now + 1200;
    soundManager.playError();
    this.player.setTexture(K.BLASTERNAUT_HURT).setTint(0x9bff5a);
    this.player.setVelocityX(0);
    // X-ray sparks, like the original's zap.
    this.tweens.add({ targets: this.player, alpha: 0.3, duration: 90, yoyo: true, repeat: 5, onComplete: () => this.player.setAlpha(1) });
    popText(this, this.player.x, this.player.y - 90, 'SLIMED!', '#7ce03a', 26);
    this.time.delayedCall(1200, () => {
      if (this.player.active) this.player.clearTint().setTexture(K.BLASTERNAUT_STAND);
    });
  }

  private hitDrone(drone: Drone): void {
    if (this.locked || !drone.alive) return;
    if (drone.choice.value === this.problem.answer.value) {
      this.locked = true;
      this.wrongStreak = 0;
      this.correctCount++;
      const points = 100 + this.level * 20;
      this.recordAnswer(true, points);
      soundManager.playExplosion();
      soundManager.playCorrect();
      popText(this, drone.container.x, drone.container.y - 30, `+${points}`, '#39ff9a');
      drone.alive = false;
      this.tweens.add({ targets: drone.container, y: drone.container.y + 500, angle: 180, alpha: 0, duration: 700, ease: 'Quad.easeIn' });
      this.equationText.setText(this.problem.prompt.replace('?', this.problem.answer.label));
      this.statusText.setText('Direct hit!');
      this.time.delayedCall(1000, () => {
        if (this.finished) return;
        if (this.correctCount >= CORRECT_TO_WIN) {
          this.clearDrones();
          this.completeMission('mathBlaster', 'red');
        } else {
          this.nextProblem();
        }
      });
      return;
    }
    this.wrongStreak++;
    this.recordAnswer(false, 0);
    soundManager.playError();
    this.tweens.add({ targets: drone.container, y: drone.container.y - 20, duration: 90, yoyo: true, repeat: 2 });
    this.statusText.setText(this.wrongStreak >= 2 ? this.problem.hint : `Not ${drone.choice.label}. Keep looking!`);
    if (this.wrongStreak >= 2) {
      narrator.say(this.problem.hint, 'gc');
      const right = this.drones.find((d) => d.alive && d.choice.value === this.problem.answer.value);
      if (right) this.tweens.add({ targets: right.container, scale: 1.25, duration: 220, yoyo: true, repeat: 4 });
    }
  }

  override update(time: number, delta: number): void {
    this.tickTimer(delta);
    if (this.paused || this.finished) return;
    const stunned = time < this.stunUntil;
    const left = !stunned && ((this.cursors?.left.isDown ?? false) || (this.keys?.a.isDown ?? false));
    const right = !stunned && ((this.cursors?.right.isDown ?? false) || (this.keys?.d.isDown ?? false));
    let vx = 0;
    if (left) vx = -300;
    else if (right) vx = 300;
    else if (!stunned && this.targetX !== null && Math.abs(this.targetX - this.player.x) > 14) vx = Math.sign(this.targetX - this.player.x) * 300;
    this.player.setVelocityX(vx);
    this.player.y = GROUND_Y;
    if (vx !== 0) {
      this.player.setFlipX(vx < 0);
      this.walkTimer += delta;
      if (!stunned && this.time.now - this.lastShot > 200) this.player.setTexture(K.BLASTERNAUT_WALK[Math.floor(this.walkTimer / 110) % 4]);
    } else if (!stunned && this.time.now - this.lastShot > 200) {
      this.player.setTexture(K.BLASTERNAUT_STAND);
    }
    if (this.keys && Phaser.Input.Keyboard.JustDown(this.keys.space)) this.shoot();

    const dt = delta / 1000;
    this.drones.forEach((d) => {
      if (!d.alive) return;
      d.container.x += d.vx * dt;
      if (d.container.x < 60 || d.container.x > this.scale.width - 60) d.vx *= -1;
      d.container.y += Math.sin(time / 400 + d.container.x / 90) * 0.4;
      if (time > d.nextGoo) {
        d.nextGoo = time + Phaser.Math.Between(2500, 6000) - this.level * 150;
        this.dropGoo(d);
      }
    });

    [...this.bolts.getChildren()].forEach((child) => {
      const bolt = child as Phaser.Physics.Arcade.Image;
      if (!bolt.active) return;
      if (bolt.y < -20) {
        bolt.destroy();
        return;
      }
      const hit = this.drones.find((d) => d.alive && Math.abs(d.container.x - bolt.x) < 52 && Math.abs(d.container.y - bolt.y) < 40);
      if (hit) {
        bolt.destroy();
        this.hitDrone(hit);
      }
    });

    [...this.goo.getChildren()].forEach((child) => {
      const goo = child as Phaser.Physics.Arcade.Image;
      if (!goo.active) return;
      if (goo.y > GROUND_Y + 40) {
        goo.destroy();
        return;
      }
      if (Math.abs(goo.x - this.player.x) < 34 && Math.abs(goo.y - this.player.y) < 60) {
        goo.destroy();
        this.slimePlayer();
      }
    });
  }
}
