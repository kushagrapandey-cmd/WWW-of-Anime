# Anime Battle Website: Phased ChatGPT Prompts

Paste **Phase 0** first, then one phase at a time. Test after each phase before saying "next".

## Design decisions baked into the prompts

- **Login:** the prototype uses local accounts in localStorage behind an `AuthService` interface, plus a `REQUIRE_LOGIN` flag that enables a "just type Player 1 / Player 2 names" mode. A real backend (Express + DB) can replace it later without touching the UI. Local login is not real security, which is fine for a prototype.
- **Images:** a Node script, run on your own machine, downloads images from the AniList and Jikan APIs into `/public/characters`. ChatGPT's chat sandbox usually has no internet, so it can write the script but can't run it. The images are copyrighted: fine locally, but license or replace them before a public launch.
- **Power scores:** one rubric on one shared scale across all three anime, generated in batches and saved as static JSON. Battles then cost nothing at runtime and stay consistent.

---

## Phase 0: Master brief (paste first)

```
You are my senior full-stack engineer and
game designer. We're building "[SITE NAME,
e.g. WWW-of-Anime]": a colorful, fun,
anime-themed website, built in phases.

PRODUCT
- Sections: Anime Quizzes, small Guessing
  Games, and Battle Arena (main feature).
- Launch content: only Naruto, One Piece,
  Bleach.
- Adding a new anime later = new data
  files + run the image script. No code
  changes.

STACK (prototype, no backend yet)
- React + Vite + Tailwind + React Router
  + Framer Motion. Plain JavaScript (ES
  modules), not TypeScript.
- Static JSON in /src/data. User data in
  localStorage via service modules, so a
  real backend can replace them later.

WORKING RULES
- ONE phase at a time. Never jump ahead.
  Wait for me to say "next".
- Give COMPLETE files with full paths. No
  "rest of code here" placeholders.
- Give exact terminal commands, then a
  "How to test" checklist.
- Small modular files (max ~250 lines).
- Explain key decisions in max 5 bullets.
- If ambiguous, pick a sensible default,
  state it in one line, continue. Only
  ask if truly blocked.
- End every phase with a "State Summary"
  (<150 words: structure, decisions,
  files) that I can paste into a fresh
  chat if this one gets long.

Reply only: "Ready".
```

---

## Phase 1: Scaffold, design system, home page

```
PHASE 1: Scaffold + design system + layout

1. Setup commands and the full folder
   structure for the whole project:
   /src/pages, /components, /data,
   /services, /game (pure battle logic,
   no React), /hooks, /public/characters,
   /scripts.
2. Theme: bold, colorful, anime-inspired.
   Dark base, neon gradients, thick
   rounded cards, comic-style headings
   (Bangers + Poppins), subtle motion.
   Each anime gets its own accent palette
   in ONE config file: Naruto =
   orange/blue, One Piece = red/gold/
   ocean blue, Bleach = black/orange/
   ice-blue.
3. Mobile-first responsive navbar: Home,
   Battle, Quizzes, Games, Profile/Login.
4. Home page: animated-gradient hero,
   three "anime portal" cards, a Battle
   Arena banner, and a "Daily Challenge"
   teaser card (placeholder for now).
5. Routing with placeholder pages and a
   404 page.
6. Reusable components: Button, Card,
   Modal, Badge, ProgressBar, and
   CharacterCard (rarity-colored glow
   frame; props only for now).
```

---

## Phase 2: Character database and power system

