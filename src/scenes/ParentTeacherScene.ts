import Phaser from 'phaser';
import { K, SCENE } from '../gfx/Keys';
import { fadeIn, fadeTo, menuButton, outlinedText, textStyle, UiButton } from '../gfx/Ui';
import { Progress } from '../systems/Progress';
import { SUBJECT_LABELS, SUBJECTS } from '../types';
import { narrator } from '../systems/Narrator';
import { music } from '../audio/MusicPlayer';
import { soundManager } from '../audio/SoundSynthesizer';

type Tab = 'reports' | 'options' | 'editor';

/**
 * Parent / Teacher panel: progress reports per subject, audio options, a
 * reset, and a simple custom-problem editor (keypad driven, no typing needed).
 */
export class ParentTeacherScene extends Phaser.Scene {
  private tab: Tab = 'reports';
  private content!: Phaser.GameObjects.Container;
  private tabButtons: UiButton[] = [];
  private editPrompt: string = '';
  private editAnswer: string = '';
  private editingField: 'prompt' | 'answer' = 'prompt';

  constructor() {
    super({ key: SCENE.PARENT });
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, K.BG_CONSOLE);
    fadeIn(this);
    music.play('title');
    outlinedText(this, width / 2, 80, 'PARENT / TEACHER CENTER', 34, '#d9ffe6', 5);
    this.content = this.add.container(0, 0);
    this.buildTabs();
    this.showTab('reports');
    menuButton(this, width / 2, height - 52, 'BACK TO MENU', () => fadeTo(this, SCENE.TITLE), 'blue', 18, 0.75);
  }

  private buildTabs(): void {
    this.tabButtons.forEach((b) => b.destroy());
    this.tabButtons = [];
    const tabs: { key: Tab; label: string }[] = [{ key: 'reports', label: 'REPORTS' }, { key: 'options', label: 'OPTIONS' }, { key: 'editor', label: 'PROBLEM EDITOR' }];
    tabs.forEach((t, i) => {
      this.tabButtons.push(menuButton(this, 300 + i * 212, 140, t.label, () => this.showTab(t.key), this.tab === t.key ? 'gold' : 'purple', 15, 0.68));
    });
  }

  private showTab(tab: Tab): void {
    this.tab = tab;
    this.buildTabs();
    this.content.removeAll(true);
    if (tab === 'reports') this.buildReports();
    else if (tab === 'options') this.buildOptions();
    else this.buildEditor();
  }

  private buildReports(): void {
    const profile = Progress.load();
    const { width } = this.scale;
    this.content.add(this.add.text(width / 2, 190, `Cadet: ${profile.name}   Score: ${profile.score}   Crystals: ${Object.values(profile.crystals).filter(Boolean).length}/3   Bonus treasures: ${profile.bestBonus}`, textStyle(16, '#d9ffe6')).setOrigin(0.5));
    SUBJECTS.forEach((subject, i) => {
      const y = 232 + i * 48;
      const stats = profile.stats[subject];
      const pct = Progress.accuracy(profile, subject);
      this.content.add(this.add.text(180, y, SUBJECT_LABELS[subject], textStyle(15, '#ffffff')).setOrigin(0, 0.5));
      this.content.add(this.add.rectangle(480, y, 320, 22, 0x0d3120).setOrigin(0, 0.5).setStrokeStyle(2, 0x7fd39a));
      this.content.add(this.add.rectangle(482, y, Math.max(0, 316 * (pct / 100)), 18, pct >= 80 ? 0x3fc75f : pct >= 50 ? 0xffcc33 : 0xe04646).setOrigin(0, 0.5));
      this.content.add(this.add.text(820, y, stats.attempted === 0 ? 'not yet played' : `${pct}%  (${stats.correct}/${stats.attempted})`, textStyle(14, '#d9ffe6')).setOrigin(0, 0.5));
    });
    this.content.add(this.add.text(width / 2, 640, 'Green: mastered (80%+).  Gold: getting there.  Red: needs practice.', textStyle(14, '#7fd39a')).setOrigin(0.5));
  }

  private buildOptions(): void {
    const profile = Progress.load();
    const { width } = this.scale;
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
      }, profile[key] ? 'green' : 'red', 20, 0.9);
      this.content.add(btn.container);
    };
    toggle('SPOKEN NARRATION', 'voiceEnabled', 230);
    toggle('MUSIC', 'musicEnabled', 310);
    toggle('SOUND EFFECTS', 'soundEnabled', 390);
    const levelBtn = menuButton(this, width / 2, 470, `LEVEL: ${profile.level}  (click to change)`, () => {
      const next = ((profile.level % 6) + 1) as typeof profile.level;
      Progress.update((p) => {
        p.level = next;
      });
      profile.level = next;
      levelBtn.setLabel(`LEVEL: ${profile.level}  (click to change)`);
    }, 'blue', 18, 0.9);
    this.content.add(levelBtn.container);
    const reset = menuButton(this, width / 2, 560, 'ERASE ALL PROGRESS', () => {
      Progress.reset();
      soundManager.playError();
      reset.setLabel('PROGRESS ERASED');
      reset.setEnabled(false);
    }, 'red', 18, 0.9);
    this.content.add(reset.container);
    this.content.add(this.add.text(width / 2, 620, 'Erasing clears scores, crystals, reports and custom problems on this device.', textStyle(13, '#7fd39a')).setOrigin(0.5));
  }

  private buildEditor(): void {
    const { width } = this.scale;
    const profile = Progress.load();
    this.content.add(this.add.text(width / 2, 186, 'Build custom review problems with the keypad. They appear in REVIEW missions.', textStyle(14, '#7fd39a')).setOrigin(0.5));

    const promptBox = this.add.rectangle(400, 236, 360, 48, 0x0d3120).setStrokeStyle(3, this.editingField === 'prompt' ? 0xffcc33 : 0x7fd39a).setInteractive({ useHandCursor: true });
    const promptText = this.add.text(400, 236, this.editPrompt || 'PROMPT  e.g. 12 + 7', textStyle(20, this.editPrompt ? '#ffffff' : '#4f8a63')).setOrigin(0.5);
    const answerBox = this.add.rectangle(700, 236, 200, 48, 0x0d3120).setStrokeStyle(3, this.editingField === 'answer' ? 0xffcc33 : 0x7fd39a).setInteractive({ useHandCursor: true });
    const answerText = this.add.text(700, 236, this.editAnswer || 'ANSWER', textStyle(20, this.editAnswer ? '#ffffff' : '#4f8a63')).setOrigin(0.5);
    promptBox.on('pointerdown', () => {
      this.editingField = 'prompt';
      this.showTab('editor');
    });
    answerBox.on('pointerdown', () => {
      this.editingField = 'answer';
      this.showTab('editor');
    });
    this.content.add([promptBox, promptText, answerBox, answerText]);

    const keys = ['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '×', '0', '÷', '⌫', 'SPACE'];
    keys.forEach((k, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = 330 + col * 120;
      const y = 300 + row * 58;
      const colour = k === '⌫' ? 0xe04646 : /[0-9]/.test(k) ? 0x3f7fe0 : 0x8a4fd8;
      const pad = this.add.rectangle(x, y, 104, 48, colour).setStrokeStyle(3, 0x1b1533).setInteractive({ useHandCursor: true });
      const label = this.add.text(x, y, k, textStyle(k === 'SPACE' ? 16 : 24, '#ffffff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5);
      pad.on('pointerover', () => pad.setFillStyle(colour, 0.8));
      pad.on('pointerout', () => pad.setFillStyle(colour, 1));
      pad.on('pointerdown', () => {
        soundManager.playBlip();
        this.keypad(k);
      });
      this.content.add([pad, label]);
    });

    const save = menuButton(this, 830, 330, 'SAVE PROBLEM', () => this.saveCustom(), 'green', 16, 0.7);
    this.content.add(save.container);
    const clear = menuButton(this, 830, 400, 'CLEAR ALL', () => {
      Progress.update((p) => {
        p.customProblems = [];
      });
      this.showTab('editor');
    }, 'red', 16, 0.7);
    this.content.add(clear.container);

    const list = profile.customProblems.slice(-8).map((cp) => `${cp.prompt} = ${cp.answer}`).join('    ');
    this.content.add(this.add.text(width / 2, 560, profile.customProblems.length === 0 ? 'No custom problems yet.' : `${profile.customProblems.length} saved:  ${list}`, textStyle(14, '#d9ffe6', { wordWrap: { width: 760 }, align: 'center' })).setOrigin(0.5, 0));
  }

  private keypad(k: string): void {
    const isPrompt = this.editingField === 'prompt';
    const current = isPrompt ? this.editPrompt : this.editAnswer;
    let next = current;
    if (k === '⌫') next = current.slice(0, -1);
    else if (k === 'SPACE') next = isPrompt ? `${current} ` : current;
    else if (isPrompt || /[0-9]/.test(k)) next = current + k;
    next = next.slice(0, isPrompt ? 24 : 6);
    if (isPrompt) this.editPrompt = next;
    else this.editAnswer = next;
    this.showTab('editor');
  }

  private saveCustom(): void {
    const prompt = this.editPrompt.trim();
    const answer = this.editAnswer.trim();
    if (!prompt || !answer || !/^\d+$/.test(answer)) {
      soundManager.playError();
      return;
    }
    Progress.update((p) => {
      p.customProblems.push({ prompt, answer });
    });
    soundManager.playCorrect();
    this.editPrompt = '';
    this.editAnswer = '';
    this.editingField = 'prompt';
    this.showTab('editor');
  }
}
