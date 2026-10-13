import Phaser from 'phaser';
import { ANIM, K, SCENE } from '../gfx/Keys';
import { FONT } from '../gfx/Ui';
import { soundManager } from '../audio/SoundSynthesizer';
import { music } from '../audio/MusicPlayer';
import { narrator } from '../systems/Narrator';
import { Progress } from '../systems/Progress';
import { setPhoneModeSetting } from '../systems/Device';

interface ManifestEntry {
  key: string;
  file: string;
  width: number;
  height: number;
}

interface Manifest {
  assets: ManifestEntry[];
}

/**
 * Loads every generated SVG listed in public/assets/manifest.json, registers
 * animations, and applies saved audio settings before the title screen.
 */
export class BootScene extends Phaser.Scene {
  private failed: string[] = [];
  private loaded: number = 0;

  constructor() {
    super({ key: SCENE.BOOT });
  }

  preload(): void {
    const { width, height } = this.scale;
    const barW = 480;
    const barH = 30;
    const x = (width - barW) / 2;
    const y = height / 2;
    const frame = this.add.graphics();
    frame.lineStyle(4, 0xffcc33, 1);
    frame.strokeRoundedRect(x - 6, y - 6, barW + 12, barH + 12, 12);
    const fill = this.add.graphics();
    const label = this.add.text(width / 2, y - 48, 'WARMING UP THE HYPERDRIVE...', { fontFamily: FONT, fontSize: '24px', color: '#ffcc33', stroke: '#1b1533', strokeThickness: 4 }).setOrigin(0.5);

    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      fill.clear();
      fill.fillStyle(0x3fc75f, 1);
      fill.fillRoundedRect(x, y, Math.max(12, Math.floor(barW * value)), barH, 10);
      label.setText(`WARMING UP THE HYPERDRIVE... ${Math.round(value * 100)}%`);
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.failed.push(file.key);
    });

    // A single-file build inlines every asset as a data URI on window; otherwise read the manifest.
    const bundled = (window as Window & { MEGA_MATH_BLASTER_BUNDLE?: Manifest }).MEGA_MATH_BLASTER_BUNDLE;
    if (bundled) {
      bundled.assets.forEach((entry) => {
        this.load.svg(entry.key, entry.file, { width: entry.width, height: entry.height });
        this.loaded++;
      });
      return;
    }
    this.load.json('manifest', 'assets/manifest.json');
    this.load.once('filecomplete-json-manifest', () => {
      const manifest = this.cache.json.get('manifest') as Manifest;
      manifest.assets.forEach((entry) => {
        this.load.svg(entry.key, `assets/${entry.file}`, { width: entry.width, height: entry.height });
        this.loaded++;
      });
    });
  }

  create(): void {
    if (this.failed.length > 0 || this.loaded === 0) {
      this.showFailure();
      return;
    }
    this.registerAnimations();

    const profile = Progress.load();
    setPhoneModeSetting(profile.phoneMode);
    soundManager.enabled = profile.soundEnabled;
    music.enabled = profile.musicEnabled;
    narrator.enabled = profile.voiceEnabled;
    this.input.once('pointerdown', () => soundManager.unlock());

    this.scene.start(SCENE.TITLE);
  }

  private registerAnimations(): void {
    const define = (key: string, frames: readonly string[], frameRate: number): void => {
      if (this.anims.exists(key)) return;
      this.anims.create({ key, frames: frames.map((f) => ({ key: f })), frameRate, repeat: -1 });
    };
    define(ANIM.WALK, K.BLASTERNAUT_WALK, 9);
    define(ANIM.FOOT_TROLL, K.FOOT_TROLL, 4);
    define(ANIM.NOSE_TROLL, K.NOSE_TROLL, 3);
    define(ANIM.KISSING_TROLL, K.KISSING_TROLL, 8);
  }

  private showFailure(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 40, 'MISSION DATA MISSING', { fontFamily: FONT, fontSize: '32px', color: '#ff4d5a', stroke: '#1b1533', strokeThickness: 5 }).setOrigin(0.5);
    const detail = this.failed.length > 0 ? `Could not load: ${this.failed.slice(0, 6).join(', ')}` : 'assets/manifest.json was empty.';
    this.add
      .text(width / 2, height / 2 + 24, `${detail}\nRun "npm run assets" to regenerate public/assets/, then reload.`, { fontFamily: FONT, fontSize: '18px', color: '#e2e8f0', align: 'center', wordWrap: { width: width - 120 } })
      .setOrigin(0.5);
  }
}
