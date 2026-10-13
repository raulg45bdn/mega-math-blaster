import Phaser from 'phaser';
import { SCENE } from '../gfx/Keys';
import { DialogController, fadeIn, fadeTo, menuButton, outlinedText, showDialog, Speaker } from '../gfx/Ui';
import { INTRO_SCRIPT, StoryBeat } from '../content/Story';
import { narrator } from '../systems/Narrator';
import { music, TrackKey } from '../audio/MusicPlayer';
import { Progress } from '../systems/Progress';

export interface CutsceneData {
  beats?: StoryBeat[];
  nextScene?: string;
  markIntro?: boolean;
  track?: TrackKey;
  title?: string;
}

/**
 * Generic cutscene player. With no data it plays the opening story; the
 * ending and mission scenes reuse it with their own beats.
 */
export class IntroScene extends Phaser.Scene {
  private beats: StoryBeat[] = [];
  private nextScene: string = SCENE.CONSOLE;
  private markIntro: boolean = true;
  private track: TrackKey = 'space';
  private title: string = '';
  private beatIndex: number = 0;
  private layer!: Phaser.GameObjects.Container;
  private dialog: DialogController | null = null;
  private finished: boolean = false;

  constructor() {
    super({ key: SCENE.INTRO });
  }

  init(data: CutsceneData): void {
    this.beats = data?.beats ?? INTRO_SCRIPT;
    this.nextScene = data?.nextScene ?? SCENE.CONSOLE;
    this.markIntro = data?.markIntro ?? true;
    this.track = data?.track ?? 'space';
    this.title = data?.title ?? '';
    this.beatIndex = 0;
    this.finished = false;
    this.dialog = null;
  }

  create(): void {
    const { width } = this.scale;
    this.layer = this.add.container(0, 0);
    music.play(this.track);
    fadeIn(this);
    menuButton(this, width - 90, 40, 'SKIP', () => this.finish(), 'red', 16, 0.5).container.setDepth(1200);
    if (this.title) outlinedText(this, width / 2, 60, this.title, 44, '#ffcc33', 7).setDepth(1100);
    this.playBeat();
  }

  private playBeat(): void {
    if (this.finished) return;
    if (this.beatIndex >= this.beats.length) {
      this.finish();
      return;
    }
    const beat = this.beats[this.beatIndex];
    const { width, height } = this.scale;
    this.layer.removeAll(true);
    const backdrop = this.add.image(width / 2, height / 2, beat.backdrop).setAlpha(0);
    this.layer.add(backdrop);
    this.tweens.add({ targets: backdrop, alpha: 1, duration: 500 });
    (beat.props ?? []).forEach(([key, x, y, scale], i) => {
      const prop = this.add.image(x, y, key).setScale(scale).setAlpha(0);
      this.layer.add(prop);
      this.tweens.add({ targets: prop, alpha: 1, duration: 500, delay: 200 + i * 150 });
      this.tweens.add({ targets: prop, y: y - 10, duration: 1600 + i * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    this.dialog = showDialog(this, beat.lines, () => {
      this.beatIndex++;
      this.playBeat();
    }, (text: string, speaker: Speaker) => narrator.say(text, speaker === 'narrator' ? 'gc' : speaker));
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    narrator.stop();
    if (this.dialog) this.dialog.destroy();
    if (this.markIntro) {
      Progress.update((p) => {
        p.introSeen = true;
      });
    }
    fadeTo(this, this.nextScene);
  }
}
