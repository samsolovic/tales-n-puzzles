import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, makeButton, panel, cornerFrame, toast, fadeTo, fadeIn } from '../ui/theme.js';
import { getLevel, getNextLevel } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { showComplete } from '../ui/complete.js';
import { IS_PORTRAIT } from '../core/viewport.js';
import { monetization } from '../core/monetization.js';
import { showHintShop } from '../ui/hintShop.js';
import { runCommercialBreak } from '../ui/adBreak.js';

export class HiddenObjectScene extends Phaser.Scene {
  constructor() {
    super('Hidden');
  }

  init(data) {
    this.levelId = data.levelId || 'cyclops';
  }

  create() {
    this.completeOverlay = null;
    this.transitioning = false;
    this.hintShop = null;
    this.level = getLevel(this.levelId);
    this.puzzle = this.level.puzzle;
    this.found = new Set();
    this.hints = 0;
    this.wrong = 0;
    this.hintLeft = 3;
    this.startTime = this.time.now;
    this.finished = false;
    this.coversById = {};

    this.drawBackground();
    if (IS_PORTRAIT) this.drawPortrait();
    else this.drawLandscape();
    fadeIn(this, 420);
    this.input.once('pointerdown', () => {
      if (!this.finished && !this.completeOverlay && !this.hintShop && !monetization.isBusy()) {
        monetization.gameplayStart();
      }
    });
    this.events.once('shutdown', () => monetization.gameplayStop());
    this.input.keyboard.on('keydown-H', () => this.useHint());
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.hintShop || monetization.isBusy()) return;
      fadeTo(this, 'Map');
    });
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0a1921, 0x0a1921, 0x11262e, 0x071116, 1, 1, 1, 1);
    g.fillRect(0, 0, W, H);
    const edge = this.add.graphics();
    edge.lineStyle(1, C.gold, 0.18).strokeRect(22, 22, W - 44, H - 44);
    edge.lineStyle(2, C.gold, 0.38);
    edge.beginPath();
    edge.moveTo(22, 96); edge.lineTo(22, 22); edge.lineTo(96, 22);
    edge.moveTo(W - 96, 22); edge.lineTo(W - 22, 22); edge.lineTo(W - 22, 96);
    edge.moveTo(22, H - 96); edge.lineTo(22, H - 22); edge.lineTo(96, H - 22);
    edge.moveTo(W - 96, H - 22); edge.lineTo(W - 22, H - 22); edge.lineTo(W - 22, H - 96);
    edge.strokePath();
  }

  drawHeader() {
    label(this, IS_PORTRAIT ? 40 : 58, 38, 'PUZZLE · HIDDEN OBJECTS', {
      size: IS_PORTRAIT ? 15 : 9, color: C.gold, family: F.display, letterSpacing: 2.4
    });
    label(this, IS_PORTRAIT ? 38 : 56, IS_PORTRAIT ? 62 : 60, this.puzzle.title, {
      size: IS_PORTRAIT ? 36 : 32, color: C.paper, family: F.serif, width: IS_PORTRAIT ? W - 190 : 1000
    });
    label(this, IS_PORTRAIT ? 40 : 58, IS_PORTRAIT ? 116 : 108, this.puzzle.instruction, {
      size: IS_PORTRAIT ? 20 : 13, color: C.dim, family: F.serif, width: IS_PORTRAIT ? W - 170 : 1000, lineSpacing: 5
    });
    this.foundText = label(this, W - (IS_PORTRAIT ? 40 : 68), IS_PORTRAIT ? 42 : 56, `0 / ${this.puzzle.items.length}`, {
      size: IS_PORTRAIT ? 38 : 34, color: C.paper, family: F.display, originX: 1, originY: 0
    });
    label(this, W - (IS_PORTRAIT ? 40 : 68), IS_PORTRAIT ? 88 : 100, 'objects found', {
      size: IS_PORTRAIT ? 15 : 10, color: C.dim, family: F.serif, originX: 1
    });
    this.add.graphics().lineStyle(1, C.gold, 0.16)
      .beginPath().moveTo(IS_PORTRAIT ? 40 : 58, IS_PORTRAIT ? 176 : 136)
      .lineTo(W - (IS_PORTRAIT ? 40 : 58), IS_PORTRAIT ? 176 : 136).strokePath();
  }

  drawLandscape() {
    this.drawHeader();
    this.art = { x: 56, y: 146, w: 1088, h: 612 };
    this.renderArt();
    this.drawSidePanel();
  }

  drawPortrait() {
    this.drawHeader();
    this.art = { x: 40, y: 194, w: 820, h: 461.25 };
    this.renderArt();
    this.drawPortraitList();
  }

  renderArt() {
    const { x, y, w, h } = this.art;
    this.artScale = w / 1600;
    this.add.graphics().fillStyle(0x000000, 0.5).fillRoundedRect(x + 7, y + 9, w, h, 2);
    this.add.image(x, y, this.puzzle.image).setOrigin(0, 0).setDisplaySize(w, h).setDepth(10);
    const frame = this.add.graphics();
    frame.lineStyle(1.4, C.gold, 0.5).strokeRect(x - 1, y - 1, w + 2, h + 2);
    frame.lineStyle(1, C.gold, 0.15).strokeRect(x - 6, y - 6, w + 12, h + 12);
    cornerFrame(this, x - 6, y - 6, w + 12, h + 12, { alpha: 0.45, len: 18 });

    this.coverLayer = this.add.container(0, 0).setDepth(20);
    this.puzzle.covers.forEach((cover) => {
      const sprite = this.add.image(x, y, cover.texture).setOrigin(0, 0).setDisplaySize(w, h);
      this.coverLayer.add(sprite);
      this.coversById[cover.id] = { ...cover, image: sprite, opened: false };
    });

    this.markerLayer = this.add.container(0, 0).setDepth(50);
    const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', (pointer) => this.handleArtClick(pointer));
    zone.on('pointerover', () => this.input.setDefaultCursor('pointer'));
    zone.on('pointerout', () => this.input.setDefaultCursor('default'));
    label(this, x, y + h + 12, 'Click the scene · move aside whatever is in the way', {
      size: IS_PORTRAIT ? 18 : 11, color: C.dim, family: F.serif
    });
  }

  drawSidePanel() {
    panel(this, 1176, 146, 368, 612, { fill: 0x0a171e, alpha: 0.86, borderAlpha: 0.26 });
    label(this, 1204, 168, 'FINDING LIST', { size: 10, color: C.gold, family: F.serif, letterSpacing: 2.2 });
    label(this, 1516, 166, `${this.puzzle.items.length} objects`, { size: 11, color: C.dim, family: F.serif, originX: 1 });
    this.add.graphics().lineStyle(1, C.gold, 0.14).beginPath().moveTo(1204, 194).lineTo(1516, 194).strokePath();

    this.rows = [];
    this.puzzle.items.forEach((item, index) => {
      const y = 212 + index * 43;
      this.makeRow(item, index, 1204, y, 26, 13, 312);
    });
    this.hintText = label(this, 1204, 558, '', {
      size: 11, color: C.goldLight, family: F.serif, width: 310, lineSpacing: 5, alpha: 0
    });
    this.hintButton = makeButton(this, 1360, 648, 280, 46, 'Hint · 3', {
      variant: 'solid', size: 14, onClick: () => this.useHint()
    });
    makeButton(this, 1360, 708, 280, 42, 'Back to Map', {
      variant: 'ghost', size: 12, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    label(this, 1360, 782, 'H for hint · ESC to return', {
      size: 8, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 0.8, alpha: 0.7
    });
  }

  drawPortraitList() {
    const top = 740;
    panel(this, 40, 700, W - 80, 310, { fill: 0x0a171e, alpha: 0.8, borderAlpha: 0.2 });
    label(this, 64, top - 22, 'FINDING LIST', { size: 17, color: C.gold, family: F.display, letterSpacing: 1.6 });
    label(this, W - 64, top - 22, `${this.puzzle.items.length} objects`, {
      size: 16, color: C.dim, family: F.serif, originX: 1
    });
    this.rows = [];
    const gap = 12;
    const colW = (W - 80 - 48 - gap) / 2;
    const rowH = 46;
    this.puzzle.items.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 64 + col * (colW + gap);
      const y = top + 16 + row * (rowH + 8);
      this.makeRow(item, index, x, y, 28, 21, colW - 28);
    });
    this.hintText = label(this, 64, Math.min(H - 162, 1030), '', {
      size: 19, color: C.goldLight, family: F.serif, width: W - 128, lineSpacing: 4, alpha: 0
    });
    this.hintButton = makeButton(this, W - 155, H < 1450 ? H - 78 : H - 92, 230, 86, 'Hint · 3', {
      variant: 'solid', size: 22, onClick: () => this.useHint()
    });
    makeButton(this, 136, H < 1450 ? H - 78 : H - 92, 210, 84, 'Back to Map', {
      variant: 'ghost', size: 20, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    label(this, W / 2, H - 30, 'H for hint · ESC to return', {
      size: 12, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 0.6, alpha: 0.65
    });
    if (H > 1600) {
      label(this, W / 2, H - 360, this.level.story.quote, {
        size: 23, color: 0xcdbc9d, family: F.serif, originX: 0.5, align: 'center', width: W - 120, lineSpacing: 6
      }).setFontStyle('italic');
      label(this, W / 2, H - 300, '— THE STORY', {
        size: 12, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 1.4
      });
    }
  }

  makeRow(item, index, x, y, markX, textSize, indexX) {
    const row = this.add.container(x, y);
    const mark = this.add.graphics();
    const drawMark = (found) => {
      mark.clear();
      if (found) {
        mark.fillStyle(C.gold, 0.95).fillCircle(7, 10, 7);
        mark.lineStyle(1, C.goldLight, 0.6).strokeCircle(7, 10, 7);
      } else {
        mark.lineStyle(1, 0x5d6a66, 0.8).strokeCircle(7, 10, 7);
      }
    };
    drawMark(false);
    const check = label(this, 7, 10, '✓', {
      size: 8, color: C.ink, family: F.sans, originX: 0.5, originY: 0.5, alpha: 0
    });
    const text = label(this, markX, 1, item.name, {
      size: textSize, color: C.paperDim, family: F.serif
    });
    const indexLabel = label(this, indexX, 2, String(index + 1).padStart(2, '0'), {
      size: IS_PORTRAIT ? 12 : 9, color: 0x5d6a66, family: F.display, originX: 1, letterSpacing: 0.8
    });
    row.add([mark, check, text, indexLabel]);
    this.rows.push({ row, mark, drawMark, check, text, indexLabel, found: false });
  }

  handleArtClick(pointer) {
    if (this.finished || this.completeOverlay || monetization.isBusy()) return;
    const { x, y, w, h } = this.art;
    const artX = ((pointer.x - x) / w) * 1600;
    const artY = ((pointer.y - y) / h) * 900;

    const cover = Object.values(this.coversById).find((c) => {
      if (c.opened) return false;
      return Math.hypot(artX - c.x, artY - c.y) <= c.r;
    });
    if (cover) {
      this.openCover(cover);
      return;
    }
    const item = this.puzzle.items.find((it) => {
      if (this.found.has(it.id)) return false;
      if (it.cover && !this.coversById[it.cover].opened) return false;
      return Math.hypot(artX - it.x, artY - it.y) <= it.r;
    });
    if (item) {
      this.collect(item);
      return;
    }
    this.wrong += 1;
    audio.wrong();
    this.ripple(pointer.x, pointer.y, 0x8c5f4f);
    if (this.wrong === 5) toast(this, 'Take your time. Read the list, then look for what is covering the scene.', {
      y: IS_PORTRAIT ? H - 220 : 808
    });
  }

  openCover(cover) {
    cover.opened = true;
    audio.open();
    const dx = (cover.move?.x || 0) * this.artScale;
    const dy = (cover.move?.y || 0) * this.artScale;
    this.tweens.add({
      targets: cover.image,
      x: cover.image.x + dx,
      y: cover.image.y + dy,
      alpha: cover.move?.alpha ?? 0.9,
      duration: 540,
      ease: 'Cubic.inOut'
    });
    this.hintText.setText(cover.message).setAlpha(1);
    this.time.delayedCall(220, () => {
      this.puzzle.items.filter((it) => it.cover === cover.id).forEach((it) => this.revealPulse(it));
    });
  }

  revealPulse(item) {
    const pos = this.artPos(item.x, item.y);
    const ring = this.add.circle(pos.x, pos.y, IS_PORTRAIT ? 22 : 18, C.goldLight, 0).setStrokeStyle(1.5, C.goldLight, 0.8).setDepth(55);
    this.markerLayer.add(ring);
    this.tweens.add({
      targets: ring, scale: 1.8, alpha: 0, duration: 900, yoyo: true, repeat: 1,
      onComplete: () => ring.destroy()
    });
    for (let i = 0; i < 6; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 18 + Math.random() * 34;
      const spark = this.add.circle(pos.x, pos.y, 1.6, C.goldLight, 0.9).setDepth(55);
      this.markerLayer.add(spark);
      this.tweens.add({
        targets: spark,
        x: pos.x + Math.cos(angle) * dist,
        y: pos.y + Math.sin(angle) * dist,
        alpha: 0, duration: 700, onComplete: () => spark.destroy()
      });
    }
  }

  collect(item) {
    this.found.add(item.id);
    audio.correct();
    this.updateRow(item);
    this.foundText.setText(`${this.found.size} / ${this.puzzle.items.length}`);
    this.markItem(item);
    this.hintText.setText(`Found: ${item.name}`).setAlpha(1);
    if (this.found.size === this.puzzle.items.length) this.finish();
  }

  updateRow(item) {
    const index = this.puzzle.items.findIndex((it) => it.id === item.id);
    const row = this.rows[index];
    if (!row || row.found) return;
    row.found = true;
    row.drawMark(true);
    row.check.setAlpha(1);
    row.text.setColor('#e6d2ad');
    row.indexLabel.setColor('#d5a85a');
  }

  markItem(item) {
    const pos = this.artPos(item.x, item.y);
    const ring = this.add.circle(pos.x, pos.y, IS_PORTRAIT ? 24 : 20, C.goldLight, 0).setStrokeStyle(2, C.goldLight, 0.95).setDepth(60);
    const tag = this.add.graphics();
    tag.fillStyle(0x08151d, 0.92).fillCircle(pos.x + 15, pos.y - 15, 9);
    tag.lineStyle(1, C.gold, 0.7).strokeCircle(pos.x + 15, pos.y - 15, 9);
    const check = label(this, pos.x + 15, pos.y - 15, '✓', {
      size: 8, color: C.goldLight, family: F.sans, originX: 0.5, originY: 0.5
    });
    this.markerLayer.add([ring, tag, check]);
    const flash = this.add.circle(pos.x, pos.y, IS_PORTRAIT ? 24 : 20, C.goldLight, 0).setStrokeStyle(3, C.goldLight, 0.7).setDepth(60);
    this.markerLayer.add(flash);
    this.tweens.add({
      targets: flash, scale: 1.8, alpha: 0, duration: 700,
      onComplete: () => flash.destroy()
    });
  }

  useHint() {
    if (this.finished || this.completeOverlay || this.hintShop || monetization.isBusy()) return;
    if (this.hintLeft <= 0) {
      this.openHintShop();
      return;
    }
    monetization.gameplayStart();
    const item = this.puzzle.items.find((it) => !this.found.has(it.id));
    if (!item) return;
    this.hintLeft -= 1;
    this.hints += 1;
    audio.open();
    this.hintButton.label.setText(this.hintLeft > 0 ? `Hint · ${this.hintLeft}` : 'More Hints');
    this.hintText.setText(`Hint: ${item.hint}`).setAlpha(1);
    if (item.cover && !this.coversById[item.cover].opened) {
      const cover = this.coversById[item.cover];
      this.pulseAt(cover.x, cover.y, 42);
    } else {
      this.pulseAt(item.x, item.y, 24);
    }
  }

  pulseAt(x, y, radius) {
    const pos = this.artPos(x, y);
    const ring = this.add.circle(pos.x, pos.y, radius * this.artScale, C.goldLight, 0).setStrokeStyle(2, C.goldLight, 0.9).setDepth(60);
    this.markerLayer.add(ring);
    this.tweens.add({
      targets: ring, scale: 1.8, alpha: 0, duration: 850, yoyo: true, repeat: 1,
      onComplete: () => ring.destroy()
    });
  }

  artPos(x, y) {
    return { x: this.art.x + (x / 1600) * this.art.w, y: this.art.y + (y / 900) * this.art.h };
  }

  ripple(x, y, color) {
    const ring = this.add.circle(x, y, 8, color, 0).setStrokeStyle(1.5, color, 0.7).setDepth(70);
    this.tweens.add({
      targets: ring, radius: 38, alpha: 0, duration: 480, ease: 'Quad.out',
      onComplete: () => ring.destroy()
    });
  }

  openHintShop() {
    if (this.hintShop) return;
    this.hintShop = showHintShop(this, {
      onReward: () => {
        this.hintLeft += 3;
        this.hintButton.label.setText(`Hint · ${this.hintLeft}`);
        this.hintButton.setEnabled(true);
        this.hintText.setText('+3 hints added.').setAlpha(1);
      },
      onClose: () => {
        this.hintShop = null;
      }
    });
  }

  finish() {
    this.finished = true;
    monetization.gameplayStop();
    this.time.delayedCall(760, () => {
      const next = getNextLevel(this.level.id);
      const isFinal = !next;
      save.markComplete(
        { levelId: this.level.id, unitComplete: isFinal },
        { hints: this.hints, wrong: this.wrong, findings: this.found.size }
      );
      showComplete(this, {
        level: this.level,
        hints: this.hints,
        wrong: this.wrong,
        elapsed: (this.time.now - this.startTime) / 1000,
        isFinal,
        onNext: () => {
          if (next) {
            runCommercialBreak(this, 'chapter_boundary').finally(() => {
              fadeTo(this, 'Story', { levelId: next.id });
            });
          } else {
            fadeTo(this, 'UnitEnd');
          }
        },
        onMap: () => fadeTo(this, 'Map')
      });
    });
  }
}
