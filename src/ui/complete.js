import { C, F, W, H, label, makeButton, panel, ornament } from './theme.js';
import { audio } from '../core/audio.js';
import { IS_PORTRAIT } from '../core/viewport.js';

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function showComplete(scene, opts) {
  const {
    level, hints = 0, wrong = 0, elapsed = 0, isFinal = false, onNext, onMap
  } = opts;
  if (scene.completeOverlay) return;
  audio.complete();

  const overlay = scene.add.container(0, 0).setDepth(600);
  scene.completeOverlay = overlay;
  const blocker = scene.add.rectangle(W / 2, H / 2, W, H, 0x03090d, 0.84).setInteractive();
  const stars = Math.max(1, 3 - (hints > 0 ? 1 : 0) - (wrong > 4 ? 1 : 0));
  const close = () => {
    scene.completeOverlay = null;
    overlay.destroy();
  };

  if (IS_PORTRAIT) {
    const panelW = W - 80;
    const panelH = Math.min(1120, H - 160);
    const px = 40;
    const py = (H - panelH) / 2;
    const p = panel(scene, px, py, panelW, panelH, { fill: 0x0c1a22, alpha: 0.985, border: C.gold, borderAlpha: 0.46 });
    const inner = scene.add.graphics();
    inner.lineStyle(1, C.gold, 0.14).strokeRect(px + 16, py + 16, panelW - 32, panelH - 32);
    inner.fillStyle(C.gold, 0.06).fillCircle(W / 2, py + panelH * 0.24, 230);
    inner.fillStyle(C.gold, 0.03).fillCircle(W / 2, py + panelH * 0.24, 320);
    const rays = scene.add.graphics();
    rays.lineStyle(1, C.gold, 0.12);
    const cx = W / 2;
    const cy = py + panelH * 0.2;
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      rays.beginPath();
      rays.moveTo(cx + Math.cos(angle) * 90, cy + Math.sin(angle) * 90);
      rays.lineTo(cx + Math.cos(angle) * 210, cy + Math.sin(angle) * 210);
      rays.strokePath();
    }

    const kicker = label(scene, cx, py + panelH * 0.06, 'MYSTERY SOLVED', {
      size: 16, color: C.gold, family: F.display, originX: 0.5, letterSpacing: 3
    });
    const title = label(scene, cx, py + panelH * 0.1, level.reward.title, {
      size: 52, color: C.paper, family: F.serif, originX: 0.5
    });
    const chapter = label(scene, cx, py + panelH * 0.185, `Chapter ${level.number} · ${level.title}`, {
      size: 18, color: C.dim, family: F.serif, originX: 0.5
    });
    const orn = ornament(scene, cx - 150, py + panelH * 0.225, 300, C.gold, 0.4);
    const starLabel = label(scene, cx, py + panelH * 0.26, `${'✦  '.repeat(stars)}${'✧  '.repeat(3 - stars)}`, {
      size: 34, color: C.goldLight, family: F.display, originX: 0.5, originY: 0.5, letterSpacing: 3
    });
    const reward = label(scene, cx, py + panelH * 0.31, level.reward.text, {
      size: 22, color: 0xd9ccb1, family: F.serif, originX: 0.5, originY: 0, align: 'center', width: panelW - 120, lineSpacing: 8
    });

    const statY = py + panelH * 0.6;
    const stats = [
      { x: cx - 220, label: 'HINTS', value: String(hints) },
      { x: cx, label: 'MISSES', value: String(wrong) },
      { x: cx + 220, label: 'TIME', value: formatTime(elapsed) }
    ].map((item) => {
      const k = label(scene, item.x, statY, item.label, {
        size: 15, color: C.dim, family: F.serif, originX: 0.5, originY: 0.5, letterSpacing: 1.2
      });
      const v = label(scene, item.x, statY + 28, item.value, {
        size: 26, color: C.paper, family: F.serif, originX: 0.5, originY: 0.5
      });
      return [k, v];
    }).flat();
    const sep1 = scene.add.rectangle(cx - 110, statY + 14, 1, 26, C.gold, 0.2);
    const sep2 = scene.add.rectangle(cx + 110, statY + 14, 1, 26, C.gold, 0.2);
    const next = makeButton(scene, cx, py + panelH * 0.74, 380, 86, isFinal ? 'Read the Epilogue' : 'Continue Journey', {
      variant: 'primary', size: 24, onClick: () => {
        audio.click();
        close();
        onNext();
      }
    });
    const map = makeButton(scene, cx, py + panelH * 0.85, 380, 76, 'Back to Chapter Map', {
      variant: 'ghost', size: 20, onClick: () => {
        audio.click();
        close();
        onMap();
      }
    });
    overlay.add([blocker, p, inner, rays, kicker, title, chapter, orn, starLabel, reward, sep1, sep2, ...stats, next, map]);
    overlay.setAlpha(0);
    scene.tweens.add({ targets: overlay, alpha: 1, duration: 260 });
    addSparks(scene, overlay, cx, py + panelH * 0.3, 22);
    return;
  }

  const p = panel(scene, 400, 178, 800, 544, { fill: 0x0c1a22, alpha: 0.985, border: C.gold, borderAlpha: 0.46 });
  const inner = scene.add.graphics();
  inner.lineStyle(1, C.gold, 0.14).strokeRect(416, 194, 768, 512);
  inner.fillStyle(C.gold, 0.07).fillCircle(800, 356, 220);
  inner.fillStyle(C.gold, 0.035).fillCircle(800, 356, 300);
  const rays = scene.add.graphics();
  rays.lineStyle(1, C.gold, 0.14);
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    rays.beginPath();
    rays.moveTo(800 + Math.cos(angle) * 120, 316 + Math.sin(angle) * 120);
    rays.lineTo(800 + Math.cos(angle) * 245, 316 + Math.sin(angle) * 245);
    rays.strokePath();
  }

  const kicker = label(scene, 800, 216, 'MYSTERY SOLVED', {
    size: 9, color: C.gold, family: F.display, originX: 0.5, letterSpacing: 4
  });
  const title = label(scene, 800, 242, level.reward.title, {
    size: 46, color: C.paper, family: F.serif, originX: 0.5
  });
  const chapter = label(scene, 800, 300, `Chapter ${level.number} · ${level.title}`, {
    size: 11, color: C.dim, family: F.serif, originX: 0.5, letterSpacing: 0.7
  });
  const orn = ornament(scene, 640, 326, 320, C.gold, 0.4);
  const starLabel = label(scene, 800, 372, `${'✦  '.repeat(stars)}${'✧  '.repeat(3 - stars)}`, {
    size: 23, color: C.goldLight, family: F.display, originX: 0.5, originY: 0.5, letterSpacing: 3
  });
  const reward = label(scene, 800, 426, level.reward.text, {
    size: 16, color: 0xd9ccb1, family: F.serif, originX: 0.5, align: 'center', width: 640, lineSpacing: 8
  });
  const statY = 526;
  const statHints = label(scene, 610, statY, `Hints  ${hints}`, {
    size: 12, color: C.dim, family: F.serif, originX: 0.5, originY: 0.5
  });
  const statWrong = label(scene, 800, statY, `Misses  ${wrong}`, {
    size: 12, color: C.dim, family: F.serif, originX: 0.5, originY: 0.5
  });
  const statTime = label(scene, 990, statY, `Time  ${formatTime(elapsed)}`, {
    size: 12, color: C.dim, family: F.serif, originX: 0.5, originY: 0.5
  });
  const sep1 = scene.add.rectangle(700, statY, 1, 16, C.gold, 0.2);
  const sep2 = scene.add.rectangle(900, statY, 1, 16, C.gold, 0.2);
  const next = makeButton(scene, 800, 606, 238, 52, isFinal ? 'Read the Epilogue' : 'Continue Journey', {
    variant: 'primary', size: 16, onClick: () => {
      audio.click();
      close();
      onNext();
    }
  });
  const map = makeButton(scene, 800, 668, 238, 40, 'Back to Chapter Map', {
    variant: 'ghost', size: 12, onClick: () => {
      audio.click();
      close();
      onMap();
    }
  });
  overlay.add([
    blocker, p, inner, rays, kicker, title, chapter, orn, starLabel, reward,
    sep1, sep2, statHints, statWrong, statTime, next, map
  ]);
  overlay.setAlpha(0);
  scene.tweens.add({ targets: overlay, alpha: 1, duration: 260 });
  addSparks(scene, overlay, 800, 340, 18);
}

function addSparks(scene, overlay, cx, cy, count) {
  for (let i = 0; i < count; i += 1) {
    const spark = scene.add.circle(cx + (Math.random() - 0.5) * 500, cy + (Math.random() - 0.5) * 220, Math.random() * 1.8 + 0.6, C.goldLight, 0.8);
    overlay.add(spark);
    scene.tweens.add({
      targets: spark,
      x: spark.x + (Math.random() - 0.5) * 180,
      y: spark.y + 80 + Math.random() * 160,
      alpha: 0,
      duration: 1400 + Math.random() * 1400,
      delay: 250 + Math.random() * 500,
      ease: 'Cubic.out'
    });
  }
}
