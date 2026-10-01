# ⚡ WWW-of-Anime

### 🍥 Shinobi. 🏴‍☠️ Pirates. ⚔️ Soul Reapers. One anime playground.

A passion project for **Naruto**, **One Piece**, and **Bleach** fans: explore your favorite worlds, test your knowledge, and eventually draft a team for a crossover showdown.

**🟢 Phase 1 interface built · 📝 Phase 2 power system proposed · 🎮 Gameplay coming in later phases**

[🚀 Run the website](#-run-the-website) · [🧭 Navigation](#-find-your-way-around) · [🎮 Features](#-whats-in-the-playground) · [🗺️ Roadmap](#️-roadmap) · [🛠️ Developer guide](docs/development.md)

> **What can I use today?** Browse the animated home page, explore the three anime portal previews, and navigate the responsive layout. Battles, quizzes, games and accounts are previews right now—there are no playable modes or working login forms yet.

## 🌌 Pick your universe

| World | The vibe | Your portal |
| --- | --- | --- |
| 🍥 **Naruto** | Shinobi rivalries, legendary jutsu, and the will of fire | `/anime/naruto` |
| 🏴‍☠️ **One Piece** | The Grand Line, Devil Fruits, and pirate adventures | `/anime/onepiece` |
| ⚔️ **Bleach** | Soul Reapers, clashing blades, and Bankai | `/anime/bleach` |

Orange and blue for Naruto, red/gold/ocean blue for One Piece, and black/orange/ice blue for Bleach. Each portal currently introduces its world; character catalogs arrive later.

## 🎮 What’s in the playground?

### ⚔️ Battle Arena — the main event

**Planned for Phase 5.** Face the CPU or a friend on the same device. Draft five random characters, reveal rarity cards, use a reroll, secretly arrange your lineup, and watch five rounds decide the winner. Results will explain each round and show an MVP.

The proposed power system uses one shared scale across all three worlds. It is a transparent game model, not an official ranking or a guarantee about hypothetical anime fights.

### 🧠 Anime Quizzes

**Planned for Phase 6.** Choose a single anime or a mixed quiz, select difficulty, and test yourself with canon questions and answer explanations. Timed Blitz will add a 60-second challenge.

### 🔍 Guessing Games

**Planned for Phase 7.** Three small games reuse the character roster:

- **Who’s That Shadow?** Identify a character from their silhouette.
- **Clue Chain:** Reveal clues one at a time; fewer clues mean more points.
- **Higher or Lower:** Guess which character has the higher game power score.

### 📅 Daily Challenge

**Planned for Phase 6.** Five date-seeded questions, one attempt per day, and a streak counter. Today’s home card is a locked teaser.

### 👤 Your Profile

**Planned for Phase 4.** A prototype account will hold an avatar, battle records, quiz progress, achievements and rank points. Local accounts will be device-specific; a real backend is on the long-term roadmap.

## 🧭 Find your way around

These are paths inside the running app, not links to a deployed website.

| Navigation | Path | What happens today |
| --- | --- | --- |
| 🏠 Home | `/` | Hero, anime portals, Battle banner and Daily Challenge teaser |
| ⚔️ Battle | `/battle` | Battle Arena preview |
| 🧠 Quizzes | `/quizzes` | Quiz preview |
| 🎮 Games | `/games` | Guessing games preview |
| 👤 Profile / Login | `/login` | Account preview; also links to the profile preview |
| 🏅 Profile | `/profile` | Profile preview |
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
npm run build
npm run preview
```

Open **http://localhost:4173**, or forwarded port **4173** in Codespaces. This previews the build without publishing it.

### 🔄 Already have a Codespace?

Save or commit your own changes first. Stop the development server, then update from `main`:

```bash
git pull --ff-only
npm ci
npm run dev
```

If Git reports local conflicts, resolve those before updating. Do not discard your changes to force a pull.

## 🗺️ Roadmap

| Phase | Milestone | Status |
| --- | --- | --- |
| 0 | Master brief | ✅ Complete |
| 1 | Scaffold, theme, home and navigation | ✅ Built; browser QA pending |
| 2 A | Power rubric, calibration and 120-character roster proposal | 📝 Awaiting approval |
| 2 B | Character JSON in small reviewed batches | ⏳ After Step A approval |
| 3 | Character image pipeline | 🔒 Planned |
| 4 | Accounts and profiles | 🔒 Planned |
| 5 | Battle Arena | 🔒 Planned |
| 6 | Quizzes and Daily Challenge | 🔒 Planned |
| 7 | Guessing games | 🔒 Planned |
| 8 | Polish, tests, expansion and deployment | 🔒 Planned |

We build one phase at a time. Nothing is publicly deployed yet.

## 🛠️ Under the hood

**React · Vite · Tailwind CSS · React Router · Framer Motion · JavaScript**

- 🎨 Anime palettes live together in `src/data/anime.js`.
- 🧩 Shared UI includes Button, Card, Modal, Badge, ProgressBar and CharacterCard.
- 📂 `src/data` will hold static characters and quizzes; `src/game` will hold pure battle logic.
- 🔌 `src/services` reserves the interface for future local accounts and persistence.
- ♿ The foundation includes focus styles, a skip link and reduced-motion handling. Full accessibility QA is still pending.

[Development structure & test checklist](docs/development.md) · [Full phased brief](docs/project-brief.md) · [Phase 2 proposal](docs/phase-2-power-rubric.md) · [Latest State Summary](STATE_SUMMARY.md)

## 📚 About the characters and scores

Character forms and abilities will be based on a fixed manga snapshot. The Phase 2 proposal specifies the cutoff, evidence policy, and uncertainty rules. Peak forms can contain major spoilers.

Cross-series scores are fan-made gameplay estimates. Rarity reflects those scores; it is not a measure of a character’s popularity or importance to the story.

## 🤝 Fan-project note

WWW-of-Anime is an unofficial fan prototype. Naruto, One Piece, Bleach and their characters belong to their respective rights holders. No third-party character artwork is bundled yet; future artwork requires appropriate usage rights before a public launch.

**Built for the rivalry. Stay for the next arc. ⚡**
