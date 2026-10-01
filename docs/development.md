# 🛠️ Development & testing

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

All paths above are tracked source files in this repository. Empty directories reserve the later phases; they contain no unfinished Phase 1 logic.

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


## Verification

The Phase 1 production build passes. Visual, mobile, keyboard and dialog checks remain manual; Chromium was unavailable in the build environment. Documentation-only changes do not alter app behavior.
