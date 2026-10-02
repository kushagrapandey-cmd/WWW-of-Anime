# ⚡ WWW-of-Anime

### 🍥 Shinobi. 🏴‍☠️ Pirates. ⚔️ Soul Reapers. One anime playground.

A passion project for **Naruto**, **One Piece**, and **Bleach** fans: explore your favorite worlds, test your knowledge, and draft a team for a crossover showdown.

**🌐 Online upgrade available · 🟢 Prototype phases complete · 📚 Naruto 40/40 · One Piece 40/40 · Bleach 40/40 · 🧬 Form explorer available · 👤 Local profiles available · ⚔️ Battle Arena playable**

[🚀 Run the website](#-run-the-website) · [🧭 Navigation](#-find-your-way-around) · [🎮 Features](#-whats-in-the-playground) · [🗺️ Roadmap](#️-roadmap) · [🛠️ Developer guide](docs/development.md)

> **What can I use today?** Browse character ratings and fallback avatars, explore the animated home page, explore the three anime portal previews, and navigate the responsive layout. Create a local account, log in, choose an avatar and view your profile. Draft against the CPU or a local friend in Battle Arena. Play Classic quizzes, Timed Blitz and Daily Challenge. Play Move Match, Clue Chain and Higher or Lower.

## 🌌 Pick your universe

| World | The vibe | Your portal |
| --- | --- | --- |
| 🍥 **Naruto** | Shinobi rivalries, legendary jutsu, and the will of fire | `/anime/naruto` |
| 🏴‍☠️ **One Piece** | The Grand Line, Devil Fruits, and pirate adventures | `/anime/onepiece` |
| ⚔️ **Bleach** | Soul Reapers, clashing blades, and Bankai | `/anime/bleach` |

Orange and blue for Naruto, red/gold/ocean blue for One Piece, and black/orange/ice blue for Bleach. Each portal currently introduces its world; the shared `/characters` explorer contains all 120 identities.

## 🎮 What’s in the playground?

### ⚔️ Battle Arena — the main event

**Available now.** Face the CPU or a friend on the same device. Draft five random characters, reveal rarity cards, use a reroll, secretly arrange your lineup, and watch five rounds decide the winner. Results explain each round, show an MVP and update your profile. Replay the last 20 battles, copy results or rematch. Peak forms are the default; variant mode locks the drawn form before play.

The approved power system uses one shared scale across all three worlds. It is a transparent game model, not an official ranking or a guarantee about hypothetical anime fights.

### 🧠 Anime Quizzes

**Available now.** Choose one anime or Mixed, select difficulty and play 10-question Classic or 60-second Blitz with streak multipliers. The bank has 90 four-option questions (30 per anime). Every answer shows an explanation; results save XP, best accuracy and mode high scores.

### 🔍 Guessing Games

**Available now.** Three games reuse fixed peak snapshots from the existing roster. Each has 10 rounds, timers, saved high scores and resumable sessions:

- **Move Match:** Identify a character from 2–3 signature moves and ability tags. Choose four options or typed names; hard mode uses unnamed stat bars.
- **Clue Chain:** Reveal clues one at a time; fewer clues mean more points.
- **Higher or Lower:** Compare peak game power scores; equal pairs are excluded. Optional streak scoring rewards consecutive correct answers.

### 📅 Daily Challenge

**Available now.** Five shared, date-seeded mixed questions. One attempt per account or guest browser profile each day, reset at midnight India time. Resume unfinished attempts; signed-in completions build a daily streak. The Home card opens today’s challenge.

### 👤 Your Profile

**Available now.** Create a username/password account, pick an avatar, and view your rank, battle record, quiz progress and achievements. New profiles start at zero; Arena matches update wins, losses, streaks, rank points and achievements. Quizzes save XP, best accuracy, mode high scores and daily streaks. Guessing games save completed-game counts and separate high-score boards. Accounts stay in this browser and do not sync to other devices. Use a demo password; a real backend remains on the roadmap.

## 🧭 Find your way around

These are paths inside the running app, not links to a deployed website.

| Navigation | Path | What happens today |
| --- | --- | --- |
| 🏠 Home | `/` | Hero, anime portals, Battle banner and playable Daily Challenge link |
| ⚔️ Battle | `/battle` | Five-card CPU/local-friend arena, results and replays; guest flag available |
| 🧠 Quizzes | `/quizzes` | Classic, Mixed, Timed Blitz, Daily Challenge and saved attempts |
| 🎮 Games | `/games` | Move Match, Clue Chain, Higher or Lower, saved sessions and high scores |
| 👤 Login | `/login` | Local account login; returns to the requested page |
| ✨ Create account | `/signup` | Local signup with validation |
| 🏅 Profile | `/profile` | Protected profile, avatar picker, stats, rank and logout |
| 🧬 **Characters & Power** | `/characters` | Browse ratings, compare forms, understand selection and tiers |
| 🌌 Anime portals | `/anime/:animeId` | Naruto, One Piece or Bleach introduction |
| 🌀 Unknown page | Any unmatched path | A 404 page with a way home |

On mobile, use the menu button at the top right. Choosing a page closes the menu. On desktop, the main sections appear across the navbar.

## 🚀 Run the website

### ☁️ GitHub Codespaces — easiest way to try it

1. Select **Code → Codespaces → Create codespace on main** in this repository.
2. Wait for the Node 22 container to finish setup; dependencies install automatically.
3. Run this in the terminal at the repository root:

```bash
npm run dev
```

4. Open **Ports → 5173 → Open in Browser**. Keep the port **Private**.
5. Keep the terminal running while you test. Stop it with `Ctrl+C`.

Codespaces uses a forwarded HTTPS address; your own computer’s localhost is not the remote Codespace. If setup did not install dependencies, run `npm ci` first.

### 💻 On your computer

Use **Node.js 22.12+**. `.nvmrc` selects Node 22.

```bash
git clone https://github.com/kushagrapandey-cmd/WWW-of-Anime.git
cd WWW-of-Anime
npm ci
npm run dev
```

Open **http://localhost:5173**. If the port is occupied, stop the old server or use `npm run dev -- --port 5174`.

### 📦 Check the production build

```bash
npm run validate:data
npm test
npm run build
npm run preview
```

Open **http://localhost:4173**, or forwarded port **4173** in Codespaces. This previews the build without publishing it.

### 🧪 Browser and accessibility smoke checks

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

Playwright runs CPU/local-friend battles, quizzes, guessing games, navigation, image/storage errors and lazy-route recovery at desktop and 360px using the production build. It checks keyboard focus, clipped headings, horizontal overflow and axe accessibility rules. `npm test` runs 67 unit tests; browser checks run separately. Reports/traces are ignored by Git. CI runs both suites on Node 24.

### 🔄 Already have a Codespace?

Save or commit your own changes first. Stop the development server, then update from `main`:

```bash
git pull --ff-only
npm ci
npm run dev
```

If Git reports local conflicts, resolve those before updating. Do not discard your changes to force a pull.

## 🔊 Optional sound

The footer **Sound off** button enables short generated effects for game reveals, answers and results. Off by default; your preference stays in this browser. Muting stops active tones. No audio files are downloaded.

## 🚢 Deployment and expansion

[Deployment steps](docs/deployment.md) cover the Vercel Functions + PostgreSQL setup and tracked SPA rewrites. Build command: `npm run build`; output: `dist`; Node 24. Production is hosted at https://www-of-anime.vercel.app/.

To add an anime later, add its entry to `src/data/anime-catalog.json`, matching character/stats and quiz JSON, and optional form JSON. Imports, filters and themes update automatically at build time. Validate and test every game pool; [the full checklist](docs/expansion.md) specifies schemas/minimums and optional local images. Phase 3 remains parked; no image downloader exists yet.

The [backend roadmap](docs/expansion.md#backend-roadmap) covers Express, Postgres/MongoDB, JWT sessions, server-owned battle/draft and game scoring, atomic progress receipts and leaderboards. Current accounts and scores remain browser-local demo data.

## 🗺️ Roadmap

| Phase | Milestone | Status |
| --- | --- | --- |
| 0 | Master brief | ✅ Complete |
| 1 | Scaffold, theme, home and navigation | ✅ Built; Chromium QA in Phase 8 |
| 2 A | Power rubric, calibration and 120-character roster proposal | ✅ Approved |
| 2 B | Character database and forms | ✅ Current scope accepted: 120 identities / 237 snapshots; further review deferred |
| 3 | Optional character image pipeline | ⏸️ Parked; no gameplay dependency |
| 4 | Accounts and profiles | ✅ Local prototype implemented; Chromium QA in Phase 8 |
| 5 | Battle Arena | ✅ Implemented and tested; Chromium QA in Phase 8 |
| 6 | Quizzes and Daily Challenge | ✅ Implemented and tested; Chromium QA in Phase 8 |
| 7 | Guessing games | ✅ Implemented and tested; Chromium QA in Phase 8 |
| 8 | Polish, tests, expansion and deployment | ✅ Implemented; hosting prepared |

We build one phase at a time. Phase 2 is closed at the user’s accepted scope, and Phases 4–8 local accounts, Battle Arena, quizzes, guessing games, polish and QA are implemented. Phase 3 is optional and parked. Nothing is publicly deployed yet.

## 🛠️ Under the hood

**React · Vite · Tailwind CSS · React Router · Framer Motion · JavaScript**

- 🎨 Anime palettes and manga cutoffs live in `src/data/anime-catalog.json`; JSON banks/forms load automatically.
- 🧩 Shared UI includes Button, Card, Modal, Badge, ProgressBar, CharacterAvatar and CharacterCard. Cards include stats, power and ability chips with no artwork dependency.
- 📂 `src/data` holds characters/forms; `src/game` contains the pure seeded draft, battle engine and rank calculation.
- 🔌 `src/services/AuthService.js` exposes async local account/profile operations and can later swap to an API adapter.
- ♿ Keyboard focus, skip navigation, reduced motion and tested WCAG checks pass in desktop/360px Chromium; other browsers and assistive technology still need release checks.

[Development structure & test checklist](docs/development.md) · [Full phased brief](docs/project-brief.md) · [Approved power rubric](docs/phase-2-power-rubric.md) · [Naruto batch 1 audit](docs/naruto-batch-1-audit.md) · [Naruto batch 2 audit](docs/naruto-batch-2-audit.md) · [Naruto batch 3 audit](docs/naruto-batch-3-audit.md) · [One Piece batch 1 audit](docs/onepiece-batch-1-audit.md) · [One Piece batch 2 audit](docs/onepiece-batch-2-audit.md) · [Forms policy & coverage](docs/character-forms.md) · [Naruto forms audit 1](docs/naruto-forms-batch-1-audit.md) · [Forms audit 2](docs/naruto-forms-batch-2-audit.md) · [Forms audit 3](docs/naruto-forms-batch-3-audit.md) · [One Piece forms audit 1](docs/onepiece-forms-batch-1-audit.md) · [Roster completion review](docs/roster-completion-review.md) · [One Piece final batch](docs/onepiece-batch-3-audit.md) · [Bleach audits](docs/bleach-batch-1-audit.md) · [Task memory & execution order](TASKS.md) · [Later phase prompts](docs/phases-4-to-8.md) · [Phase 4 accounts](docs/phase-4-accounts.md) · [Phase 5 arena and testing](docs/phase-5-arena.md) · [Phase 6 quizzes and testing](docs/phase-6-quizzes.md) · [Phase 7 games and testing](docs/phase-7-games.md) · [Phase 8 polish & browser QA](docs/phase-8-polish.md) · [Deployment](docs/deployment.md) · [Expansion & backend roadmap](docs/expansion.md) · [Latest State Summary](STATE_SUMMARY.md)

## 📚 About the characters and scores

Character forms and abilities will be based on a fixed manga snapshot. The approved Phase 2 rubric specifies the cutoff, evidence policy, and uncertainty rules. Peak forms can contain major spoilers.

All **120 character identities** are loaded: **40 Naruto, 40 One Piece and 40 Bleach**. Visit **Characters** to explore their selected peak ratings and **237 form snapshots across 55 identities** (170 Naruto snapshots across all 40 characters, plus 67 One Piece snapshots across its first 15 identities). One Piece additions include early Luffy Gears/Nightmare, Zoro’s sword/Asura states, Sanji’s suit/Ifrit, Chopper’s Points and Robin’s giant blooms. Naruto forms separate Pain’s bodies, Obito’s Kamui/host states, Madara’s eye/host configurations and Killer B’s cloaks/Gyuki. Forms also include Sasuke’s curse marks and eyes, Kakashi’s temporary dual Sharingan, Guy/Lee’s gates, Choji’s pills and Gaara’s Shukaku states. Counts describe authored records; complete canon and inventory review is deferred. Unexpanded characters are clearly marked deferred; the user accepted the current character scope and deferred additional forms and complete calibration. Character images remain empty; polished fallback avatars are the default. Phase 3 is parked, so accounts, battles and text games proceed without artwork. Power score and tier are game estimates; player rank is separate and now shown on local profiles.

Cross-series scores are fan-made gameplay estimates. Rarity reflects those scores; it is not a measure of a character’s popularity or importance to the story.

## 🎨 Artwork is optional

All 120 characters use the shared **CharacterAvatar** fallback: initials, anime gradients, rarity glow and role icons. A future `image` value uses lazy-loaded art; loading errors return to the fallback.

You can manually add `home.jpg`, `naruto.jpg`, `onepiece.jpg` and `bleach.jpg` in [`public/hero/`](public/hero/README.md). Missing files retain the CSS gradients. Portal names stay as comic-font text. No character or cover artwork is fetched from the web.

Optional later roadmap: reopen Phase 3 and implement/run `fetch-images` after gameplay is solid. This command does **not** exist yet.

## 🤝 Fan-project note

WWW-of-Anime is an unofficial fan prototype. Naruto, One Piece, Bleach and their characters belong to their respective rights holders. No third-party character artwork is bundled yet; future artwork requires appropriate usage rights before a public launch.

**Built for the rivalry. Stay for the next arc. ⚡**


## Online accounts and multiplayer

Production now uses **Vercel Functions + PostgreSQL** for accounts, invites, private drafts and shared results. Sign-in and progress work across devices after the database is configured. Guests can practice quizzes/games locally. Browser-only prototype accounts do not migrate automatically.

Start with [Vercel deployment and environment setup](docs/deployment.md) and the [online upgrade handoff](docs/online-upgrade.md). **A static deployment alone does not activate the backend.** Production is deployed on Vercel Hobby with Neon Free PostgreSQL. Email recovery and production operations remain pending.
