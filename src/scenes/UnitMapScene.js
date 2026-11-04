import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, makeButton, progressPips, ornament, toast, fadeTo, fadeIn } from '../ui/theme.js';
import { odyssey } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { IS_PORTRAIT } from '../core/viewport.js';

export class UnitMapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  create() {
    this.transitioning = false;
    this.data_ = save.get();
    this.completed = this.data_.completed;
    this.currentIndex = odyssey.levels.findIndex((level) => !this.completed.includes(level.id));
    this.allDone = this.currentIndex === -1;

    this.add.rectangle(W / 2, H / 2, W, H, 0x08151d);
    if (IS_PORTRAIT) this.buildPortrait();
    else this.buildLandscape();
    this.drawDust();
    fadeIn(this, 600);
    this.input.keyboard.on('keydown-ESC', () => fadeTo(this, 'Title'));
  }

  buildLandscape() {
    this.add.image(0, 0, 'odyssey-map').setOrigin(0, 0);
    const top = this.add.graphics();
    top.fillGradientStyle(0x08151d, 0x08151d, 0x08151d, 0x08151d, 0.94, 0.94, 0, 0);
    top.fillRect(0, 0, W, 310);
    const bottom = this.add.graphics();
    bottom.fillGradientStyle(0x08151d, 0x08151d, 0x08151d, 0x08151d, 0, 0, 0.92, 0.92);
    bottom.fillRect(0, H - 210, W, 210);
    const edge = this.add.graphics();
    edge.lineStyle(1, C.gold, 0.22).strokeRect(28, 28, W - 56, H - 56);
    this.drawHeader();
    this.drawRoute();
    this.drawNodes();
    this.drawFooter();
    this.drawShip();
  }

  buildPortrait() {
    this.drawPortraitHeader();
    this.drawPortraitBanner();
    this.drawPortraitCards();
    this.drawPortraitFooter();
  }

  // -------------------------------------------------------------------------
  // Landscape map

  drawHeader() {
    label(this, 68, 48, 'UNIT I · THE ODYSSEY', {
      size: 9, color: C.gold, family: F.display, letterSpacing: 3
    });
    label(this, 64, 70, `${odyssey.title} · ${odyssey.subtitle}`, {
      size: 34, color: C.paper, family: F.serif
    });
    label(this, 68, 120, 'Follow the golden route. Uncover one chapter at a time.', {
      size: 13, color: C.dim, family: F.serif
    });
    ornament(this, 68, 154, 340, C.gold, 0.28);

    const done = this.completed.filter((id) => odyssey.levels.some((level) => level.id === id)).length;
    label(this, W - 70, 54, 'VOYAGE PROGRESS', {
      size: 10, color: C.dim, family: F.serif, originX: 1, letterSpacing: 1.2
    });
    label(this, W - 70, 74, `${done} / ${odyssey.levels.length}`, {
      size: 25, color: C.paper, family: F.display, originX: 1, letterSpacing: 1
    });
    const barX = W - 300;
    const barW = 230;
    const g = this.add.graphics();
    g.fillStyle(0x2a3b3e, 0.9).fillRoundedRect(barX, 112, barW, 3, 1.5);
    if (done > 0) g.fillStyle(C.gold, 0.9).fillRoundedRect(barX, 112, (barW * done) / odyssey.levels.length, 3, 1.5);
    progressPips(this, W - 286, 146, odyssey.levels.length, done, { gap: 24, radius: 4 });

    if (this.allDone) {
      makeButton(this, W - 340, 196, 210, 40, 'Read the Epilogue', {
        variant: 'primary', size: 13, onClick: () => { audio.click(); fadeTo(this, 'UnitEnd'); }
      });
    }
  }

  drawRoute() {
    const g = this.add.graphics();
    const nodes = odyssey.map.nodes;
    for (let i = 0; i < nodes.length - 1; i += 1) {
      const a = nodes[i];
      const b = nodes[i + 1];
      const passed = this.completed.includes(odyssey.levels[i].id);
      const color = passed ? C.goldLight : 0x9d9b83;
      const alpha = passed ? 0.72 : 0.24;
      const length = Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y);
      const steps = Math.floor(length / 16);
      for (let s = 1; s < steps; s += 1) {
        const t = s / steps;
        const x = Phaser.Math.Linear(a.x, b.x, t);
        const y = Phaser.Math.Linear(a.y, b.y, t) - Math.sin(t * Math.PI) * 10;
        g.fillStyle(color, alpha).fillCircle(x, y, passed ? 2.1 : 1.5);
      }
    }
  }

  drawNodes() {
    this.nodes = [];
    odyssey.map.nodes.forEach((node, index) => {
      const level = odyssey.levels[index];
      const isComplete = this.completed.includes(level.id);
      const isCurrent = index === this.currentIndex;
      const unlocked = index === 0 || odyssey.levels.slice(0, index).every((l) => this.completed.includes(l.id));
      const container = this.add.container(node.x, node.y);

      const pulse = this.add.circle(0, 0, 27, C.gold, 0).setStrokeStyle(1.4, C.goldLight, 0.7);
      pulse.setVisible(isCurrent);
      if (isCurrent) {
        this.tweens.add({ targets: pulse, scale: 1.55, alpha: 0, duration: 1900, repeat: -1, ease: 'Sine.out' });
      }
      const halo = this.add.circle(0, 0, 34, 0x07141c, 0.56);
      const disc = this.add.graphics();
      if (isComplete) {
        disc.fillStyle(C.gold, 0.96).fillCircle(0, 0, 23);
        disc.lineStyle(1.5, C.paper, 0.55).strokeCircle(0, 0, 17);
      } else if (isCurrent) {
        disc.fillStyle(0x0b1a22, 0.94).fillCircle(0, 0, 23);
        disc.lineStyle(2, C.goldLight, 0.95).strokeCircle(0, 0, 23);
        disc.lineStyle(1, C.gold, 0.36).strokeCircle(0, 0, 29);
      } else {
        disc.fillStyle(0x0b171e, 0.9).fillCircle(0, 0, 23);
        disc.lineStyle(1, 0x7f877c, 0.5).strokeCircle(0, 0, 23);
      }
      const roman = label(this, 0, 1, level.roman, {
        size: 16, color: isComplete ? C.ink : isCurrent ? C.goldLight : 0x89918a,
        family: F.display, originX: 0.5, originY: 0.5, letterSpacing: 1
      });
      const plaque = this.add.graphics();
      plaque.fillStyle(0x08151d, 0.72).fillRoundedRect(-76, 36, 152, 38, 3);
      plaque.lineStyle(1, C.gold, isCurrent ? 0.3 : 0.12).strokeRoundedRect(-75.5, 36.5, 151, 37, 3);
      const name = label(this, 0, 43, isCurrent ? 'Continue here' : node.label, {
        size: 12, color: isComplete ? C.paper : isCurrent ? C.goldLight : 0xd2cdbc,
        family: F.serif, originX: 0.5, letterSpacing: 0.8
      });
      const sub = label(this, 0, 60, level.title, {
        size: 10, color: isComplete ? 0x9b947f : isCurrent ? 0xd0b47a : 0xa0a292,
        family: F.serif, originX: 0.5
      });
      if (!unlocked) {
        name.setAlpha(0.55);
        sub.setAlpha(0.5);
      }
      const lock = this.add.graphics();
      if (!unlocked) {
        lock.lineStyle(1.2, 0x6f776e, 0.6).strokeCircle(0, 0, 23);
        lock.fillStyle(0x6f776e, 0.55).fillRect(-5, -2, 10, 8);
        lock.lineStyle(1.2, 0x6f776e, 0.6).strokeCircle(0, -3, 4);
      }
      const check = label(this, 15, -17, '✓', {
        size: 10, color: C.ink, family: F.sans, originX: 0.5, originY: 0.5
      });
      check.setVisible(isComplete);
      const zone = this.add.zone(0, 0, 82, 82).setInteractive({ useHandCursor: unlocked });
      const tooltip = this.makeTooltip(level, index, isCurrent, isComplete);

      zone.on('pointerover', () => {
        if (!unlocked) return;
        this.tweens.add({ targets: container, scale: 1.08, duration: 160, ease: 'Quad.out' });
        tooltip.setVisible(true).setAlpha(0);
        this.tweens.add({ targets: tooltip, alpha: 1, duration: 150 });
        audio.click();
      });
      zone.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1, duration: 160, ease: 'Quad.out' });
        this.tweens.add({ targets: tooltip, alpha: 0, duration: 120, onComplete: () => tooltip.setVisible(false) });
      });
      zone.on('pointerup', () => {
        if (!unlocked) {
          audio.wrong();
          toast(this, 'Finish the previous chapter first.', { y: H - 120 });
          return;
        }
        audio.click();
        fadeTo(this, 'Story', { levelId: level.id });
      });

      container.add([pulse, halo, disc, plaque, roman, name, sub, lock, check, zone]);
      container.setDepth(20);
      this.nodes.push({ container, tooltip, level, unlocked, isComplete, isCurrent });
    });
  }

  makeTooltip(level, index, isCurrent, isComplete) {
    const type = level.puzzle.type === 'spot' ? 'Spot the Difference' : 'Hidden Objects';
    const status = isComplete ? 'Completed' : isCurrent ? 'Current chapter' : 'Locked';
    const w = 238;
    const h = 62;
    const container = this.add.container(odyssey.map.nodes[index].x, odyssey.map.nodes[index].y - 96).setDepth(60).setVisible(false);
    const g = this.add.graphics();
    g.fillStyle(0x08151d, 0.94).fillRoundedRect(-w / 2, -h / 2, w, h, 3);
    g.lineStyle(1, C.gold, 0.34).strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 3);
    g.fillStyle(0x08151d, 0.94).fillTriangle(-7, h / 2 - 1, 7, h / 2 - 1, 0, h / 2 + 8);
    const t1 = label(this, 0, -14, `${level.roman} · ${level.title}`, {
      size: 13, color: C.paper, originX: 0.5, originY: 0.5, width: 210
    });
    const t2 = label(this, 0, 10, `${type} · ${status}`, {
      size: 10, color: C.dim, originX: 0.5, originY: 0.5, letterSpacing: 0.5
    });
    container.add([g, t1, t2]);
    return container;
  }

  drawFooter() {
    makeButton(this, 130, H - 70, 148, 44, 'Back to Title', {
      variant: 'ghost', size: 12, onClick: () => { audio.click(); fadeTo(this, 'Title'); }
    });
    const done = this.completed.filter((id) => odyssey.levels.some((level) => level.id === id)).length;
    label(this, W / 2, H - 84, 'CHAPTER SELECT', {
      size: 8, color: C.gold, family: F.display, letterSpacing: 3, originX: 0.5, alpha: 0.7
    });
    label(this, W / 2, H - 62, this.allDone ? 'All chapters complete. The epilogue is waiting.' : 'Choose a chapter and keep sailing.', {
      size: 13, color: C.paperDim, family: F.serif, originX: 0.5
    });
    label(this, W / 2, H - 38, `First unit · ${odyssey.title} · ${odyssey.levels.length} chapters`, {
      size: 10, color: C.dim, family: F.serif, originX: 0.5
    });
    this.drawSound(W - 76, H - 70, 1);
  }

  drawShip() {
    const index = this.currentIndex === -1 ? odyssey.levels.length - 1 : this.currentIndex;
    const node = odyssey.map.nodes[index];
    const ship = this.add.container(node.x + 56, node.y - 60).setDepth(35).setAngle(-6);
    const g = this.add.graphics();
    g.fillStyle(C.gold, 0.92);
    g.fillTriangle(-2, -18, 15, -4, -2, -2);
    g.lineStyle(1.4, C.goldLight, 0.9).strokeTriangle(-2, -18, 15, -4, -2, -2);
    g.fillStyle(C.rust, 0.95).fillEllipse(0, 0, 30, 8);
    g.lineStyle(1, C.gold, 0.7).beginPath().moveTo(0, -4).lineTo(0, -24).strokePath();
    g.fillStyle(C.paper, 0.88).fillTriangle(1, -23, 15, -10, 1, -7);
    const wake = this.add.graphics();
    wake.lineStyle(1, C.gold, 0.25).beginPath().moveTo(-20, 8).lineTo(-38, 11).strokePath();
    ship.add([wake, g]);
    this.tweens.add({
      targets: ship, y: ship.y - 5, angle: -3, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.inOut'
    });
  }

  // -------------------------------------------------------------------------
  // Portrait map

  drawPortraitHeader() {
    label(this, 40, 38, 'UNIT I · THE ODYSSEY', {
      size: 13, color: C.gold, family: F.display, letterSpacing: 2.8
    });
    label(this, 38, 62, `${odyssey.title} · ${odyssey.subtitle}`, {
      size: 34, color: C.paper, family: F.serif, width: W - 260
    });
    label(this, 40, 124, 'Follow the golden route, one chapter at a time.', {
      size: 20, color: C.dim, family: F.serif
    });
    const done = this.completed.filter((id) => odyssey.levels.some((level) => level.id === id)).length;
    label(this, W - 40, 38, 'VOYAGE', {
      size: 11, color: C.dim, family: F.serif, originX: 1, letterSpacing: 1.6
    });
    label(this, W - 40, 58, `${done} / ${odyssey.levels.length}`, {
      size: 30, color: C.paper, family: F.display, originX: 1
    });
    progressPips(this, W - 220, 116, odyssey.levels.length, done, { gap: 34, radius: 6 });
  }

  drawPortraitBanner() {
    const bannerY = 164;
    const bannerH = H < 1450 ? 260 : Math.min(490, Math.round(H * 0.28));
    const image = this.add.image(W / 2, bannerY - (506 - bannerH) / 2, 'odyssey-map')
      .setOrigin(0.5, 0)
      .setDisplaySize(W, 506);
    const mask = this.make.graphics({ add: false });
    mask.fillStyle(0xffffff).fillRect(0, bannerY, W, bannerH);
    image.setMask(mask.createGeometryMask());
    const fade = this.add.graphics();
    fade.fillGradientStyle(0x08151d, 0x08151d, 0x08151d, 0x08151d, 0, 0, 0.88, 0.88);
    fade.fillRect(0, bannerY + bannerH - 120, W, 120);
    const top = this.add.graphics();
    top.fillGradientStyle(0x08151d, 0x08151d, 0x08151d, 0x08151d, 0.6, 0.6, 0, 0);
    top.fillRect(0, bannerY, W, 90);
    const rule = this.add.graphics();
    rule.lineStyle(1, C.gold, 0.2).strokeRect(22, 22, W - 44, H - 44);
    this.bannerEnd = bannerY + bannerH;
  }

  drawPortraitCards() {
    const gap = 14;
    const start = this.bannerEnd + 28;
    const available = H - start - 190;
    const cardH = Phaser.Math.Clamp((available - gap * 4) / 5, 88, 150);
    const cardW = W - 80;
    this.portraitCards = [];

    odyssey.levels.forEach((level, index) => {
      const y = start + index * (cardH + gap);
      const isComplete = this.completed.includes(level.id);
      const isCurrent = index === this.currentIndex;
      const unlocked = index === 0 || odyssey.levels.slice(0, index).every((l) => this.completed.includes(l.id));
      const container = this.add.container(40, y);
      const g = this.add.graphics();
      const draw = (hover = false) => {
        g.clear();
        g.fillStyle(0x0a171e, hover ? 0.94 : 0.82).fillRoundedRect(0, 0, cardW, cardH, 3);
        g.lineStyle(isCurrent ? 1.4 : 1, isCurrent ? C.gold : C.gold, isCurrent ? 0.55 : hover ? 0.3 : 0.14);
        g.strokeRoundedRect(0.5, 0.5, cardW - 1, cardH - 1, 3);
        if (isCurrent) {
          g.fillStyle(C.gold, 0.08).fillRoundedRect(0, 0, cardW, cardH, 3);
        }
      };
      draw();

      const cy = cardH / 2;
      const disc = this.add.graphics();
      if (isComplete) {
        disc.fillStyle(C.gold, 0.95).fillCircle(44, cy, 20);
        disc.lineStyle(1, C.paper, 0.5).strokeCircle(44, cy, 14);
      } else if (isCurrent) {
        disc.fillStyle(0x0a171e, 0.9).fillCircle(44, cy, 20);
        disc.lineStyle(2, C.goldLight, 0.9).strokeCircle(44, cy, 20);
      } else {
        disc.fillStyle(0x0a171e, 0.9).fillCircle(44, cy, 20);
        disc.lineStyle(1, 0x5b6764, 0.7).strokeCircle(44, cy, 20);
      }
      const roman = label(this, 44, cy + 1, level.roman, {
        size: 17, color: isComplete ? C.ink : isCurrent ? C.goldLight : 0x89918a,
        family: F.display, originX: 0.5, originY: 0.5
      });
      const title = label(this, 82, cy - 28, level.title, {
        size: 24, color: isComplete ? C.paper : isCurrent ? C.paper : unlocked ? 0xd6d0be : 0x8c9186,
        family: F.serif
      });
      const place = label(this, 82, cy + 4, level.place, {
        size: 17, color: C.dim, family: F.serif, width: cardW - 300
      });
      const type = label(this, 82, cy + 30, level.puzzle.type === 'spot' ? 'Spot the Difference' : 'Hidden Objects', {
        size: 15, color: isCurrent ? C.goldLight : C.dim, family: F.serif, letterSpacing: 0.4
      });
      const status = label(this, cardW - 24, cy, isComplete ? 'COMPLETED' : isCurrent ? 'CONTINUE' : lockedText(unlocked), {
        size: 14, color: isComplete ? C.gold : isCurrent ? C.goldLight : 0x6f7873,
        family: F.display, originX: 1, originY: 0.5, letterSpacing: 1.4
      });
      const check = label(this, 44, cy + 24, '✓', {
        size: 12, color: C.ink, family: F.sans, originX: 0.5, originY: 0.5, alpha: isComplete ? 1 : 0
      });
      const zone = this.add.zone(0, 0, cardW, Math.max(60, cardH)).setOrigin(0, 0).setInteractive({ useHandCursor: unlocked });
      zone.on('pointerover', () => { if (unlocked) draw(true); });
      zone.on('pointerout', () => draw(false));
      zone.on('pointerup', () => {
        if (!unlocked) {
          audio.wrong();
          toast(this, 'Finish the previous chapter first.', { y: H - 120 });
          return;
        }
        audio.click();
        fadeTo(this, 'Story', { levelId: level.id });
      });
      container.add([g, disc, roman, title, place, type, status, check, zone]);
      this.portraitCards.push(container);
    });

  }

  drawPortraitFooter() {
    if (this.allDone) {
      makeButton(this, W / 2, H - 88, W - 160, 84, 'Read the Epilogue', {
        variant: 'primary', size: 24, onClick: () => { audio.click(); fadeTo(this, 'UnitEnd'); }
      });
      return;
    }
    makeButton(this, 136, H - 88, 210, 80, 'Back to Title', {
      variant: 'ghost', size: 20, onClick: () => { audio.click(); fadeTo(this, 'Title'); }
    });
    this.drawSound(W - 120, H - 88, 1.5);
  }

  drawSound(x, y, scale = 1) {
    const text = label(this, x, y, audio.muted ? 'Sound · Off' : 'Sound · On', {
      size: 12 * scale, color: C.paperDim, family: F.serif, originX: 1, originY: 0.5
    }).setInteractive({ useHandCursor: true });
    text.on('pointerup', () => {
      const muted = audio.toggle();
      text.setText(muted ? 'Sound · Off' : 'Sound · On');
    });
    text.on('pointerover', () => text.setColor('#f0cd85'));
    text.on('pointerout', () => text.setColor('#cbbd9f'));
  }

  drawDust() {
    for (let i = 0; i < 18; i += 1) {
      const x = W * 0.06 + Math.random() * W * 0.88;
      const y = H * 0.25 + Math.random() * H * 0.55;
      const dot = this.add.circle(x, y, Math.random() * 1.4 + 0.4, C.goldLight, 0.2 + Math.random() * 0.3).setDepth(5);
      this.tweens.add({
        targets: dot,
        y: y - 20 - Math.random() * 40,
        alpha: 0,
        duration: 3000 + Math.random() * 5000,
        delay: Math.random() * 4000,
        repeat: -1
      });
    }
  }
}

function lockedText(unlocked) {
  return unlocked ? 'AVAILABLE' : 'LOCKED';
}
