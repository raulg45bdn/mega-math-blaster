import Phaser from 'phaser';
import { K, SCENE } from '../gfx/Keys';
import { consoleButton, fadeIn, fadeTo, menuButton, outlinedText, textStyle, UiButton } from '../gfx/Ui';
import { Level, Subject, SUBJECT_LABELS, SUBJECTS } from '../types';
import { Progress } from '../systems/Progress';
import { narrator } from '../systems/Narrator';
import { music } from '../audio/MusicPlayer';

const LEVEL_NOTES: Record<Level, string> = {
  1: 'first facts',
  2: 'facts to 20',
  3: 'two-digit work',
  4: 'bigger numbers',
  5: 'three-digit work',
  6: 'challenge'
};

/**
 * The green subject/level console from the original: choose what to practise,
 * then launch the mission map. Also the doorway to the Parent/Teacher editor.
 */
export class ConsoleScene extends Phaser.Scene {
  private subject!: Subject;
  private level!: Level;
  private subjectButtons: UiButton[] = [];
  private levelButtons: UiButton[] = [];
  private summary!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE.CONSOLE });
  }

  create(): void {
    const { width } = this.scale;
    const profile = Progress.load();
    this.subject = profile.subject;
    this.level = profile.level;
    this.subjectButtons = [];
    this.levelButtons = [];

    this.add.image(width / 2, this.scale.height / 2, K.BG_CONSOLE);
    fadeIn(this);
    music.play('title');

    outlinedText(this, width / 2, 90, 'MISSION CONSOLE', 40, '#d9ffe6');
    this.add.text(width / 2, 130, 'Pick a subject and a level, cadet.', textStyle(18, '#7fd39a')).setOrigin(0.5);

    this.add.text(300, 168, 'SUBJECT', textStyle(20, '#d9ffe6')).setOrigin(0.5);
    SUBJECTS.forEach((subject, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const btn = consoleButton(this, 170 + col * 262, 210 + row * 62, SUBJECT_LABELS[subject].toUpperCase(), () => this.pickSubject(subject), subject === this.subject, subject === 'fractions' ? 13 : 16);
      this.subjectButtons.push(btn);
    });

    this.add.text(690, 168, 'LEVEL', textStyle(20, '#d9ffe6')).setOrigin(0.5);
    ([1, 2, 3, 4, 5, 6] as Level[]).forEach((level, i) => {
      const btn = consoleButton(this, 690, 210 + i * 54, `LEVEL ${level}: ${LEVEL_NOTES[level]}`, () => this.pickLevel(level), level === this.level, 14);
      this.levelButtons.push(btn);
    });

    this.summary = this.add.text(width / 2, 548, '', textStyle(20, '#ffd23f', { stroke: '#0d3120', strokeThickness: 3 })).setOrigin(0.5);
    this.refreshSummary();

    menuButton(this, width / 2, 606, 'LAUNCH MISSION', () => {
      Progress.update((p) => {
        p.subject = this.subject;
        p.level = this.level;
      });
      narrator.say(`${SUBJECT_LABELS[this.subject]}, level ${this.level}. Blast off!`, 'gc');
      fadeTo(this, profile.introSeen ? SCENE.MISSION : SCENE.INTRO);
    }, 'green', 24);

    menuButton(this, 250, 690, 'MAIN MENU', () => fadeTo(this, SCENE.TITLE), 'blue', 18, 0.75);
    menuButton(this, 512, 690, 'HELP', () => this.showHelp(), 'gold', 18, 0.75);
    menuButton(this, 774, 690, 'EDITOR / REPORTS', () => fadeTo(this, SCENE.PARENT), 'purple', 16, 0.75);
  }

  private pickSubject(subject: Subject): void {
    this.subject = subject;
    this.subjectButtons.forEach((b) => b.destroy());
    this.subjectButtons = [];
    SUBJECTS.forEach((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this.subjectButtons.push(consoleButton(this, 170 + col * 262, 210 + row * 62, SUBJECT_LABELS[s].toUpperCase(), () => this.pickSubject(s), s === this.subject, s === 'fractions' ? 13 : 16));
    });
    narrator.say(SUBJECT_LABELS[subject], 'gc');
    this.refreshSummary();
  }

  private pickLevel(level: Level): void {
    this.level = level;
    this.levelButtons.forEach((b) => b.destroy());
    this.levelButtons = [];
    ([1, 2, 3, 4, 5, 6] as Level[]).forEach((l, i) => {
      this.levelButtons.push(consoleButton(this, 690, 210 + i * 54, `LEVEL ${l}: ${LEVEL_NOTES[l]}`, () => this.pickLevel(l), l === this.level, 14));
    });
    this.refreshSummary();
  }

  private refreshSummary(): void {
    this.summary.setText(`READY:  ${SUBJECT_LABELS[this.subject].toUpperCase()}   -   LEVEL ${this.level}`);
  }

  private showHelp(): void {
    const { width, height } = this.scale;
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(50).setInteractive();
    const panel = this.add.image(width / 2, height / 2, K.DIALOG_PANEL).setDepth(51).setScale(1, 2.2);
    const text = this.add
      .text(width / 2, height / 2, [
        'HOW TO PLAY',
        '',
        'Space Zapper: aim with the mouse or finger, click to fire at the number that completes the equation.',
        'Math Blaster: arrow keys or A/D move, SPACE or click fires up at the drones. Dodge the goo!',
        'Cave Runner: arrows or WASD move, SPACE jumps, F or click throws. Carry a number that fits between the gate numbers.',
        'Equationator: click a tube to drop its bottom number, RECYCLE to rotate a tube.',
        '',
        'Click anywhere to close.'
      ].join('\n'), textStyle(18, '#ffffff', { align: 'center', wordWrap: { width: 800 }, lineSpacing: 6 }))
      .setOrigin(0.5)
      .setDepth(52);
    dim.once('pointerdown', () => {
      dim.destroy();
      panel.destroy();
      text.destroy();
    });
  }
}
