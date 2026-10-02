# Phase 7 — Move Match, Clue Chain and Higher or Lower

`/games` is playable. All three games use the existing 120-character roster and locked **peak** snapshots. No form backfill, rating changes, images or silhouette game. Phase 3 stays parked.

## Implemented games

| Game | Prompt | Rules |
| --- | --- | --- |
| Move Match | 2–3 signature moves plus ability tags | Four identity choices or typed answers; 100 points per correct answer, 30-second rounds |
| Move Match hard | Eight unnamed stat bars, no moves/tags/avatar | Four choices or typed answers; 150 points per correct answer, 45-second rounds. Tests familiarity with this site’s ratings |
| Clue Chain | One clue initially; reveal up to three | One guess per round. Correct scores are 300 / 200 / 100 with one / two / three clues; 30-second rounds |
| Higher or Lower | Reference score and a challenger with hidden score | Choose the challenger’s relation to the reference. Ties excluded; 30-second rounds. Classic awards 100 per correct answer; optional streak scoring increases every three correct answers, capped at ×4, and resets on a miss |

Each game has 10 rounds. Correct/wrong/timeout feedback reveals the identity or both power scores, then Next starts a fresh round timer. Feedback time does not consume the next round’s allowance. Save and leave preserves the current snapshot and deadline; resuming an expired unanswered round records one timeout. No skipped rounds or partial-game high-score credit.

## Ambiguity and typed names

Questions are generated from data, not a separate new trivia bank. Eligibility rejects duplicate identity names, identical eight-stat vectors for hard mode, duplicate complete clue sets and move/tag profiles that identify multiple characters. Move clues use up to three listed peak signature moves and the full tag set. Checks compare against the full roster, including identities outside the selected anime filter. Four-option rounds contain unique identities, including the target. Hard prompts expose only the stat vector until answered; options can show names in choice mode.

Typed matching normalizes case, punctuation and accents. It accepts full names and unique name tokens. Inputs of 5–8 normalized characters permit one edit; 9+ permit two. Shorter non-exact guesses do not get typo correction. Multiple equally close identities or shared surnames produce a request for a full name without consuming the answer. A unique wrong identity or an unmatched non-empty name consumes the round as an incorrect guess.

`src/data/game-aliases.json` supplies a small explicit table for Whitebeard, Blackbeard, Chad, Pain and Guy/Gai. It is not an exhaustive nickname inventory. Aliases do not change roster identities. Forms/ratings and the typed dictionary are copied into the session so later data changes do not alter an unfinished game or saved result.

## Persistence and scoring

`MiniGameService` saves per-account/guest records with settings, seed, locked questions, dictionary, answers, hint counts, cursor, timestamps, deadlines and revisions. It retains the last 20 sessions. High scores are stored independently, so eviction of an old result cannot erase its record. Boards are separate by game, anime filter, rules and Move Match answer style; different difficulty/streak boards do not compete directly.

`AuthService.recordGameResult` adds completed games and board high scores to an optional `gameProgress` field, compatible with older profiles. Private receipts keep retries idempotent. A pending result survives profile-write failure; if the final history write fails after profile credit, a retry uses the receipt rather than recounting. Result views do not credit again. Existing battle rank, quiz XP/streaks and achievements stay unchanged.

Guests get persistent local boards and resumable history. Sign in before starting to credit a profile; later sign-in cannot claim guest sessions. Account changes reset the displayed session, while its original owner’s saved record remains. Revision checks reject stale saves from another tab. Corrupt stored data is preserved and shown as an error. These are browser-local prototype records, editable by the user; a future backend must enforce scores and authorization.

Power and stat scores remain game estimates from the accepted roster. Complete calibration/canon review remains deferred.

## Complete files

| Path | Purpose |
| --- | --- |
| `src/minigames/{config,names,questions,validation,engine}.js` | Rules/boards, safe fuzzy matching, eligibility/generation, snapshot checks, scoring and profile deltas |
| `src/data/game-aliases.json`, `miniRoster.js` | Game-specific name aliases layered onto unchanged roster data |
| `src/services/MiniGameService.js` | Session snapshots, resume, independent high scores and result-save recovery |
| `src/services/LocalAuthService.js`, `AuthService.js`, `src/context/AuthContext.jsx` | Profile game progress and private receipts |
| `src/pages/Games.jsx`, `Games.css` | Public games route and orchestration |
| `src/components/games/*.jsx` | Shared GameShell, setup, typed form, three game prompts, feedback and result recap |
| `src/App.jsx`, `src/pages/Profile.jsx` | Route and profile game record |
| `tests/mini-engine.test.js`, `tests/mini-storage.test.js`, `vitest.config.js` | Pure engine and storage verification |

## Exact commands

```bash
git pull --ff-only
npm ci
npm test
npm run validate:data
npm run build
npm run dev
```

Open forwarded port **5173** in Codespaces and visit `/games`. Use Node 22.12+.

## How to test

1. Play normal Move Match with Naruto, One Piece, Bleach and All filters. Each prompt shows 2–3 moves/tags and four unique identities. Complete 10 rounds and check the saved board score.
2. Select typed answers. Try a unique first name, a supported nickname and a small typo. Try `Uchiha`: request a full name, with no answer consumed. Then submit a full name.
3. Enable hard mode and typed answers. Before answering, verify only the eight stat bars appear: no fighter name, form-specific identity, avatar, move or tag. After answering, the correct fighter appears. Choice-mode options still show four names.
4. Play Clue Chain. Verify first/second/third-clue correct rewards of 300/200/100, no fourth clue, one guess per round and hint reset on Next.
5. Play Higher or Lower with and without streak scoring. The reference score appears; the challenger’s score and rarity remain hidden until feedback. No equal-score pair appears. Build a streak and break it; check points and recap.
6. Leave an unanswered round and reload/remount the route. Resume the same snapshot/deadline. If expired, record one timeout and let Next start a new timer. Leave during feedback and resume it without another answer.
7. View completed results again: game counts/high scores must not be credited twice. Play again creates a fresh session with the same settings. A lower result must retain the old high score. Check `/profile`; battle and quiz totals must stay unchanged.
8. Sign out and repeat a game. Guest boards/history persist locally. Signing in cannot credit a guest game. Check keyboard heading focus, typed-input labels, timer accessibility, narrow layout and reduced-motion settings. Real visual QA remains manual.

## Validation

58 total automated tests: eight account tests, 33 existing battle/quiz tests and 17 mini-game tests. The new tests cover every anime/game/hard/typed combination, deterministic snapshots, unique choices/unequal power pairs across 100 seeds, ambiguous profile rejection, alias/fuzzy matching, answer locking, clue/streak scoring, timeouts/deadline persistence, board separation, independent high-score retention, legacy profiles, account isolation, stale revisions, corrupt storage and partial-save recovery.

Account and guest DOM integration runs cover full normal Move Match, hard typed privacy/ambiguity, clue rewards, hidden power/streaks, 10-round results, focus, route remount/resume, no recount, fresh play-again sessions, live timeout and profile/board persistence. Data validation and production build pass. These DOM checks do not assert layout; real browser/mobile visual QA remains pending because no working browser binary is installed.

Next only on “next”: Phase 8 polish, QA, optional sound, expansion and deployment guidance.
