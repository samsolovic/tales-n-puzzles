import { W, H } from '../core/viewport.js';

export { W, H };

export const C = {
  ink: 0x0b1720,
  inkSoft: 0x12242e,
  panel: 0x101f28,
  paper: 0xf2e5ca,
  paperDim: 0xcbbd9f,
  gold: 0xd5a85a,
  goldLight: 0xf0cd85,
  rust: 0xa34f3c,
  sea: 0x2b6871,
  seaLight: 0x6fa39a,
  white: 0xf7efdc,
  dim: 0x84908a
};

export const F = {
  serif: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
  display: 'Baskerville, "Iowan Old Style", "Palatino Linotype", Georgia, serif',
  sans: '"Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif'
};

export const hex = (n) => `#${n.toString(16).padStart(6, '0')}`;

export function label(scene, x, y, content, opts = {}) {
  const {
    size = 20,
    color = C.paper,
    family = F.serif,
    align = 'left',
    originX = 0,
    originY = 0,
    lineSpacing = 8,
    width = null,
    alpha = 1,
    letterSpacing = 0,
    shadow = false
  } = opts;
  const style = {
    fontFamily: family,
    fontSize: `${size}px`,
    color: hex(color),
    align,
    lineSpacing,
    ...(width ? { wordWrap: { width, useAdvancedWrap: true } } : {})
  };
  if (letterSpacing) style.letterSpacing = letterSpacing;
  if (shadow) {
    style.shadow = { offsetX: 0, offsetY: 3, color: '#000000', blur: 12, fill: true };
  }
  return scene.add.text(x, y, content, style).setOrigin(originX, originY).setAlpha(alpha);
}

export function panel(scene, x, y, w, h, opts = {}) {
  const {
    fill = C.panel,
    alpha = 0.9,
    border = C.gold,
    borderAlpha = 0.22,
    radius = 4
  } = opts;
  const g = scene.add.graphics();
  g.fillStyle(fill, alpha).fillRoundedRect(x, y, w, h, radius);
  if (border) {
    g.lineStyle(1, border, borderAlpha).strokeRoundedRect(x + 0.5, y + 0.5, w - 1, h - 1, radius);
  }
  return g;
}

export function cornerFrame(scene, x, y, w, h, opts = {}) {
  const { color = C.gold, alpha = 0.55, inset = 0, len = 24, width = 1.4 } = opts;
  const g = scene.add.graphics();
  g.lineStyle(width, color, alpha);
  const x1 = x + inset;
  const y1 = y + inset;
  const x2 = x + w - inset;
  const y2 = y + h - inset;
  g.beginPath();
  g.moveTo(x1, y1 + len); g.lineTo(x1, y1); g.lineTo(x1 + len, y1);
  g.moveTo(x2 - len, y1); g.lineTo(x2, y1); g.lineTo(x2, y1 + len);
  g.moveTo(x1, y2 - len); g.lineTo(x1, y2); g.lineTo(x1 + len, y2);
  g.moveTo(x2 - len, y2); g.lineTo(x2, y2); g.lineTo(x2, y2 - len);
  g.strokePath();
  return g;
}

export function ornament(scene, x, y, width, color = C.gold, alpha = 0.35) {
  const g = scene.add.graphics();
  g.lineStyle(1, color, alpha);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + width / 2 - 12, y);
  g.moveTo(x + width / 2 + 12, y);
  g.lineTo(x + width, y);
  g.strokePath();
  g.fillStyle(color, alpha).fillCircle(x + width / 2, y, 2.2);
  return g;
}

