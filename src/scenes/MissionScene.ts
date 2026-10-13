import Phaser from 'phaser';
import { K, SCENE } from '../gfx/Keys';
import { fadeIn, fadeTo, menuButton, outlinedText, showDialog, textStyle, Speaker } from '../gfx/Ui';
import { MISSION_BRIEFS } from '../content/Story';
import { MissionKey, MISSION_LABELS, MISSION_ORDER, SUBJECT_LABELS } from '../types';
import { Progress } from '../systems/Progress';
import { narrator } from '../systems/Narrator';
import { music } from '../audio/MusicPlayer';

interface NodeSpec {
  key: MissionKey;
  x: number;
  y: number;
  icon: string;
  iconScale: number;
  scene: string;
  data?: object;
}

const NODES: NodeSpec[] = [
  { key: 'spaceZapper1', x: 180, y: 600, icon: K.ASTEROIDS[0], iconScale: 0.7, scene: SCENE.SPACE_ZAPPER, data: { mode: 1 } },
  { key: 'mathBlaster', x: 420, y: 560, icon: K.DRONE, iconScale: 0.6, scene: SCENE.MATH_BLASTER },
  { key: 'caveRunner', x: 660, y: 540, icon: K.GATE_CLOSED, iconScale: 0.32, scene: SCENE.CAVE_RUNNER },
  { key: 'equationator', x: 840, y: 520, icon: K.TUBE_TOKEN, iconScale: 1, scene: SCENE.EQUATIONATOR },
  { key: 'spaceZapper2', x: 930, y: 380, icon: K.SPACE_MINE, iconScale: 0.85, scene: SCENE.SPACE_ZAPPER, data: { mode: 2 } }
];

/** Mission map of Moldar: choose an activity, see crystals and progress. */
export class MissionScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.MISSION });
  }

  create(): void {
    const { width, height } = this.scale;
    const profile = Progress.load();
    this.add.image(width / 2, height / 2, K.BG_MAP);
    fadeIn(this);
    music.play('space');

    outlinedText(this, width / 2, 46, 'PLANET MOLDAR: MISSION MAP', 34, '#ffcc33', 6);
    this.add.text(width / 2, 84, `${SUBJECT_LABELS[profile.subject]}  -  Level ${profile.level}   |   Score ${profile.score}   |   Bonus treasures ${profile.bonusItems}`, textStyle(17, '#c9b6ff', { stroke: '#1b1533', strokeThickness: 3 })).setOrigin(0.5);

    // Crystal sockets.
    const socketX = [80, 160, 240];
    (['blue', 'red', 'green'] as const).forEach((c, i) => {
      this.add.image(socketX[i], 170, K.CRYSTAL_SOCKET).setScale(0.8);
      if (profile.crystals[c]) {
        const crystal = this.add.image(socketX[i], 170, c === 'blue' ? K.CRYSTAL_BLUE : c === 'red' ? K.CRYSTAL_RED : K.CRYSTAL_GREEN).setScale(0.85);
        this.tweens.add({ targets: crystal, scale: 0.95, duration: 900, yoyo: true, repeat: -1 });
      }
    });
    this.add.text(160, 236, 'POWER CRYSTALS', textStyle(14, '#ffffff')).setOrigin(0.5);

    const nextKey = MISSION_ORDER.find((k) => !profile.missionsCleared[k]);
    NODES.forEach((node) => this.buildNode(node, profile.missionsCleared[node.key], node.key === nextKey));

    const allDone = MISSION_ORDER.every((k) => profile.missionsCleared[k]);
    if (allDone) {
      const btn = menuButton(this, width / 2, 400, 'RESCUE SPOT: FINALE', () => fadeTo(this, SCENE.ENDING), 'gold', 22);
      this.tweens.add({ targets: btn.container, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });
    }

    menuButton(this, 130, height - 50, 'CONSOLE', () => fadeTo(this, SCENE.CONSOLE), 'purple', 16, 0.65);
    menuButton(this, width - 130, height - 50, 'MAIN MENU', () => fadeTo(this, SCENE.TITLE), 'blue', 16, 0.65);

    const gc = this.add.image(width - 110, 160, K.GC_SMILE).setScale(0.8);
    this.tweens.add({ targets: gc, y: 166, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const tip = nextKey ? `Next up: ${MISSION_LABELS[nextKey]}. Click a mission to begin!` : 'Every mission is complete. Time to rescue Spot!';
    this.add.text(width - 110, 250, tip, textStyle(14, '#ffffff', { align: 'center', wordWrap: { width: 200 } })).setOrigin(0.5, 0);
  }

  private buildNode(node: NodeSpec, cleared: boolean, isNext: boolean): void {
    const ring = this.add.circle(node.x, node.y, 46, cleared ? 0x3fc75f : 0x1b1533, 0.85).setStrokeStyle(5, isNext ? 0xffcc33 : 0xc9b6ff);
    const icon = this.add.image(node.x, node.y, node.icon).setScale(node.iconScale);
    const label = outlinedText(this, node.x, node.y + 68, MISSION_LABELS[node.key].toUpperCase(), 16, '#ffffff', 3);
    if (cleared) this.add.text(node.x + 34, node.y - 40, '✔', textStyle(26, '#3fc75f', { stroke: '#1b1533', strokeThickness: 4 })).setOrigin(0.5);
    if (isNext) this.tweens.add({ targets: [ring, icon], scale: 1.12, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    ring.setInteractive({ useHandCursor: true });
    ring.on('pointerover', () => label.setColor('#ffcc33'));
    ring.on('pointerout', () => label.setColor('#ffffff'));
    ring.on('pointerdown', () => this.launch(node));
  }

  private launch(node: NodeSpec): void {
    const brief = MISSION_BRIEFS[node.key];
    showDialog(this, brief, () => fadeTo(this, node.scene, node.data), (text: string, speaker: Speaker) => narrator.say(text, speaker === 'narrator' ? 'gc' : speaker));
  }
}
