import { fullscreenSupported, hasCoarsePointer, toggleFullscreen } from './Device';

/**
 * Browser-level helpers that sit outside the Phaser canvas:
 *  - a "turn your phone sideways" screen, because a 4:3 game in portrait
 *    shrinks to an unplayable strip
 *  - a fullscreen button, which on a phone recovers the browser's address bar
 *    and gives the canvas noticeably more room
 *
 * Both are driven by CSS media queries, so they react to the phone being
 * rotated without any polling.
 */
const CSS = `
#mmb-rotate {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 60;
  background: #0b0c16;
  color: #e2e8f0;
  text-align: center;
  padding: 24px;
  box-sizing: border-box;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  font-family: "Trebuchet MS", "Segoe UI", Arial, sans-serif;
}
#mmb-rotate .mmb-phone {
  width: 86px;
  height: 140px;
  border: 5px solid #38bdf8;
  border-radius: 14px;
  animation: mmb-tilt 2.2s ease-in-out infinite;
}
#mmb-rotate h1 {
  margin: 0;
  font-size: 24px;
  color: #ffcc33;
  letter-spacing: 0.5px;
}
#mmb-rotate p {
  margin: 0;
  font-size: 16px;
  max-width: 320px;
  line-height: 1.5;
  color: #b9c2d4;
}
@keyframes mmb-tilt {
  0%, 45% { transform: rotate(0deg); }
  70%, 100% { transform: rotate(-90deg); }
}
@media (prefers-reduced-motion: reduce) {
  #mmb-rotate .mmb-phone { animation: none; transform: rotate(-90deg); }
}
@media (orientation: portrait) and (pointer: coarse) {
  #mmb-rotate { display: flex; }
}
#mmb-fullscreen {
  display: none;
  position: fixed;
  top: calc(6px + env(safe-area-inset-top, 0px));
  right: 8px;
  z-index: 55;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 2px solid #38bdf8;
  background: rgba(11, 12, 22, 0.75);
  color: #e2e8f0;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
#mmb-fullscreen:active { background: rgba(56, 189, 248, 0.35); }
@media (pointer: coarse) and (orientation: landscape) {
  #mmb-fullscreen.mmb-available { display: block; }
}
`;

export function installPhoneUi(): void {
  if (typeof document === 'undefined' || document.getElementById('mmb-rotate')) return;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const rotate = document.createElement('div');
  rotate.id = 'mmb-rotate';
  rotate.innerHTML =
    '<div class="mmb-phone"></div>' +
    '<h1>Turn your phone sideways</h1>' +
    '<p>Mega Math Blaster is a wide-screen game. Rotate your phone to landscape and it will fill the screen.</p>';
  document.body.appendChild(rotate);

  const button = document.createElement('button');
  button.id = 'mmb-fullscreen';
  button.type = 'button';
  button.title = 'Fullscreen';
  button.setAttribute('aria-label', 'Toggle fullscreen');
  button.textContent = '⛶';
  if (hasCoarsePointer() && fullscreenSupported()) button.classList.add('mmb-available');
  button.addEventListener('click', (event) => {
    event.preventDefault();
    toggleFullscreen();
  });
  document.body.appendChild(button);
}
