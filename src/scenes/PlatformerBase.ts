import Phaser from 'phaser';
import { ActivityBase } from './ActivityBase';
import { ANIM, K } from '../gfx/Keys';
import { popText, textStyle } from '../gfx/Ui';
import { LevelDef, TILE, Zone } from '../content/Levels';
import { GateProblem } from '../types';
import { generateGate } from '../content/Curriculum';
import { soundManager } from '../audio/SoundSynthesizer';

export interface Troll {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  minX: number;
  maxX: number;
  speed: number;
  flying: boolean;
  baseY: number;
  alive: boolean;
}

export interface Gate {
  problem: GateProblem;
  sprite: Phaser.GameObjects.Image;
  body: Phaser.GameObjects.Rectangle;
  lowText: Phaser.GameObjects.Text;
  highText: Phaser.GameObjects.Text;
  open: boolean;
  col: number;
}

export interface Plate {
  container: Phaser.GameObjects.Container;
  value: number;
  gateIndex: number;
}

export interface Pickup {
  sprite: Phaser.GameObjects.Image;
  kind: 'gem' | 'gift' | 'cluster' | 'egg' | 'pad' | 'key' | 'jetpack' | 'droplet';
  value: number;
  label?: Phaser.GameObjects.Text;
}

const ZONE_PLATFORM: Record<Zone, string> = { ice: K.PLATFORM_ICE, temple: K.PLATFORM_TEMPLE, jungle: K.PLATFORM_JUNGLE, city: K.PLATFORM_GIRDER };
const ZONE_BRIDGE: Record<Zone, string> = { ice: K.PLATFORM_PLANK, temple: K.PLATFORM_PLANK, jungle: K.ROPE_BRIDGE, city: K.PLATFORM_MUSHROOM };
const ZONE_FILL: Record<Zone, number> = { ice: 0x1f5f9c, temple: 0x5e5847, jungle: 0x1e4f17, city: 0x3b2f6e };
const ZONE_BG: Record<Zone, string> = { ice: K.BG_ICE, temple: K.BG_TEMPLE, jungle: K.BG_JUNGLE, city: K.BG_CITY };
const ZONE_TROLL: Record<Zone, { frames: readonly string[]; anim: string; flying: boolean; weapon: string }> = {
  ice: { frames: K.FOOT_TROLL, anim: ANIM.FOOT_TROLL, flying: false, weapon: K.BANANA_PEEL },
  temple: { frames: K.NOSE_TROLL, anim: ANIM.NOSE_TROLL, flying: false, weapon: K.CLOTHESPIN },
  jungle: { frames: K.KISSING_TROLL, anim: ANIM.KISSING_TROLL, flying: true, weapon: K.PACIFIER },
  city: { frames: K.FOOT_TROLL, anim: ANIM.FOOT_TROLL, flying: false, weapon: K.BANANA_PEEL }
};

export const JUMP_VELOCITY = -760;
export const GRAVITY = 1400;
export const RUN_SPEED = 270;

/**
 * Side-scrolling platformer engine shared by Cave Runner and City Runner:
 * ASCII level parsing, physics world, Blasternaut controls, trolls,
 * projectiles, pickups, hazards, gates and the exit.
 */
