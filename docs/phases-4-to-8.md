# Execution prompts — Phases 4–8

Phase 3 is parked by user instruction. The user closed Phase 2 at current coverage on 2026-10-02 and deferred remaining forms/calibration. Execute these one phase at a time. Shared `CharacterAvatar` is mandatory; no image acquisition prerequisite.

## Phase 4: Accounts and profile — implemented

See [Phase 4 implementation and tests](phase-4-accounts.md).

```
PHASE 4: Prototype auth + profile

1. AuthService interface: signUp, logIn,
   logOut, getCurrentUser, updateStats.
   Implement LocalAuthService on
   localStorage. Hash passwords with Web
   Crypto PBKDF2 + salt, and comment
   clearly that this is NOT real
   security. Design it so a future
   ApiAuthService (Express + JWT + DB) is
   a drop-in replacement.
2. Config flag REQUIRE_LOGIN (default
   true). If false, Battle Arena lets me
   type Player 1 / Player 2 names
   (guest mode).
3. Signup/Login page with validation,
   show/hide password and friendly
   errors. ProtectedRoute that redirects
   to login and returns afterwards.
4. Profile schema: username, avatar
   (simple picker), createdAt,
   battleStats {wins, losses, winStreak,
   bestStreak, rankPoints}, quizStats,
   achievements[].
5. Rank ladder from rankPoints (Elo-style
   +/-): Rookie, Fighter, Elite, Master,
   Legend.
6. Profile page: stats, rank badge,
   logout.
```

---

## Phase 5: Battle Arena

```
PHASE 5: Battle Arena (main feature)

FLOW
1. Setup: Player 1 = logged-in user.
   Player 2 = "vs CPU" or "Local friend"
   (type a name, same device). Show
   pass-the-device screens between turns.
2. Draft: each player gets 5 random
   characters, revealed ONE AT A TIME
   with a card-flip animation using
   CharacterCard/CharacterAvatar even
   with no images. Optional stronger
   rare-pull motion respects reduced
   motion. Rarity-
   weighted RNG (rarer = less likely), no
   duplicates across both teams, and 1
   reroll token per player (one card).
3. Lineup: each player orders their 5
   characters into Round 1-5 slots,
   hidden from the opponent.
4. Battle: 5 rounds, character i vs
   character i. Animated VS screen, power
   bars filling, round-winner banner,
   final scoreboard, MVP card.
5. Result: winner, rank points change,
   rematch / new draft, and a
   copy-to-clipboard result summary.

ENGINE (pure functions in /src/game/,
no React, unit-tested with Vitest)
- effectivePower = powerScore x
  matchupMod x synergyMod x luck
- matchupMod: small readable ability-tag
  counter table, max +/-10%.
- synergyMod: +5% if 3+ teammates share
  a faction or anime.
- luck: seeded random 0.92-1.08. Save the
  seed so any battle can be replayed.
- Higher effectivePower wins the round;
  ties go to the higher speed stat.
- Stronger usually wins, but upsets are
  possible.
- All constants live in
  /src/game/config.js.
- Show a "why they won" line per round
  (e.g. "Type advantage + higher speed").

Persist the last 20 battles in
localStorage. Update stats and rankPoints
through AuthService.
```

---

## Phase 6: Quizzes

```
PHASE 6: Quizzes

Data: src/data/quizzes/{naruto,onepiece,
bleach}.json, 30 questions each: 4
options, difficulty (easy|medium|hard),
one-line explanation, confidence field.
Only canon facts you're highly confident
about. Drop ambiguous questions.

Modes: single-anime, Mixed (all three),
Timed Blitz (60s with a streak
multiplier).

UI: pick mode/anime/difficulty, then one
question per screen with an animated
timer bar, instant right/wrong feedback
with the explanation, and a results
screen (score, accuracy, XP, streak).

Persist best scores and XP to the user
profile.

Daily Challenge: 5 questions seeded by
the date, playable once per day, with a
streak counter. Connect it to the Home
teaser card from Phase 1.
```

---

## Phase 7: Guessing games

```
PHASE 7: Mini guessing games (reuse
character data; no image dependency)

1. "Move Match": show 2-3 signatureMoves
   and abilityTags; guess the character
   with 4 options or type-to-guess with
   fuzzy matching. Hard mode shows only
   stat bars, no names. Use a fixed form
   snapshot and distinct answer profiles;
   skip ambiguous/shared-stat questions.
2. "Clue Chain": show the `clues` one at
   a time (hard to easy). Fewer clues
   used = more points.
3. "Higher or Lower: Power Edition": two
   characters, guess who has the higher
   powerScore. Streak mode. (It also lets
   players sanity-check our ratings.)

Each game: 10 rounds, score screen, high
score saved, play again. Build one shared
<GameShell> (round counter, score, timer)
and an anime filter (Naruto / One Piece /
Bleach / All).
```

---

## Phase 8: Polish, tests, expansion

```
PHASE 8: Polish, QA, expansion

1. Audit and fix: keyboard access,
   contrast, aria labels on game
   controls, loading/empty/error states,
   layout at 360px width, avatar fallback
   and optional-image errors, route splitting,
   prefers-reduced-motion.
2. Sound effects toggle (off by default).
3. Tests: unit tests for the battle
   engine, quiz scoring and
   LocalAuthService, plus one Playwright
   smoke test of the full battle flow.
4. README: setup, a "how to add a new
   anime" checklist (roster, stats JSON,
   quiz JSON, register in index), and a roadmap to a real
   backend (Express + Postgres/MongoDB,
   JWT auth, SERVER-SIDE battle
   resolution so players can't cheat,
   leaderboard).
5. Static deployment steps (Vercel or
   Netlify). Keep optional later image
   acquisition (`run fetch-images`) in
   the roadmap; do not require it now.
```

---

## Tips

- **Creative additions already included:** rarity cards, a reroll token, hidden lineup ordering, a "why they won" line, seeded replays, a daily challenge and a rank ladder.
- **Spot-check the power scores:** an LLM's scores come from its training knowledge, so fans will disagree. The `reasoning` and `confidence` fields help you audit them, and Higher-or-Lower will expose the odd ones.
- **If ChatGPT cuts off:** say "continue from file X" instead of regenerating. If the chat gets long, start a new one with Phase 0 plus the last State Summary.
