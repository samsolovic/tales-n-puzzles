import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, makeButton, cornerFrame, toast, fadeTo, fadeIn } from '../ui/theme.js';
import { getLevel, getNextLevel } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { showComplete } from '../ui/complete.js';
import { IS_PORTRAIT } from '../core/viewport.js';
import { monetization } from '../core/monetization.js';
import { showHintShop } from '../ui/hintShop.js';
import { runCommercialBreak } from '../ui/adBreak.js';

export class SpotDifferenceScene extends Phaser.Scene {
  constructor() {
    super('Spot');
  }

  init(data) {
    this.levelId = data.levelId || 'lotus';
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
    g.fillGradientStyle(0x0b1a22, 0x0b1a22, 0x10252d, 0x081218, 1, 1, 1, 1);
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
    label(this, IS_PORTRAIT ? 40 : 62, IS_PORTRAIT ? 38 : 38, 'PUZZLE · SPOT THE DIFFERENCE', {
      size: IS_PORTRAIT ? 15 : 9, color: C.gold, family: F.display, letterSpacing: 2.4
    });
    label(this, IS_PORTRAIT ? 38 : 58, IS_PORTRAIT ? 62 : 60, this.puzzle.title, {
      size: IS_PORTRAIT ? 36 : 32, color: C.paper, family: F.serif, width: IS_PORTRAIT ? W - 190 : 1000
    });
    label(this, IS_PORTRAIT ? 40 : 62, IS_PORTRAIT ? 116 : 108, this.puzzle.instruction, {
      size: IS_PORTRAIT ? 20 : 13, color: C.dim, family: F.serif, width: IS_PORTRAIT ? W - 170 : 960, lineSpacing: 5
    });
    this.foundText = label(this, W - (IS_PORTRAIT ? 40 : 68), IS_PORTRAIT ? 42 : 56, `0 / ${this.puzzle.differences.length}`, {
      size: IS_PORTRAIT ? 38 : 34, color: C.paper, family: F.display, originX: 1, originY: 0
    });
    label(this, W - (IS_PORTRAIT ? 40 : 68), IS_PORTRAIT ? 88 : 100, 'differences found', {
      size: IS_PORTRAIT ? 15 : 10, color: C.dim, family: F.serif, originX: 1
    });
    const line = this.add.graphics();
    line.lineStyle(1, C.gold, 0.16).beginPath().moveTo(IS_PORTRAIT ? 40 : 58, IS_PORTRAIT ? 176 : 142).lineTo(W - (IS_PORTRAIT ? 40 : 58), IS_PORTRAIT ? 176 : 142).strokePath();
  }

  drawLandscape() {
    this.drawHeader();
    const panelW = 735;
    const panelH = 413.4;
    const panelY = 154;
    this.panels = [{ x: 58, y: panelY, w: panelW, h: panelH }, { x: 807, y: panelY, w: panelW, h: panelH }];
    this.renderPanels();
    this.slotsTop = 640;
    this.drawSlotsLandscape();
    this.drawFooterLandscape();
  }

  drawPortrait() {
    this.drawHeader();
    const panelH = Math.max(250, (H - 580) / 2);
    const panelW = Math.min(820, (panelH * 16) / 9);
    const realH = (panelW * 9) / 16;
    const panelX = (W - panelW) / 2;
    const panelY = 194;
    this.panels = [
      { x: panelX, y: panelY, w: panelW, h: realH },
      { x: panelX, y: panelY + realH + 24, w: panelW, h: realH }
    ];
    this.renderPanels();
    const slotsTop = panelY + realH * 2 + 24 + 42;
    this.drawSlotsPortrait(slotsTop);
    this.drawFooterPortrait();
  }

  renderPanels() {
    this.panels.forEach((panel, index) => {
      const { x, y, w, h } = panel;
      this.add.graphics().fillStyle(0x000000, 0.45).fillRoundedRect(x + 6, y + 8, w, h, 2);
      const image = this.add.image(x, y, index === 0 ? this.puzzle.imageA : this.puzzle.imageB)
        .setOrigin(0, 0)
        .setDisplaySize(w, h)
        .setDepth(10);
      const frame = this.add.graphics();
      frame.lineStyle(1.4, C.gold, 0.5).strokeRect(x - 1, y - 1, w + 2, h + 2);
      frame.lineStyle(1, C.gold, 0.14).strokeRect(x - 6, y - 6, w + 12, h + 12);
      cornerFrame(this, x - 6, y - 6, w + 12, h + 12, { alpha: 0.45, len: 16 });
      const badge = this.add.graphics();
      badge.fillStyle(0x08151d, 0.8).fillCircle(x + 24, y + 24, 14);
      badge.lineStyle(1, C.gold, 0.5).strokeCircle(x + 24, y + 24, 14);
      label(this, x + 24, y + 24, index === 0 ? 'A' : 'B', {
        size: IS_PORTRAIT ? 14 : 11, color: C.goldLight, family: F.display, originX: 0.5, originY: 0.5
      });
      const zone = this.add.zone(x, y, w, h).setOrigin(0, 0).setInteractive({ useHandCursor: true });
      zone.on('pointerdown', (pointer) => this.handleClick(pointer, index));
      zone.on('pointerover', () => this.input.setDefaultCursor('crosshair'));
      zone.on('pointerout', () => this.input.setDefaultCursor('default'));
    });
    this.markerLayer = this.add.container(0, 0).setDepth(50);
  }