export abstract class PlatformerBase extends ActivityBase {
  protected zone: Zone = 'ice';
  protected levelDef!: LevelDef;
  protected player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  protected solids!: Phaser.Physics.Arcade.StaticGroup;
  protected oneWay!: Phaser.Physics.Arcade.StaticGroup;
  protected hazards: Phaser.GameObjects.Rectangle[] = [];
  protected trolls: Troll[] = [];
  protected gates: Gate[] = [];
  protected plates: Plate[] = [];
  protected pickups: Pickup[] = [];
  protected projectiles!: Phaser.Physics.Arcade.Group;
  protected exitDoor!: Phaser.GameObjects.Image;
  protected exitBody!: Phaser.GameObjects.Rectangle;
  protected startX: number = 0;
  protected startY: number = 0;
  protected checkpointX: number = 0;
  protected checkpointY: number = 0;
  protected worldWidth: number = 0;
  protected hasJetpack: boolean = false;
  protected fuel: number = 100;
  protected hasKey: boolean = false;
  protected needsKey: boolean = false;
  protected stunUntil: number = 0;
  protected lastThrow: number = 0;
  protected cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  protected keys?: { a: Phaser.Input.Keyboard.Key; d: Phaser.Input.Keyboard.Key; w: Phaser.Input.Keyboard.Key; f: Phaser.Input.Keyboard.Key; space: Phaser.Input.Keyboard.Key };
  protected touchLeft: boolean = false;
  protected touchRight: boolean = false;
  protected touchJump: boolean = false;
  protected touchThrow: boolean = false;
  protected jumpHeld: boolean = false;
  protected levelComplete: boolean = false;
  protected banner!: Phaser.GameObjects.Text;

  /** Build the whole level from its ASCII map. */
  protected buildLevel(def: LevelDef): void {
    this.levelDef = def;
    this.zone = def.zone;
    this.hazards = [];
    this.trolls = [];
    this.gates = [];
    this.plates = [];
    this.pickups = [];
    this.fuel = 100;
    this.hasKey = false;
    this.needsKey = def.zone === 'city';
    this.levelComplete = false;
    this.stunUntil = 0;

    const rows = def.rows;
    const cols = rows[0].length;
    this.worldWidth = cols * TILE;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.scale.height);
    this.physics.world.gravity.y = GRAVITY;

    const bg = this.add.tileSprite(0, 0, this.worldWidth, this.scale.height, ZONE_BG[def.zone]).setOrigin(0, 0).setScrollFactor(0.35).setDepth(-10);
    bg.tileScaleX = 1;
    this.solids = this.physics.add.staticGroup();
    this.oneWay = this.physics.add.staticGroup();
    this.projectiles = this.physics.add.group({ allowGravity: false });

