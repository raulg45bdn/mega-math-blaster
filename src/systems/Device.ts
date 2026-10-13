/**
 * Phone detection and touch sizing.
 *
 * The game is drawn at 1024x768 and scaled to fit, so on a phone every control
 * shrinks by the same factor the canvas does. At a typical phone landscape size
 * the scale lands near 0.48, which turns a comfortable 44px button into 21px.
 * Phone mode enlarges the controls that are actually tapped so they stay above
 * the ~44px minimum once scaled.
 */
export type PhoneMode = 'auto' | 'on' | 'off';

const PHONE_UI_SCALE = 1.5;

let setting: PhoneMode = 'auto';

/** True when the primary pointer is a finger rather than a mouse. */
export function hasCoarsePointer(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
    return (navigator.maxTouchPoints ?? 0) > 0;
  } catch {
    return false;
  }
}

/**
 * Shortest edge available to the game, used to tell a phone from a tablet or
 * laptop. Both the device screen and the current window are considered: a phone
 * held sideways still reports a short window height, and a desktop browser
 * squeezed narrow should not be treated as a phone unless it is also a touch
 * screen, which the caller checks separately.
 */
export function shortestEdge(): number {
  try {
    const screenW = window.screen?.width ?? window.innerWidth;
    const screenH = window.screen?.height ?? window.innerHeight;
    return Math.min(screenW, screenH, window.innerWidth, window.innerHeight);
  } catch {
    return 1024;
  }
}

/** What auto-detection concludes, before any manual override. */
export function detectedAsPhone(): boolean {
  return hasCoarsePointer() && shortestEdge() <= 560;
}

export function setPhoneModeSetting(mode: PhoneMode): void {
  setting = mode;
}

export function getPhoneModeSetting(): PhoneMode {
  return setting;
}

/** The resolved answer: is the game running with phone-sized controls? */
export function phoneMode(): boolean {
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return detectedAsPhone();
}

/** Multiplier for anything the player taps. */
export function uiScale(): number {
  return phoneMode() ? PHONE_UI_SCALE : 1;
}

/** Grow a tap target for phone mode, leaving mouse play untouched. */
export function tap(base: number): number {
  return Math.round(base * uiScale());
}

/** True when the device is held upright, where a 4:3 game has almost no room. */
export function isPortrait(): boolean {
  try {
    return window.innerHeight > window.innerWidth;
  } catch {
    return false;
  }
}

export function fullscreenSupported(): boolean {
  try {
    return !!document.documentElement.requestFullscreen && document.fullscreenEnabled !== false;
  } catch {
    return false;
  }
}

export function isFullscreen(): boolean {
  try {
    return !!document.fullscreenElement;
  } catch {
    return false;
  }
}

/** Toggle fullscreen. Must be called from a real tap or click to be allowed. */
export function toggleFullscreen(): void {
  try {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => undefined);
    }
  } catch {
    // Fullscreen is blocked on some browsers (notably iPhone Safari); the game still plays.
  }
}
