# Project tasks and execution memory

## User decision — 2026-10-02, India time

Phase 3 image acquisition is **parked**, not a dependency. Do not search for/download artwork or implement/run `fetch-images` unless the user explicitly reopens it. Retain `imageQuery` and `image: null` in identity data. Every character display uses `CharacterAvatar`; optional images lazy-load, failed/missing images use initials, anime gradient, rarity glow and role icon. Hero covers are manually supplied in `/public/hero/`; gradients work without them. Portal logos remain text.

## Publication authorization — 2026-10-02

User explicitly approved publishing the completed Naruto batch to `main` and continuing the project ("Yes and continue"). Continue publishing completed, validated authorized batches to `main`; do not request the same approval again.

## Scope closure — 2026-10-02

User said the current characters are enough and asked to wind up Phase 2 and move forward. Close the launch character scope at 120 identities and 237 forms across 55 identities. Stop form backfill. Remaining One Piece/Bleach forms and complete inventory/panel/peer calibration are deferred optional work, not prerequisites to Phase 4/5. This is accepted prototype scope, not certified exhaustive canon coverage.

## Execution order and tasks

- [x] Phase 0: brief and approved rubric.
- [x] Phase 1: scaffold/home/navigation; shared fallback avatar and stat-rich CharacterCard added. Browser/mobile QA remains open.
- [x] Phase 2: closed by user acceptance of current prototype scope (120 identities / 237 snapshots); exhaustive forms and calibration deferred.
- [x] Form backfill: all Naruto identities and One Piece identities 1–15 authored. Current 237 snapshots / 55 identities (Naruto 170 / 40; One Piece 67 / 15; Bleach 0).
- [ ] Optional deferred: remaining One Piece/Bleach form inventories. No identity certified fully covered.
- [ ] Optional deferred: panel/alias inventory, peer calibration, borrowed resource costs, peak consistency and rarity review. Preserve formula/thresholds; never force scores to quotas.
- [x] User accepted current Phase 2 scope; proceed directly to Phase 4.
- [ ] Phase 3: PARKED / optional later; no downloader currently exists.
- [x] Phase 4: local accounts/profile via AuthService, salted PBKDF2, login/signup, protected profile/Battle entry, guest flag, avatars/ranks and logout. Eight auth tests, DOM form/redirect/profile/session/guest checks and production build pass; browser/mobile visual QA pending.
- [ ] Next: Phase 7 Move Match, Clue Chain and Higher or Lower only on user’s “next”.
- [x] Phase 5: CPU/local-friend five-card rarity-weighted draft, one reroll each, hidden lineups/handoffs, seeded rounds/explanations/MVP, Elo-style rank/stats/achievements, copy/rematch, last-20 snapshot replays and retry-safe profile receipts. Peak/variant pool fixed before drafting; identity dedup and locked forms. 16 Vitest engine/storage tests plus 8 auth tests, full account/guest DOM arena flows, data validation and build pass. Browser/mobile visual QA remains pending.
- [x] Phase 6: 90 four-option manga questions (30 per anime, 10 per difficulty); Classic/Mixed, 60-second Blitz with capped streak multiplier, date-seeded five-question Daily resetting at midnight Asia/Kolkata, one resumable daily attempt per account/guest, feedback/results/review, profile XP/high scores/achievements/streaks and retry-safe receipts. 41 total tests plus account/guest DOM flows, data validation and build pass. Browser/mobile visual QA pending.
- [ ] Phase 7: **Move Match** replaces Who’s That Shadow. Show 2–3 moves plus tags; four choices or fuzzy typed answers. Hard mode uses stat bars without names; reject ambiguous profiles. Clue Chain and Higher or Lower stay.
- [ ] Phase 8: QA, battle/auth/quiz tests, optional sound, expansion and deployment guidance. Image licensing is no longer a mandatory phase task. Optional later roadmap: implement/run `fetch-images` when explicitly reopened.

## Persistent working constraints

Use GitHub `kushagrapandey-cmd/WWW-of-Anime`, branch `main`; push completed authorized work. React/Vite/Tailwind/Router/Framer Motion, JavaScript. Manga cutoffs Naruto 700, One Piece 1122, Bleach 686. No anime-only/film/game/novel abilities or unshown transformations. Follow modular prompts in `docs/project-brief.md` and `docs/phases-4-to-8.md`; newer user instructions override earlier prompts. Keep updated counts and decisions here and in `STATE_SUMMARY.md` after every batch. Do not claim canon review or visual QA is complete merely because schema/build checks pass.
