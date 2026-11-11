# WeChat Mini Game — Cocos Validation Spike

Project name: **解谜涨知识**  
First release: **解谜涨知识之山海经**

![Cocos WeChat validation spike](wechat-cocos-spike.png)

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

Actual path:

```text
wechat-minigame/
  assets/
    resources/spike.jpg
    scenes/Spike.scene
    scripts/SpikeController.ts
  settings/
  package.json
```

Validation scene:

- Portrait 750 × 1334 design resolution; safe-area aware
- One background image (a converted lotus or cyclops scene is fine)
- One tappable difference / hidden object
- Correct tap: toast + counter
- Wrong tap: small shake / toast
- Chinese heading: `解谜涨知识` / `之 · 山海经`
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

Installed and verified:

- Cocos Creator **3.8.8** at `/Applications/Cocos/Creator/3.8.8`
- WeChat DevTools at `/Applications/wechatwebdevtools.app`
- Cocos project: `wechat-minigame/`
- WeChat build: `wechat-minigame/build/wechatgame/`
- Cocos AppID set to `wx9f31155e9d70c411`
- 2D-only engine trim: **3.5 MB** main package

Validation performed:

- Cocos web-mobile build runs at 390 × 844
- Chinese title and body render correctly
- Clean lotus artwork loads from the `resources` bundle
- Eye target receives touch and updates the status label
- `sys.localStorage` survives the write; value is `found`
- No missing-class or runtime errors after the scene class ID fix

Real-device run (Android, WeChat base library 3.18.0):

- Cocos Creator 3.8.8 launched successfully
- Scene loaded: `db://assets/scenes/Spike.scene`
- Visible design size: 750 × 1666
- Lotus artwork loaded from the resources bundle
- Eye target taps logged 13 times in a row
- No missing-class, JavaScript exception, or scene-load failure

Non-blocking warnings in the device log:

- `Failed to set shading scale, pipelineSceneData is invalid` — Cocos legacy-pipeline warning from the trimmed 2D build; rendering continues.
- `Read json failed: ... cacheList.json` — first-launch asset cache file is absent; normal.
- `webapi_game_transfer -31001` / `getUserGrantInfo fail` — WeChat's game-transfer/benefit service, not this game's code.
- `preload traffic expt` — WeChat ad-system experiment plumbing; no ad SDK is used in the spike yet.

## Storage finding

Two Android sessions were compared:

- `console-1794377232187.log` — first session, 13 eye taps
- `console-1794377864410.log` — second session, 19 eye taps

Both logged `previous: ""` at startup. Core touch and image loading still worked, but `sys.localStorage` did not provide a reliable readback across debug sessions.

The spike now uses the native WeChat API explicitly:

```ts
wx.setStorageSync(STORAGE_KEY, 'found');
wx.getStorageSync(STORAGE_KEY);
```

It falls back to `sys.localStorage` only when `wx` is unavailable (web preview). New log lines:

```text
[Spike] wx storage write found
[Spike] Cocos WeChat validation started { previous: "found", ... }
```

Still pending:

- Re-run the WeChat build and confirm `previous: "found"` after a full close/reopen
- Test on iOS
- Replace the debug build with a release build before submission

The first build exposed two Cocos-specific issues that are now fixed:

1. The scene must reference the compiler-generated class ID `3f2a1tMXW5PcIqbDB0uP0pb`, not the ordinary compressed asset UUID.
2. The image is a `Texture2D` subasset; load `spike/texture` and create a `SpriteFrame` at runtime.