    const isSolid = (r: number, c: number): boolean => r >= 0 && r < rows.length && c >= 0 && c < cols && rows[r][c] === '#';

    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = rows[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (ch === '#') this.placeSolid(x, y, isSolid(r - 1, c));
        else if (ch === '=') this.placeBridge(x, y);
        else if (ch === 'L') this.placeLava(x, y);
        else if (ch === 'S') this.placeStatue(x, y);
        else if (ch === 'B') {
          this.startX = x + TILE / 2;
          this.startY = y + TILE / 2 - 24;
        } else if (ch === 'E') this.placeExit(x, y);
        else if (ch === 'T') this.placeTroll(x, y, r, c, rows);
        else if (ch === 'G') this.placeGate(x, y, c);
        else if (ch === 'W') this.placeCobweb(x, y);
        else if ('gbcepKJD'.includes(ch)) this.placePickup(ch, x, y);
      }
    }
    // Plates are created after gates so they can reference the gate to their right.
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = rows[r][c];
        if (ch === '1' || ch === '2' || ch === '3') this.placePlate(c * TILE, r * TILE, c);
      }
    }
    this.checkpointX = this.startX;
    this.checkpointY = this.startY;
  }

  // ----------------------------------------------------------- placement
  private placeSolid(x: number, y: number, hasSolidAbove: boolean): void {
    const block = this.add.rectangle(x + TILE / 2, y + TILE / 2, TILE, TILE, ZONE_FILL[this.zone], 1).setDepth(1);
    block.setStrokeStyle(2, 0x1b1533, 0.5);
    this.solids.add(block);
    if (!hasSolidAbove) this.add.image(x + TILE / 2, y + 16, ZONE_PLATFORM[this.zone]).setDisplaySize(TILE + 2, 32).setDepth(2);
  }

  private placeBridge(x: number, y: number): void {
    this.add.image(x + TILE / 2, y + 14, ZONE_BRIDGE[this.zone]).setDisplaySize(TILE + 2, 28).setDepth(2);
    const body = this.add.rectangle(x + TILE / 2, y + 8, TILE, 10, 0xffffff, 0);
    this.oneWay.add(body);
    const sb = body.body as Phaser.Physics.Arcade.StaticBody;
    sb.checkCollision.down = false;
    sb.checkCollision.left = false;
    sb.checkCollision.right = false;
  }

  private placeLava(x: number, y: number): void {
    const lava = this.add.image(x + TILE / 2, y + 40, K.LAVA_PIT).setDisplaySize(TILE, 48).setDepth(1);
    this.tweens.add({ targets: lava, y: y + 36, duration: 700 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.hazards.push(this.add.rectangle(x + TILE / 2, y + 52, TILE - 8, 24, 0xffffff, 0));
  }

  private placeStatue(x: number, y: number): void {
    const statue = this.add.image(x + TILE / 2 + 10, y + TILE, this.zone === 'ice' ? K.FIRE_STATUE_ICE : K.FIRE_STATUE_TEMPLE).setOrigin(0.5, 1).setScale(0.75).setDepth(3);
    this.tweens.add({ targets: statue, scaleX: 0.72, duration: 300, yoyo: true, repeat: -1 });
    this.hazards.push(this.add.rectangle(x - 6, y + 30, 40, 26, 0xffffff, 0));
  }

  private placeExit(x: number, y: number): void {
    this.exitDoor = this.add.image(x + TILE / 2, y + TILE, K.EXIT_DOOR).setOrigin(0.5, 1).setDepth(2);
    this.exitBody = this.add.rectangle(x + TILE / 2, y + 30, 36, 60, 0xffffff, 0);
  }

  private placeTroll(x: number, y: number, row: number, col: number, rows: string[]): void {
    const spec = ZONE_TROLL[this.zone];
    const sprite = this.physics.add.sprite(x + TILE / 2, y + TILE / 2, spec.frames[0]).setDepth(6);
    sprite.play(spec.anim);
    sprite.body.setSize(60, 60).setOffset(15, 20);
    let minX = x;
    let maxX = x + TILE;
    if (spec.flying) {
      minX = Math.max(TILE, x - 200);
      maxX = Math.min(this.worldWidth - TILE, x + TILE + 200);
      sprite.body.setAllowGravity(false);
    } else {
      const under = row + 1;
      const walkable = (c: number): boolean => c >= 0 && c < rows[0].length && (rows[under]?.[c] === '#' || rows[under]?.[c] === '=');
      let c = col;
      while (walkable(c - 1) && rows[row][c - 1] !== '#') c--;
      minX = c * TILE + 20;
      c = col;
      while (walkable(c + 1) && rows[row][c + 1] !== '#') c++;
      maxX = (c + 1) * TILE - 20;
    }
    this.trolls.push({ sprite, minX, maxX, speed: 60 + this.level * 8, flying: spec.flying, baseY: y + TILE / 2, alive: true });
  }

  private placeGate(x: number, y: number, col: number): void {
    const problem = generateGate(this.subject, this.level);
    const sprite = this.add.image(x + TILE / 2, y + TILE, K.GATE_CLOSED).setOrigin(0.5, 1).setScale(0.62).setDepth(4);
    const plateY = y + TILE - 120 * (0.62 / 0.6) + 50 * 0.62;
    const lowText = this.add.text(x + TILE / 2 - 72 + 36 * 0.62, plateY, problem.lowLabel, textStyle(15, '#ffffff')).setOrigin(0.5).setDepth(5);
    const highText = this.add.text(x + TILE / 2 - 72 + 204 * 0.62, plateY, problem.highLabel, textStyle(15, '#ffffff')).setOrigin(0.5).setDepth(5);
    const body = this.add.rectangle(x + TILE / 2, y, 44, TILE * 2, 0xffffff, 0);
    this.gates.push({ problem, sprite, body, lowText, highText, open: false, col });
  }

  private placeCobweb(x: number, y: number): void {
    this.add.image(x + TILE / 2, y + TILE - 22, K.COBWEB).setDisplaySize(TILE + 40, 44).setDepth(2);
    this.hazards.push(this.add.rectangle(x + TILE / 2, y + TILE - 8, TILE, 16, 0xffffff, 0).setData('bounce', true));
  }

  private placePickup(ch: string, x: number, y: number): void {
    const table: Record<string, { key: string; kind: Pickup['kind']; value: number; scale: number }> = {
      g: { key: K.GEM, kind: 'gem', value: 100, scale: 1 },
      b: { key: K.GIFT_BOX, kind: 'gift', value: 250, scale: 1 },
      c: { key: K.CRYSTAL_CLUSTER, kind: 'cluster', value: 500, scale: 1 },
      e: { key: K.EGG_TOKEN, kind: 'egg', value: 1000, scale: 1 },
      p: { key: K.COMPUTER_PAD, kind: 'pad', value: 750, scale: 1 },
      K: { key: K.GOLD_KEY, kind: 'key', value: 0, scale: 1.2 },
      J: { key: K.JETPACK_PICKUP, kind: 'jetpack', value: 0, scale: 1 },
      D: { key: K.DROPLET, kind: 'droplet', value: 0, scale: 1.2 }
    };
    const spec = table[ch];
    const sprite = this.add.image(x + TILE / 2, y + TILE / 2, spec.key).setScale(spec.scale).setDepth(5);
    this.tweens.add({ targets: sprite, y: y + TILE / 2 - 8, duration: 800 + Math.random() * 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const pickup: Pickup = { sprite, kind: spec.kind, value: spec.value };
    if (spec.kind === 'droplet') {
      const delta = Phaser.Math.Between(1, 3) * (Math.random() < 0.5 ? 1 : -1);
      pickup.value = delta;
      pickup.label = this.add.text(sprite.x, sprite.y + 4, `${delta > 0 ? '+' : ''}${delta}`, textStyle(15, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setDepth(6);
    }
    this.pickups.push(pickup);
  }

  private placePlate(x: number, y: number, col: number): void {
    const gateIndex = this.gates.findIndex((g) => g.col > col && (this.gates.filter((o) => o.col > col).every((o) => o.col >= g.col)));
    if (gateIndex < 0) {
      this.placePickup('g', x, y);
      return;
    }
    const ordinal = this.plates.filter((p) => p.gateIndex === gateIndex).length;
    const value = this.gates[gateIndex].problem.plates[ordinal % 3];
    const container = this.add.container(x + TILE / 2, y + TILE / 2).setDepth(5);
    container.add([this.add.image(0, 0, K.NUMBER_PLATE).setScale(1.15), this.add.text(0, 0, `${value}`, textStyle(22, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5)]);
    this.tweens.add({ targets: container, y: y + TILE / 2 - 8, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.plates.push({ container, value, gateIndex });
  }

  // ------------------------------------------------------------- player
  protected carriedNumber: number | null = null;

  /** Create Blasternaut, the camera, colliders and touch controls. Call after buildLevel(). */
  protected spawnPlayer(): void {
    const { width, height } = this.scale;
    this.player = this.physics.add.sprite(this.startX, this.startY, K.BLASTERNAUT_STAND).setScale(0.9).setDepth(10);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 100).setOffset(20, 14);
    this.player.body.setMaxVelocityY(1100);
    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.player, this.oneWay);
    this.trolls.forEach((t) => {
      if (!t.flying) {
        this.physics.add.collider(t.sprite, this.solids);
        this.physics.add.collider(t.sprite, this.oneWay);
      }
    });
    this.gates.forEach((gate) => {
      this.physics.add.existing(gate.body, true);
      this.physics.add.collider(this.player, gate.body, () => this.onGateContact(gate));
    });
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(120, 200);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.keys = {
        a: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        d: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        w: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        f: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
      };
    }
    this.buildTouchControls(width, height);
    const hint = this.add.text(width / 2, 112, 'KEYS:  arrows or W A S D move   -   SPACE jumps   -   F throws        (or hold the round buttons with the mouse)', textStyle(15, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setScrollFactor(0).setDepth(900);
    this.tweens.add({ targets: hint, alpha: 0, delay: 9000, duration: 800 });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < height - 130 && p.x > 260 && p.x < width - 260) this.touchThrow = true;
    });
    this.input.on('pointerup', () => {
      this.touchThrow = false;
    });
  }

  private buildTouchControls(width: number, height: number): void {
    const make = (x: number, label: string, onDown: () => void, onUp: () => void): void => {
      const circle = this.add.circle(x, height - 64, 46, 0x1b1533, 0.55).setStrokeStyle(4, 0xffcc33, 0.8).setScrollFactor(0).setDepth(950).setInteractive();
      this.add.text(x, height - 64, label, textStyle(28, '#ffffff')).setOrigin(0.5).setScrollFactor(0).setDepth(951);
      circle.on('pointerdown', onDown);
      circle.on('pointerup', onUp);
      circle.on('pointerout', onUp);
    };
    make(70, '◀', () => (this.touchLeft = true), () => (this.touchLeft = false));
    make(180, '▶', () => (this.touchRight = true), () => (this.touchRight = false));
    make(width - 70, '▲', () => (this.touchJump = true), () => (this.touchJump = false));
    make(width - 180, '✦', () => (this.touchThrow = true), () => (this.touchThrow = false));
  }

  // --------------------------------------------------------------- hooks
  protected onPlateTaken(_value: number): void {}
  protected onDroplet(_delta: number): void {}
  protected onTreasure(_kind: string, _value: number): void {}
  protected onGateBlocked(_low: string, _high: string, _lowValue: number, _highValue: number): void {}
  protected onGateOpened(): void {}
  protected abstract onLevelComplete(): void;

  private lastGateMessage: number = 0;

  private onGateContact(gate: Gate): void {
    if (gate.open) return;
    const n = this.carriedNumber;
    if (n !== null && n > gate.problem.lowValue && n < gate.problem.highValue) {
      gate.open = true;
      gate.sprite.setTexture(K.GATE_OPEN);
      (gate.body.body as Phaser.Physics.Arcade.StaticBody).enable = false;
      soundManager.playFanfare();
      this.addScore(300);
      popText(this, gate.sprite.x, gate.sprite.y - 140, '+300 GATE OPEN', '#39ff9a', 22);
      this.checkpointX = gate.sprite.x + 90;
      this.checkpointY = gate.sprite.y - 64;
      this.carriedNumber = null;
      this.onGateOpened();
      return;
    }
    if (this.time.now - this.lastGateMessage < 1500) return;
    this.lastGateMessage = this.time.now;
    soundManager.playError();
    this.player.setVelocityX(-260);
    this.player.setVelocityY(-260);
    this.stunUntil = this.time.now + 350;
    this.onGateBlocked(gate.problem.lowLabel, gate.problem.highLabel, gate.problem.lowValue, gate.problem.highValue);
  }

  // ------------------------------------------------------------- update
  protected updatePlatformer(time: number, delta: number): void {
    this.tickTimer(delta);
    if (this.paused || this.finished || this.levelComplete || !this.player) return;
    const stunned = time < this.stunUntil;
    const left = !stunned && ((this.cursors?.left.isDown ?? false) || (this.keys?.a.isDown ?? false) || this.touchLeft);
    const right = !stunned && ((this.cursors?.right.isDown ?? false) || (this.keys?.d.isDown ?? false) || this.touchRight);
    const jump = !stunned && ((this.cursors?.up.isDown ?? false) || (this.keys?.w.isDown ?? false) || (this.keys?.space.isDown ?? false) || this.touchJump);
    const throwing = !stunned && ((this.keys?.f.isDown ?? false) || this.touchThrow);
    const body = this.player.body;
    const onGround = body.blocked.down || body.touching.down;

    if (left) {
      this.player.setVelocityX(-RUN_SPEED);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(RUN_SPEED);
      this.player.setFlipX(false);
    } else if (!stunned) {
      this.player.setVelocityX(0);
    }

    let jetting = false;
    if (jump && !this.jumpHeld && onGround) {
      this.player.setVelocityY(JUMP_VELOCITY);
      soundManager.playJetpack();
    } else if (jump && !onGround && this.hasJetpack && this.fuel > 0) {
      this.player.setVelocityY(Math.max(body.velocity.y - 90, -360));
      this.fuel = Math.max(0, this.fuel - delta * 0.05);
      jetting = true;
    }
    if (onGround) this.fuel = Math.min(100, this.fuel + delta * 0.08);
    this.jumpHeld = jump;

    if (stunned) this.player.setTexture(K.BLASTERNAUT_HURT);
    else if (!onGround) {
      if (this.player.anims.isPlaying) this.player.anims.stop();
      this.player.setTexture(jetting ? K.BLASTERNAUT_JET : K.BLASTERNAUT_JUMP);
    } else if (left || right) {
      if (!this.player.anims.isPlaying) this.player.play(ANIM.WALK);
    } else {
      if (this.player.anims.isPlaying) this.player.anims.stop();
      if (time - this.lastThrow > 250) this.player.setTexture(K.BLASTERNAUT_STAND);
    }

    if (throwing && time - this.lastThrow > 450) this.throwProjectile(time);
    this.trolls.forEach((t) => this.updateTroll(t, time, delta));
    this.updateProjectiles();
    this.updatePickups();
    this.updateHazards(time);
    if (this.hasJetpack) this.hud.setExtra(`JETPACK ${Math.round(this.fuel)}%`);

    if (this.exitBody && Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.exitBody.getBounds())) {
      if (this.needsKey && !this.hasKey) {
        if (time - this.lastGateMessage > 1500) {
          this.lastGateMessage = time;
          popText(this, this.exitDoor.x, this.exitDoor.y - 150, 'LOCKED: find the KEY!', '#ff4d5a', 22);
          soundManager.playError();
        }
      } else {
        this.levelComplete = true;
        this.player.setVelocity(0, 0);
        this.onLevelComplete();
      }
    }
  }

  private throwProjectile(time: number): void {
    this.lastThrow = time;
    const dir = this.player.flipX ? -1 : 1;
    const proj = this.projectiles.create(this.player.x + dir * 30, this.player.y - 10, ZONE_TROLL[this.zone].weapon) as Phaser.Physics.Arcade.Image;
    proj.setVelocityX(dir * 540).setDepth(9).setAngularVelocity(dir * 400);
    proj.setData('born', time);
    this.player.setTexture(K.BLASTERNAUT_THROW);
    soundManager.playBlip();
  }

  private updateProjectiles(): void {
    [...this.projectiles.getChildren()].forEach((child) => {
      const proj = child as Phaser.Physics.Arcade.Image;
      if (!proj.active) return;
      if (this.time.now - (proj.getData('born') as number) > 1300) {
        proj.destroy();
        return;
      }
      const hit = this.trolls.find((t) => t.alive && Phaser.Math.Distance.Between(proj.x, proj.y, t.sprite.x, t.sprite.y) < 54);
      if (hit) {
        proj.destroy();
        this.defeatTroll(hit);
      }
    });
  }

  private defeatTroll(troll: Troll): void {
    troll.alive = false;
    soundManager.playCorrect();
    this.addScore(150);
    popText(this, troll.sprite.x, troll.sprite.y - 50, '+150', '#ffcc33', 22);
    troll.sprite.anims.stop();
    troll.sprite.body.enable = false;
    this.tweens.add({ targets: troll.sprite, y: troll.flying ? troll.sprite.y - 400 : troll.sprite.y + 300, angle: troll.flying ? -40 : 90, alpha: 0, duration: 800, ease: 'Quad.easeIn', onComplete: () => troll.sprite.destroy() });
  }

  private updateTroll(troll: Troll, time: number, delta: number): void {
    if (!troll.alive) return;
    const s = troll.sprite;
    if (troll.flying) {
      const dir = s.flipX ? 1 : -1;
      s.x += dir * troll.speed * (delta / 1000);
      s.y = troll.baseY + Math.sin(time / 350 + s.x / 60) * 30;
      if (s.x <= troll.minX) s.setFlipX(true);
      if (s.x >= troll.maxX) s.setFlipX(false);
    } else {
      const dir = s.flipX ? 1 : -1;
      s.setVelocityX(dir * troll.speed);
      if ((s.x <= troll.minX && dir < 0) || s.body.blocked.left) s.setFlipX(true);
      if ((s.x >= troll.maxX && dir > 0) || s.body.blocked.right) s.setFlipX(false);
    }
    if (time > this.stunUntil && Phaser.Math.Distance.Between(s.x, s.y, this.player.x, this.player.y) < 62) {
      this.stunUntil = time + 900;
      this.elapsed += 3;
      soundManager.playError();
      const push = Math.sign(this.player.x - s.x) || 1;
      this.player.setVelocity(push * 320, -380);
      popText(this, this.player.x, this.player.y - 80, 'OUCH! +3s', '#ff4d5a', 22);
    }
  }

  private updatePickups(): void {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      if (Phaser.Math.Distance.Between(p.sprite.x, p.sprite.y, this.player.x, this.player.y) > 56) continue;
      this.pickups.splice(i, 1);
      this.tweens.killTweensOf(p.sprite);
      p.sprite.destroy();
      p.label?.destroy();
      if (p.kind === 'jetpack') {
        this.hasJetpack = true;
        this.fuel = 100;
        soundManager.playFanfare();
        popText(this, this.player.x, this.player.y - 80, 'JETPACK! Hold jump to fly', '#59c8ff', 22);
      } else if (p.kind === 'droplet') {
        soundManager.playGem();
        this.onDroplet(p.value);
      } else if (p.kind === 'key') {
        this.hasKey = true;
        soundManager.playFanfare();
        popText(this, this.player.x, this.player.y - 80, 'KEY!', '#ffcc33', 26);
        this.onTreasure('key', 300);
      } else {
        soundManager.playGem();
        popText(this, this.player.x, this.player.y - 80, `+${p.value}`, '#ff5fb0', 22);
        this.onTreasure(p.kind, p.value);
        if (p.kind === 'egg') this.blossom(p.sprite.x, p.sprite.y);
      }
    }
    for (let i = this.plates.length - 1; i >= 0; i--) {
      const plate = this.plates[i];
      if (Phaser.Math.Distance.Between(plate.container.x, plate.container.y, this.player.x, this.player.y) > 56) continue;
      if (this.carriedNumber === plate.value) continue;
      soundManager.playGem();
      this.tweens.add({ targets: plate.container, scale: 1.4, duration: 160, yoyo: true });
      this.onPlateTaken(plate.value);
    }
  }

  /** An egg token blossoms into a ring of gems. */
  private blossom(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const gx = x + Math.cos((i / 6) * Math.PI * 2) * 90;
      const gy = y - 40 + Math.sin((i / 6) * Math.PI * 2) * 60;
      const sprite = this.add.image(x, y, K.GEM).setDepth(5);
      this.tweens.add({ targets: sprite, x: gx, y: gy, duration: 500, ease: 'Back.easeOut' });
      this.pickups.push({ sprite, kind: 'gem', value: 100 });
    }
  }

  private hazardCooldown: number = 0;

  private updateHazards(time: number): void {
    if (time < this.hazardCooldown) return;
    const bounds = this.player.getBounds();
    for (const zone of this.hazards) {
      if (!Phaser.Geom.Intersects.RectangleToRectangle(bounds, zone.getBounds())) continue;
      if (zone.getData('bounce')) {
        this.player.setVelocityY(-1050);
        soundManager.playJetpack();
        this.hazardCooldown = time + 400;
        return;
      }
      this.hazardCooldown = time + 1200;
      this.stunUntil = time + 600;
      this.elapsed += 5;
      soundManager.playError();
      popText(this, this.player.x, this.player.y - 80, 'HOT! +5s', '#ff6a1a', 24);
      this.cameras.main.flash(200, 255, 100, 20);
      this.player.setPosition(this.checkpointX, this.checkpointY);
      this.player.setVelocity(0, 0);
      return;
    }
  }
}
