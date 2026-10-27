# Showcase release — 27 October 2026

Approved scope: one portrait per character shared across forms; arena round reveal/replay; quick quiz/game entry; expanded quiz content; character browsing/comparison; profile identity and attainable goals; polished share results; adaptive polling. Preserve server authority, coin rules, existing saved matches and guest behavior. Ship together after verification.

Plan:
- `public/characters`, `src/data/character-images.json`, image pipeline/provenance, shared CharacterAvatar.
- `OnlineBattle`, shared reveal wrapper, arena results/share component.
- `Home`, game/quiz setup, quiz bank expansion.
- `CharacterGuide`, searchable roster and two-character comparison.
- Shared progression goals/profile presentation, existing account data as source of truth.
- Relevant tests, asset validation, README and production deployment.

Status: released to production and verified on 27 October 2026.

Live: https://www-of-anime.vercel.app

Feature commit: `828777598dfcbf2e1a3efb881cd57ddc4533a513`. Vercel deployment: `dpl_CyQxT69gZQQ3orDhhoHeXAU5KbW1` (READY).

Later roadmap (not part of this release): ranked asynchronous challenges, full Draft Lab, spoiler-tagged question filtering, live matchmaking, real redemption.

Implementation notes:
- 120 reviewed identity mappings, 240 optimized local WebP files (~2.34 MiB total), smaller grid thumbnails; no live image provider dependency. Provenance in `character-images.json`; public `/credits`. Attribution is not a license grant.
- Online showdown presents the saved result, with auto-play/pause/next/skip/replay. No replay award calls.
- Friend polling backs off from 4 to 15 seconds if unchanged; locked lineups stay at 4 seconds; CPU synchronization uses 30 seconds; hidden tabs skip requests.
- Quick-play cards plus optional custom settings. Home launches a Blitz preset; guests use existing local practice storage.
- Quiz bank expanded from 90 to 180: 60 per anime, 20 per difficulty. Stored attempts retain snapshots. New daily questions become eligible on 28 October (the next India-time reset), preserving the published 27 October daily pool. Classic and Blitz use all 180 immediately. Content/schema validation does not certify every canon fact.
- Searchable roster, incremental loading and side-by-side form comparison; methodology moved below the explorer.
- Character profile avatars, derived cosmetic titles and six lifetime objectives. Unlocks follow existing saved statistics across devices; no new coin grants or spending.
- Public-route result sharing and canvas-generated PNG score cards; private invites and match/session IDs are excluded from new share cards.

Manual review:
1. Home: verify three portrait cards and use the 60-second quick challenge as a guest.
2. Games: start each card; customize a typed/hard run; save/leave and resume. Check answers reveal the correct portrait.
3. Characters: search/filter, show more, choose a fighter/form, compare another form. Missing images must retain initials.
4. Account: save a character portrait as avatar, reload, inspect objectives and titles. Guest practice must not award account coins.
5. Arena: CPU and two-account friend match, draft/reroll/order/lock, next/pause/skip/replay; refresh and confirm coins only awarded once.
6. Results: share/copy and download PNG. Verify no private invite or account token enters the share text.
7. Mobile: verify no horizontal overflow; controls remain usable; reduced-motion mode disables automatic initial playback.

Verification completed:
- `npm test`: 88 passing checks (12 account/coin/asset/progression, 60 game/storage, 16 server).
- Catalog validators: 120 identities, 237 forms and 180 unique question records pass schema checks.
- 34 distinct browser scenarios pass across full runs and targeted reruns: 16 local/demo regression cases and 18 online cases, each covering desktop and 360px mobile.
- Axe accessibility checks, keyboard navigation, reduced-motion behavior, portrait failures, saved progress, separate-account invites, avatar persistence, PNG downloads and replay ledger invariance covered.
- The 100-seed stress test retains all assertions with a 20-second timeout for shared CI hardware.
- Production build passes. No database migration, new paid service or changes to coin award rules.

Production verification:
- Live browser: three hero portraits decoded, homepage Blitz quick play, Clue Chain answer reveal, character/form comparison, 120 source credits and 360px layout pass.
- Five direct portrait responses returned successful WebP content, including the corrected Nagato, Sabo and Nelliel portraits.
- No uncaught browser errors; deployment error/fatal log scan returned no entries at verification time.
- No production QA accounts or feedback emails created during this smoke test. Full authenticated flows were verified against the isolated test backend.
