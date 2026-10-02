# Add an anime through data

Launch remains Naruto, One Piece and Bleach. This checklist prepares later expansion without authoring another series now. All registrations live in `src/data/anime-catalog.json`; Vite discovers roster, quiz and form JSON at build time. No component, game engine or import-list edits are required. A rebuild is required.

1. Add one catalog entry with a unique lowercase slug `id` (never `all`), `name`, `subtitle`, `motif`, `label`, `description`, positive manga `cutoffChapter` and `colors` containing six-digit hex `primary`, `secondary` and `background`. Optional `tertiary` can be supplied. Preserve existing entry order to keep current pools stable. New worlds get a shared star icon automatically.
2. Add `src/data/characters/<id>.json`. Copy the existing schema: stable globally unique character IDs, name/anime/faction/role, eight stats, computed power/rarity, 3–5 ability tags, 2–3 signature moves, three hard-to-easy clues, short reasoning, confidence, image query and `image: null`. Stats are embedded in the roster JSON; there is no separate stats file. Use `calculatePower`/`getPowerTier` from `src/data/power.js`; do not force ratings to tier quotas.
3. Supply at least 12 distinct identities for Battle including both rerolls. Move Match/Clue Chain need at least 10 eligible, unambiguous profiles for that anime; hard Move Match needs 10 unique eight-stat vectors. Higher or Lower needs different scores. Merely passing schema validation does not prove a satisfying or unambiguous game pool; test every mode/filter.
4. Add `src/data/quizzes/<id>.json`: 30 high-confidence manga questions, 10 per difficulty, four distinct options and zero-based `answerIndex`, explanation and canon reference matching the catalog cutoff. Keep IDs and complete question text unique across all banks. Unknown or ambiguous canon claims belong outside the bank until reviewed.
5. Optionally add `src/data/forms/<character-file>.json` using the existing form schema. The file basename is not the identity; every record’s `characterId` must point to the roster and every form ID must start with `<characterId>--`. Forms load automatically. Keep snapshots coherent and within the catalog manga cutoff. Optional aliases belong in `src/data/game-aliases.json`.
6. Keep `image: null` for the shared generated avatar. If you already have an appropriate local image, use `/characters/<filename>` and put it in `public/characters/`. Optional hero art goes in `public/hero/<id>.jpg`. Image acquisition remains parked: only implement/run a future `fetch-images` when explicitly reopened. There is no image command to run today.
7. Run the commands below and test Home/portal themes, Characters, Battle, quizzes and all guessing-game styles with the new filter. Current launch-specific content/count assertions in the tests must be updated deliberately when accepting a real expansion; they guard the closed 120-identity scope today.

```bash
npm run validate:data
npm test
npm run test:e2e
npm run build
npm run dev
```

Validators check catalog/data-file agreement, IDs, schema, weighted scores, rarity, source cutoffs and quiz structure. They do not certify canon. New data changes future seeded pools, including new Daily Challenges; saved attempts, games and battles retain their copied snapshots.

# Backend roadmap

Keep the local prototype service interfaces as adapters. A real multiplayer or leaderboard launch requires a backend, not more client-side checks.

| Stage | Work | Result |
| --- | --- | --- |
| Accounts | Express API plus Postgres or MongoDB; server password hashing; JWT access/session handling with secure refresh cookies, expiry and logout; validate/rate-limit requests | Real account ownership, recovery and progress across devices |
| Battle authority | Server-owned roster versions, random seeds, draft/reveal state, rerolls and lineup locks; resolve all rounds on the server | Clients cannot submit fabricated teams/results for rank credit |
| Quiz/game authority | Server-owned daily date, question sessions, answer checks and deadlines; avoid exposing correct answers to untrusted clients | Enforced attempts, scoring and high scores |
| Persistence | Transactions/atomic updates and unique result receipts; durable history and explicit versioning | Retry-safe results without localStorage as the source of truth |
| Competition | Paginated leaderboard, season rules, moderation and audit logs; validated server results only | Credible public rankings |
| Online matches | Matchmaking, authenticated realtime rooms, disconnect/timeout rules and hidden-state delivery | Two-device multiplayer with fair turn handling |

Implement API-backed AuthService/BattleService/QuizService/MiniGameService behind the current UI, then test failure/retry/account-switch cases before removing the local adapters. Profile APIs should expose safe fields only. Preserve record/engine versions for replay compatibility. Browser caches can support display/offline practice, but must not authorize competitive score changes.
