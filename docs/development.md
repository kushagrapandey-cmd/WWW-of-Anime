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
  scripts/validate-data.mjs
  scripts/validate-forms.mjs
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
      CharacterGuide.jsx
      CharacterGuide.css
    data/
      anime.js
      index.js
      power.js
      peakForms.js
      characters/{naruto,onepiece,bleach}.json
      forms/{index.js,luffy.json,naruto.json}
      quizzes/.gitkeep
    services/.gitkeep
    game/.gitkeep
    hooks/.gitkeep
```

All paths above are tracked source files in this repository. Empty directories reserve later phases. Phase 2 adds character data, form snapshots and the user-requested guide.

## How to test

- Home: animated gradient hero, three anime portals, Battle banner and locked Daily Challenge teaser are visible.
- Click Home, Battle, Quizzes, Games and Profile / Login. Each reaches its correct route and highlights its navigation item where applicable.
- Characters: visit `/characters`, switch Luffy from Base to Gear Five, then Naruto from Part One Base to final-duel avatar. Check scores, tiers, eras, moves and limits change. Select Kaido and check the pending-forms notice.
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

Production build, data validation and bundled form-selection/identity checks pass. Guide server rendering is checked. The `/characters` route loads its roster chunk on demand and shows an accessible loading status. Visual, mobile, keyboard and dialog checks remain manual; no browser binary is installed in this environment. The user-requested guide changes the UI; battle/account/gameplay phases remain pending.