```
PHASE 2: Character database + power system
(data only, no UI)

STEP A (do now, then STOP for my approval):
1. Define a transparent power rubric.
   Rate every character at their PEAK
   CANON form (manga canon only; no
   filler, movies or games). Stats 1-100:
   attack, defense, speed, durability,
   intelligence/tactics, versatility,
   stamina, feats.
2. Compute powerScore (1-1000) with an
   exact weighted formula. Show weights.
3. Use ONE shared scale across all three
   series. Define an anchor ladder
   (street, building, city, island,
   country, planetary+). Place 3
   reference characters per rung, from
   different series, and calibrate
   everyone against it. A series' top
   characters must not all land at 900+
   by default.
4. Rarity tiers from powerScore: Common,
   Rare, Epic, Legendary, Mythic. Give
   cutoffs for roughly 35/30/20/11/4%.
5. Propose a roster of ~40 characters per
   anime (mains, major antagonists,
   popular supports). Names only.

STEP B (after I say "approved"; one anime
per reply, max 15 characters per batch;
continue on "next"):
Output a valid JSON array. Per character:
{ id (slug), name, anime, faction,
  role (Striker|Tank|Support|Tactician|
  Hybrid), stats {...}, powerScore,
  rarity, abilityTags [3-5, e.g. "fire",
  "speed", "genjutsu", "haki",
  "reiatsu"], signatureMoves [2-3],
  clues [3 clues, hardest to easiest, no
  name in them], reasoning (max 25 words),
  confidence (high|medium|low),
  imageQuery (exact name as on AniList/
  MyAnimeList), image: null }
Rules: follow the rubric strictly, don't
invent characters or abilities, no
verbatim quotes. Save as
src/data/characters/naruto.json,
onepiece.json, bleach.json plus
src/data/index.js that merges them.
```

---

## Phase 3: Image pipeline

```
PHASE 3: Character image pipeline
(runs on MY machine at build time)

Write /scripts/fetch-images.mjs (Node 18+)
that:
1. Reads all character JSON files.
2. Finds each image via the AniList
   GraphQL API (primary), falling back
   to the Jikan (MyAnimeList) API, using
   imageQuery. Verify the match by name
   + series so I don't get the wrong
   character.
3. Downloads to
   /public/characters/<anime>/<id>.jpg.
   Idempotent: skip existing files.
4. Respects rate limits: sequential
   requests, small delay, exponential
   backoff on 429.
5. Writes /public/characters/manifest.json
   (id, local path, source URL, source
   site) and fills each character's
   `image` field.
6. Prints a report (downloaded / skipped
   / failed / low-confidence) and saves
   failures to /scripts/failed.json.
7. Flags: --anime=naruto and --force.

Frontend: a <CharacterImage> component
with lazy loading, a blur placeholder,
and a colored-initials fallback if the
file is missing.

README note: these images belong to their
rights holders. Fine for a local
prototype; license or replace them before
public launch.
```

---

## Phase 4: Accounts and profile

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
   with a card-flip animation. Rarity-
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
character data and images)

1. "Who's That Shadow?": silhouette
   (CSS brightness(0)) of the image.
   4 options OR type-to-guess with fuzzy
   matching. Image reveals on answer.
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
   layout at 360px width, lazy-loaded
   images, route code-splitting,
   prefers-reduced-motion.
2. Sound effects toggle (off by default).
3. Tests: unit tests for the battle
   engine, quiz scoring and
   LocalAuthService, plus one Playwright
   smoke test of the full battle flow.
4. README: setup, a "how to add a new
   anime" checklist (roster, stats JSON,
   quiz JSON, run fetch-images, register
   in index), and a roadmap to a real
   backend (Express + Postgres/MongoDB,
   JWT auth, SERVER-SIDE battle
   resolution so players can't cheat,
   leaderboard).
5. Static deployment steps (Vercel or
   Netlify) and an image-licensing
   warning.
```

---

## Tips

- **Creative additions already included:** rarity cards, a reroll token, hidden lineup ordering, a "why they won" line, seeded replays, a daily challenge and a rank ladder.
- **Spot-check the power scores:** an LLM's scores come from its training knowledge, so fans will disagree. The `reasoning` and `confidence` fields help you audit them, and Higher-or-Lower will expose the odd ones.
- **If ChatGPT cuts off:** say "continue from file X" instead of regenerating. If the chat gets long, start a new one with Phase 0 plus the last State Summary.
