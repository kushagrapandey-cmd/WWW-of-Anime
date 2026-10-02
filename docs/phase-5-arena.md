# Phase 5 — Battle Arena

The existing 120 identities and 237 form snapshots power `/battle`. No roster additions or artwork downloads. Phase 3 stays parked. Quiz/game routes are still previews.

## Implemented flow

1. Select CPU or local friend, anime pool and peak-only (default) or form variants **before** drafting. Player 1 is the signed-in user; guest names are available with `VITE_REQUIRE_LOGIN=false`.
2. Each player reveals five fighters individually using shared fallback cards and reduced-motion-aware flips. One reroll replaces the latest card; CPU rerolls its weakest Common card. A discarded identity stays excluded. No identity is shared across either team, regardless of form.
3. Move fighters earlier/later in five round slots, then lock. CPU shuffles deterministically before the human lineup is locked. Local friends receive private pass-device screens between drafting and ordering, and a shared battle handoff.
4. Advance five animated VS rounds. Scores, power factors and winner explanations appear one round at a time. Results show the winning team and the MVP (largest effective-power winning margin on that team).
5. Save profile wins/losses/streaks/rank and achievements, copy the result, rematch the locked teams with a new seed or start a new draft. Replays never update statistics.

## Game rules

All gameplay constants live in `src/game/config.js`. The engine and draft are pure JavaScript with injected data and seeded randomness.

- Present rarity tiers are selected with weights Common 35, Rare 30, Epic 20, Legendary 11, Mythic 4; missing tiers are removed and the remainder renormalized. Within a tier, choose identity uniformly, then form uniformly. This prevents many authored forms from multiplying an identity’s odds within a tier.
- Variant pools include the peak record plus authored alternate forms. Unexpanded characters retain their peak. Locked records keep identity/form IDs and a complete snapshot; no later free form upgrade.
- `effectivePower = base power × matchup × synergy × luck`, rounded to two decimals for comparison. Tag counters cap at ±10%. Three sharing an anime **or** faction earn one +5% bonus. Seeded luck spans 0.92–1.08. Equal effective power uses higher speed; equal speed uses the next seeded draw. Factors and tiebreak reasons are displayed.
- Water/fire, lightning/water, haki/logia, sealing/regeneration, sensing/traps and wind/ranged are small gameplay counters, not canon immunity claims.
- Rank uses Elo-style expected score with K=32 and scale=400. CPU rating is 300; a local friend’s rating is Player 1’s starting rating. Points floor at zero. Only Player 1’s signed-in profile changes; friend names do not identify a second account.
- A first win earns `first-victory`; three consecutive wins earn `three-win-streak`.

## Storage and recovery

`BattleService` retains the last 20 battles **across this device**, then filters them for the current account or guest. Each record contains a unique ID, version, seed, names, settings, timestamp and both locked team snapshots. Replaying ignores current roster ratings. Engine versions are checked; unsupported or malformed replays show an error.

History is saved before profile updates. AuthService atomically applies a battle and stores a private receipt alongside the profile, keeping the last 100 receipts. A retry after a partial write reuses the receipt. History with a pending profile result offers “Finish saving”; saved history offers read-only “Replay”. A save error offers retry or an explicit “Continue without saving”. Corrupt history is preserved rather than replaced. Account switches abandon the active draft and prevent crediting another account.

All profiles/results remain editable browser-local prototype data. The future backend must enforce authorization, uniqueness and scoring. Reloading during a draft abandons it; only completed matches are persisted.

## Files

| Path | Responsibility |
| --- | --- |
| `src/game/{config,random,pool,draft,engine,profileResult}.js` | Constants, seeded RNG, pool construction, pulls/rerolls, battle/replay and rank updates |
| `src/services/BattleService.js` | History, result save and partial-save recovery |
| `src/services/LocalAuthService.js`, `src/context/AuthContext.jsx` | Atomic profile update/receipt and refreshed UI profile |
| `src/pages/BattleEntry.jsx`, `src/pages/BattleArena.css` | Arena orchestration and responsive styling |
| `src/components/battle/*.jsx` | Setup, reveal, hidden lineup, rounds, results and mini fighter rows |
| `tests/game.test.js`, `tests/game-storage.test.js`, `vitest.config.js` | Pure engine and storage tests |

## Exact commands

```bash
git pull --ff-only
npm ci
npm test
npm run validate:data
npm run build
npm run dev
```

In Codespaces, open forwarded port **5173**, then `/battle`. Use Node 22.12+.

## How to test

- Log in/create a profile. Start a CPU draft in peak mode. Reveal five cards, use one reroll, and verify it becomes unavailable. Order fighters with the arrow buttons, lock and advance all five rounds.
- Check the final score, per-round factor explanations, MVP, rank change and `/profile` totals. A loss at zero rank must not produce negative points.
- Copy the result; denied clipboard access should show a selectable text field. Rematch should reuse fighters with a new seed and count one new match.
- Start a local-friend match. Pass-device screens must show no fighter names/cards. Verify each player can privately draft and order their team.
- Try Naruto and variant mode. Form labels stay fixed from draft to rounds/results. No identity appears twice, including different forms.
- From recent battles, replay a match. Round powers/winners/score must match the original, and profile totals must stay unchanged. Reload after results: history and profile remain.
- Set `VITE_REQUIRE_LOGIN=false` in `.env.local` and restart Vite. Guest names and CPU/friend play work; guest history saves without rank points. `/profile` still requires login.
- Check keyboard focus, card text and controls at 360px and desktop widths. Enable reduced motion: card flips/sliding/power-fill animation should stop. Check contrast and absence of horizontal scrolling.

## Validation

Eight account tests and 16 Vitest tests cover deterministic drafting across 250 seeds, rarity distribution, identity/form deduplication, reroll limits, bounded matchups/synergy/luck, ties/upsets, exact snapshot replay, MVP, rank floor, history limits, corrupt storage, account changes and partial-save retries. Account and guest DOM integration runs exercised complete CPU/friend drafts, order controls, hidden handoffs, five rounds, copy fallback, rematch and replay without recounting. Data validation and production build pass. These DOM checks do not assert layout; real browser/mobile visual QA remains pending because this environment has no working browser binary.

Next on the user’s “next”: Phase 6 quizzes, Blitz and Daily Challenge only.
