import Phaser from 'phaser';
import { K } from './Keys';
import { soundManager } from '../audio/SoundSynthesizer';

export const FONT = '"Arial Black", "Arial Rounded MT Bold", Arial, Helvetica, sans-serif';
export const FONT_BODY = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';

export const INK = '#1b1533';

export function textStyle(size: number, color: string, extra: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT, fontSize: `${size}px`, color, ...extra };
}

export function bodyStyle(size: number, color: string, extra: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: FONT_BODY, fontSize: `${size}px`, color, fontStyle: 'bold', ...extra };
}

/** Cartoon lettering: bold face with a thick ink outline. */
export function outlinedText(scene: Phaser.Scene, x: number, y: number, str: string, size: number, color: string, strokeWidth: number = Math.max(3, Math.round(size / 8))): Phaser.GameObjects.Text {
  return scene.add.text(x, y, str, textStyle(size, color, { stroke: INK, strokeThickness: strokeWidth })).setOrigin(0.5);
}

export type ButtonVariant = keyof typeof K.BTN;

export interface UiButton {
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  setEnabled(enabled: boolean): void;
  setLabel(text: string): void;
  destroy(): void;
}

function attachButtonBehaviour(scene: Phaser.Scene, container: Phaser.GameObjects.Container, hit: Phaser.GameObjects.Image, onClick: () => void, silent: boolean): { setEnabled(v: boolean): void } {
  let enabled = true;
  hit.setInteractive({ useHandCursor: true });
  hit.on('pointerover', () => {
    if (enabled) container.setScale(1.05);
  });
  hit.on('pointerout', () => container.setScale(1));
  hit.on('pointerdown', () => {
    if (!enabled) return;
    if (!silent) soundManager.playBlip();
    scene.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.92, duration: 70, yoyo: true });
    onClick();
  });
  return {
    setEnabled(v: boolean): void {
      enabled = v;
      container.setAlpha(v ? 1 : 0.45);
      if (v) hit.setInteractive({ useHandCursor: true });
      else hit.disableInteractive();
    }
  };
}

/** Big rounded menu button (300x70 texture). */
export function menuButton(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, variant: ButtonVariant = 'green', fontSize: number = 24, scale: number = 1): UiButton {
  const container = scene.add.container(x, y).setScale(scale);
  const img = scene.add.image(0, 0, K.BTN[variant]);
  const text = scene.add.text(0, -4, label, textStyle(fontSize, '#ffffff', { stroke: INK, strokeThickness: 4 })).setOrigin(0.5);
  container.add([img, text]);
  const behaviour = attachButtonBehaviour(scene, container, img, onClick, false);
  return { container, label: text, setEnabled: behaviour.setEnabled, setLabel: (t) => text.setText(t), destroy: () => container.destroy() };
}

/** Green LCD console button (250x52 texture). */
export function consoleButton(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, lit: boolean = false, fontSize: number = 17): UiButton {
  const container = scene.add.container(x, y);
  const img = scene.add.image(0, 0, lit ? K.CONSOLE_BTN_ON : K.CONSOLE_BTN_OFF);
  const text = scene.add.text(0, 0, label, textStyle(fontSize, lit ? '#0d3120' : '#d9ffe6', { stroke: lit ? '#d9ffe6' : '#0d3120', strokeThickness: 2 })).setOrigin(0.5);
  container.add([img, text]);
  const behaviour = attachButtonBehaviour(scene, container, img, onClick, false);
  return { container, label: text, setEnabled: behaviour.setEnabled, setLabel: (t) => text.setText(t), destroy: () => container.destroy() };
}

/** Round metal machine button (110x60 texture). */
export function machineButton(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void, colour: keyof typeof K.MACHINE_BTN = 'red', fontSize: number = 18): UiButton {
  const container = scene.add.container(x, y);
  const img = scene.add.image(0, 0, K.MACHINE_BTN[colour]);
  const text = scene.add.text(0, -2, label, textStyle(fontSize, '#ffffff', { stroke: INK, strokeThickness: 3 })).setOrigin(0.5);
  container.add([img, text]);
  const behaviour = attachButtonBehaviour(scene, container, img, onClick, false);
  return { container, label: text, setEnabled: behaviour.setEnabled, setLabel: (t) => text.setText(t), destroy: () => container.destroy() };
}

