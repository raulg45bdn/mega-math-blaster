import Phaser from 'phaser';
import { K, SCENE } from '../gfx/Keys';
import { fadeTo, menuButton, outlinedText, scrollHud, ScrollHud, showDialog, Speaker, textStyle } from '../gfx/Ui';
import { CrystalKey, Level, MissionKey, Problem, Profile, Subject } from '../types';
import { customToProblem, generateProblem } from '../content/Curriculum';
import { Progress } from '../systems/Progress';
import { narrator } from '../systems/Narrator';
import { music } from '../audio/MusicPlayer';
import { soundManager } from '../audio/SoundSynthesizer';
import { CRYSTAL_LINES } from '../content/Story';
import { MATH_TIPS } from '../content/Endings';

const CRYSTAL_TEXTURE: Record<CrystalKey, string> = { blue: K.CRYSTAL_BLUE, red: K.CRYSTAL_RED, green: K.CRYSTAL_GREEN };

/**
 * Shared skeleton for every activity: profile, scroll HUD with score and
 * timer, Math Tips, the Options pause panel, answer bookkeeping and the
 * mission-complete flow (crystal award, G.C. dialogue, bonus round).
 */
export abstract class ActivityBase extends Phaser.Scene {
  protected profile!: Profile;
  protected subject!: Subject;
  protected level!: Level;
  protected hud!: ScrollHud;
  protected score: number = 0;
  protected elapsed: number = 0;
  protected paused: boolean = false;
  protected finished: boolean = false;
  private pausePanel: Phaser.GameObjects.Container | null = null;

  protected speak = (text: string, speaker: Speaker): void => narrator.say(text, speaker === 'narrator' ? 'gc' : speaker);

  protected setupActivity(hudX: number = 14, hudY: number = 10): void {
    this.profile = Progress.load();
    this.subject = this.profile.subject;
    this.level = this.profile.level;
    this.score = 0;
    this.elapsed = 0;
    this.paused = false;
    this.finished = false;
    this.pausePanel = null;
    this.hud = scrollHud(this, hudX, hudY, () => this.showTip(), () => this.togglePause());
    this.hud.container.setScrollFactor(0);
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => narrator.stop());
  }

  /** Call from update(): advances the HUD clock while the activity is live. */
  protected tickTimer(delta: number): void {
    if (this.paused || this.finished) return;
    this.elapsed += delta / 1000;
    this.hud.setTime(this.elapsed);
  }

  protected addScore(points: number): void {
    this.score += points;
    this.hud.setScore(this.score);
  }

  /** Hint for the problem currently on screen; activities override this. */
  protected currentHint(): string {
    return '';
  }

  protected showTip(): void {
    if (this.finished) return;
    const specific = this.currentHint();
    const generic = MATH_TIPS[this.subject];
    const text = specific || generic[Math.floor(Math.random() * generic.length)];
    this.setPaused(true);
    showDialog(this, [{ speaker: 'gc', text }], () => this.setPaused(false), this.speak);
  }

  protected setPaused(value: boolean): void {
    this.paused = value;
    if (value) this.physics.world.pause();
    else this.physics.world.resume();
  }

  protected togglePause(): void {
    if (this.finished) return;
    if (this.pausePanel) {
      this.pausePanel.destroy();
      this.pausePanel = null;
      this.setPaused(false);
      return;
    }
    const { width, height } = this.scale;
    this.setPaused(true);
    const panel = this.add.container(0, 0).setDepth(1500).setScrollFactor(0);
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65).setInteractive();
    const box = this.add.image(width / 2, height / 2, K.DIALOG_PANEL).setScale(0.8, 2.4);
    const title = outlinedText(this, width / 2, height / 2 - 190, 'OPTIONS', 40, '#ffcc33', 6);
    const profile = Progress.load();
    const toggle = (label: string, key: 'voiceEnabled' | 'musicEnabled' | 'soundEnabled', y: number): void => {
      const btn = menuButton(this, width / 2, y, `${label}: ${profile[key] ? 'ON' : 'OFF'}`, () => {
        profile[key] = !profile[key];
        Progress.save(profile);
        narrator.enabled = profile.voiceEnabled;
        music.enabled = profile.musicEnabled;
        soundManager.enabled = profile.soundEnabled;
        if (key === 'musicEnabled') {
          if (profile.musicEnabled) music.resume();
          else music.stop();
        }
        btn.setLabel(`${label}: ${profile[key] ? 'ON' : 'OFF'}`);
      }, profile[key] ? 'green' : 'red', 20, 0.8);
      panel.add(btn.container);
    };
    panel.add([dim, box, title]);
    toggle('VOICE', 'voiceEnabled', height / 2 - 110);
    toggle('MUSIC', 'musicEnabled', height / 2 - 45);
    toggle('SOUND FX', 'soundEnabled', height / 2 + 20);
    panel.add(menuButton(this, width / 2 - 170, height / 2 + 110, 'RESUME', () => this.togglePause(), 'green', 20, 0.8).container);
    panel.add(menuButton(this, width / 2 + 170, height / 2 + 110, 'MISSION MAP', () => fadeTo(this, SCENE.MISSION), 'blue', 18, 0.8).container);
    panel.add(menuButton(this, width / 2, height / 2 + 180, 'MAIN MENU', () => fadeTo(this, SCENE.TITLE), 'purple', 18, 0.7).container);
    this.pausePanel = panel;
  }

  /** Next multiple-choice problem; Review missions mix in problems written in the editor. */
  protected makeProblem(choiceCount: number): Problem {
    const custom = this.profile.customProblems;
    if (this.subject === 'review' && custom.length > 0 && Math.random() < 0.35) {
      return customToProblem(custom[Math.floor(Math.random() * custom.length)], this.level, choiceCount);
    }
    return generateProblem(this.subject, this.level, choiceCount);
  }

  /** Book-keeping for one answered problem. */
  protected recordAnswer(correct: boolean, points: number): void {
    Progress.recordAnswer(this.subject, correct, correct ? points : 0);
    if (correct) this.addScore(points);
  }

  /** Award the crystal (or just mark the mission), celebrate, then run the bonus round. */
  protected completeMission(mission: MissionKey, crystal: CrystalKey | null): void {
    if (this.finished) return;
    this.finished = true;
    this.setPaused(true);
    if (crystal) Progress.awardCrystal(crystal, mission);
    else Progress.clearMission(mission);
    soundManager.playFanfare();
    const { width, height } = this.scale;
    if (crystal) {
      const img = this.add.image(width / 2, height / 2 - 120, CRYSTAL_TEXTURE[crystal]).setDepth(1400).setScale(0.2).setScrollFactor(0);
      this.tweens.add({ targets: img, scale: 2.2, angle: 360, duration: 900, ease: 'Back.easeOut' });
      this.tweens.add({ targets: img, y: img.y - 16, duration: 1200, yoyo: true, repeat: -1, delay: 900 });
    }
    const timeText = `${Math.floor(this.elapsed / 60)} minutes and ${Math.floor(this.elapsed % 60)} seconds`;
    const lines = [...CRYSTAL_LINES[mission], { speaker: 'gc' as Speaker, text: `Mission score: ${this.score} points in ${timeText}. Now for a bonus run through the city!` }];
    this.add.text(width / 2, height / 2 + 40, 'MISSION COMPLETE', textStyle(44, '#ffcc33', { stroke: '#1b1533', strokeThickness: 8 })).setOrigin(0.5).setDepth(1400).setScrollFactor(0);
    showDialog(this, lines, () => fadeTo(this, SCENE.CITY_RUNNER, { returnTo: SCENE.MISSION }), this.speak);
  }
}
