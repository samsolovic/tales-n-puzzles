# Poki Submission Pack

## Short answer

Registering as a Poki developer requiring a game submission is **not a blocker**. Poki explicitly supports prototypes:

> "Uploading your game to Poki for Developers is the first step of the journey. It's quick, and it works with prototypes too."
>
> — [Adding your game](https://developers.poki.com/guide/adding-your-game)

The current five-chapter build is enough for an initial P4D entry and a first playtest. Do not wait for the full 15–20 chapter art production.

## Public review build

If you host the build on GitHub Pages, Netlify, etc., the game automatically uses simulated ad breaks outside Poki. That is intentional: real ads only make sense inside Poki. The uploaded build itself will use the real SDK on Poki.

## What to upload

- Runtime zip: [tales-and-puzzles-poki.zip](../tales-and-puzzles-poki.zip)
- Game title: **Tales & Puzzles: The Odyssey**
- Platform build: HTML5 / Phaser 3.90
- Current scope: Unit I, five chapters, roughly 15 minutes
- Controls: mouse/touch, `H` hint, `←`/`→` story pages, `Esc` map
- Orientation: landscape and phone portrait (portrait still needs Inspector validation)

## Suggested store copy

**Tagline**

> Every legend hides a puzzle.

**Short description**

> Read a short illustrated story, then solve the scene: spot five differences between two paintings or find hidden objects tucked around the picture.

**Long description**

> Read a three-page illustrated story, then solve the scene: spot five differences or find hidden objects, some tucked under covers you can lift. Five chapters inspired by the Odyssey turn a classic tale into a cozy puzzle — you're not just finding objects, you're uncovering what the story is hiding.

**Instructions**

> Read the chapter's story, then tap the differences between the two paintings or find the objects listed beside the scene. Tap covers to move them. Use the Hint button if you get stuck.

**Feature bullets (optional)**

- Five chapters inspired by the Odyssey
- A three-page illustrated story in every chapter
- Three spot-the-difference and two hidden-object puzzles
- 28 details to find
- Three hints per chapter
- Mouse and touch controls; desktop and mobile

## Why it fits Poki

> Tales & Puzzles: The Odyssey takes two familiar casual puzzle types — spot the difference and hidden object — and wraps them in a short illustrated story. The controls are simple (tap or click), it works on desktop and mobile, and each chapter fits a short break. The chapter map makes it easy to come back for one more, while the storybook framing gives a familiar genre a distinctive, memorable look without requiring any prior knowledge of the Odyssey. That makes it a natural fit for Poki's broad casual audience, as well as players who enjoy mythology and story-driven games.

**Categories to suggest**

- Puzzle
- Brain
- Adventure
- Story

## Hosting the public review build

The form wants a **playable URL**, not a zip. Upload the unzipped runtime files.

### GitHub Pages

1. Create a public repository, for example `tales-and-puzzles`.
2. Unzip `tales-and-puzzles-poki.zip` into the repository root. The root must contain `index.html`, `assets/`, `src/`, `vendor/` and the empty `.nojekyll` file.
3. Push the files to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select `main` and `/ (root)`, then save.
7. Submit the published page URL, for example:

   `https://YOUR-USERNAME.github.io/tales-and-puzzles/`

Do not submit the `.zip` file URL or the repository URL. The reviewer needs the live page.

`tales-and-puzzles-poki.zip` already uses relative paths, so it works under a repository subpath. On a non-Poki host the game automatically runs its simulated ad mode; the uploaded Poki build uses the real SDK.

### Alternative: Netlify Drop

If you do not want to use GitHub, drag the unzipped runtime folder onto Netlify Drop and submit the generated public URL. The same rule applies: the reviewer must be able to open and play the game without logging in.

### Check before submitting

- Open the URL in a private/incognito window.
- Check desktop and phone portrait.
- Confirm no login, no missing assets, and no console errors.
- Click through at least one full puzzle.
- Make sure the page URL ends with `/` and is not a file download.

## Registration / upload flow

1. Create the Poki for Developers account at <https://app.poki.dev/signin/>.
2. Add the game entry and upload `tales-and-puzzles-poki.zip`.
3. Complete team/general information.
4. Wait for the initial content moderation check.
5. Open the game from **Versions → Inspector** and work through the QA modules and event log.
6. Fix the SDK/16:9/portrait issues found there.
7. Request the first playtest.
8. Use the recordings and metrics to decide whether to scale the chapter count and art production.

## Known risks to watch in moderation / QA

- **Cyclops violence:** the story mentions the giant eating crew members and the red-hot stake in his eye. If content moderation flags this, soften the prose rather than changing the puzzle.
- **16:9:** Poki's hard requirements page emphasizes 16:9 full-canvas. The current phone portrait stage is a deliberate exception. Validate with Inspector; if it fails, make the Poki build landscape-first.
- **Thumbnail:** a final 1:1 static thumbnail and later an animated thumbnail are still required for player fit / soft release. Do not use a stretched or letterboxed screenshot.
- **Content volume:** five chapters is fine for the first playtest, but likely too short for a global release. Plan 12–15 chapters for the launch version.
- **Entry friction:** Title → map → story is slower than Poki's ideal. Watch the playtest funnel; consider launching directly into the next unfinished chapter.

## What this submission is for

This first upload is a **learning build**, not the commercial launch. The goal is to get:

- a real Poki SDK event log;
- a real mobile embedding check;
- real playtest recordings;
- early completion / hint / rewarded-ad signals;
- confirmation that the portrait stage and 16:9 assumptions are viable.

Only after that should the remaining chapters and final art be produced.
