import { PlatformerBase } from './PlatformerBase';
import { SCENE } from '../gfx/Keys';
import { banner, fadeTo, outlinedText, showDialog, textStyle } from '../gfx/Ui';
import { CITY_LEVEL } from '../content/Levels';
import { music } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';
import { Progress } from '../systems/Progress';
import { soundManager } from '../audio/SoundSynthesizer';

const BONUS_SECONDS = 75;

/**
 * City Runner bonus round after every academic mission: grab gems, gift boxes
 * and crystal clusters, find the key, reach the exit at the top right before
 * the clock runs out. Treasures found decide which ending you earn.
 */
export class CityRunnerScene extends PlatformerBase {
  private returnTo: string = SCENE.MISSION;
  private timeLeft: number = BONUS_SECONDS;
  private treasures: number = 0;
  private clock!: Phaser.GameObjects.Text;
  private ended: boolean = false;

  constructor() {
    super({ key: SCENE.CITY_RUNNER });
  }

  init(data: { returnTo?: string }): void {
    this.returnTo = data?.returnTo ?? SCENE.MISSION;
  }

  create(): void {
    this.timeLeft = BONUS_SECONDS;
    this.treasures = 0;
    this.ended = false;
    this.setupActivity(14, 10);
    this.hud.container.setScale(0.78);
    this.buildLevel(CITY_LEVEL);
    this.hasJetpack = false;
    this.spawnPlayer();
    music.play('city');
    this.clock = outlinedText(this, this.scale.width / 2, 40, `BONUS TIME ${BONUS_SECONDS}`, 30, '#ffcc33', 5).setScrollFactor(0).setDepth(900);
    this.add.text(this.scale.width / 2, 78, 'Collect treasures, grab the KEY, then reach the EXIT at the top right!', textStyle(16, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5).setScrollFactor(0).setDepth(900);
    banner(this, 'CITY RUNNER BONUS!', '#ffcc33', 1400, 46);
    narrator.say('Bonus round! Collect treasures and find the key to the exit.', 'gc');
  }

  protected override onTreasure(kind: string, value: number): void {
    this.treasures++;
    this.addScore(value);
    if (kind === 'key') {
      this.hud.setExtra('KEY FOUND!');
      narrator.say('You found the key! Head for the exit.', 'gc');
    }
  }

  protected override onLevelComplete(): void {
    this.finishBonus(true);
  }

  private finishBonus(reachedExit: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.finished = true;
    this.setPaused(true);
    const bonusPoints = reachedExit ? 500 + Math.round(this.timeLeft) * 10 : 0;
    this.addScore(bonusPoints);
    Progress.addBonusItems(this.treasures);
    const total = this.score;
    Progress.update((p) => {
      p.score += total;
    });
    soundManager.playFanfare();
    banner(this, reachedExit ? 'EXIT REACHED!' : "TIME'S UP!", '#ffcc33', 1500, 46);
    const text = reachedExit ? `You escaped the city with ${this.treasures} treasures and a ${bonusPoints} point exit bonus!` : `Time's up! You still grabbed ${this.treasures} treasures. Nice work!`;
    showDialog(this, [{ speaker: 'gc', text }], () => fadeTo(this, this.returnTo), this.speak);
  }

  override update(time: number, delta: number): void {
    this.updatePlatformer(time, delta);
    if (this.paused || this.finished || this.ended) return;
    this.timeLeft -= delta / 1000;
    this.clock.setText(`BONUS TIME ${Math.max(0, Math.ceil(this.timeLeft))}`);
    if (this.timeLeft <= 10) this.clock.setColor('#ff4d5a');
    if (this.timeLeft <= 0) this.finishBonus(false);
  }
}
