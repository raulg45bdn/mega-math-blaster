import Phaser from 'phaser';
import { ActivityBase } from './ActivityBase';
import { K, SCENE } from '../gfx/Keys';
import { banner, machineButton, outlinedText, popText, textStyle } from '../gfx/Ui';
import { evaluate, generateEquation } from '../content/Curriculum';
import { EquationPuzzle } from '../types';
import { soundManager } from '../audio/SoundSynthesizer';
import { music } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';
import { Progress } from '../systems/Progress';

interface Tube {
  x: number;
  values: number[];
  tokens: Phaser.GameObjects.Container[];
  hit: Phaser.GameObjects.Rectangle;
}

const TUBE_X = [400, 560, 720];
const TUBE_TOP = 150;
const TOKEN_SPACING = 62;
const SLOT_Y = 560;
const EQUATIONS_TO_WIN = 8;

/**
 * Equationator (mission 4): G.C.'s generator room. Drop the bottom number of
 * each tube into the equation; recycle a tube to rotate a new number to the
 * bottom. True equations charge the generator that de-oozes Moldar.
 */
export class EquationatorScene extends ActivityBase {
  private puzzle!: EquationPuzzle;
  private tubes: Tube[] = [];
  private slots: (number | null)[] = [null, null, null];
  private slotTexts: Phaser.GameObjects.Text[] = [];
  private operatorText!: Phaser.GameObjects.Text;
  private gcSprite!: Phaser.GameObjects.Image;
  private gcLine!: Phaser.GameObjects.Text;
  private meterFill!: Phaser.GameObjects.Rectangle;
  private solved: number = 0;
  private locked: boolean = false;
  private history: number[] = [];

  constructor() {
    super({ key: SCENE.EQUATIONATOR });
  }

