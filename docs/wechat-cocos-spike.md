# WeChat Mini Game — Cocos Validation Spike

Project name: **故事有谜**  
First release: **故事有谜·山海拾遗**

## Short answer

You do **not** need a registered Mini Game AppID or a completed filing to start the Cocos validation spike.

WeChat DevTools provides a **test account** ("测试号"). It supports local development, device preview and most APIs; it cannot verify monetization or upload/release. Use it for the first Cocos build.

Start account registration and filing in parallel, not as a blocker.

## Required tools

1. **Cocos Creator 3.8 LTS** (or current 3.8.x)
   - https://www.cocos.com/creator-download
2. **WeChat DevTools — Stable**
   - https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
3. A free Cocos account for the Dashboard.

Cocos Creator and WeChat DevTools are free. There is no activation code for the validation spike.

## What the test account can do

Official WeChat docs describe the test account as usable before AppID registration. It supports normal development and preview; it cannot validate commercial capabilities or upload/release.

Reference:
- https://developers.weixin.qq.com/minigame/dev/guide/develop/start.md

## Start in parallel

Create the Mini Game account and reserve the name as soon as possible:

- Registration: https://mp.weixin.qq.com/wxopen/waregister?action=step1
- Choose the **game** category; after choosing a game category the account becomes a Mini Game account.
- Prefer the **casual** category. Do not choose **文化互动** unless you are certain: it is irreversible, has restrictions, and is not available to individual subjects.
- For the first version use **IAA (ad-only) / no virtual payment**. This avoids payment qualifications and the version-number path, but **Mini Game filing and Mini Program filing are still required**.
- If the game name contains English, WeChat may request a software copyright certificate. Keep the Mini Game name pure Chinese.

References:
- Registration flow: https://developers.weixin.qq.com/minigame/introduction/guide/register.html
- Categories: https://developers.weixin.qq.com/minigame/introduction/guide/type.html
- IAA guide: https://developers.weixin.qq.com/minigame/introduction/guide/iaa.html
- IAA qualification: https://developers.weixin.qq.com/minigame/introduction/guide/zzsh-iaa.html
- Mini Game filing: https://developers.weixin.qq.com/minigame/introduction/guide/nrjs.html

Filing is slow: platform review is typically 1–2 working days, and the authority review is typically 10–20 working days. Budget 1–2 months overall.

## Cocos spike scope

Use a separate project folder, not the existing Phaser app.

Suggested path:

```text
wechat-minigame/
  assets/
    scenes/Spike.scene
    scripts/SpikeController.ts
    textures/
  settings/
  package.json
```

Validation scene:

- Portrait 750 × 1334 design resolution; safe-area aware
- One background image (a converted lotus or cyclops scene is fine)
- One tappable difference / hidden object
- Correct tap: toast + counter
- Wrong tap: small shake / toast
- Chinese heading: `故事有谜` / `山海拾遗`
- Save a flag with `wx.setStorageSync` and read it back
- One simple sound effect, optional
- Build target: WeChat Mini Game
- Import the generated `build/wechatgame` folder into WeChat DevTools
- Use the test account AppID, then scan the preview QR code

Do not add ads, sharing, cloud save or the full story yet.

## Success criteria

- Build opens in WeChat DevTools without errors
- Preview QR opens on at least one iPhone and one Android phone
- Touch hit detection is accurate on both
- Chinese text is legible; no missing glyph boxes
- Storage write/read survives a relaunch
- Main package is under 4 MB; total package under 30 MB
- No obvious frame drops on a mid-range Android phone
- No dependency on the Poki SDK

## After the spike

1. Register the real AppID and enter it in Cocos build settings.
2. Start the IAA qualification and Mini Game filing.
3. Build one full chapter: three story pages + one puzzle.
4. Add the WeChat reward-ad adapter and test with a real ad unit only after Traffic Master is available.
5. Then expand to five chapters.

## Current machine status

Cocos Creator and WeChat DevTools are not installed in this workspace yet. Install both before creating the Cocos project.
