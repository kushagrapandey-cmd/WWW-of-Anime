# 🧬 Character forms and public power guide

**User-requested scope revision, 2026-10-01:** important characters must have their supported forms, not just one peak record; the website must explain selection criteria and levels. The original 40 identities per series stay fixed. **Newer decision, 2026-10-02:** the user accepted current scope and closed Phase 2 at 120 identities / 237 snapshots. Further form backfill and calibration are deferred optional work; Phase 4 proceeds now. Phase 3 is parked. The new `/characters` guide is an explicitly requested UI addition to the otherwise data-focused phase.

## Identity, form and level

- One character has one identity ID. A form has its own `characterId--form-slug` ID, era, eight stats, exact power score, rarity, tags, moves, limitations, confidence and manga chapter ranges.
- `getRatedCharacter(characterId, formId)` returns the selected form rating while preserving the character ID/name/faction. A form belonging to another character returns null. Future drafting must deduplicate on character ID, never form ID.
- Choose the eligible form pool in setup before rarity-weighted drafting; a drafted card locks its form for lineup/battle. Default peak-only mode retains the original draft rules. Variant mode samples rated forms, excluding an identity after any of its forms is drawn; it must not let a Common card freely upgrade into a Mythic form. Mid-battle transformations are outside this prototype unless separately designed. The form’s stats replace peak stats instead of stacking them.
- Power score (1–1000) and rarity tier are the displayed character level. They are editorial game ratings, not official canon levels. Player rank remains separate.
- Every form uses the same original weights/formula and tier thresholds, centralized in `src/data/power.js`. No series normalization, popularity bonus or inflated quota.

## What “all forms” covers

Cover all distinct, manga-supported battle transformations and materially different early/late base snapshots for the approved roster, including meaningful subforms. Clothing changes and every episode appearance are not separate forms. Temporary, borrowed, prepared and uncontrolled states require explicit limitations. Sparse demonstrated states receive low confidence; do not invent undemonstrated numbered tail states or awakenings.

Luffy has Base and Gears 2–5; Gear 1 is an informal base label, not a distinct canon transformation. Gear Four includes Boundman, Snakeman and the demonstrated stuffed Tankman; an unshown standard Tankman is not invented. Early and late Base have different Haki/access. Naruto’s original-series range includes base eras, demonstrated fox-chakra/cloak states, Sage Mode, KCM 1, KCM 2, supported sage combination and Six Paths/avatar states. Boruto/Baryon Mode, films and unsupported adult peak estimates remain excluded.

## Initial seed — 23 snapshots, two identities (historical)

**This is an initial major-form set, not completed coverage for every roster character.** The guide states the live coverage count and marks every unexpanded character as pending. Further chapter review may split additional materially different era snapshots. All form ratings remain provisional. A future completed-coverage certification still requires inventory/evidence review; current scope acceptance does not grant that certification.

| Character | Form / era | Score | Tier | Confidence | Manga review ranges |
| --- | --- | ---: | --- | --- | --- |
| Luffy | Base — East Blue · East Blue | 269 | Common | medium | 1–100 |
| Luffy | Base — late Wano · Wano | 662 | Epic | medium | 1010–1043 |
| Luffy | Gear Two · Wano-era retained technique | 657 | Epic | medium | 387–388, 617, 1000–1043 |
| Luffy | Gear Three · Wano | 643 | Epic | medium | 421–422, 1000 |
| Luffy | Gear Four — Boundman · Late Wano | 695 | Epic | medium | 784–790, 1042 |
| Luffy | Gear Four — Tankman (Stuffed Version) · Whole Cake Island | 589 | Rare | low | 842 |
| Luffy | Gear Four — Snakeman · Late Wano | 687 | Epic | medium | 895–896, 1041–1042 |
| Luffy | Gear Five · Wano–Egghead | 803 | Legendary | medium | 1044–1049, 1070–1072, 1106–1111 |
| Naruto | Base — Part One · Late Part One | 303 | Common | medium | 1–238 |
| Naruto | Base — late original series · Final war / final duel | 595 | Rare | low | 690–699 |
| Naruto | Initial Nine-Tails chakra · Land of Waves | 302 | Common | medium | 27–30 |
| Naruto | One-tail cloak · Part One final valley | 368 | Common | medium | 228–233 |
| Naruto | Three-tail cloak · Tenchi Bridge | 385 | Common | low | 291–292 |
| Naruto | Four-tail rampage · Tenchi Bridge | 446 | Rare | medium | 293–296 |
| Naruto | Six-tail rampage · Pain invasion | 522 | Rare | medium | 437–439 |
| Naruto | Eight-tail emergence · Pain invasion | 498 | Rare | low | 439–440 |
| Naruto | Sage Mode · Pain invasion | 556 | Rare | medium | 418–442 |
| Naruto | Nine-Tails Chakra Mode (KCM 1) · Early war | 671 | Epic | medium | 499–505, 544–558 |
| Naruto | Kurama Mode (KCM 2) · War partnership | 776 | Legendary | medium | 570–571, 597–617 |
| Naruto | Kurama Mode + Sage Mode · Late war | 802 | Legendary | medium | 645–648 |
| Naruto | Six Paths Sage Mode · Final war | 864 | Legendary | medium | 673–690 |
| Naruto | Six Paths Kurama avatar · Final war / final duel | 890 | Legendary | medium | 676–690, 696–697 |
| Naruto | Final-duel three-headed Kurama avatar · Final valley | 912 | Mythic | medium | 696–697 |

