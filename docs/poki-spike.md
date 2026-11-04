# Poki SDK Spike

Status: **local integration complete, Inspector validation pending.**

## What is implemented

| Area | Implementation |
| --- | --- |
| SDK provider | Poki's JavaScript SDK, loaded from `https://game-cdn.poki.com/scripts/v2/poki-sdk.js` only outside localhost or with `?mockAds=0` |
| Adapter | `src/core/monetization.js` — init, loading, gameplay events, commercial break, rewarded break |
| Non-Poki hosts | deterministic mock; no Poki network request |
| Poki hosts | real SDK loaded automatically |
| SDK unavailable on a real host | ads disabled; rewarded breaks return `false`, so no reward is granted |
| Midroll | triggered by `Continue Journey` after a non-final chapter, before the next story page |
| Rewarded hints | after 3 free hints: standard `Keep Looking` plus optional `▶ Watch video · +3 hints` |
| Ad audio | master gain muted while an ad is playing |
| Ad input | full-screen blocker plus keyboard guards while an ad is playing |
| Story skip | pages 1 and 2 have a `Skip story` link |
| Scroll prevention | arrow keys and wheel are prevented from scrolling the host page |

## Event mapping

```text
Preload.create
  monetization.init()
  monetization.gameLoadingFinished()

Puzzle first pointer input / H key
  monetization.gameplayStart()

Hint shop open
  monetization.gameplayStop()

Hint shop close (standard or rewarded)
  monetization.gameplayStart()

Chapter complete
  monetization.gameplayStop()
  completion card
  Continue Journey
    monetization.commercialBreak()  -> next Story page
  Back to Chapter Map
    no ad

Rewarded hint offer
  monetization.rewardedBreak()
    true  -> +3 hints, update button
    false -> no reward, resume
```

`gameplayStart()` and `gameplayStop()` are idempotent in the adapter. There is no internal ad timer; Poki decides whether a called break actually fills.

## Test locally

```bash
npm start
```

| URL | Test |
| --- | --- |
| `http://127.0.0.1:4173/` | mock mode; no SDK request |
| `http://127.0.0.1:4173/?mockAds=1` | explicit mock |
| `http://127.0.0.1:4173/?mockAds=0` | forces a real SDK attempt; plain HTTP localhost may warn about COOP, use Inspector for the real ad test |
| `http://127.0.0.1:4173/?mockAdFail=1` | rewarded break returns failure; verify no hints are granted |

Manual checks:

1. Start a puzzle, use three hints.
2. The hint button becomes `More Hints`; press it.
3. Verify `Keep Looking` is larger than and above the video option.
4. Watch the mock rewarded ad; verify `+3 hints` and the hint button becomes `Hint · 3`.
5. Repeat with `?mockAdFail=1`; verify hints stay at 0.
6. Complete a non-final chapter, press `Continue Journey`; verify the ad curtain and then the next story page.
7. Complete the final chapter; verify no ad and the unit ending appears.
8. Press `Back to Chapter Map` on a completion card; verify no ad.
9. Skip story from page 1/2; verify the puzzle opens.

## Validation performed locally

- Loaded the game at 390 × 844 and 1600 × 900 with no JavaScript errors.
- Default localhost mode: no Poki SDK request, `mock: true`.
- Reward success: `+3` hints, hint button returns to `Hint · 3`.
- `?mockAdFail=1`: rewarded break returns `false`; hints stay at `0`.
- Blocked SDK script with `?mockAds=0`: `available: false`; rewarded offer grants no hints.
- Chapter completion → `Continue Journey`: simulated midroll then next story page; `commercialCount` increments.
- Final chapter → `Read the Epilogue`: no midroll; unit ending opens.
- `Back to Chapter Map` on a completion card: no midroll.
- Story pages 1/2: `Skip story` opens the puzzle.
- Runtime is portable under a Poki subpath: HTML and module paths are relative.

Real ad fill, no-fill and event ordering still need Poki Inspector validation.

## Poki compliance checklist

- [x] Only Poki SDK for ads; no AdMob/AdSense/third-party ad SDK.
- [x] `rewardedBreak()` only on explicit player action.
- [x] Standard non-reward option visible and larger than the rewarded option.
- [x] Rewarded button has a video icon and is not green.
- [x] No reward when the SDK returns `false`.
- [x] No custom ad-block message.
- [x] One reward per video.
- [x] Audio muted and input blocked during ads.
- [x] `gameplayStart` / `gameplayStop` guarded against duplicates.
- [x] No internal ad frequency timer.
- [x] Midroll at a natural chapter boundary; not inside a puzzle.
- [x] No ad on `Back to Chapter Map`.
- [x] Story pages skippable on pages 1/2.
- [x] No external assets besides the allowed Poki SDK.
- [x] localStorage reads/writes are wrapped in try/catch.
- [ ] Poki Inspector event-stream validation.
- [ ] Real ad fill / ad block / no-fill validation.
- [ ] 16:9 requirement vs. the phone portrait stage.
- [ ] Static + animated thumbnails.
- [ ] Final Poki submission.

## Open questions for Poki Inspector

1. Does the dynamic portrait stage pass the 16:9/full-canvas requirement, or should the Poki build be landscape-first? This is the highest-risk item before mass-producing art.
2. Does the platform accept `commercialBreak()` after a completion card when the next destination is a story page rather than the puzzle immediately?
3. Is the current chapter-boundary ad cadence appropriate for a 15–20 minute session? The game does not impose a timer; Poki controls fill.

## Next implementation step

Upload the runtime-only zip to the Poki Inspector:

```bash
zip -r tales-and-puzzles-poki.zip index.html assets src vendor
```

Then verify the event timeline and mobile embedding before starting final-art production.
