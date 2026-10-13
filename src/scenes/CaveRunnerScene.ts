import { PlatformerBase } from './PlatformerBase';
import { K, SCENE } from '../gfx/Keys';
import { banner, outlinedText, textStyle } from '../gfx/Ui';
import { CAVE_LEVELS } from '../content/Levels';
import { music, TrackKey } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';
import { soundManager } from '../audio/SoundSynthesizer';

const ZONE_TRACK: Record<string, TrackKey> = { ice: 'cave', temple: 'temple', jungle: 'jungle' };

interface CaveData {
  levelIndex?: number;
  carryScore?: number;
  carryTime?: number;
  hasJetpack?: boolean;
}

/**
 * Cave Runner (mission 3): ice, temple and jungle caverns. Carry a number that
 * fits between each gate's values, dodge trolls, find the Green Crystal.
 */
export class CaveRunnerScene extends PlatformerBase {
  private levelIndex: number = 0;
  private carryScore: number = 0;
  private carryTime: number = 0;
  private carryJetpack: boolean = false;
  private bubble!: Phaser.GameObjects.Container;
  private bubbleText!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private messageUntil: number = 0;

  constructor() {
    super({ key: SCENE.CAVE_RUNNER });
  }

  init(data: CaveData): void {
    this.levelIndex = data?.levelIndex ?? 0;
    this.carryScore = data?.carryScore ?? 0;
    this.carryTime = data?.carryTime ?? 0;
    this.carryJetpack = data?.hasJetpack ?? false;
  }

  create(): void {
    const def = CAVE_LEVELS[this.levelIndex];
    this.setupActivity(14, 10);
    this.hud.container.setScale(0.78);
    this.buildLevel(def);
    this.hasJetpack = this.carryJetpack;
    this.score = this.carryScore;
    this.elapsed = this.carryTime;
    this.hud.setScore(this.score);
    this.carriedNumber = null;
    this.spawnPlayer();
    music.play(ZONE_TRACK[def.zone]);

    this.bubble = this.add.container(0, 0).setDepth(20);
    this.bubbleText = this.add.text(30, -18, '?', textStyle(24, '#1b1533')).setOrigin(0.5);
    this.bubble.add([this.add.image(20, -20, K.THOUGHT_BUBBLE).setScale(0.9), this.bubbleText]);

    this.message = this.add.text(this.scale.width / 2, 40, '', textStyle(20, '#ffffff', { stroke: '#1b1533', strokeThickness: 4, align: 'center', wordWrap: { width: 700 } })).setOrigin(0.5, 0).setScrollFactor(0).setDepth(900);
    outlinedText(this, this.scale.width / 2, 700, `${def.name}   -   level ${this.levelIndex + 1} of ${CAVE_LEVELS.length}`, 16, '#ffffff', 3).setScrollFactor(0).setDepth(900).setAlpha(0.9);
    banner(this, def.name, '#ffcc33', 1500, 46);
    narrator.say(`${def.name}. Find a number that fits between the gate numbers!`, 'gc');
    this.showMessage('Grab a number plate whose value fits between the gate numbers.', 4000);
  }

  private showMessage(text: string, ms: number): void {
    this.message.setText(text);
    this.messageUntil = this.time.now + ms;
  }

  protected override onPlateTaken(value: number): void {
    this.carriedNumber = value;
    this.bubbleText.setText(`${value}`);
    this.showMessage(`You are carrying ${value}.`, 1800);
  }

  protected override onDroplet(delta: number): void {
    if (this.carriedNumber === null) {
      this.showMessage('The droplet fizzles: pick up a number first!', 2000);
      return;
    }
    this.carriedNumber = Math.max(0, this.carriedNumber + delta);
    this.bubbleText.setText(`${this.carriedNumber}`);
    this.showMessage(`${delta > 0 ? '+' : ''}${delta}! Your number is now ${this.carriedNumber}.`, 2200);
  }

  protected override onGateBlocked(low: string, high: string, lowValue: number, highValue: number): void {
    if (this.carriedNumber === null) {
      this.showMessage(`The gate needs a number between ${low} and ${high}. Find a number plate first!`, 2600);
      narrator.say('Pick up a number plate first!', 'gc');
      return;
    }
    const why = this.carriedNumber <= lowValue ? `${this.carriedNumber} is too small.` : `${this.carriedNumber} is too big.`;
    this.showMessage(`${why} The gate wants a number between ${low} (${lowValue}) and ${high} (${highValue}).`, 3200);
    narrator.say(`${why} You need a number between ${lowValue} and ${highValue}.`, 'gc');
  }

  protected override onGateOpened(): void {
    this.showMessage('The gate opens! Onward!', 1800);
    narrator.say('That number fits! The gate is open.', 'gc');
  }

  protected override onTreasure(_kind: string, value: number): void {
    this.addScore(value);
  }

  protected override onLevelComplete(): void {
    const next = this.levelIndex + 1;
    if (next >= CAVE_LEVELS.length) {
      this.completeMission('caveRunner', 'green');
      return;
    }
    soundManager.playFanfare();
    banner(this, 'CAVE CLEARED!', '#39ff9a', 1200, 48);
    const data: CaveData = { levelIndex: next, carryScore: this.score + 1000, carryTime: this.elapsed, hasJetpack: this.hasJetpack };
    this.time.delayedCall(1300, () => this.scene.restart(data));
  }

  override update(time: number, delta: number): void {
    this.updatePlatformer(time, delta);
    if (this.player) {
      this.bubble.setPosition(this.player.x + 10, this.player.y - 70);
      this.bubble.setVisible(this.carriedNumber !== null);
    }
    if (this.message.text && time > this.messageUntil) this.message.setText('');
  }
}
