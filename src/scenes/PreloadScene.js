import Phaser from '../vendor-shim.js';
import { monetization } from '../core/monetization.js';

const art = [
  ['title-hero', 1600, 900],
  ['odyssey-map', 1600, 900],
  ['lotus-a', 1600, 900],
  ['lotus-b', 1600, 900],
  ['cyclops-cave', 1600, 900],
  ['cyclops-fire-cover', 1600, 900],
  ['cyclops-wood-cover', 1600, 900],
  ['cyclops-fleece-cover', 1600, 900],
  ['cyclops-cloth-cover', 1600, 900],
  ['cyclops-shield-cover', 1600, 900],
  ['circe-a', 1600, 900],
  ['circe-b', 1600, 900],
  ['sirens-sea', 1600, 900],
  ['sirens-bench-cover', 1600, 900],
  ['sirens-crate-cover', 1600, 900],
  ['sirens-sail-cover', 1600, 900],
  ['sirens-shield-cover', 1600, 900],
  ['ithaca-a', 1600, 900],
  ['ithaca-b', 1600, 900],
  ['story-lotus', 1560, 720],
  ['story-cyclops', 1560, 720],
  ['story-circe', 1560, 720],
  ['story-sirens', 1560, 720],
  ['story-ithaca', 1560, 720]
];

const storyKeys = ['story-lotus', 'story-cyclops', 'story-circe', 'story-sirens', 'story-ithaca'];

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    const status = document.getElementById('boot-status');
    this.load.setPath('assets/art');
    this.load.on('progress', (value) => {
      if (status) status.textContent = `Binding the pages… ${Math.round(value * 100)}%`;
    });
    this.load.on('loaderror', (file) => {
      console.error('Failed to load', file.key, file.src);
      if (status) status.textContent = `Page ${file.key} could not be loaded`;
    });
    art.forEach(([key, width, height]) => {
      this.load.svg(key, `${key}.svg`, { width, height });
    });
  }

  create() {
    this.buildStoryPages();
    const status = document.getElementById('boot-status');
    if (status) status.textContent = 'Connecting the story to the platform…';
    monetization.init().finally(() => {
      monetization.gameLoadingFinished();
      const boot = document.getElementById('boot-screen');
      if (boot) {
        boot.classList.add('is-hidden');
        window.setTimeout(() => boot.remove(), 900);
      }
      this.time.delayedCall(160, () => {
        this.scene.start('Title');
      });
    });
  }

  // Each story triptych is one 1560 x 720 painting with three framed panels.
  // The chapter reader shows one panel at a time, so cut the triptych into three
  // runtime textures without duplicating the source SVG files.
  buildStoryPages() {
    const panelX = 40;
    const panelY = 40;
    const panelW = 460;
    const panelH = 640;
    const gap = 40;
    storyKeys.forEach((key) => {
      const texture = this.textures.get(key);
      if (!texture || texture.key === '__MISSING') return;
      const source = texture.getSourceImage();
      for (let i = 0; i < 3; i += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = panelW;
        canvas.height = panelH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          source,
          panelX + i * (panelW + gap), panelY, panelW, panelH,
          0, 0, panelW, panelH
        );
        this.textures.addCanvas(`${key}-${i + 1}`, canvas);
      }
    });
  }
}