## Current backfill — 237 snapshots, 55 identities

All 40 Naruto identities now have authored form records (170 snapshots); One Piece has 67 across its first 15. [One Piece forms batch 1](onepiece-forms-batch-1-audit.md) adds 59: five early/borrowed Luffy variants and 54 for Zoro through Teach. The original eight Luffy snapshots remain unchanged. [Batch 3](naruto-forms-batch-3-audit.md) adds 40 for Konan through Mei: Pain bodies, Obito's host/Kamui transitions, Madara's eye/host configurations and B's cloak/beast states. [Batch 1](naruto-forms-batch-1-audit.md) and [batch 2](naruto-forms-batch-2-audit.md) remain historical batch records. All previous identity and form data remain unchanged. No thresholds changed, and no inventory is certified complete. The user closed Phase 2 at this coverage on 2026-10-02. Remaining One Piece/Bleach forms and full panel/alias/peer review are deferred optional work, not a gameplay prerequisite.

## Evidence and ratings

[Official Naruto Sage/Pain retrospective](https://naruto-official.com/en/news/01_1321), [war chakra-mode retrospective](https://naruto-official.com/en/news/01_1327) and [Six Paths retrospective](https://naruto-official.com/en/news/01_1355) provide event context and embedded manga references. They are adaptation-oriented summaries, not permission to add anime-only feats. [VIZ One Piece 1044](https://www.viz.com/shonenjump/one-piece-chapter-1044/chapter/24172) locates awakening, and official merchandise searches corroborated Gear naming, not power levels. Individual chapter ranges in each JSON are panel-review targets, not a claim of exhaustive inspection.

The Luffy Gear Five and Naruto final-duel avatar records retain existing peak scores (803 and 912). Naruto’s peak stamina estimate remains a specific calibration review item: final-duel nature-energy setup is finite. Earlier/uncontrolled forms do not inherit late-series techniques or tactical intelligence. Tankman, transient three/eight-tail snapshots and late-base Naruto have low confidence; descriptive action labels avoid inventing official names.

Shared comparisons: Luffy’s early Base is near the provisional local-combat band; later forms rise past Kakuzu 481 toward restored Nagato 744, with Gear Five below Hashirama 840. Naruto’s early Base is local; Sage/early chakra modes cross Kakuzu/Nagato context, while final Six Paths states approach existing Madara/Kaguya ceiling. These are compressed game comparisons, not claims of literal physical multipliers. All forms require peer calibration in the final audit.

## Deferred optional character work

1. Identity rosters are now complete (120/120). The user requested final One Piece plus all Bleach together. The current inventory is accepted for the prototype; extra forms and full calibration are deferred. Phase 3 is parked.
2. Inventory distinct supported forms for all 120 identities; prioritize Sasuke, Kakashi, Guy, Lee, Gaara, Ichigo, Rukia, Renji, Aizen, Ulquiorra, Kaido, the Straw Hats, Zoan users and awakened users. Characters without transformations still get an explicit supported base/era record.
3. Expand form JSON in modular files under 250 lines and register each file in `src/data/forms/index.js`. Keep form-specific moves/limits; never inherit a stronger form’s arsenal implicitly.
4. Verify chapter scope, compare peers, audit all aliases, mark actual complete coverage, and review existing peak/form consistency and temporary resource costs.
5. Phase 3 image acquisition is parked. `CharacterAvatar` already supplies shared image/fallback rendering; later artwork needs form-aware matching. Phase 5 exposes pre-battle form selection, stores both identity and form IDs in replay data, and deduplicates character identities across teams.

## Current website and testing

Navigation → Characters opens `/characters`. Home and section previews link to the same page. It explains roster balance, manga snapshots, exact weights/formula, tiers, uncertainty and form limits. The explorer lists all 120 characters; 55 identities have form selectors with 237 authored snapshots. Naruto has 170 snapshots across all 40 identities, One Piece has 67 across its first 15 identities, and Bleach has none yet. Counts are not a completed-review badge. Per-series counts and selected-form manga review ranges are visible. The remaining characters show their exact selected peak label plus an explicit deferred-forms notice. This is a read-only information preview; battle setup is not implemented.

Run `npm run validate:data` and `npm run build`. The forms validator checks schema, identity references, unique form IDs, chapter cutoffs, eight-stat bounds, exact scores, tier thresholds and move/tag counts. Browser/mobile/keyboard visual checks are manual when no browser binary is available.
