import { C, F, W, H, label, panel } from './theme.js';
import { audio } from '../core/audio.js';
import { monetization } from '../core/monetization.js';

export function showAdCurtain(scene, heading = 'ADVERTISEMENT') {
  const overlay = scene.add.container(0, 0).setDepth(2000);
  const blocker = scene.add.rectangle(W / 2, H / 2, W, H, 0x03090d, 0.94).setInteractive();
  const line = scene.add.graphics();
  line.lineStyle(1, C.gold, 0.25);
  const lineWidth = Math.min(W - 120, 420);
  line.beginPath();
  line.moveTo(W / 2 - lineWidth / 2, H / 2 + 62);
  line.lineTo(W / 2 + lineWidth / 2, H / 2 + 62);
  line.strokePath();
  const kicker = label(scene, W / 2, H / 2 - 26, heading, {
    size: 14, color: C.gold, family: F.display, originX: 0.5, originY: 0.5, letterSpacing: 3.2
  });
  const sub = label(scene, W / 2, H / 2 + 20, monetization.usingMock ? 'Local simulated ad · game paused' : 'Your game is paused', {
    size: 12, color: C.dim, family: F.serif, originX: 0.5, originY: 0.5, align: 'center', width: W - 120
  });
  overlay.add([blocker, line, kicker, sub]);
  return {
    close() {
      overlay.destroy(true);
    }
  };
}

export async function runCommercialBreak(scene, reason = 'chapter_boundary') {
  if (!monetization.isAvailable() || monetization.isBusy()) return false;
  monetization.gameplayStop();
  audio.setAdPaused(true);
  const curtain = showAdCurtain(scene, monetization.usingMock ? 'SIMULATED AD BREAK' : 'ADVERTISEMENT');
  try {
    return await monetization.commercialBreak(reason);
  } finally {
    audio.setAdPaused(false);
    curtain.close();
  }
}

export async function runRewardedBreak(scene, reason = 'extra_hints') {
  if (!monetization.isAvailable() || monetization.isBusy()) return false;
  monetization.gameplayStop();
  audio.setAdPaused(true);
  const curtain = showAdCurtain(scene, monetization.usingMock ? 'SIMULATED REWARDED AD' : 'REWARDED VIDEO');
  try {
    return await monetization.rewardedBreak(reason);
  } finally {
    audio.setAdPaused(false);
    curtain.close();
  }
}

export function adButtonMark(button) {
  if (!button || !button.icon) return;
  button.icon.setVisible(false);
}
