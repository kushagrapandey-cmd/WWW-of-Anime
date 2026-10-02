# Phase 8 — polish, browser QA and deployment preparation

The planned prototype phases are complete, except intentionally parked Phase 3. Character scope stays at 120 identities and 237 forms; no artwork, additional forms or rating calibration was added. No public deployment was performed.

## Changes

- **Keyboard and navigation:** route changes focus the main landmark; battle phases/rounds focus their headings; all native inputs/selects/textareas/details receive visible focus. Mobile navigation closes on Escape and returns focus to its button. Existing keyboard lineup reordering and game heading focus remain.
- **Layouts and readability:** fixed Home headline clipping and the joined “DailyChallenge” heading at 360px, stacked narrow battle duels, allowed history rows to wrap, tightened mobile branding and improved muted footer/hero text contrast. Replaced the fullwidth portal plus with an SVG icon. Corrected obsolete “planned” Battle/rank text.
- **Loading and errors:** lazy routes load inside the persistent navigation/layout. A route error boundary offers Reload and Home after a failed chunk/render. Corrupt progress is preserved. All current roster displays retain shared avatar/optional-image fallback behavior.
- **Motion and sound:** Home explicitly respects reduced motion, including initially offscreen portals; existing game animation controls remain. A footer sound toggle starts off and persists per browser. Short generated tones mark reveals, answers, round advances and completion. No sound files/downloads. Muting stops tones immediately, including when storage writes fail or audio resume is pending; hidden tabs stop playback. Sound failures leave gameplay usable.
- **Expansion and release:** anime metadata/cutoffs moved to JSON; rosters, quiz banks and forms auto-load using Vite globs. Existing roster and question pool ordering is preserved. Validators check catalog/file agreement. Added Vercel/Netlify SPA configuration, deployment/expansion/backend guides and CI checks.

## Complete file groups

| Paths | Purpose |
| --- | --- |
| `src/services/SoundService.js`, `src/context/SoundContext.jsx`, `src/components/SoundToggle.jsx` | Opt-in generated audio, persistence and mute/recovery |
| `src/components/RouteErrorBoundary.jsx`, `Layout.jsx`, `Navbar.jsx`, `src/App.jsx`, `src/main.jsx` | Persistent shell, route fallback, focus, menu and provider |
| `src/pages/{Home,BattleEntry,Games,Quizzes,AuthPage,CharacterGuide,Placeholder}.jsx`, battle/setup components, CSS | Game cues, focused headings, data-driven labels, corrected copy and narrow layout |
| `src/data/anime-catalog.json`, `anime.js`, `registry.js`, roster/form/quiz indexes, validation scripts | JSON registrations and automatic data discovery |
| `playwright.config.js`, `tests/browser/*.js`, `tests/{sound,data-registry}.test.js`, `vitest.config.js`, package files | Browser/accessibility, sound and expansion checks |
| `.github/workflows/ci.yml`, `vercel.json`, `netlify.toml` | CI and static-host configuration |
| `README.md`, `TASKS.md`, `STATE_SUMMARY.md`, development/expansion/deployment guides | Setup, reviewable evidence and next choices |

## Exact commands

```bash
git pull --ff-only
npm ci
npm test
npm run validate:data
npx playwright install --with-deps chromium
npm run test:e2e
npm run dev
```

Open port **5173** in Codespaces. For the production build, use `npm run build` then `npm run preview` on port **4173**. Playwright starts a production preview itself on 4173; stop unrelated servers on that port first.

## How to test

1. Use Home at 360px and desktop. Every portal should appear with reduced motion enabled; the full hero headline and Daily Challenge words must fit. Check the footer sound control.
2. Tab to Skip to content and press Enter. Open the mobile menu, focus a link and press Escape. Reopen and choose a route; focus moves to content and the menu closes.
3. Complete CPU and local-friend battles, reorder a lineup using keyboard buttons, inspect handoff privacy and replay a saved match. Results focus the heading; replay totals remain unchanged.
4. Complete a Classic quiz and each guessing game. Check hard typed privacy, ambiguous surname rejection, clue rewards, hidden challenger power, resume and saved totals. Existing unit tests cover Blitz/Daily deadlines and save failures.
5. Turn Sound on, trigger a reveal/answer and then turn it off. Check preference persistence after reload. Everything remains playable if browser audio is unavailable. Physical speaker/headphone listening is a manual check.
6. Run `npm run test:e2e`. The suite simulates blocked lazy chunks, corrupt storage and valid/broken optional images; each state must offer useful feedback or its fallback. View `playwright-report/index.html` for failures/traces; outputs are ignored by Git.
7. Follow [deployment](deployment.md) for hosted deep-link/refresh checks and [expansion](expansion.md) for new data. They do not reopen artwork or add another anime automatically.

## Verification and limits

**67 unit tests** (8 account + 59 Vitest) and **16 Playwright runs** (eight scenarios at 1280×900 and 360×800) pass. Data validation and production build pass. Browser checks exercise full CPU and local-friend battles, private handoffs, keyboard lineup movement, saved replay, Classic quiz/account persistence, all three guessing-game completions, hard-mode privacy, game resume, optional-image failures, corrupt storage, lazy-route recovery, navigation and sound preference.

The suite applies axe WCAG 2 A/AA and WCAG 2.1 AA tags to the tested routes/states, checks page width and clipped headings, and watches runtime errors on normal flows. No violations remain in those checks. Screenshot review covered Home, Characters, Battle and Higher or Lower on desktop/narrow Chromium, with system-font fallbacks available when external fonts fail.

This is Chromium QA, not complete accessibility certification or physical-device/cross-browser coverage. Safari/Firefox, real assistive technology, audio listening and an actual hosted URL remain manual release checks. The normal Playwright browser CDN download failed in this environment; validation used a temporary Chromium 153 executable with Playwright’s executable-path override. No browser binary or workaround dependency is added to the repository.

No backend or public hosting account was created. Local authentication/scores remain a prototype; [the backend roadmap](expansion.md#backend-roadmap) describes server-owned resolution and progress. All planned gameplay phases are implemented; further hosting/backend/content work needs a new scope from the user.
