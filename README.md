# WWW-of-Anime

**Three worlds. One playground.** An interactive fan project for Naruto, One Piece and Bleach, featuring character exploration, private online battles, quizzes and guessing games.

[Live demo](https://www-of-anime.vercel.app/) · [Architecture & interview guide](docs/architecture-interview-guide.md) · [Development](docs/development.md) · [Deployment](docs/deployment.md)

**Status: public beta.** Production uses Vercel Functions and PostgreSQL for online accounts and progress. An explicit browser-local demo mode remains available for development. Email password recovery and production operations work remain pending.

![WWW-of-Anime home page with crossover hero and primary navigation](docs/screenshots/home-showcase.webp)

## Product walkthrough

The screenshots below were supplied by the project creator. They illustrate the interface, not automated proof that every workflow passes. Some captures show page sections rather than the entire viewport.

### Home — `/`

The landing page introduces the crossover experience and directs visitors to battles, quizzes and the character power guide. Shared navigation connects the major sections.

### Three anime worlds — `/` and `/anime/:animeId`

Naruto, One Piece and Bleach each have themed portal cards with introductory story and publication metadata. Selecting a world opens its introduction; the shared character explorer covers all three rosters. Publication counts are editorial snapshots and may need updating as ongoing series progress.

![The Naruto, One Piece and Bleach world cards with themed introductions](docs/screenshots/worlds.png)

### Accounts — `/login` and `/signup`

Username/password authentication connects users to a persistent online profile. Account creation validates input; protected routes return signed-in users to their intended destination. Production uses server sessions in HttpOnly cookies, not browser-local credentials. Email recovery is not yet available.

![Login page with account benefits, username field and password control](docs/screenshots/login.png)

### Battle Arena — `/battle`

Create a CPU match or invite a friend using a private link. Filter by world and optionally include form variants. Each participant drafts five fighters, uses an optional reroll, orders their lineup and locks it. The server checks account ownership, hides the opponent's lineup until completion, computes results and awards rank. Unfinished matches expire after 24 hours; visible friend-match tabs use adaptive polling (4–15 seconds), while CPU tabs synchronize every 30 seconds. Completed matches reveal five rounds with pause, skip and replay controls.

![Online Battle Arena setup with opponent, world and form variant controls](docs/screenshots/battle.png)

### Anime quizzes — `/quizzes`

A 180-question authored bank supports Classic, Timed Blitz and Daily Challenge modes. Anime/difficulty filters, answer explanations, XP, accuracy and streaks provide progression. Signed-in attempts and scoring are managed by the server; guest practice remains browser-local. Daily challenges reset at midnight India time.

![Quiz quick-play cards for Blitz, Daily Challenge and Classic](docs/screenshots/quizzes-showcase.webp)

### Guessing games — `/games`

Move Match, Clue Chain and Higher or Lower reuse the character roster. Options include multiple-choice or typed answers where supported, timed rounds, hints and resumable attempts. Quick-play cards start preset games immediately; optional custom settings retain advanced rules. High scores are separate from battle rank and quiz XP.

![Quick-play cards for Move Match, Clue Chain and Higher or Lower](docs/screenshots/games-showcase.webp)

### Characters and forms — `/characters`

Explore 120 identities across the three worlds and 237 authored form snapshots in the accepted scope. Search and filter the portrait roster, then compare two fighters/forms side by side. Dossiers display weighted stats, game power tiers, signature moves and limitations. Forms are not complete canon inventories; ratings are provisional gameplay estimates.

![Searchable character portrait archive with world filters and fighter dossiers](docs/screenshots/character-forms-showcase.webp)

### Profile — `/profile`

A protected profile combines a selectable character portrait, rank, battle record, quiz progress, game high scores and achievements. Six lifetime objectives unlock cosmetic player titles from saved statistics. Online accounts persist across devices. Account security controls support password changes and revoking all sessions.

## Technology and architecture

| Layer | Implementation |
| --- | --- |
| Frontend | React 19, JavaScript, React Router 7 |
| Build and styling | Vite 6, Tailwind CSS 4, custom CSS |
| Animation and icons | Framer Motion, Lucide React |
| Backend | Node.js Vercel Functions, same-origin JSON API |
| Database | PostgreSQL via `pg`; production deployment uses Neon Free |
| Authentication | Salted scrypt passwords, hashed opaque sessions, HttpOnly cookies |
| Multiplayer | Server-owned state, private invites, row locks, revision checks and HTTP polling |
| Game rules | Shared pure JavaScript engines with seeded randomness and versioned replays |
| Quality checks | Node test runner, Vitest, Playwright, axe and JSON validators |
| Hosting | Vercel Hobby with a tracked SPA rewrite configuration |

This project uses **React + Vite, not Next.js**. Production authentication is not JWT-based. Character catalogs and questions are authored JSON. Runtime uses bundled WebP portraits; no external anime/image API is required. Portrait sources, image processing and rights notes are documented in [the portrait audit](docs/character-portrait-audit.md) and public `/credits`. [Showcase release notes and manual checks](docs/SHOWCASE-RELEASE.md) cover the combined update.

```mermaid
flowchart TD
  UI[React pages and shared components] --> Services[API and local service adapters]
  Services --> API[Vercel Node API]
  Services --> Local[Guest and explicit demo storage]
  API --> Rules[Account, match and activity rules]
  Rules --> DB[PostgreSQL transactions]
  Rules --> Engines[Shared game engines and JSON catalogs]
```

The browser manages presentation and input. The server verifies identity, permissions, transitions and official scores. Match/profile changes use transactions and locks; stale revisions return conflicts. The frontend refreshes latest state and carefully limits retries. See the [code walkthrough](docs/architecture-interview-guide.md) for request flows, important functions and tradeoffs.

## Run locally

Requires Node.js 22.12+; CI uses Node 24.

```bash
git clone https://github.com/kushagrapandey-cmd/WWW-of-Anime.git
cd WWW-of-Anime
npm ci
npm run dev
```

Open `http://localhost:5173`. Local development defaults to the browser-local prototype unless online mode is configured. Demo accounts do not automatically migrate to production. Do not use a valuable password for the local prototype.

For online development, configure `.env.local` using `.env.example`, provision PostgreSQL, set the documented origin/auth mode, and run migrations and the API in addition to Vite:

```bash
npm run db:migrate
npm run dev:api
```

Follow [deployment configuration](docs/deployment.md) for exact environment requirements. Never commit `.env.local` or expose database credentials in `VITE_*` variables. A static preview alone does not run the online API.

## Validation

```bash
npm run validate:data
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run test:e2e:online
```

CI runs data validation, authentication/server/unit tests, and prototype/online Chromium checks on pushes and pull requests. The online test harness uses PGlite for reproducible database tests. Test counts and results should be taken from the latest run rather than a fixed README claim. Broader browser/device and assistive-technology coverage remains ongoing work.

## Design choices and current limits

- CharacterAvatar provides initials, anime gradients, rarity framing and role icons; portrait loading failures retain the fallback. One bundled third-party portrait per identity is shared across forms, with local thumbnails and public source credits. Attribution does not establish redistribution permission.
- Five-round battle outcomes combine authored power, bounded ability counters, team synergy and seeded luck. Game balance and canon accuracy are separate concerns.
- Turn-based multiplayer uses adaptive polling rather than WebSockets: visible friend matches back off from 4 to 15 seconds when unchanged, locked lineups use 4 seconds, CPU matches use 30 seconds, and hidden tabs skip requests. This simplifies serverless hosting but introduces update latency and request load.
- Online scores are server-calculated. Public authored question/roster data means this is not a cheat-proof competitive system.
- Optional sound is generated with Web Audio and starts only after opt-in. Reduced motion and keyboard navigation are supported.
- Email recovery, policy/account-deletion workflows, stronger operational monitoring/backups, further roster calibration and wider compatibility checks remain future work.
- The identity-portrait pipeline shipped on 27 October 2026: `python3 scripts/prepare-character-images.py` rebuilds missing portraits from the source manifest. A legacy `fetch-images` npm command does not exist.

## Development approach

This is an **AI-assisted project**. AI coding tools helped with implementation, documentation, debugging and test generation. The project creator defined the product direction and provided hands-on feedback. Specific authorship and review responsibility should be described accurately; AI-generated code still requires understanding, verification and maintenance.

## Documentation

- [Architecture, function walkthrough and interview preparation](docs/architecture-interview-guide.md)
- [Development structure](docs/development.md)
- [Deployment and environment configuration](docs/deployment.md)
- [Online upgrade](docs/online-upgrade.md)
- [Character forms policy](docs/character-forms.md)
- [Power rubric](docs/phase-2-power-rubric.md)
- [Expansion checklist](docs/expansion.md)
- [Task history](TASKS.md) and [state summary](STATE_SUMMARY.md)

## Fan-project notice

WWW-of-Anime is unofficial and is not affiliated with the rights holders of Naruto, One Piece or Bleach. Names and characters belong to their respective owners. Character stats and crossover outcomes are fan-made game mechanics. Bundled and future artwork requires appropriate usage rights; the source manifest records attribution, not a license grant. Content may contain spoilers.

### Showcase coins and feedback

Battle Arena wins now earn display-only coins through the server-owned match result. The account stores a transaction ledger, current reward streak and acknowledged milestones; no coin-purchase or redemption feature is enabled. The homepage footer includes contact links and a visitor feedback form.

Consecutive Arena wins award 10, 10, 15, 20, 25, 30, then 35 coins per win; a loss awards zero and resets the streak. The cap is on the per-win streak bonus, not a daily allowance. The disabled Redeem button is intentional. Online quiz/game completion refreshes profile progress without requiring a page reload; see [the progress fix](docs/activity-progress-fix.md).

See [implementation choices, file plan, setup and manual tests](docs/coins-and-feedback.md). Feedback delivery requires a server-only Resend key; the direct email link remains available when delivery is not configured.

## Character portraits and share cards

One portrait per identity is shared across forms, including old saved snapshots through `CharacterAvatar`. Grid thumbnails load lazily; broken images retain the generated avatar. `scripts/prepare-character-images.py` rebuilds missing images from the reviewed source manifest (requires Pillow; add `--force` to replace existing images). New source artwork must be reviewed for identity and applicable rights. Result cards are generated in the browser; sharing opens a public play route and does not expose private invites.