export function makeButton(scene, x, y, w, h, text, opts = {}) {
  const {
    variant = 'ghost',
    size = 18,
    onClick = () => {},
    disabled: initiallyDisabled = false,
    align = 'center',
    accent = C.gold
  } = opts;
  let disabled = initiallyDisabled;
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const t = label(scene, 0, 1, text, {
    size,
    color: variant === 'primary' ? C.ink : C.paper,
    align,
    originX: 0.5,
    originY: 0.5,
    family: F.serif
  });
  if (align === 'left') t.setX(-w / 2 + 22);
  if (align === 'right') t.setX(w / 2 - 22);
  const icon = scene.add.text(w / 2 - 24, 0, '→', {
    fontFamily: F.display,
    fontSize: `${size}px`,
    color: hex(variant === 'primary' ? C.ink : accent)
  }).setOrigin(0.5);
  if (align === 'left') icon.setX(w / 2 - 24);
  if (align === 'right') icon.setVisible(false);

  const draw = (hover = false, down = false) => {
    g.clear();
    const a = disabled ? 0.34 : 1;
    if (variant === 'primary') {
      g.fillStyle(accent, hover ? 0.96 : 0.88).fillRoundedRect(-w / 2, -h / 2, w, h, 2);
      g.lineStyle(1, C.goldLight, hover ? 0.85 : 0.45).strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 2);
    } else if (variant === 'solid') {
      g.fillStyle(C.panel, hover ? 0.96 : 0.82).fillRoundedRect(-w / 2, -h / 2, w, h, 2);
      g.lineStyle(1, C.gold, hover ? 0.55 : 0.25).strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 2);
    } else {
      g.fillStyle(C.paper, hover ? 0.07 : down ? 0.1 : 0.015).fillRoundedRect(-w / 2, -h / 2, w, h, 2);
      g.lineStyle(1, C.gold, hover ? 0.62 : 0.3).strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, 2);
    }
    c.setAlpha(a);
    c.setScale(down ? 0.985 : hover && !disabled ? 1.012 : 1);
  };
  draw(false);
  c.add([g, t, icon]);
  c.setSize(w, h);
  c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
  if (disabled) c.disableInteractive();
  c.on('pointerover', () => { if (!disabled) draw(true); });
  c.on('pointerout', () => draw(false));
  c.on('pointerdown', () => { if (!disabled) draw(true, true); });
  c.on('pointerup', () => {
    if (disabled) return;
    draw(true);
    onClick();
  });
  c.label = t;
  c.icon = icon;
  c.redraw = draw;
  c.setEnabled = (enabled) => {
    disabled = !enabled;
    if (enabled) {
      c.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
      c.setAlpha(1);
      c.redraw(false);
    } else {
      c.disableInteractive();
      c.setAlpha(0.34);
    }
  };
  return c;
}

export function progressPips(scene, x, y, total, current, opts = {}) {
  const { gap = 30, radius = 5, complete = C.gold, currentColor = C.goldLight, dim = 0x45555a } = opts;
  const g = scene.add.graphics();
  for (let i = 0; i < total; i += 1) {
    const px = x + i * gap;
    if (i < current) {
      g.fillStyle(complete, 0.95).fillCircle(px, y, radius);
    } else if (i === current) {
      g.lineStyle(1.5, currentColor, 0.9).strokeCircle(px, y, radius + 2);
      g.fillStyle(currentColor, 0.9).fillCircle(px, y, radius - 1);
    } else {
      g.lineStyle(1, dim, 0.7).strokeCircle(px, y, radius);
    }
  }
  return g;
}

export function toast(scene, message, opts = {}) {
  const { x = W / 2, y = H - 92, duration = 1800, color = C.paper } = opts;
  const container = scene.add.container(x, y).setDepth(200).setAlpha(0);
  const text = label(scene, 0, 0, message, {
    size: 16,
    color,
    originX: 0.5,
    originY: 0.5,
    align: 'center',
    family: F.serif
  });
  const width = Math.max(180, text.width + 46);
  const g = scene.add.graphics();
  g.fillStyle(C.ink, 0.88).fillRoundedRect(-width / 2, -22, width, 44, 22);
  g.lineStyle(1, C.gold, 0.36).strokeRoundedRect(-width / 2 + 0.5, -21.5, width - 1, 43, 22);
  container.add([g, text]);
  scene.tweens.add({
    targets: container,
    alpha: 1,
    y: y - 8,
    duration: 220,
    ease: 'Quad.out',
    hold: duration,
    yoyo: true,
    onComplete: () => container.destroy()
  });
  return container;
}

export function panelLabel(scene, x, y, num, title, subtitle = '') {
  label(scene, x, y, num, { size: 11, color: C.gold, family: F.display, letterSpacing: 2 });
  label(scene, x, y + 20, title, { size: 24, color: C.paper });
  if (subtitle) label(scene, x, y + 54, subtitle, { size: 12, color: C.dim, family: F.serif });
}

export function wrapText(value, maxChars) {
  return String(value).split('\n').map((paragraph) => {
    const words = paragraph.trim().split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.join('\n');
  }).join('\n');
}


export function fadeTo(scene, key, data = {}, opts = {}) {
  const { duration = 380, color = [11, 23, 32] } = opts;
  if (scene.transitioning) return;
  if (!scene.__fadeGuardBound) {
    scene.__fadeGuardBound = true;
    scene.events.on('shutdown', () => {
      scene.transitioning = false;
    });
  }
  scene.transitioning = true;
  scene.cameras.main.fadeOut(duration, ...color);
  scene.cameras.main.once('camerafadeoutcomplete', () => {
    scene.scene.start(key, data);
  });
}

export function fadeIn(scene, duration = 500, color = [11, 23, 32]) {
  scene.cameras.main.fadeIn(duration, ...color);
}