  drawSlotsLandscape() {
    this.slots = [];
    const y = this.slotsTop;
    this.puzzle.differences.forEach((diff, index) => {
      const x = 58 + index * 286;
      this.makeSlot(index, x, y, 270, 54, 16, 48, 17, 18);
    });
    label(this, 58, 618, 'FOUND CLUES', { size: 9, color: C.dim, family: F.serif, letterSpacing: 1.6 });
    this.hintText = label(this, 62, 748, '', {
      size: 13, color: C.goldLight, family: F.serif, width: 1000, alpha: 0
    });
    makeButton(this, 136, 830, 146, 42, 'Back to Map', {
      variant: 'ghost', size: 12, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    this.hintButton = makeButton(this, 1380, 830, 220, 48, 'Hint · 3', {
      variant: 'solid', size: 14, onClick: () => this.useHint()
    });
    label(this, 136, 866, 'H for hint · ESC to return', {
      size: 8, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 0.8, alpha: 0.7
    });
  }

  drawSlotsPortrait(top) {
    this.slots = [];
    label(this, 40, top - 30, 'FOUND CLUES', { size: 15, color: C.gold, family: F.display, letterSpacing: 1.4 });
    const single = H >= 1800;
    const gap = single ? 10 : 12;
    const w = single ? W - 80 : (W - 80 - gap) / 2;
    const h = single ? 56 : 44;
    const rowGap = single ? 10 : 8;
    this.puzzle.differences.forEach((diff, index) => {
      const col = single ? 0 : index % 2;
      const row = single ? index : Math.floor(index / 2);
      const x = 40 + col * (w + gap);
      const y = top + row * (h + rowGap);
      this.makeSlot(index, x, y, w, h, single ? 18 : 14, single ? 58 : 44, single ? 18 : 14, single ? 22 : 16);
    });
    const rows = single ? this.puzzle.differences.length : Math.ceil(this.puzzle.differences.length / 2);
    const end = top + rows * (h + rowGap);
    this.slotsEnd = end;
    const hintY = Math.min(H - 162, end + 18);
    this.hintText = label(this, 40, hintY, '', {
      size: 19, color: C.goldLight, family: F.serif, width: W - 80, lineSpacing: 4, alpha: 0
    });
    makeButton(this, 136, H < 1450 ? H - 78 : H - 92, 210, 84, 'Back to Map', {
      variant: 'ghost', size: 20, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    this.hintButton = makeButton(this, W - 155, H < 1450 ? H - 78 : H - 92, 230, 86, 'Hint · 3', {
      variant: 'solid', size: 22, onClick: () => this.useHint()
    });
    label(this, W / 2, H - 28, 'H for hint · ESC to return', {
      size: 12, color: C.dim, family: F.display, originX: 0.5, letterSpacing: 0.5, alpha: 0.65
    });
    if (H >= 1800) {
      const tipY = Math.max(H - 350, (this.slotsEnd || 0) + 36);
      if (tipY < H - 120) {
        this.tipLabel = label(this, W / 2, tipY, 'A difference can be a color, a shape, an object — or something missing.', {
          size: 19, color: C.dim, family: F.serif, originX: 0.5, align: 'center', width: W - 120, lineSpacing: 5
        });
      }
    }
  }

  makeSlot(index, x, y, w, h, padding, textX, numSize, textSize) {
    const container = this.add.container(x, y);
    const g = this.add.graphics();
    const draw = (found) => {
      g.clear();
      g.fillStyle(found ? C.gold : 0x0b171e, found ? 0.12 : 0.62).fillRoundedRect(0, 0, w, h, 3);
      g.lineStyle(1, found ? C.gold : 0x465455, found ? 0.55 : 0.3).strokeRoundedRect(0.5, 0.5, w - 1, h - 1, 3);
    };
    draw(false);
    const num = label(this, padding, h / 2, String(index + 1).padStart(2, '0'), {
      size: numSize, color: C.gold, family: F.display, originY: 0.5, letterSpacing: 0.6
    });
    const text = label(this, textX, h / 2, 'Not found yet', {
      size: textSize, color: C.dim, family: F.serif, originY: 0.5
    });
    const check = label(this, w - 16, h / 2, '✓', {
      size: textSize, color: C.goldLight, family: F.sans, originX: 1, originY: 0.5, alpha: 0
    });
    container.add([g, num, text, check]);
    this.slots.push({ container, g, draw, text, check, found: false });
  }

  drawFooterLandscape() {}

  drawFooterPortrait() {}

  updateSlot(index) {
    const slot = this.slots[index];
    if (!slot || slot.found) return;
    slot.found = true;
    slot.draw(true);
    slot.text.setText(this.puzzle.differences[index].name).setColor('#e6d2ad');
    slot.check.setAlpha(1);
  }

  handleClick(pointer, panelIndex) {
    if (this.finished || this.completeOverlay || monetization.isBusy()) return;
    const panel = this.panels[panelIndex];
    const artX = ((pointer.x - panel.x) / panel.w) * 1600;
    const artY = ((pointer.y - panel.y) / panel.h) * 900;
    if (artX < 0 || artX > 1600 || artY < 0 || artY > 900) return;

    let hitIndex = -1;
    this.puzzle.differences.forEach((diff, index) => {
      if (this.found.has(diff.id)) return;
      if (Math.hypot(artX - diff.x, artY - diff.y) <= diff.r) hitIndex = index;
    });

    if (hitIndex === -1) {
      this.wrong += 1;
      audio.wrong();
      this.ripple(pointer.x, pointer.y, 0x9a5b4c);
      this.cameras.main.shake(90, 0.0016);
      if (this.wrong === 4) toast(this, 'Take your time. Compare the two scenes closely.', { y: IS_PORTRAIT ? H - 220 : 714 });
      return;
    }

    const diff = this.puzzle.differences[hitIndex];
    this.found.add(diff.id);
    audio.correct();
    this.updateSlot(hitIndex);
    this.foundText.setText(`${this.found.size} / ${this.puzzle.differences.length}`);
    this.markDifference(diff, hitIndex);
    this.burst(pointer.x, pointer.y);
    if (this.found.size === this.puzzle.differences.length) this.finish();
  }

  markDifference(diff, index) {
    this.panels.forEach((panel, panelIndex) => {
      const px = panel.x + (diff.x / 1600) * panel.w;
      const py = panel.y + (diff.y / 900) * panel.h;
      const r = Math.max(15, (diff.r / 1600) * panel.w * 0.92);
      const ring = this.add.circle(px, py, r, C.goldLight, 0).setStrokeStyle(2, C.goldLight, 0.95);
      const inner = this.add.circle(px, py, 2.4, C.goldLight, 1);
      const tag = this.add.graphics();
      tag.fillStyle(0x08151d, 0.9).fillCircle(px + r * 0.72, py - r * 0.72, 9);
      tag.lineStyle(1, C.gold, 0.65).strokeCircle(px + r * 0.72, py - r * 0.72, 9);
      const num = label(this, px + r * 0.72, py - r * 0.72, String(index + 1), {
        size: 9, color: C.goldLight, family: F.display, originX: 0.5, originY: 0.5
      });
      this.markerLayer.add([ring, inner, tag, num]);
      const flash = this.add.circle(px, py, r, C.goldLight, 0).setStrokeStyle(3, C.goldLight, 0.75).setDepth(55);
      this.markerLayer.add(flash);
      this.tweens.add({
        targets: flash, scale: 1.7, alpha: 0, duration: 720, delay: panelIndex * 80,
        ease: 'Cubic.out', onComplete: () => flash.destroy()
      });
    });
  }

  burst(x, y) {
    for (let i = 0; i < 11; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 24 + Math.random() * 58;
      const dot = this.add.circle(x, y, 1.2 + Math.random() * 2, C.goldLight, 1).setDepth(70);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 500 + Math.random() * 350,
        ease: 'Cubic.out',
        onComplete: () => dot.destroy()
      });
    }
  }

  ripple(x, y, color) {
    const ring = this.add.circle(x, y, 8, color, 0).setStrokeStyle(1.5, color, 0.7).setDepth(70);
    this.tweens.add({
      targets: ring, radius: 42, alpha: 0, duration: 520, ease: 'Quad.out',
      onComplete: () => ring.destroy()
    });
  }

  useHint() {
    if (this.finished || this.completeOverlay || this.hintShop || monetization.isBusy()) return;
    if (this.hintLeft <= 0) {
      this.openHintShop();
      return;
    }
    monetization.gameplayStart();
    const index = this.puzzle.differences.findIndex((diff) => !this.found.has(diff.id));
    if (index === -1) return;
    const diff = this.puzzle.differences[index];
    this.hintLeft -= 1;
    this.hints += 1;
    audio.open();
    this.hintButton.label.setText(this.hintLeft > 0 ? `Hint · ${this.hintLeft}` : 'More Hints');
    this.hintText.setText(`Hint: ${diff.hint}`).setAlpha(1);
    if (this.tipLabel) this.tipLabel.setVisible(false);
    this.panels.forEach((panel, panelIndex) => {
      const px = panel.x + (diff.x / 1600) * panel.w;
      const py = panel.y + (diff.y / 900) * panel.h;
      const ring = this.add.circle(px, py, IS_PORTRAIT ? 26 : 22, C.goldLight, 0).setStrokeStyle(2, C.goldLight, 0.9).setDepth(60);
      this.tweens.add({
        targets: ring, scale: 2.2, alpha: 0, duration: 900, yoyo: true, repeat: 1,
        delay: panelIndex * 80, onComplete: () => ring.destroy()
      });
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
        if (this.tipLabel) this.tipLabel.setVisible(false);
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
