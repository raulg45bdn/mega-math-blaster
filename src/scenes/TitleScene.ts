import Phaser from 'phaser';
import { K, SCENE } from '../gfx/Keys';
import { fadeIn, fadeTo, menuButton, outlinedText, textStyle } from '../gfx/Ui';
import { music } from '../audio/MusicPlayer';
import { soundManager } from '../audio/SoundSynthesizer';
import { narrator } from '../systems/Narrator';
import { Progress } from '../systems/Progress';
import { detectedAsPhone, PhoneMode, setPhoneModeSetting } from '../systems/Device';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.TITLE });
  }

  create(): void {
    const { width, height } = this.scale;
    const profile = Progress.load();
    this.add.image(width / 2, height / 2, K.BG_TITLE);
    fadeIn(this);
    music.play('title');

    const logo = this.add.image(width / 2, 150, K.LOGO).setScale(1.05);
    this.tweens.add({ targets: logo, y: 158, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Cast: Blasternaut in the foreground, Spot beside him, G.C. watching from the bridge window.
    const hero = this.add.image(230, 470, K.BLASTERNAUT_STAND).setScale(2.4);
    const spot = this.add.image(380, 560, K.SPOT_HAPPY).setScale(1.6);
    const gc = this.add.image(120, 250, K.GC_SMILE).setScale(0.9);
    const gelator = this.add.image(760, 300, K.GELATOR_GRIN).setScale(0.55).setAlpha(0.95);
    this.tweens.add({ targets: [hero, spot], y: '-=10', duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: gelator, y: '+=16', angle: 4, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: gc, angle: -3, duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    spot.setInteractive({ useHandCursor: true });
    spot.on('pointerdown', () => {
      soundManager.playGem();
      this.tweens.add({ targets: spot, scale: 1.9, duration: 120, yoyo: true });
    });

    const canContinue = profile.introSeen;
    const bx = width / 2 + 40;
    menuButton(this, bx, 360, 'NEW GAME', () => {
      Progress.newGame();
      soundManager.unlock();
      narrator.say('Welcome aboard, Blasternaut!', 'gc');
      fadeTo(this, SCENE.INTRO);
    }, 'green');
    const cont = menuButton(this, bx, 440, 'CONTINUE', () => {
      soundManager.unlock();
      fadeTo(this, SCENE.MISSION);
    }, 'blue');
    cont.setEnabled(canContinue);
    menuButton(this, bx, 520, 'SUBJECT CONSOLE', () => fadeTo(this, SCENE.CONSOLE), 'purple', 20);
    menuButton(this, bx, 600, 'PARENT / TEACHER', () => fadeTo(this, SCENE.PARENT), 'gold', 20);

    this.createPhoneToggle(186, height - 96);
    outlinedText(this, width / 2, height - 44, 'A fan recreation of the 1996 Davidson classic. Original art and code.', 16, '#c9b6ff', 3);
    this.add.text(width - 20, 20, `Stars: ${profile.score}   Bonus treasures: ${profile.bestBonus}`, textStyle(16, '#ffcc33', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(1, 0);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      keyboard.once('keydown-ENTER', () => {
        if (canContinue) fadeTo(this, SCENE.MISSION);
        else {
          Progress.newGame();
          fadeTo(this, SCENE.INTRO);
        }
      });
    }
  }

  /**
   * Cycles auto / on / off. Auto follows device detection, which suits almost
   * everyone; the explicit settings cover a small tablet that reads as a
   * desktop, or a phone someone would rather play with a keyboard.
   */
  private createPhoneToggle(x: number, y: number): void {
    const order: PhoneMode[] = ['auto', 'on', 'off'];
    const describe = (mode: PhoneMode): string => {
      if (mode === 'on') return 'BIG TOUCH CONTROLS: ON';
      if (mode === 'off') return 'BIG TOUCH CONTROLS: OFF';
      return 'BIG TOUCH CONTROLS: AUTO (' + (detectedAsPhone() ? 'ON' : 'OFF') + ')';
    };
    const btn = menuButton(this, x, y, describe(Progress.load().phoneMode), () => {
      const next = order[(order.indexOf(Progress.load().phoneMode) + 1) % order.length];
      Progress.update((p) => {
        p.phoneMode = next;
      });
      setPhoneModeSetting(next);
      // Rebuild so every control is laid out at the new size.
      this.scene.restart();
    }, 'purple', 13, 0.78);
    btn.container.setDepth(40);
  }
}