/** Small text link styled like the scroll's MATH TIPS / OPTIONS entries. */
export function scrollLink(scene: Phaser.Scene, x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
  const t = scene.add.text(x, y, label, textStyle(15, '#4a2c0a')).setOrigin(0.5).setInteractive({ useHandCursor: true });
  t.on('pointerover', () => t.setColor('#b8500a'));
  t.on('pointerout', () => t.setColor('#4a2c0a'));
  t.on('pointerdown', () => {
    soundManager.playBlip();
    onClick();
  });
  return t;
}

/** Fade a scene in from black. */
export function fadeIn(scene: Phaser.Scene, duration: number = 400): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}

/** Fade to black, then start another scene. */
export function fadeTo(scene: Phaser.Scene, sceneKey: string, data?: object, duration: number = 400): void {
  scene.cameras.main.fadeOut(duration, 0, 0, 0);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => scene.scene.start(sceneKey, data));
}

/** Floating popup text that rises and fades. */
export function popText(scene: Phaser.Scene, x: number, y: number, str: string, color: string, size: number = 28): void {
  const t = outlinedText(scene, x, y, str, size, color).setDepth(500);
  scene.tweens.add({ targets: t, y: y - 70, alpha: 0, duration: 1000, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
}

/** Centre-screen banner used for round results ("CORRECT!", "LEVEL COMPLETE"). */
export function banner(scene: Phaser.Scene, str: string, color: string, duration: number = 1400, size: number = 54): Phaser.GameObjects.Text {
  const { width, height } = scene.scale;
  const t = outlinedText(scene, width / 2, height / 2 - 40, str, size, color, 8).setDepth(600).setScale(0.2);
  scene.tweens.add({ targets: t, scale: 1, duration: 260, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: t, alpha: 0, delay: duration, duration: 300, onComplete: () => t.destroy() });
  return t;
}

// ---------------------------------------------------------------- scroll HUD
export interface ScrollHud {
  container: Phaser.GameObjects.Container;
  setScore(score: number): void;
  setTime(seconds: number): void;
  setExtra(label: string): void;
}

/** The parchment score/timer scroll from the original HUD, top-left of every activity. */
export function scrollHud(scene: Phaser.Scene, x: number, y: number, onTips: () => void, onOptions: () => void): ScrollHud {
  const container = scene.add.container(x, y).setDepth(900);
  const img = scene.add.image(0, 0, K.SCROLL_HUD).setOrigin(0, 0);
  const ink = '#4a2c0a';
  const scoreLabel = scene.add.text(110, 40, 'SCORE', textStyle(15, ink)).setOrigin(0.5);
  const scoreValue = scene.add.text(110, 64, '0', textStyle(26, '#b8500a', { stroke: ink, strokeThickness: 2 })).setOrigin(0.5);
  const timeLabel = scene.add.text(110, 92, 'TIME', textStyle(15, ink)).setOrigin(0.5);
  const timeValue = scene.add.text(110, 116, '0:00', textStyle(24, ink)).setOrigin(0.5);
  const extra = scene.add.text(110, 140, '', textStyle(14, '#1f8a3b')).setOrigin(0.5);
  const tips = scrollLink(scene, 110, 160, 'MATH TIPS', onTips);
  const options = scrollLink(scene, 110, 180, 'OPTIONS', onOptions);
  container.add([img, scoreLabel, scoreValue, timeLabel, timeValue, extra, tips, options]);
  return {
    container,
    setScore: (score) => scoreValue.setText(`${score}`),
    setTime: (seconds) => {
      const s = Math.max(0, Math.floor(seconds));
      timeValue.setText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
    },
    setExtra: (label) => extra.setText(label)
  };
}

// ------------------------------------------------------------------ dialogue
export type Speaker = 'gc' | 'freud' | 'blasternaut' | 'gelator' | 'narrator';

export interface DialogLine {
  speaker: Speaker;
  text: string;
}

const SPEAKER_NAMES: Record<Speaker, string> = { gc: 'G.C.', freud: 'FREUD', blasternaut: 'BLASTERNAUT', gelator: 'GELATOR', narrator: '' };
const SPEAKER_PORTRAIT: Record<Speaker, string | null> = { gc: K.GC_TALK, freud: K.FREUD, blasternaut: K.BLASTERNAUT_PORTRAIT, gelator: K.GELATOR_GRIN, narrator: null };
const SPEAKER_NAME_COLOR: Record<Speaker, string> = { gc: '#ff8ad0', freud: '#39ff9a', blasternaut: '#8ef0a0', gelator: '#f6d72b', narrator: '#ffcc33' };

export interface DialogController {
  skip(): void;
  destroy(): void;
}

/**
 * Bottom-of-screen dialogue box with portrait, typewriter text and spoken
 * narration. Clicking the panel (or NEXT) advances; onDone fires after the
 * last line. `speak` is injected so scenes decide whether lines are voiced.
 */
export function showDialog(scene: Phaser.Scene, lines: DialogLine[], onDone: () => void, speak?: (text: string, speaker: Speaker) => void): DialogController {
  const { width, height } = scene.scale;
  const panelY = height - 112;
  const container = scene.add.container(0, 0).setDepth(1000);
  const panel = scene.add.image(width / 2, panelY, K.DIALOG_PANEL).setInteractive({ useHandCursor: true });
  const portrait = scene.add.image(width / 2 - 470 + 105, panelY, K.GC_SMILE).setVisible(false);
  const name = scene.add.text(width / 2 - 250, panelY - 74, '', textStyle(20, '#ffcc33', { stroke: INK, strokeThickness: 3 }));
  const body = scene.add.text(width / 2 - 250, panelY - 44, '', bodyStyle(23, '#ffffff', { wordWrap: { width: 640 }, lineSpacing: 6 }));
  const next = menuButton(scene, width / 2 + 400, panelY + 62, 'NEXT', () => advance(), 'gold', 18, 0.5);
  container.add([panel, portrait, name, body, next.container]);

  let index = -1;
  let typing: Phaser.Time.TimerEvent | null = null;
  let finished = false;

  const fitPortrait = (key: string): void => {
    portrait.setTexture(key).setVisible(true);
    const scale = Math.min(150 / portrait.width, 150 / portrait.height);
    portrait.setScale(scale);
  };

  const showLine = (): void => {
    const line = lines[index];
    const key = SPEAKER_PORTRAIT[line.speaker];
    if (key) fitPortrait(key);
    else portrait.setVisible(false);
    name.setText(SPEAKER_NAMES[line.speaker]).setColor(SPEAKER_NAME_COLOR[line.speaker]);
    body.setText('');
    if (speak) speak(line.text, line.speaker);
    let shown = 0;
    if (typing) typing.remove(false);
    typing = scene.time.addEvent({
      delay: 18,
      repeat: line.text.length,
      callback: () => {
        shown++;
        body.setText(line.text.slice(0, shown));
        if (shown >= line.text.length) {
          if (line.speaker === 'gc') fitPortrait(K.GC_SMILE);
          typing = null;
        }
      }
    });
  };

  const advance = (): void => {
    if (finished) return;
    if (typing) {
      typing.remove(false);
      typing = null;
      body.setText(lines[index].text);
      if (lines[index].speaker === 'gc') fitPortrait(K.GC_SMILE);
      return;
    }
    index++;
    if (index >= lines.length) {
      finished = true;
      container.destroy();
      onDone();
      return;
    }
    showLine();
  };

  panel.on('pointerdown', () => advance());
  advance();

  return {
    skip(): void {
      if (finished) return;
      finished = true;
      if (typing) typing.remove(false);
      container.destroy();
      onDone();
    },
    destroy(): void {
      finished = true;
      if (typing) typing.remove(false);
      container.destroy();
    }
  };
}
