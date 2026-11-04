import { C, F, W, H, label, makeButton, panel, toast } from './theme.js';
import { IS_PORTRAIT } from '../core/viewport.js';
import { audio } from '../core/audio.js';
import { monetization } from '../core/monetization.js';
import { runRewardedBreak } from './adBreak.js';

export function showHintShop(scene, { onReward, onClose } = {}) {
  if (scene.hintShop) return scene.hintShop;
  monetization.gameplayStop();

  const overlay = scene.add.container(0, 0).setDepth(1400);
  const blocker = scene.add.rectangle(W / 2, H / 2, W, H, 0x03090d, 0.86).setInteractive();
  let busy = false;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    scene.hintShop = null;
    overlay.destroy(true);
    if (!scene.finished && !scene.completeOverlay) monetization.gameplayStart();
    if (onClose) onClose();
  };

  let panelX;
  let panelY;
  let panelW;
  let panelH;
  let titleY;
  let bodyY;
  let standardY;
  let rewardY;
  let footnoteY;
  let buttonW;
  let standardH;
  let rewardH;
  let titleSize;
  let bodySize;
  let buttonSize;

  if (IS_PORTRAIT) {
    panelW = W - 80;
    panelH = Math.min(680, H - 180);
    panelX = 40;
    panelY = (H - panelH) / 2;
    titleSize = 44;
    bodySize = 24;
    buttonSize = 27;
    buttonW = W - 160;
    standardH = 94;
    rewardH = 88;
    titleY = panelY + 66;
    bodyY = panelY + 128;
    standardY = panelY + panelH - 232;
    rewardY = panelY + panelH - 126;
    footnoteY = panelY + panelH - 40;
  } else {
    panelW = 760;
    panelH = 508;
    panelX = (W - panelW) / 2;
    panelY = (H - panelH) / 2;
    titleSize = 40;
    bodySize = 18;
    buttonSize = 18;
    buttonW = 520;
    standardH = 58;
    rewardH = 54;
    titleY = panelY + 62;
    bodyY = panelY + 118;
    standardY = panelY + 300;
    rewardY = panelY + 376;
    footnoteY = panelY + 436;
  }

  const p = panel(scene, panelX, panelY, panelW, panelH, {
    fill: 0x0c1a22, alpha: 0.985, border: C.gold, borderAlpha: 0.45
  });
  const inner = scene.add.graphics();
  inner.lineStyle(1, C.gold, 0.14).strokeRect(panelX + 16, panelY + 16, panelW - 32, panelH - 32);

  const kicker = label(scene, W / 2, panelY + 30, 'HINTS', {
    size: IS_PORTRAIT ? 14 : 9,
    color: C.gold,
    family: F.display,
    originX: 0.5,
    letterSpacing: 3
  });
  const title = label(scene, W / 2, titleY, 'Out of hints', {
    size: titleSize,
    color: C.paper,
    family: F.serif,
    originX: 0.5
  });
  const body = label(scene, W / 2, bodyY,
    'You have used all three hints in this chapter. Watch one short video for three more hints — or keep looking.',
    {
      size: bodySize,
      color: C.paperDim,
      family: F.serif,
      originX: 0.5,
      align: 'center',
      width: IS_PORTRAIT ? W - 120 : 620,
      lineSpacing: IS_PORTRAIT ? 8 : 6
    }
  );

  const standard = makeButton(scene, W / 2, standardY, buttonW, standardH, 'Keep Looking', {
    variant: 'primary',
    size: buttonSize,
    onClick: () => {
      if (busy) return;
      audio.click();
      close();
    }
  });

  const reward = makeButton(scene, W / 2, rewardY, buttonW, rewardH, 'Watch video · +3 hints', {
    variant: 'ghost',
    size: buttonSize - 1,
    onClick: async () => {
      if (busy || monetization.isBusy()) return;
      busy = true;
      audio.click();
      standard.setEnabled(false);
      reward.setEnabled(false);
      const success = await runRewardedBreak(scene, 'extra_hints');
      if (success) {
        audio.correct();
        if (onReward) onReward();
        toast(scene, '+3 hints added', { y: IS_PORTRAIT ? H - 220 : 714 });
      } else {
        toast(scene, 'No reward this time. Keep looking.', { y: IS_PORTRAIT ? H - 220 : 714 });
      }
      close();
    }
  });
  reward.icon.setVisible(false);
  const playBg = scene.add.circle(-buttonW / 2 + 38, 0, IS_PORTRAIT ? 17 : 14, C.goldLight, 1);
  const play = scene.add.text(-buttonW / 2 + 39, 0, '▶', {
    fontFamily: F.sans,
    fontSize: IS_PORTRAIT ? '17px' : '13px',
    color: '#0b1720'
  }).setOrigin(0.5);
  reward.add([playBg, play]);

  const footnote = label(scene, W / 2, footnoteY,
    'Rewarded video is optional. Hints are never required to finish a puzzle.',
    {
      size: IS_PORTRAIT ? 13 : 10,
      color: C.dim,
      family: F.serif,
      originX: 0.5,
      align: 'center',
      width: IS_PORTRAIT ? W - 120 : 620
    }
  );

  overlay.add([blocker, p, inner, kicker, title, body, standard, reward, footnote]);
  overlay.setAlpha(0);
  scene.tweens.add({ targets: overlay, alpha: 1, duration: 180 });

  scene.hintShop = { close };
  return scene.hintShop;
}