  create(): void {
    const { width, height } = this.scale;
    this.tubes = [];
    this.slots = [null, null, null];
    this.slotTexts = [];
    this.solved = 0;
    this.locked = false;
    this.history = [];

    this.add.image(width / 2, height / 2, K.BG_CHAMBER).setDepth(-10);
    this.setupActivity(14, 10);
    this.hud.container.setScale(0.78);
    music.play('machine');

    outlinedText(this, width / 2 + 60, 60, 'THE EQUATIONATOR', 30, '#ffcc33', 5);
    this.add.image(width / 2 + 60, 108, K.ENERGY_METER).setScale(1.2);
    this.meterFill = this.add.rectangle(width / 2 + 60 - 228, 108, 0, 22, 0xff9a1f).setOrigin(0, 0.5);
    this.add.text(width / 2 + 60, 138, 'GENERATOR CHARGE', textStyle(13, '#ffffff')).setOrigin(0.5);

    this.gcSprite = this.add.image(150, 470, K.GC_FULL).setScale(1.15);
    this.tweens.add({ targets: this.gcSprite, y: 476, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.gcLine = this.add.text(150, 660, '', textStyle(15, '#ffffff', { align: 'center', wordWrap: { width: 250 }, stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5, 0);

    TUBE_X.forEach((x, i) => {
      this.add.image(x, TUBE_TOP + 160, K.GLASS_TUBE).setDepth(3);
      const hit = this.add.rectangle(x, TUBE_TOP + 160, 90, 320, 0xffffff, 0).setInteractive({ useHandCursor: true }).setDepth(6);
      hit.on('pointerdown', () => this.dropFromTube(i));
      hit.on('pointerover', () => this.tubes[i]?.tokens.forEach((t) => t.setScale(1.06)));
      hit.on('pointerout', () => this.tubes[i]?.tokens.forEach((t) => t.setScale(1)));
      this.tubes.push({ x, values: [], tokens: [], hit });
      machineButton(this, x, TUBE_TOP + 350, 'RECYCLE', () => this.recycleTube(i), 'green', 14).container.setScale(0.8);
      this.add.image(x, TUBE_TOP + 400, K.RECYCLE_BIN).setScale(0.5).setAlpha(0.9);
    });

    // Equation row.
    const slotX = [TUBE_X[0], TUBE_X[1], TUBE_X[2]];
    slotX.forEach((x) => {
      this.add.image(x, SLOT_Y + 40, K.TUBE_TOKEN).setScale(1.2).setAlpha(0.95).setDepth(4);
      this.slotTexts.push(this.add.text(x, SLOT_Y + 40, '?', textStyle(30, '#ffcc33', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setDepth(5));
    });
    this.operatorText = outlinedText(this, (TUBE_X[0] + TUBE_X[1]) / 2, SLOT_Y + 40, '+', 44, '#ffffff', 5);
    outlinedText(this, (TUBE_X[1] + TUBE_X[2]) / 2, SLOT_Y + 40, '=', 44, '#ffffff', 5);

    machineButton(this, 900, 540, 'UNDO', () => this.undo(), 'gold', 18);
    machineButton(this, 900, 610, 'RESET', () => this.resetSlots(true), 'red', 18);
    this.add.text(900, 660, 'Click a tube to drop\nits bottom number', textStyle(13, '#ffffff', { align: 'center' })).setOrigin(0.5, 0);

    this.newPuzzle();
  }

  protected override currentHint(): string {
    return this.puzzle.hint;
  }

  private say(text: string): void {
    this.gcLine.setText(text);
    this.gcSprite.setTexture(K.GC_FULL_TALK);
    this.time.delayedCall(1200, () => this.gcSprite.setTexture(K.GC_FULL));
  }

  private newPuzzle(): void {
    this.puzzle = generateEquation(this.subject, this.level);
    this.operatorText.setText(this.puzzle.operator);
    this.puzzle.tubes.forEach((values, i) => {
      this.tubes[i].values = [...values];
    });
    this.resetSlots(false);
    this.renderTubes();
    this.say(`Build a true equation with ${this.puzzle.operator}. Drop one number from each tube!`);
    narrator.say(`Build a true equation. Drop one number from each tube.`, 'gc');
  }

  private renderTubes(): void {
    this.tubes.forEach((tube) => {
      tube.tokens.forEach((t) => t.destroy());
      tube.tokens = [];
      tube.values.forEach((value, index) => {
        const y = TUBE_TOP + 60 + index * TOKEN_SPACING;
        const token = this.add.container(tube.x, y).setDepth(5);
        const isBottom = index === tube.values.length - 1;
        token.add([this.add.image(0, 0, K.TUBE_TOKEN).setScale(isBottom ? 0.95 : 0.8).setAlpha(isBottom ? 1 : 0.8), this.add.text(0, 0, `${value}`, textStyle(isBottom ? 22 : 18, isBottom ? '#ffcc33' : '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5)]);
        tube.tokens.push(token);
      });
    });
  }

  private dropFromTube(index: number): void {
    if (this.locked || this.paused || this.finished) return;
    const tube = this.tubes[index];
    if (this.slots[index] !== null || tube.values.length === 0) {
      soundManager.playError();
      return;
    }
    const value = tube.values.pop() as number;
    this.slots[index] = value;
    this.history.push(index);
    soundManager.playClunk();
    const token = tube.tokens[tube.tokens.length - 1];
    this.tweens.add({ targets: token, y: SLOT_Y + 40, duration: 320, ease: 'Bounce.easeOut', onComplete: () => {
      token.destroy();
      this.slotTexts[index].setText(`${value}`);
      this.renderTubes();
      this.checkEquation();
    } });
    tube.tokens.pop();
  }

  private recycleTube(index: number): void {
    if (this.locked || this.paused || this.finished) return;
    const tube = this.tubes[index];
    if (tube.values.length < 2) return;
    soundManager.playClunk();
    const bottom = tube.values.pop() as number;
    tube.values.unshift(bottom);
    this.renderTubes();
    const top = tube.tokens[0];
    top.setScale(0.4);
    this.tweens.add({ targets: top, scale: 1, duration: 260, ease: 'Back.easeOut' });
  }

  private undo(): void {
    if (this.locked || this.history.length === 0) return;
    const index = this.history.pop() as number;
    const value = this.slots[index];
    if (value === null) return;
    this.slots[index] = null;
    this.slotTexts[index].setText('?');
    this.tubes[index].values.push(value);
    this.renderTubes();
    soundManager.playBlip();
  }

  private resetSlots(sound: boolean): void {
    this.slots.forEach((value, i) => {
      if (value !== null) this.tubes[i].values.push(value);
    });
    this.slots = [null, null, null];
    this.history = [];
    this.slotTexts.forEach((t) => t.setText('?').setColor('#ffcc33'));
    this.renderTubes();
    this.locked = false;
    if (sound) soundManager.playBlip();
  }

  private checkEquation(): void {
    if (this.slots.some((s) => s === null)) return;
    const [a, b, c] = this.slots as [number, number, number];
    const result = evaluate(a, this.puzzle.operator, b);
    this.locked = true;
    if (result !== null && result === c) {
      this.solved++;
      const points = 150 + this.level * 25;
      this.recordAnswer(true, points);
      soundManager.playCorrect();
      this.slotTexts.forEach((t) => t.setColor('#39ff9a'));
      popText(this, TUBE_X[1], SLOT_Y - 20, `+${points}`, '#39ff9a');
      this.say(`${a} ${this.puzzle.operator} ${b} = ${c}. Recycled into pure energy!`);
      const charge = Math.min(100, Math.round((this.solved / EQUATIONS_TO_WIN) * 100));
      this.tweens.add({ targets: this.meterFill, width: 456 * (charge / 100), duration: 500 });
      Progress.update((p) => {
        p.generatorCharge = charge;
      });
      this.time.delayedCall(1400, () => {
        if (this.finished) return;
        if (this.solved >= EQUATIONS_TO_WIN) this.fireGenerator();
        else this.newPuzzle();
      });
      return;
    }
    this.recordAnswer(false, 0);
    soundManager.playError();
    this.cameras.main.shake(200, 0.005);
    this.slotTexts.forEach((t) => t.setColor('#ff4d5a'));
    const shown = result === null ? 'does not divide evenly' : `= ${result}, not ${c}`;
    this.say(`${a} ${this.puzzle.operator} ${b} ${shown}. The destroyer zaps it! ${this.puzzle.hint}`);
    narrator.say(`Not quite. ${this.puzzle.hint}`, 'gc');
    this.time.delayedCall(1600, () => this.resetSlots(false));
  }

  private fireGenerator(): void {
    this.cameras.main.flash(600, 255, 154, 31);
    banner(this, 'GENERATOR FIRED!', '#ff9a1f', 1400, 50);
    this.time.delayedCall(900, () => this.completeMission('equationator', null));
  }

  override update(_time: number, delta: number): void {
    this.tickTimer(delta);
  }
}
