import { PreloadScene } from './scenes/PreloadScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { UnitMapScene } from './scenes/UnitMapScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { SpotDifferenceScene } from './scenes/SpotDifferenceScene.js';
import { HiddenObjectScene } from './scenes/HiddenObjectScene.js';
import { UnitEndScene } from './scenes/UnitEndScene.js';
import { W, H, IS_PORTRAIT } from './core/viewport.js';
import { monetization } from './core/monetization.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#0b1720',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  render: {
    antialias: true,
    roundPixels: false,
    preserveDrawingBuffer: true
  },
  input: {
    activePointers: 3
  },
  scene: [
    PreloadScene,
    TitleScene,
    UnitMapScene,
    StoryScene,
    SpotDifferenceScene,
    HiddenObjectScene,
    UnitEndScene
  ]
};

const game = new Phaser.Game(config);
window.__TALES_GAME__ = game;
window.__PNP_GAME__ = game;
window.__TALES_MONETIZATION__ = monetization;

// The stage is rebuilt for portrait or landscape at boot. If the device is
// physically rotated, reload once so all scenes use the correct layout.
const orientation = window.matchMedia('(orientation: portrait)');
orientation.addEventListener('change', (event) => {
  if (event.matches === IS_PORTRAIT) return;
  const veil = document.getElementById('reframing');
  if (veil) veil.classList.add('is-visible');
  window.setTimeout(() => window.location.reload(), 420);
});

window.addEventListener('resize', () => {
  if (game.scale) game.scale.refresh();
});
