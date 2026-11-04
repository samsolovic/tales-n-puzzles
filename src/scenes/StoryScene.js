import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, makeButton, cornerFrame, ornament, fadeTo, fadeIn } from '../ui/theme.js';
import { odyssey, getLevel } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { IS_PORTRAIT } from '../core/viewport.js';

const PAGE_COUNT = 3;

export class StoryScene extends Phaser.Scene {
  constructor() {
    super('Story');
  }

  init(data) {
    this.levelId = data.levelId || odyssey.levels[0].id;
  }

  create() {
    this.leaving = false;
    this.transitioning = false;
    this.page = 0;
    this.pageLayer = null;
    this.level = getLevel(this.levelId);
    this.drawBackground();
    this.drawHeader();
    this.renderPage(0, false);
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.page < PAGE_COUNT - 1) this.nextPage();
      else this.enterPuzzle();
    });
    this.input.keyboard.on('keydown-RIGHT', () => this.nextPage());
    this.input.keyboard.on('keydown-LEFT', () => this.prevPage());
    this.input.keyboard.on('keydown-ESC', () => fadeTo(this, 'Map'));
    fadeIn(this, 550);
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0d1c25, 0x0a151c, 0x14252c, 0x071116, 1, 1, 1, 1);
    g.fillRect(0, 0, W, H);
    const lines = this.add.graphics();
    lines.lineStyle(1, C.gold, 0.05);
    for (let i = 0; i < 8; i += 1) {
      lines.beginPath();
      lines.moveTo(0, H * 0.72 + i * 28);
      lines.lineTo(W, H * 0.68 + i * 28);
      lines.strokePath();
    }
    const edge = this.add.graphics();
    edge.lineStyle(1, C.gold, 0.18).strokeRect(22, 22, W - 44, H - 44);
    edge.lineStyle(2, C.gold, 0.4);
    edge.beginPath();
    edge.moveTo(22, 96); edge.lineTo(22, 22); edge.lineTo(96, 22);
    edge.moveTo(W - 96, 22); edge.lineTo(W - 22, 22); edge.lineTo(W - 22, 96);
    edge.moveTo(22, H - 96); edge.lineTo(22, H - 22); edge.lineTo(96, H - 22);
    edge.moveTo(W - 96, H - 22); edge.lineTo(W - 22, H - 22); edge.lineTo(W - 22, H - 96);
    edge.strokePath();
  }

  drawHeader() {
    label(this, IS_PORTRAIT ? 40 : 64, 42, `CHAPTER ${this.level.roman} / V`, {
      size: IS_PORTRAIT ? 15 : 9, color: C.gold, family: F.display, letterSpacing: 2.8
    });
    label(this, IS_PORTRAIT ? 38 : 68, IS_PORTRAIT ? 64 : 70, this.level.title, {
      size: IS_PORTRAIT ? 38 : 40, color: C.paper, family: F.serif, width: IS_PORTRAIT ? W - 220 : 720
    });
    label(this, IS_PORTRAIT ? 40 : 72, IS_PORTRAIT ? 118 : 126, this.level.place, {
      size: IS_PORTRAIT ? 20 : 12, color: C.dim, family: F.serif
    });
    if (save.isComplete(this.level.id)) {
      label(this, W - (IS_PORTRAIT ? 150 : 132), IS_PORTRAIT ? 52 : 82, 'Completed · Replay', {
        size: IS_PORTRAIT ? 16 : 10, color: C.goldLight, family: F.serif, originX: 1, originY: 0.5
      });
    }
    makeButton(this, W - (IS_PORTRAIT ? 100 : 116), IS_PORTRAIT ? 120 : 126, IS_PORTRAIT ? 160 : 120, IS_PORTRAIT ? 64 : 38, 'Back to Map', {
      variant: 'ghost', size: IS_PORTRAIT ? 20 : 12, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
  }

  renderPage(index, animate = true) {
    this.page = index;
    if (this.pageLayer) {
      this.pageLayer.destroy(true);
      this.pageLayer = null;
    }
    this.pageLayer = this.add.container(0, 0);
    const items = [];
    if (IS_PORTRAIT) this.buildPortraitPage(index, items);
    else this.buildLandscapePage(index, items);
    items.forEach((item) => this.pageLayer.add(item));
    if (animate) {
      this.pageLayer.setAlpha(0);
      this.tweens.add({ targets: this.pageLayer, alpha: 1, duration: 220, ease: 'Quad.out' });
    }
  }

  buildLandscapePage(index, items) {
    const artX = 116;
    const artY = 148;
    const artW = 460;
    const artH = 640;
    items.push(this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(artX + 8, artY + 10, artW, artH, 2));
    const imageKey = this.textures.exists(`${this.level.story.image}-${index + 1}`)
      ? `${this.level.story.image}-${index + 1}`
      : this.level.story.image;
    const image = this.add.image(artX, artY, imageKey).setOrigin(0, 0).setDisplaySize(artW, artH);
    items.push(image);
    const frame = this.add.graphics();
    frame.lineStyle(1.4, C.gold, 0.55).strokeRect(artX - 1, artY - 1, artW + 2, artH + 2);
    frame.lineStyle(1, C.gold, 0.14).strokeRect(artX - 6, artY - 6, artW + 12, artH + 12);
    items.push(frame);
    items.push(cornerFrame(this, artX - 6, artY - 6, artW + 12, artH + 12, { alpha: 0.45, len: 18 }));
    items.push(this.pageIndicator(artX, artY + artH + 24, index, 11));

    const tx = 700;
    const tw = 760;
    const textItems = [];
    textItems.push(label(this, tx, 148, this.level.story.kicker, {
      size: 11, color: C.gold, family: F.serif, letterSpacing: 1.8
    }));
    textItems.push(label(this, tx, 174, this.level.latin, {
      size: 11, color: C.dim, family: F.display, letterSpacing: 2.6
    }));
    textItems.push(ornament(this, tx, 210, 360, C.gold, 0.32));

    const paragraph = label(this, tx, 246, this.level.story.paragraphs[index], {
      size: 26, color: index === 0 ? C.paper : 0xd6c9ae, family: F.serif, width: tw, lineSpacing: 12
    });
    textItems.push(paragraph);

    if (index === PAGE_COUNT - 1) {
      const quoteY = paragraph.y + paragraph.height + 38;
      const quote = label(this, tx + 16, quoteY, this.level.story.quote, {
        size: 21, color: 0xe5d2ad, family: F.serif, width: tw - 32, lineSpacing: 7
      }).setFontStyle('italic');
      const quoteLine = this.add.graphics().fillStyle(C.gold, 0.5).fillRect(tx, quoteY - 2, 2, quote.height + 4);
      const source = label(this, tx + 16, quoteY + quote.height + 10, `— ${this.level.story.source}`, {
        size: 11, color: C.dim, family: F.serif, letterSpacing: 0.6
      });
      textItems.push(quote, quoteLine, source);
    }

    const maxBottom = Math.max(...textItems.map((item) => item.y + (item.height || 0)));
    const offset = Math.max(0, (800 - maxBottom) * 0.3);
    textItems.forEach((item) => { item.y += offset; });
    items.push(...textItems);

    const navY = 826;
    if (index > 0) {
      items.push(makeButton(this, 790, navY, 170, 48, 'Back', {
        variant: 'ghost', size: 15, onClick: () => this.prevPage()
      }));
    }
    const primaryLabel = index < PAGE_COUNT - 1 ? 'Continue' : 'Enter the Puzzle';
    items.push(makeButton(this, 1310, navY, 300, 54, primaryLabel, {
      variant: 'primary', size: 18,
      onClick: () => {
        if (index < PAGE_COUNT - 1) this.nextPage();
        else this.enterPuzzle();
      }
    }));
    items.push(label(this, 320, 826, '← → to turn the page', {
      size: 9, color: C.dim, family: F.display, originX: 0, originY: 0.5, letterSpacing: 0.8, alpha: 0.6
    }));
    if (index < PAGE_COUNT - 1) {
      const skip = label(this, 500, 826, 'Skip story', {
        size: 10, color: C.paperDim, family: F.serif, originX: 0.5, originY: 0.5
      }).setInteractive({ useHandCursor: true });
      skip.on('pointerover', () => skip.setColor('#f0cd85'));
      skip.on('pointerout', () => skip.setColor('#cbbd9f'));
      skip.on('pointerup', () => this.skipStory());
      items.push(skip);
    }
  }

  buildPortraitPage(index, items) {
    const compact = H < 1450;
    const artH = compact ? 500 : Math.min(860, Math.round(H * 0.45));
    const artW = (artH * 460) / 640;
    const artX = (W - artW) / 2;
    const artY = 160;
    items.push(this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(artX + 7, artY + 9, artW, artH, 2));
    const imageKey = this.textures.exists(`${this.level.story.image}-${index + 1}`)
      ? `${this.level.story.image}-${index + 1}`
      : this.level.story.image;
    const image = this.add.image(artX, artY, imageKey).setOrigin(0, 0).setDisplaySize(artW, artH);
    items.push(image);
    const frame = this.add.graphics();
    frame.lineStyle(1.4, C.gold, 0.55).strokeRect(artX - 1, artY - 1, artW + 2, artH + 2);
    frame.lineStyle(1, C.gold, 0.14).strokeRect(artX - 6, artY - 6, artW + 12, artH + 12);
    items.push(frame);
    items.push(cornerFrame(this, artX - 6, artY - 6, artW + 12, artH + 12, { alpha: 0.45, len: 16 }));
    items.push(this.pageIndicator(artX, artY + artH + 34, index, compact ? 14 : 16));

    const textX = 56;
    const textY = artY + artH + (compact ? 62 : 78);
    const textW = W - 112;
    const paragraph = label(this, textX, textY, this.level.story.paragraphs[index], {
      size: compact ? 22 : 28,
      color: index === 0 ? C.paper : 0xd6c9ae,
      family: F.serif,
      width: textW,
      lineSpacing: compact ? 7 : 10
    });
    const textItems = [paragraph];

    if (index === PAGE_COUNT - 1) {
      const quoteY = paragraph.y + paragraph.height + (compact ? 24 : 32);
      const quote = label(this, textX + 14, quoteY, this.level.story.quote, {
        size: compact ? 20 : 25, color: 0xe5d2ad, family: F.serif, width: textW - 28, lineSpacing: 6
      }).setFontStyle('italic');
      const quoteLine = this.add.graphics().fillStyle(C.gold, 0.5).fillRect(textX, quoteY - 2, 2, quote.height + 4);
      const source = label(this, textX + 14, quoteY + quote.height + 8, `— ${this.level.story.source}`, {
        size: compact ? 14 : 16, color: C.dim, family: F.serif
      });
      textItems.push(quote, quoteLine, source);
    }

    // Keep the page's text block balanced between the illustration and the
    // bottom controls, rather than leaving all whitespace below the paragraph.
    const maxBottom = Math.max(...textItems.map((item) => item.y + (item.height || 0)));
    const offset = Math.max(0, (H - 140 - maxBottom) * 0.35);
    textItems.forEach((item) => { item.y += offset; });
    items.push(...textItems);

    const navY = H - 92;
    if (index === 0) {
      items.push(makeButton(this, W / 2, navY, W - 140, 92, 'Continue', {
        variant: 'primary', size: 30, onClick: () => this.nextPage()
      }));
    } else {
      items.push(makeButton(this, 150, navY, 210, 88, 'Back', {
        variant: 'ghost', size: 20, onClick: () => this.prevPage()
      }));
      const primaryLabel = index < PAGE_COUNT - 1 ? 'Continue' : 'Enter the Puzzle';
      items.push(makeButton(this, W - 40 - 190, navY, 380, 92, primaryLabel, {
        variant: 'primary', size: 24,
        onClick: () => {
          if (index < PAGE_COUNT - 1) this.nextPage();
          else this.enterPuzzle();
        }
      }));
    }
    items.push(label(this, W / 2, H - 32, '← → to turn the page', {
      size: 11, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 0.7, alpha: 0.55
    }));
    if (index < PAGE_COUNT - 1) {
      const skip = label(this, W - 100, artY + artH + 34, 'Skip story', {
        size: compact ? 14 : 16, color: C.paperDim, family: F.serif, originX: 0.5, originY: 0.5
      }).setInteractive({ useHandCursor: true });
      skip.on('pointerover', () => skip.setColor('#f0cd85'));
      skip.on('pointerout', () => skip.setColor('#cbbd9f'));
      skip.on('pointerup', () => this.skipStory());
      items.push(skip);
    }
  }

  pageIndicator(x, y, index, size) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    for (let i = 0; i < PAGE_COUNT; i += 1) {
      const px = i * 22;
      if (i === index) {
        g.fillStyle(C.goldLight, 0.95).fillCircle(px, 6, 4);
        g.lineStyle(1, C.gold, 0.5).strokeCircle(px, 6, 7);
      } else {
        g.lineStyle(1, 0x5d6a66, 0.75).strokeCircle(px, 6, 4);
      }
    }
    const text = label(this, PAGE_COUNT * 22 + 8, 0, `PAGE ${index + 1} / ${PAGE_COUNT}`, {
      size, color: C.dim, family: F.display, letterSpacing: 1.4
    });
    container.add([g, text]);
    return container;
  }

  nextPage() {
    if (this.page >= PAGE_COUNT - 1 || this.leaving) return;
    audio.click();
    this.renderPage(this.page + 1);
  }

  prevPage() {
    if (this.page <= 0 || this.leaving) return;
    audio.click();
    this.renderPage(this.page - 1);
  }

  skipStory() {
    if (this.leaving) return;
    this.leaving = true;
    audio.click();
    save.markStarted(this.level.id);
    const target = this.level.puzzle.type === 'spot' ? 'Spot' : 'Hidden';
    fadeTo(this, target, { levelId: this.level.id }, { duration: 420 });
  }

  enterPuzzle() {
    if (this.leaving || this.page !== PAGE_COUNT - 1) return;
    this.leaving = true;
    audio.click();
    save.markStarted(this.level.id);
    const target = this.level.puzzle.type === 'spot' ? 'Spot' : 'Hidden';
    fadeTo(this, target, { levelId: this.level.id }, { duration: 420 });
  }
}
