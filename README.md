# WWW-of-Anime — Phase 1

A React + Vite + Tailwind CSS + React Router + Framer Motion prototype, in plain JavaScript. Only Phase 1 is implemented. Anime portal pages, Battle, Quizzes, Games, Profile and Login are intentional previews. No character database, authentication, game engine, or user persistence exists yet.

## Test in GitHub Codespaces

1. Select **Code → Codespaces → Create codespace on main** in this repository.
2. Wait for setup. The Node 22 container installs dependencies using `npm ci` automatically.
3. At the repository root in the Codespaces terminal, run:

```bash
npm run dev
```

4. Open the **Ports** tab and click **Open in Browser** for port **5173**. Keep its visibility **Private**. Codespaces provides a forwarded HTTPS URL; your computer's localhost is not the remote Codespace.
5. Leave the terminal running while testing; stop it with `Ctrl+C`.

If automatic installation did not complete:

```bash
npm ci
npm run dev
```

## Test on your computer

Requires Node.js 22.12+; `.nvmrc` selects Node 22.

```bash
git clone https://github.com/kushagrapandey-cmd/WWW-of-Anime.git
cd WWW-of-Anime
npm ci
npm run dev
```

Open `http://localhost:5173`. If occupied, stop the old server or run `npm run dev -- --port 5174` and open that port.

## Production build check

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` locally, or forwarded port **4173** in Codespaces. This previews the built site without publishing it.

## Complete folder structure

```text
WWW-of-Anime/
  index.html
  package.json
  package-lock.json
  vite.config.js
  README.md
  STATE_SUMMARY.md
  .gitignore
  .nvmrc
  .devcontainer/devcontainer.json
  docs/project-brief.md
  public/
    favicon.svg
    characters/.gitkeep
  scripts/.gitkeep
  src/
    main.jsx
    App.jsx
    styles.css
    components/
      Navbar.jsx
      Layout.jsx
      Button.jsx
      Card.jsx
      Modal.jsx
      Badge.jsx
      ProgressBar.jsx
      CharacterCard.jsx
    pages/
      Home.jsx
      Placeholder.jsx
    data/
      anime.js
      characters/.gitkeep
      quizzes/.gitkeep
    services/.gitkeep
    game/.gitkeep
    hooks/.gitkeep
```

All paths above are complete files inside the archive. Empty directories reserve the later phases; they contain no unfinished Phase 1 logic.

## How to test

- Home: animated gradient hero, three anime portals, Battle banner and locked Daily Challenge teaser are visible.
- Click Home, Battle, Quizzes, Games and Profile / Login. Each reaches its correct route and highlights its navigation item where applicable.
- Click each anime portal. Verify Naruto, One Piece and Bleach preview pages and their theme colors.
- Visit `/profile`, `/login`, `/does-not-exist` and `/anime/unknown`. The first two show previews; the last two show the 404 screen.
- At 360px width: open/close the navigation menu, select a route, and check that the menu closes. Confirm no horizontal scroll.
- Use Tab and Enter to navigate links; check visible focus and the skip-to-content link.
- Turn on the operating system's reduced-motion preference. Decorative motion should stop.
- Run `npm run build`; it should succeed. Visit routes using `npm run preview`.

## Reusable component interfaces

- `Button`: `to`, `variant` (`primary` / `secondary`), `children`, native button/link props.
- `Card`: `children`, `className`, native div props.
- `Modal`: `open`, `onClose`, `title`, `children`. Native dialog provides focus trapping, Escape handling and focus return; backdrop clicks close it.
- `Badge`: `children`, optional `color`, `className`.
- `ProgressBar`: `value`, `max`, `label`, `color`. Values are clamped and exposed accessibly.
- `CharacterCard`: `name`, `anime`, `image`, `rarity`, `powerScore`, `selected`, optional `onSelect`. Props only; initials appear when no image is supplied or loading fails.

## Key decisions

- Default brand is WWW-of-Anime. Lime marks global actions; anime accents live together in `src/data/anime.js`.
- Anime portals read the shared config rather than repeating per-anime markup.
- Phase 1 uses typographic motifs and interface icons; character assets belong to Phase 3.
- Modal uses the browser's accessible native dialog; reduced-motion preferences are respected globally.
- Hosting stays deferred to Phase 8, as requested. Production static hosting will need SPA rewrites to `index.html` for direct route visits.

Bangers and Poppins load from Google Fonts with local font fallbacks. No third-party character imagery is bundled. This is an unofficial fan prototype.

## Verification performed

Dependency installation and `npm run build` succeed. A persistent live preview was not verified in this environment. Automated visual/mobile browser checks could not run because this environment has no installed Chromium executable; use the checklist above for visual and interaction verification.

## Phase status

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Master brief | Complete |
| 1 | Scaffold, theme, navigation, home, shared components | Complete; manual browser checks pending |
| 2 | Character roster and power rubric | Next; approve Step A before data batches |
| 3 | Image pipeline | Planned |
| 4 | Accounts and profiles | Planned |
| 5 | Battle Arena | Planned |
| 6 | Quizzes and Daily Challenge | Planned |
| 7 | Guessing games | Planned |
| 8 | Polish, tests, expansion and deployment | Planned |

The phased brief lives in `docs/project-brief.md`; the handoff is in `STATE_SUMMARY.md`. Future phases update this repository.
