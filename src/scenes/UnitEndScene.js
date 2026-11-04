import Phaser from '../vendor-shim.js';
import { C, F, W, H, label, makeButton, panel, ornament, fadeTo, fadeIn } from '../ui/theme.js';
import { odyssey, unitLevelIds } from '../data/odyssey.js';
import { save } from '../core/save.js';
import { audio } from '../core/audio.js';
import { IS_PORTRAIT } from '../core/viewport.js';

function duration(ms) {
  if (!ms || ms < 0) return '—';
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export class UnitEndScene extends Phaser.Scene {
  constructor() {
    super('UnitEnd');
  }

  create() {
    this.transitioning = false;
    this.drawBackground();
    const data = save.get();
    this.complete = unitLevelIds.every((id) => data.completed.includes(id));
    this.data_ = data;
    if (IS_PORTRAIT) this.drawPortrait();
    else this.drawLandscape();
    this.drawDust();
    fadeIn(this, 800);
    audio.complete();
    this.input.keyboard.on('keydown-ESC', () => fadeTo(this, 'Title'));
  }

  drawBackground() {
    const scale = Math.max(W / 1600, H / 900);
    const img = this.add.image(W / 2, H / 2, 'title-hero').setOrigin(0.5, 0.5);
    img.setDisplaySize(1600 * scale, 900 * scale);
    const shade = this.add.graphics();
    shade.fillGradientStyle(0x050d12, 0x050d12, 0x07141b, 0x07141b, 0.95, 0.95, 0.99, 0.99);
    shade.fillRect(0, 0, W, H);
    const edge = this.add.graphics();
    edge.lineStyle(1, C.gold, 0.22).strokeRect(22, 22, W - 44, H - 44);
    edge.lineStyle(2, C.gold, 0.45);
    edge.beginPath();
    edge.moveTo(22, 96); edge.lineTo(22, 22); edge.lineTo(96, 22);
    edge.moveTo(W - 96, 22); edge.lineTo(W - 22, 22); edge.lineTo(W - 22, 96);
    edge.moveTo(22, H - 96); edge.lineTo(22, H - 22); edge.lineTo(96, H - 22);
    edge.moveTo(W - 96, H - 22); edge.lineTo(W - 22, H - 22); edge.lineTo(W - 22, H - 96);
    edge.strokePath();
  }

  drawLandscape() {
    const data = this.data_;
    const totalHints = data.hints;
    const totalWrong = data.wrong;
    const totalTime = data.startedAt && data.completedAt ? duration(data.completedAt - data.startedAt) : '—';
    label(this, 800, 112, 'THE END OF UNIT I', {
      size: 9, color: C.gold, family: F.display, originX: 0.5, letterSpacing: 4
    });
    label(this, 800, 146, 'HOME', {
      size: 82, color: C.paper, family: F.serif, originX: 0.5, shadow: true
    });
    label(this, 800, 242, 'The Odyssey · Unit I complete', {
      size: 13, color: C.paperDim, family: F.serif, originX: 0.5, letterSpacing: 1.4
    });
    ornament(this, 650, 276, 300, C.gold, 0.4);
    const paragraph = this.complete
      ? 'Storms, giants, witches and songs are behind you. The hall of Ithaca is lit again, and the next story is still waiting in the binding.'
      : 'Some chapters remain. Return to the map and finish the voyage.';
    label(this, 800, 310, paragraph, {
      size: 16, color: 0xd9ccb1, family: F.serif, originX: 0.5, align: 'center', width: 720, lineSpacing: 10
    });
    panel(this, 420, 386, 760, 92, { fill: 0x0a171e, alpha: 0.72, borderAlpha: 0.22 });
    const col = [560, 800, 1040];
    label(this, col[0], 410, 'TOTAL TIME', { size: 9, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.4 });
    label(this, col[0], 432, totalTime, { size: 16, color: C.paper, family: F.serif, originX: 0.5 });
    label(this, col[1], 410, 'HINTS & MISSES', { size: 9, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.4 });
    label(this, col[1], 432, `${totalHints} hints · ${totalWrong} misses`, { size: 16, color: C.paper, family: F.serif, originX: 0.5 });
    label(this, col[2], 410, 'CLUES FOUND', { size: 9, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.4 });
    label(this, col[2], 432, `${data.findings}`, { size: 16, color: C.paper, family: F.serif, originX: 0.5 });
    label(this, 800, 518, odyssey.epigraph, {
      size: 17, color: 0xe4cfa8, family: F.serif, originX: 0.5
    }).setFontStyle('italic');
    label(this, 800, 548, '— UNIT EPIGRAPH', {
      size: 9, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.2
    });
    this.drawChapterStrip(620);
    makeButton(this, 640, 748, 250, 50, 'Sail this Unit Again', {
      variant: 'ghost', size: 15, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    makeButton(this, 960, 748, 250, 50, 'Back to Title', {
      variant: 'primary', size: 15, onClick: () => { audio.click(); fadeTo(this, 'Title'); }
    });
    label(this, 800, 820, 'NEXT UNIT · IN THE BINDERY', {
      size: 10, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 2
    });
    label(this, 800, 854, 'TALES & PUZZLES · ORIGINAL ILLUSTRATIONS · PHASER 3', {
      size: 8, color: 0x5e6a66, family: F.display, originX: 0.5, letterSpacing: 1.8
    });
  }

  drawPortrait() {
    const data = this.data_;
    const compact = H < 1400;
    const totalTime = data.startedAt && data.completedAt ? duration(data.completedAt - data.startedAt) : '—';
    label(this, W / 2, H * 0.075, 'THE END OF UNIT I', {
      size: compact ? 13 : 15, color: C.gold, family: F.display, originX: 0.5, letterSpacing: 3.2
    });
    label(this, W / 2, H * 0.1, 'HOME', {
      size: compact ? 84 : 108, color: C.paper, family: F.serif, originX: 0.5, shadow: true
    });
    label(this, W / 2, H * (compact ? 0.19 : 0.175), 'The Odyssey · Unit I complete', {
      size: compact ? 20 : 24, color: C.paperDim, family: F.serif, originX: 0.5, letterSpacing: 1
    });
    ornament(this, W / 2 - 160, H * (compact ? 0.215 : 0.2), 320, C.gold, 0.4);
    const paragraph = this.complete
      ? 'Storms, giants, witches and songs are behind you. The hall of Ithaca is lit again, and the next story is still waiting in the binding.'
      : 'Some chapters remain. Return to the map and finish the voyage.';
    label(this, W / 2, H * (compact ? 0.25 : 0.225), paragraph, {
      size: compact ? 24 : 28, color: 0xd9ccb1, family: F.serif, originX: 0.5, align: 'center', width: W - 100, lineSpacing: compact ? 7 : 10
    });

    const statsY = H * (compact ? 0.35 : 0.325);
    panel(this, 40, statsY, W - 80, 130, { fill: 0x0a171e, alpha: 0.72, borderAlpha: 0.22 });
    const col = [W * 0.22, W * 0.5, W * 0.78];
    const sy = statsY + 36;
    label(this, col[0], sy, 'TOTAL TIME', { size: 18, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.2 });
    label(this, col[0], sy + 34, totalTime, { size: 30, color: C.paper, family: F.serif, originX: 0.5 });
    label(this, col[1], sy, 'HINTS & MISSES', { size: 18, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.2 });
    label(this, col[1], sy + 34, `${data.hints} · ${data.wrong}`, { size: 30, color: C.paper, family: F.serif, originX: 0.5 });
    label(this, col[2], sy, 'CLUES FOUND', { size: 18, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.2 });
    label(this, col[2], sy + 34, `${data.findings}`, { size: 30, color: C.paper, family: F.serif, originX: 0.5 });

    const quoteY = H * (compact ? 0.48 : 0.47);
    label(this, W / 2, quoteY, odyssey.epigraph, {
      size: compact ? 22 : 26, color: 0xe4cfa8, family: F.serif, originX: 0.5, align: 'center', width: W - 120
    }).setFontStyle('italic');
    label(this, W / 2, compact ? quoteY + 40 : H * 0.505, '— UNIT EPIGRAPH', {
      size: 14, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 1.2
    });
    this.drawChapterStrip(H * (compact ? 0.53 : 0.55));
    makeButton(this, W / 2, H * (compact ? 0.7 : 0.68), W - 160, compact ? 84 : 96, 'Sail this Unit Again', {
      variant: 'ghost', size: compact ? 24 : 28, onClick: () => { audio.click(); fadeTo(this, 'Map'); }
    });
    makeButton(this, W / 2, H * (compact ? 0.79 : 0.78), W - 160, compact ? 84 : 96, 'Back to Title', {
      variant: 'primary', size: compact ? 24 : 28, onClick: () => { audio.click(); fadeTo(this, 'Title'); }
    });
    label(this, W / 2, H * 0.87, 'NEXT UNIT · IN THE BINDERY', {
      size: 18, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 2
    });
    label(this, W / 2, H * 0.93, 'TALES & PUZZLES · ORIGINAL ILLUSTRATIONS · PHASER 3', {
      size: 12, color: 0x5e6a66, family: F.display, originX: 0.5, letterSpacing: 1.2
    });
  }

  drawChapterStrip(y) {
    const data = this.data_;
    if (IS_PORTRAIT) {
      label(this, 40, y, 'FIVE CHAPTERS', {
        size: 15, color: C.gold, family: F.display, letterSpacing: 2.2
      });
      this.add.graphics().lineStyle(1, C.gold, 0.16)
        .beginPath().moveTo(240, y + 10).lineTo(W - 40, y + 10).strokePath();
      odyssey.levels.forEach((level, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 40 + col * 410;
        const yy = y + 38 + row * 40;
        const done = data.completed.includes(level.id);
        const g = this.add.graphics();
        g.fillStyle(done ? C.gold : 0x1a2b2f, done ? 0.9 : 0.8).fillCircle(x + 12, yy + 10, 10);
        g.lineStyle(1, done ? C.goldLight : 0x5b6765, 0.8).strokeCircle(x + 12, yy + 10, 14);
        if (done) label(this, x + 12, yy + 10, '✓', { size: 9, color: C.ink, family: F.sans, originX: 0.5, originY: 0.5 });
        label(this, x + 36, yy, `${level.roman}  ${level.title}`, {
          size: 18, color: done ? C.paperDim : 0x707a74, family: F.serif
        });
      });
      return;
    }
    const gap = 124;
    const start = W / 2 - ((odyssey.levels.length - 1) * gap) / 2;
    odyssey.levels.forEach((level, index) => {
      const x = start + index * gap;
      const done = data.completed.includes(level.id);
      const g = this.add.graphics();
      g.fillStyle(done ? C.gold : 0x1a2b2f, done ? 0.9 : 0.8).fillCircle(x, y, 10);
      g.lineStyle(1, done ? C.goldLight : 0x5b6765, 0.8).strokeCircle(x, y, 14);
      if (done) label(this, x, y, '✓', { size: 8, color: C.ink, family: F.sans, originX: 0.5, originY: 0.5 });
      label(this, x, y + 28, level.roman, { size: 9, color: done ? C.gold : C.dim, family: F.display, originX: 0.5 });
      label(this, x, y + 44, level.title, { size: 9, color: done ? C.paperDim : 0x5e6864, family: F.serif, originX: 0.5 });
      if (index < odyssey.levels.length - 1) {
        this.add.graphics().lineStyle(1, done ? C.gold : 0x394b4b, done ? 0.45 : 0.35)
          .beginPath().moveTo(x + 16, y).lineTo(x + gap - 16, y).strokePath();
      }
    });
  }

  drawDust() {
    for (let i = 0; i < 26; i += 1) {
      const dot = this.add.circle(
        W * 0.2 + Math.random() * W * 0.6,
        H * 0.12 + Math.random() * H * 0.7,
        Math.random() * 1.7 + 0.5,
        C.goldLight,
        0.25
      );
      this.tweens.add({
        targets: dot,
        y: dot.y - 40 - Math.random() * 80,
        alpha: 0,
        duration: 3500 + Math.random() * 4500,
        delay: Math.random() * 2500,
        repeat: -1
      });
    }
  }
}
