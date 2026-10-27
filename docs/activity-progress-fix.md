# Activity progress refresh — 27 October 2026

## Problem and behavior

The server already saved online quiz/game results and profile statistics in the completion transaction. The React pages refreshed AuthContext only through a save path gated on `!state.saved`. Because the online response was already marked saved, an in-app Profile visit could show old quiz counts, XP, game counts and derived goals until a full reload. Game scoreboards could also use a history request's stale copy of profile scores.

`src/pages/Quizzes.jsx` and `src/pages/Games.jsx` now synchronize completed online activities even when the result is already persisted. This includes reopening a completed attempt or completing a quiz through its deadline. Already-saved online results do not need another activity fetch or any settlement mutation; the synchronization reads the current profile. The online game's displayed high scores derive from current AuthContext; guest/demo scores still use the local store. Save/retry/account guards remain in place.

`tests/online/online.spec.js` now follows the app's Profile link after quiz completion, compares displayed XP with the result, checks the game score board after completion, and opens Profile through navigation to check games played. A marker on `window` confirms those checks did not reload the document. The regression reproduced `Quizzes played: 0` before the fix, where `1` was expected. It runs at desktop and 360px widths, including the mobile menu.

## Coins are intentionally display-only

Coin settlement is unchanged: Arena wins (including CPU) award 10, 10, 15, 20, 25, 30, then 35 per consecutive win. The bonus is capped at 25 on top of the base 10; losing awards zero and resets the streak. Milestones are 100, 500 and 1000. There is no purchase, spend, redemption, checkout or shipping implementation. The disabled Redeem button is intentional, not a broken checkout. See `src/config/coins.js`, `src/services/CoinsService.js` and [coins and feedback](coins-and-feedback.md).

## Documentation

README, STATE_SUMMARY and the active architecture/expansion guidance now describe bundled identity portraits, the existing Pillow script and adaptive polling. Historical phase and online-upgrade records are labeled so their older artwork deferral and test counts are not presented as current state. No framework, database schema, coin rule or provider plan was changed.

## Verification

- `npm test`: 88 passing checks (12 account/coin/asset/progression, 60 game/storage, 16 server).
- `npm run validate:data`: 120 identities, 237 forms and 180 quiz questions pass structural validators; this does not certify all canon facts.
- Browser verification: all 18 distinct online scenarios covered across the full run and focused reruns; the mobile regression helper was corrected to open the navigation menu. The updated activity regression passes at desktop and 360px without reloading after completion.
- `npm run test:e2e`: all 16 demo/guest Chromium scenarios pass.
- Production build and `git diff --check` pass.

Browser tests use a disposable PGlite backend, not production accounts. The Chromium executable is an external test-environment tool; no browser package or dependency was added to the repository. Deployment status and live smoke results are verified separately after publication; these local checks are not a claim that authenticated production accounts were exercised.
