# Anime Battle Website: Phased ChatGPT Prompts

Paste **Phase 0** first, then one phase at a time. Test after each phase before saying "next".

## Design decisions baked into the prompts

- **Login:** the prototype uses local accounts in localStorage behind an `AuthService` interface, plus a `REQUIRE_LOGIN` flag that enables a "just type Player 1 / Player 2 names" mode. A real backend (Express + DB) can replace it later without touching the UI. Local login is not real security, which is fine for a prototype.
- **Images (revised by user):** Phase 3 is parked. Every character renders through `CharacterAvatar`: optional lazy-loaded `image`, otherwise initials, anime gradient, rarity glow and role icon. Do not search for or download artwork. Optional home covers are supplied manually in `/public/hero/`; CSS gradients cover missing files. Image acquisition is an optional later task, never a dependency for accounts or gameplay.
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
  files + register anime config. Optional
  images can be added later.

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
   /scripts, /public/hero.
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
   CharacterAvatar and CharacterCard.
   CharacterAvatar shows a lazy-loaded
   image when character.image exists;
   otherwise polished initials, anime
   gradient, rarity glow and role icon.
   A failed image also uses the fallback.
   CharacterCard has stat bars, rarity
   badge, ability chips and power score.
   Fallback avatars are the DEFAULT.
7. Hero/portal art reads optional local
   /public/hero/{home,naruto,onepiece,
   bleach}.jpg with CSS-gradient fallback.
   Use comic-font text portal logos.
   Do NOT fetch images from the web.
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

## Phase 3: Image pipeline — PARKED

Do not execute or write the image downloader until the user explicitly reopens this phase. Keep `imageQuery` and `image: null` in identity JSON. Images are optional; all later phases use `CharacterAvatar` and work without them. A future image pipeline must preserve identity/form matching and write compatible image values without replacing UI components.

On 2026-10-02 the user accepted current Phase 2 scope and deferred remaining forms/calibration. Continue directly to Phase 4. `run fetch-images` is an optional future roadmap item; no script or command exists today.

---

## Remaining execution prompts

[Phases 4–8: accounts, battles, quizzes, Move Match and polish](phases-4-to-8.md). Continue directly from completed Phase 2 to Phase 4; Phase 3 is optional and parked. See [task memory](../TASKS.md) for current work and unresolved checks.
