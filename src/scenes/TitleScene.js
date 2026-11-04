import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, panel, makeButton, ornament, fadeTo } from '../ui/theme.js';
import { odyssey, unitLevelIds, getLevel } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { IS_PORTRAIT } from '../core/viewport.js';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.about = null;
    this.transitioning = false;
    this.drawBackground();
    if (IS_PORTRAIT) this.buildPortrait();
    else this.buildLandscape();
    this.drawAtmosphere();
    this.drawSound();
    this.cameras.main.fadeIn(700, 8, 17, 24);

    this.input.keyboard.on('keydown-ENTER', () => this.primaryAction());
    this.input.keyboard.on('keydown-SPACE', () => this.primaryAction());
    this.input.keyboard.on('keydown-ESC', () => this.closeAbout());
  }

  drawBackground() {
    if (IS_PORTRAIT) {
      this.add.rectangle(W / 2, H / 2, W, H, 0x0b1720);
      const heroH = H < 1400 ? Math.min(440, Math.round(H * 0.36)) : Math.min(740, Math.round(H * 0.38));
      this.heroH = heroH;
      const scale = Math.max(W / 1600, heroH / 900);
      const hero = this.add.image(W / 2, heroH - 900 * scale, 'title-hero').setOrigin(0.5, 0);
      hero.setDisplaySize(1600 * scale, 900 * scale);
      const mask = this.make.graphics({ add: false });
      mask.fillStyle(0xffffff).fillRect(0, 0, W, heroH);
      hero.setMask(mask.createGeometryMask());
      const fade = this.add.graphics();
      fade.fillGradientStyle(0x0b1720, 0x0b1720, 0x0b1720, 0x0b1720, 0, 0, 1, 1);
      fade.fillRect(0, heroH - 250, W, 250);
      const top = this.add.graphics();
      top.fillGradientStyle(0x07131b, 0x07131b, 0x07131b, 0x07131b, 0.42, 0.42, 0, 0);
      top.fillRect(0, 0, W, 150);
      this.drawFrame();
      return;
    }

    this.add.image(0, 0, 'title-hero').setOrigin(0, 0);
    const shade = this.add.graphics();
    shade.fillGradientStyle(0x07131b, 0x07131b, 0x07131b, 0x07131b, 0.94, 0, 0.9, 0);
    shade.fillRect(0, 0, 960, H);
    const topShade = this.add.graphics();
    topShade.fillGradientStyle(0x07131b, 0x07131b, 0x07131b, 0x07131b, 0.32, 0.32, 0, 0);
    topShade.fillRect(0, 0, W, 180);
    this.drawFrame();
  }

  drawFrame() {
    const g = this.add.graphics();
    if (IS_PORTRAIT) {
      g.lineStyle(1, C.gold, 0.18).strokeRect(22, 22, W - 44, H - 44);
      g.lineStyle(2, C.gold, 0.38);
      g.beginPath();
      g.moveTo(22, 80); g.lineTo(22, 22); g.lineTo(80, 22);
      g.moveTo(W - 80, 22); g.lineTo(W - 22, 22); g.lineTo(W - 22, 80);
      g.moveTo(22, H - 80); g.lineTo(22, H - 22); g.lineTo(80, H - 22);
      g.moveTo(W - 80, H - 22); g.lineTo(W - 22, H - 22); g.lineTo(W - 22, H - 80);
      g.strokePath();
      return;
    }
    g.lineStyle(1, C.gold, 0.24);
    g.strokeRect(28, 28, W - 56, H - 56);
    const corners = this.add.graphics();
    corners.lineStyle(2, C.gold, 0.48);
    corners.beginPath();
    corners.moveTo(28, 110); corners.lineTo(28, 28); corners.lineTo(110, 28);
    corners.moveTo(W - 110, 28); corners.lineTo(W - 28, 28); corners.lineTo(W - 28, 110);
    corners.moveTo(28, H - 110); corners.lineTo(28, H - 28); corners.lineTo(110, H - 28);
    corners.moveTo(W - 110, H - 28); corners.lineTo(W - 28, H - 28); corners.lineTo(W - 28, H - 110);
    corners.strokePath();
    const v = this.add.graphics();
    v.lineStyle(1, C.gold, 0.18);
    v.beginPath(); v.moveTo(92, 134); v.lineTo(92, H - 130); v.strokePath();
  }

  buildLandscape() {
    const eyebrow = label(this, 112, 118, 'A NARRATIVE PUZZLE GAME', {
      size: 10, color: C.gold, family: F.display, letterSpacing: 4.2
    });
    const titleOne = label(this, 108, 202, 'Tales', {
      size: 94, color: C.paper, family: F.display, shadow: true
    });
    const amp = label(this, 112, 294, '&', {
      size: 90, color: C.gold, family: F.display, shadow: true
    }).setFontStyle('italic');
    const titleTwo = label(this, 112 + amp.width + 24, 294, 'Puzzles', {
      size: 94, color: C.paper, family: F.display, shadow: true
    });
    const subtitle = label(this, 116, 424, 'Find what the story is hiding.', {
      size: 21, color: C.paperDim, family: F.serif, letterSpacing: 0.6
    });
    ornament(this, 116, 470, 280, C.gold, 0.4);

    label(this, 116, 506, 'UNIT I', { size: 10, color: C.gold, family: F.display, letterSpacing: 3.2 });
    label(this, 116, 526, `${odyssey.title} · ${odyssey.subtitle}`, { size: 25, color: C.paper, family: F.serif });
    label(this, 116, 566, odyssey.author, { size: 12, color: C.dim, family: F.serif, letterSpacing: 0.4 });
    this.drawActions(281, 660, 281, 730, 330, 58, 330, 54);
    this.drawFooter();
    [eyebrow, titleOne, amp, titleTwo, subtitle].forEach((item, index) => {
      item.setAlpha(0);
      item.y += 12;
      this.tweens.add({
        targets: item,
        alpha: 1,
        y: item.y - 12,
        duration: 700,
        delay: 120 + index * 90,
        ease: 'Cubic.out'
      });
    });
  }

  buildPortrait() {
    const top = this.heroH + 24;
    const heroTitle = label(this, 60, top, 'A NARRATIVE PUZZLE GAME', {
      size: 14, color: C.gold, family: F.display, letterSpacing: 3.4
    });
    const titleOne = label(this, 58, top + 24, 'Tales', {
      size: 80, color: C.paper, family: F.display, shadow: true
    });
    const amp = label(this, 62, top + 112, '&', {
      size: 78, color: C.gold, family: F.display, shadow: true
    }).setFontStyle('italic');
    const titleTwo = label(this, 62 + amp.width + 20, top + 112, 'Puzzles', {
      size: 80, color: C.paper, family: F.display, shadow: true
    });
    const subtitle = label(this, 64, top + 218, 'Find what the story is hiding.', {
      size: 28, color: C.paperDim, family: F.serif
    });
    ornament(this, 64, top + 268, 300, C.gold, 0.4);
    label(this, 64, top + 304, 'UNIT I', { size: 15, color: C.gold, family: F.display, letterSpacing: 3.2 });
    label(this, 64, top + 328, `${odyssey.title} · ${odyssey.subtitle}`, {
      size: 36, color: C.paper, family: F.serif
    });
    label(this, 64, top + 382, odyssey.author, { size: 20, color: C.dim, family: F.serif });
    const intro = H >= 1450
      ? label(this, 64, top + 432, 'A storm, a giant, a witch, a song — and one long way home.', {
        size: 25, color: C.paperDim, family: F.serif, width: W - 128, lineSpacing: 9
      })
      : null;

    if (H > 1850) this.drawChapterStrip(H - 540);
    this.drawActions(W / 2, H - 300, W / 2, H - 204, W - 150, 92, W - 150, 82);
    this.drawFooter(H - 58);

    [heroTitle, titleOne, amp, titleTwo, subtitle, ...(intro ? [intro] : [])].forEach((item, index) => {
      item.setAlpha(0);
      item.y += 10;
      this.tweens.add({
        targets: item,
        alpha: 1,
        y: item.y - 10,
        duration: 650,
        delay: 100 + index * 80,
        ease: 'Cubic.out'
      });
    });
  }

  drawChapterStrip(y) {
    label(this, 64, y, 'FIVE CHAPTERS', {
      size: 13, color: C.gold, family: F.display, letterSpacing: 2.4
    });
    const line = this.add.graphics();
    line.lineStyle(1, C.gold, 0.16).beginPath().moveTo(220, y + 10).lineTo(W - 64, y + 10).strokePath();
    odyssey.levels.forEach((level, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 64 + col * 410;
      const yy = y + 40 + row * 34;
      label(this, x, yy, `${level.roman}  ${level.title}`, {
        size: 20, color: C.paperDim, family: F.serif
      });
    });
  }

  drawActions(primaryX, primaryY, secondaryX, secondaryY, primaryW, primaryH, secondaryW, secondaryH) {
    const data = save.get();
    const done = data.completed.filter((id) => unitLevelIds.includes(id));
    const allDone = done.length === unitLevelIds.length;
    const nextId = allDone ? unitLevelIds[0] : save.firstPlayable(unitLevelIds);
    const next = getLevel(nextId);
    this.nextId = nextId;
    this.allDone = allDone;
    this.hasProgress = done.length > 0;

    let primaryText = 'Begin the Journey';
    if (allDone) primaryText = 'Sail the Odyssey Again';
    else if (done.length > 0) primaryText = `Continue · ${next.roman} ${next.title}`;

    const size = IS_PORTRAIT ? 32 : 18;
    this.primary = makeButton(this, primaryX, primaryY, primaryW, primaryH, primaryText, {
      variant: 'primary',
      size,
      onClick: () => this.primaryAction()
    });
    this.primary.setAlpha(0);
    const py = this.primary.y;
    this.primary.y += 14;
    this.tweens.add({ targets: this.primary, alpha: 1, y: py, duration: 600, delay: 560, ease: 'Cubic.out' });

    this.secondary = makeButton(this, secondaryX, secondaryY, secondaryW, secondaryH, this.hasProgress ? 'Chapter Map' : 'About the Game', {
      variant: 'ghost',
      size: IS_PORTRAIT ? 27 : 16,
      onClick: () => {
        audio.click();
        if (this.hasProgress) fadeTo(this, 'Map');
        else this.showAbout();
      }
    });
    this.secondary.setAlpha(0);
    const sy = this.secondary.y;
    this.secondary.y += 14;
    this.tweens.add({ targets: this.secondary, alpha: 1, y: sy, duration: 600, delay: 640, ease: 'Cubic.out' });

    const hint = label(this, primaryX, secondaryY + secondaryH / 2 + (IS_PORTRAIT ? 34 : 26), 'Click to look · notice · solve', {
      size: IS_PORTRAIT ? 18 : 11, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 0.8
    });
    hint.setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 0.9, duration: 500, delay: 760 });
  }

  drawFooter(y = H - 56) {
    if (IS_PORTRAIT) {
      label(this, 64, y, 'FIRST UNIT · THE ODYSSEY', {
        size: 15, color: C.gold, family: F.display, letterSpacing: 1.6, alpha: 0.76
      });
      label(this, W - 64, y, 'v0.2 · PHASER 3', {
        size: 13, color: C.dim, family: F.display, letterSpacing: 1.2, originX: 1
      });
      const about = label(this, W - 64, y - 42, 'About & Reset', {
        size: 15, color: C.paperDim, family: F.serif, originX: 1, originY: 0.5
      }).setInteractive({ useHandCursor: true });
      about.on('pointerup', () => this.showAbout());
      about.on('pointerover', () => about.setColor('#f0cd85'));
      about.on('pointerout', () => about.setColor('#cbbd9f'));
      return;
    }
    label(this, 112, y, 'FIRST UNIT · THE ODYSSEY', {
      size: 9, color: C.gold, family: F.display, letterSpacing: 2.6, alpha: 0.78
    });
    label(this, 112, y + 18, 'Five chapters · two kinds of puzzles · one long way home', {
      size: 11, color: C.dim, family: F.serif, letterSpacing: 0.4
    });
    label(this, W - 112, H - 38, 'v0.2 · PHASER 3', {
      size: 8, color: C.dim, family: F.display, letterSpacing: 2, originX: 1
    });
    const about = label(this, W - 112, H - 58, 'About & Reset', {
      size: 11, color: C.paperDim, family: F.serif, originX: 1
    }).setInteractive({ useHandCursor: true });
    about.on('pointerup', () => this.showAbout());
    about.on('pointerover', () => about.setColor('#f0cd85'));
    about.on('pointerout', () => about.setColor('#cbbd9f'));
  }

  drawAtmosphere() {
    const count = IS_PORTRAIT ? 14 : 18;
    for (let i = 0; i < count; i += 1) {
      const dot = this.add.circle(
        W * 0.35 + Math.random() * W * 0.62,
        H * 0.3 + Math.random() * H * 0.5,
        Math.random() * 1.8 + 0.5,
        C.goldLight,
        0.22 + Math.random() * 0.35
      );
      this.tweens.add({
        targets: dot,
        y: dot.y - 28 - Math.random() * 60,
        alpha: 0,
        duration: 2600 + Math.random() * 5000,
        delay: Math.random() * 3000,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
  }

  drawSound() {
    const x = IS_PORTRAIT ? W - 86 : W - 90;
    const y = IS_PORTRAIT ? 52 : 74;
    this.soundLabel = label(this, x, y, audio.muted ? 'Sound · Off' : 'Sound · On', {
      size: IS_PORTRAIT ? 16 : 11,
      color: C.paperDim,
      family: F.serif,
      originX: 0.5,
      originY: 0.5,
      letterSpacing: 0.6
    }).setInteractive({ useHandCursor: true });
    const g = this.add.graphics();
    if (IS_PORTRAIT) {
      g.lineStyle(1, C.gold, 0.25).strokeRoundedRect(W - 176, 30, 152, 44, 22);
    } else {
      g.lineStyle(1, C.gold, 0.25).strokeRoundedRect(W - 162, 56, 144, 36, 18);
    }
    this.soundLabel.on('pointerover', () => this.soundLabel.setColor('#f0cd85'));
    this.soundLabel.on('pointerout', () => this.soundLabel.setColor('#cbbd9f'));
    this.soundLabel.on('pointerup', () => {
      const muted = audio.toggle();
      this.soundLabel.setText(muted ? 'Sound · Off' : 'Sound · On');
    });
  }

  primaryAction() {
    if (this.about) return;
    audio.click();
    if (this.allDone) {
      fadeTo(this, 'Map');
    } else if (this.hasProgress) {
      fadeTo(this, 'Story', { levelId: this.nextId });
    } else {
      fadeTo(this, 'Map');
    }
  }

  showAbout() {
    if (this.about) return;
    audio.click();
    this.about = this.add.container(0, 0).setDepth(500);
    const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x03090d, 0.84).setInteractive();

    if (IS_PORTRAIT) {
      const panelH = Math.min(1120, H - 160);
      const px = 40;
      const py = (H - panelH) / 2;
      const pw = W - 80;
      const p = panel(this, px, py, pw, panelH, { fill: 0x0d1b24, alpha: 0.98, borderAlpha: 0.44 });
      const inner = this.add.graphics();
      inner.lineStyle(1, C.gold, 0.14).strokeRect(px + 16, py + 16, pw - 32, panelH - 32);
      const kicker = label(this, px + 48, py + 48, 'ABOUT THE GAME', { size: 13, color: C.gold, family: F.display, letterSpacing: 3 });
      const title = label(this, px + 48, py + 76, 'The story is the riddle. The picture is the answer.', {
        size: 30, color: C.paper, family: F.serif, width: pw - 96, lineSpacing: 6
      });
      const body = label(this, px + 48, py + 164, 'Tales & Puzzles is a narrative puzzle game hidden inside great books and old legends. Each unit is a story. Each chapter is a picture and a secret.', {
        size: 26, color: C.paperDim, family: F.serif, width: pw - 96, lineSpacing: 8
      });
      const body2 = label(this, px + 48, py + 300, 'There are only two kinds of puzzles: find the differences between two paintings, or find the objects hidden in one. Click the scene. Move what is in the way. Trust your eyes.', {
        size: 26, color: C.paperDim, family: F.serif, width: pw - 96, lineSpacing: 8
      });
      const controls = label(this, px + 48, py + 450, 'SPOT THE DIFFERENCE   compare the two paintings\nHIDDEN OBJECTS   click the scene; move covers aside\nHINT   H key or the button below\nBACK   ESC or the top-left button', {
        size: 20, color: C.dim, family: F.serif, width: pw - 96, lineSpacing: 12
      });
      const rule = this.add.graphics();
      rule.lineStyle(1, C.gold, 0.14).beginPath().moveTo(px + 48, py + 580).lineTo(px + pw - 48, py + 580).strokePath();
      const unitKey = label(this, px + 48, py + 604, 'CURRENT UNIT', { size: 12, color: C.gold, family: F.serif, letterSpacing: 1.4 });
      const unitValue = label(this, px + 220, py + 600, 'The Odyssey · The Long Way Home (5 chapters)', { size: 18, color: C.paperDim, family: F.serif, width: pw - 270 });
      const nextKey = label(this, px + 48, py + 646, 'NEXT UNIT', { size: 12, color: C.gold, family: F.serif, letterSpacing: 1.4 });
      const nextValue = label(this, px + 220, py + 642, 'In the bindery · coming soon', { size: 18, color: C.dim, family: F.serif });
      const close = makeButton(this, W / 2, py + panelH - 92, 300, 76, 'Close the Book', {
        variant: 'ghost', size: 22, onClick: () => this.closeAbout()
      });
      const reset = label(this, px + 48, py + panelH - 92, 'Clear local progress', {
        size: 18, color: 0x8d6a5d, family: F.serif, originY: 0.5
      }).setInteractive({ useHandCursor: true });
      this.bindReset(reset);
      this.about.add([blocker, p, inner, kicker, title, body, body2, controls, rule, unitKey, unitValue, nextKey, nextValue, close, reset]);
      this.about.setAlpha(0);
      this.tweens.add({ targets: this.about, alpha: 1, duration: 220 });
      return;
    }

    const p = panel(this, 460, 156, 680, 588, { fill: 0x0d1b24, alpha: 0.98, borderAlpha: 0.44 });
    const inner = this.add.graphics();
    inner.lineStyle(1, C.gold, 0.14).strokeRect(478, 174, 644, 552);
    const kicker = label(this, 506, 204, 'ABOUT THE GAME', { size: 9, color: C.gold, family: F.display, letterSpacing: 3.2 });
    const title = label(this, 506, 230, 'The story is the riddle.', {
      size: 28, color: C.paper, family: F.serif, width: 582
    });
    const body = label(this, 506, 288, 'Tales & Puzzles is a narrative puzzle game hidden inside great books and old legends.\nEach unit is a story. Each chapter is a picture and a secret.', {
      size: 16, color: C.paperDim, width: 582, lineSpacing: 11
    });
    const body2 = label(this, 506, 376, 'There are only two kinds of puzzles: find the differences between two paintings, or find the objects hidden in one.\nClick the scene. Move what is in the way. Trust your eyes.', {
      size: 16, color: C.paperDim, width: 582, lineSpacing: 11
    });
    const controls = label(this, 506, 468, 'SPOT THE DIFFERENCE   compare the two paintings\nHIDDEN OBJECTS   click the scene; move covers aside\nHINT   H key or the button below\nBACK   ESC or the top-left button', {
      size: 13, color: C.dim, width: 582, lineSpacing: 10
    });
    const rule = this.add.graphics();
    rule.lineStyle(1, C.gold, 0.14).beginPath().moveTo(506, 560).lineTo(1088, 560).strokePath();
    const unitKey = label(this, 506, 578, 'CURRENT UNIT', { size: 9, color: C.gold, family: F.serif, letterSpacing: 1.4 });
    const unitValue = label(this, 620, 576, 'The Odyssey · The Long Way Home (5 chapters)', { size: 12, color: C.paperDim, family: F.serif });
    const nextKey = label(this, 506, 606, 'NEXT UNIT', { size: 9, color: C.gold, family: F.serif, letterSpacing: 1.4 });
    const nextValue = label(this, 620, 604, 'In the bindery · coming soon', { size: 12, color: C.dim, family: F.serif });
    const close = makeButton(this, 800, 690, 180, 46, 'Close the Book', {
      variant: 'ghost', size: 15, onClick: () => this.closeAbout()
    });
    const reset = label(this, 506, 706, 'Clear local progress', {
      size: 10, color: 0x8d6a5d, family: F.serif
    }).setInteractive({ useHandCursor: true });
    this.bindReset(reset);
    const closeHint = label(this, 1118, 706, 'ESC to close', {
      size: 10, color: C.dim, family: F.display, originX: 1, letterSpacing: 1
    });
    this.about.add([blocker, p, inner, kicker, title, body, body2, controls, rule, unitKey, unitValue, nextKey, nextValue, close, reset, closeHint]);
    this.about.setAlpha(0);
    this.tweens.add({ targets: this.about, alpha: 1, duration: 220 });
  }

  bindReset(reset) {
    let confirmReset = false;
    reset.on('pointerup', () => {
      if (!confirmReset) {
        confirmReset = true;
        reset.setText('Click again to clear progress').setColor('#d58b74');
      } else {
        save.reset();
        this.scene.restart();
      }
    });
  }

  closeAbout() {
    if (!this.about) return;
    const target = this.about;
    this.about = null;
    this.tweens.add({
      targets: target,
      alpha: 0,
      duration: 160,
      onComplete: () => target.destroy()
    });
  }
}
