import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { IntroScene } from './scenes/IntroScene';
import { ConsoleScene } from './scenes/ConsoleScene';
import { MissionScene } from './scenes/MissionScene';
import { SpaceZapperScene } from './scenes/SpaceZapperScene';
import { MathBlasterScene } from './scenes/MathBlasterScene';
import { CaveRunnerScene } from './scenes/CaveRunnerScene';
import { EquationatorScene } from './scenes/EquationatorScene';
import { CityRunnerScene } from './scenes/CityRunnerScene';
import { EndingScene } from './scenes/EndingScene';
import { ParentTeacherScene } from './scenes/ParentTeacherScene';

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 768;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#070a1f',
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: {
    activePointers: 3
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, IntroScene, ConsoleScene, MissionScene, SpaceZapperScene, MathBlasterScene, CaveRunnerScene, EquationatorScene, CityRunnerScene, EndingScene, ParentTeacherScene]
};

function launch(): void {
  const game = new Phaser.Game(config);
  // Exposed for automated smoke tests and debugging in the browser console.
  (window as Window & { megaMathBlaster?: Phaser.Game }).megaMathBlaster = game;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', launch, { once: true });
} else {
  launch();
}
