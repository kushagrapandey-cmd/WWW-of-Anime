# Phase 6 — quizzes, Blitz and Daily Challenge

`/quizzes` replaces the preview. The Home card links to `/quizzes?mode=daily`. The character roster and form inventory are unchanged; Phase 3 stays parked and guessing games await Phase 7.

## Content

Three JSON banks contain 30 original questions each, with four distinct options, an answer index, difficulty, one-line explanation, `confidence: high` and a manga-arc reference. Each anime has 10 easy, 10 medium and 10 hard questions. The launch cutoffs remain Naruto 700, One Piece 1122 and Bleach 686. Difficulty labels are editorial. Questions avoid disputed power comparisons, anime-only additions and current chapter/bounty trivia. Spellings follow familiar English names; romanization can vary.

The questions use stable manga facts. Official-site spot checks include [Kakashi and Team Seven](https://naruto-official.com/en/news/01_1903), [the Rasengan’s creator](https://naruto-official.com/en/news/01_1802), [Franky](https://one-piece.com/character/franky/index.html), [Jinbe](https://one-piece.com/character/Jinbe/index.html) and [Bleach character profiles](https://bleach-anime.com/en/character/). Arc labels are reading anchors, not exact panel citations. `confidence` is an editorial assessment; schema validation does not independently certify canon accuracy.

## Rules and defaults

- Classic: 10 shuffled questions, one anime or Mixed, selected difficulty or all difficulties. No timer.
- Blitz: a 60-second wall-clock deadline over the selected question pool, without repeated questions. It can end early if the pool is exhausted. Reading explanations uses time. Reloading or leaving does not reset the deadline. Every third consecutive correct answer increases the multiplier, capped at ×4; a miss resets the streak. The UI labels the multiplier for the next correct answer.
- Points: easy 100, medium 150, hard 200. XP is total points divided by 10, rounded down. Classic/Daily do not apply Blitz multipliers.
- Classic/Daily accuracy uses all questions, including unanswered questions at Daily expiry. Blitz accuracy uses answered questions; zero answers yields zero accuracy.
- Daily: five shared mixed questions and option order seeded by engine version and the date in **Asia/Kolkata**. Settings do not change this pool. It closes at midnight India time. An attempt is reserved when Start is clicked, then saved after every answer/advance. An unfinished attempt resumes; a completed one opens its result without counting again.
- Daily streaks belong to signed-in profiles and count completed challenge dates, regardless of accuracy. Yesterday → today extends the streak; missed days reset the next completion to one. The displayed streak falls to zero after a missed day. A delayed old result cannot move the latest completed date backwards. Expired partial attempts can save their earned points; the credited date remains the challenge’s original date.
- Guests can practice, resume and view locally saved results, with one Daily attempt per guest browser profile. Profile XP, achievements and daily streaks require logging in **before** starting. Account changes reset the displayed active attempt; it remains saved for its original player.

## Storage and profile contract

`QuizService` stores up to 20 recent attempt snapshots per account/guest and additionally retains today’s Daily attempt if practice quizzes would evict it. Stored snapshots include shuffled questions/options, locked answer indices, answers, cursor, revision, settings, seed, timestamps and deadline. Unsupported/malformed snapshots show an error and are preserved. Revision checks reject stale writes from another tab; “Load saved attempt” recovers the current version.

A completed attempt saves before profile updates. `AuthService.recordQuizResult` computes the score and atomically applies quiz totals, mode high scores, achievements and a private receipt within the local adapter. Up to 100 receipts prevent repeated credit during retries. A second result ID for an already-credited current Daily date is also rejected. Final history-write failure can be retried without repeating XP. Pending completed results offer “Finish saving” in history. Existing accounts without quiz metadata remain compatible.

The existing `quizStats.bestScore` is **best accuracy, 0–100**. `quizProgress.bestScores` stores best raw points for Classic, Blitz and Daily separately. `perfect-quiz` rewards 100% accuracy on a non-empty attempt; `three-day-scholar` rewards three consecutive Daily completions. Battle stats and rank points are untouched.

These remain editable browser-local prototype records. The local adapter is not a backend-enforced scoring or one-attempt security boundary.

## Complete files

| Path | Purpose |
| --- | --- |
| `src/data/quizzes/{naruto,onepiece,bleach}.json`, `index.js` | 90 questions and bank exports |
| `src/quiz/{config,date,engine,profileResult}.js` | Rules, India-time dates, deterministic selection, scoring and profile deltas |
| `src/services/QuizService.js` | Attempt persistence, resume and save recovery |
| `src/services/LocalAuthService.js`, `AuthService.js` | Quiz profile updates/receipts alongside existing accounts |
| `src/context/AuthContext.jsx` | Refresh profile after recorded quizzes |
| `src/pages/Quizzes.jsx`, `Quizzes.css` | Quiz flow, deadline timer and responsive layout |
| `src/components/quiz/{QuizSetup,QuizQuestion,QuizResults}.jsx` | Mode selection, feedback and review |
| `src/App.jsx`, `src/pages/Home.jsx`, `Profile.jsx` | Route, Daily link and profile statistics |
| `scripts/validate-quizzes.mjs`, `tests/quiz-*.test.js` | Bank validation, scoring/date/storage tests |

## Exact commands

```bash
git pull --ff-only
npm ci
npm test
npm run validate:data
npm run build
npm run dev
```

Open forwarded port **5173** in Codespaces and visit `/quizzes`. Use Node 22.12+.

## How to test

1. Log in and play Classic with one anime/difficulty. Answer a question; all options lock, correct/wrong labels appear and the explanation shows. Finish all 10. Check score, accuracy, XP, answer streak and answer review.
2. Open `/profile`; confirm quiz totals, mode high scores and achievements. View the saved result again; totals must not increase.
3. Start Mixed Blitz. Keep a correct streak to raise the multiplier; answer incorrectly to reset it. Wait for the live timer to expire. Check zero-answer and partially answered results. Leave/reload and resume: its original deadline must remain.
4. Start Daily from Home. It has five shared mixed questions. Save and leave, navigate away/reload, then resume the same question/feedback. Complete it and reopen today’s result; a new attempt must not start or award XP again.
5. Check midnight India-time rollover and consecutive/missed-day streak behavior with the automated date/storage tests. A completed challenge yesterday should allow a new challenge today.
6. Sign out and play as a guest. History/resume/results work, but guest results do not credit an account that logs in afterwards.
7. Use keyboard only: visible focus, question/result heading focus on transitions, native selects and descriptive option feedback. Check 360px and desktop layouts and reduced motion. Real layout/contrast QA remains manual.

## Validation

41 total tests: eight existing account tests, 16 battle tests, 10 quiz-engine tests and seven quiz-storage tests. Coverage includes shuffled answer mappings, stable daily selection, score/XP/multipliers, unanswered accuracy, deadline checks, midnight/leap-day boundaries, streak resets, legacy profiles, history retention, stale revisions, account isolation, malformed storage, duplicate Daily credit and partial-save recovery. Account and guest DOM integration runs exercise full quiz flows, feedback/focus, saved attempt remount/resume, live Blitz expiry, unchanged deadlines, Daily re-entry, Home link and profile totals. Data validation and production build pass. DOM checks do not assert visual layout; browser/mobile visual QA remains pending.

Next only on “next”: Phase 7 Move Match, Clue Chain and Higher or Lower.
