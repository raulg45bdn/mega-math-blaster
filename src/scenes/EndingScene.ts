import Phaser from 'phaser';
import { SCENE } from '../gfx/Keys';
import { ENDINGS, pickEnding } from '../content/Endings';
import { Progress } from '../systems/Progress';
import { CutsceneData } from './IntroScene';

/** Picks the ending from bonus treasures found and hands it to the cutscene player. */
export class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.ENDING });
  }

  create(): void {
    const profile = Progress.load();
    const ending = ENDINGS[pickEnding(profile.bonusItems)];
    const data: CutsceneData = { beats: ending.beats, nextScene: SCENE.TITLE, markIntro: false, track: 'ending', title: `THE END: ${ending.title}` };
    this.scene.start(SCENE.INTRO, data);
  }
}
