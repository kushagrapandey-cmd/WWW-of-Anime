# Project tasks and execution memory

## User decision — 2026-10-02, India time

Phase 3 image acquisition is **parked**, not a dependency. Do not search for/download artwork or implement/run `fetch-images` unless the user explicitly reopens it. Retain `imageQuery` and `image: null` in identity data. Every character display uses `CharacterAvatar`; optional images lazy-load, failed/missing images use initials, anime gradient, rarity glow and role icon. Hero covers are manually supplied in `/public/hero/`; gradients work without them. Portal logos remain text.

## Execution order and tasks

- [x] Phase 0: brief and approved rubric.
- [x] Phase 1: scaffold/home/navigation; shared fallback avatar and stat-rich CharacterCard added. Browser/mobile QA remains open.
- [ ] Phase 2: all 120 identities authored (40 per series); forms and calibration still in progress.
- [x] Form backfill: initial Luffy/Naruto seed and all Naruto identities 2–40 authored. Current 178 snapshots / 41 identities (Naruto 170 / 40; One Piece 8 / 1; Bleach 0).
- [ ] Next: One Piece form inventory/backfill, then Bleach inventories. No identity certified fully covered yet.
- [ ] Complete panel/alias inventory and peer calibration, borrowed resource costs, peak consistency, rarity distribution review. Preserve formula/thresholds; never force scores to quotas.
- [ ] Sign off Phase 2 after actual coverage/review, then go directly to Phase 4.
- [ ] Phase 3: PARKED / optional later; no downloader currently exists.
- [ ] Phase 4: local accounts/profile via AuthService; guest flag; no image dependency.
- [ ] Phase 5: seeded five-card draft/battle, form pool fixed before drafting, identity deduplication across teams, locked forms and replay IDs. Card flips use fallback art; optional stronger rarity effects obey reduced motion.
- [ ] Phase 6: canon quizzes, Blitz and Daily Challenge.
- [ ] Phase 7: **Move Match** replaces Who’s That Shadow. Show 2–3 moves plus tags; four choices or fuzzy typed answers. Hard mode uses stat bars without names; reject ambiguous profiles. Clue Chain and Higher or Lower stay.
- [ ] Phase 8: QA, battle/auth/quiz tests, optional sound, expansion and deployment guidance. Image licensing is no longer a mandatory phase task. Optional later roadmap: implement/run `fetch-images` when explicitly reopened.

## Persistent working constraints

Use GitHub `kushagrapandey-cmd/WWW-of-Anime`, branch `main`; push completed authorized work. React/Vite/Tailwind/Router/Framer Motion, JavaScript. Manga cutoffs Naruto 700, One Piece 1122, Bleach 686. No anime-only/film/game/novel abilities or unshown transformations. Follow modular prompts in `docs/project-brief.md` and `docs/phases-4-to-8.md`; newer user instructions override earlier prompts. Keep updated counts and decisions here and in `STATE_SUMMARY.md` after every batch. Do not claim canon review or visual QA is complete merely because schema/build checks pass.
