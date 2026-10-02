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
      CharacterAvatar.jsx
      AvatarPicker.jsx
      ProtectedRoute.jsx
    pages/
      Home.jsx
      Placeholder.jsx
      CharacterGuide.jsx
      CharacterGuide.css
      AuthPage.jsx
      Profile.jsx
      BattleEntry.jsx
      Accounts.css
    data/
      anime.js
      index.js
      power.js
      peakForms.js
      characters/{naruto,onepiece,bleach}.json
      forms/index.js and 55 modular character JSON files
      quizzes/.gitkeep
    services/
      AuthService.js
      LocalAuthService.js
      passwords.js
      localStorageStore.js
      authRouting.js
    game/.gitkeep
    hooks/.gitkeep
    context/AuthContext.jsx
    config/auth.js
  tests/auth.test.mjs
  .env.example
```

All paths above are tracked source files in this repository. Empty directories reserve later phases. Phase 2 adds character data, form snapshots and the user-requested guide.

## How to test

- Home: animated gradient hero, three anime portals, Battle banner and locked Daily Challenge teaser are visible.
- Click Home, Battle, Quizzes, Games and Profile / Login. Each reaches its correct route and highlights its navigation item where applicable.
- Characters: visit `/characters`, switch Luffy from Base to Gear Five, then Naruto from Part One Base to final-duel avatar. Check scores, tiers, eras, moves and limits change. Switch Sasuke from early Base to Indra Susanoo: no early Rinnegan/Indra moves, and score/tier/limits must change. Check Kakashi’s temporary dual-eye limits, Lee’s individual gates and Choji’s pill costs. Confirm per-series counts (Naruto 170 across 40 identities, One Piece 67 across 15 identities, Bleach 0), chapter ranges and review status. Compare Pain’s Deva-only and restored Nagato moves; check Obito’s host has no Kamui and Madara’s final state has no stolen eye. Compare B’s swords with Gyuki’s ball/ink/tentacles. Compare early Luffy Gears/Nightmare with Gear Five; check Sanji’s Ifrit has no Raid Suit, Chopper’s Monster body has no Guard move, and General Franky has no simultaneous pilot Radical Beam. Select Kaido and check the deferred-forms notice.
- Click each anime portal. Verify Naruto, One Piece and Bleach preview pages and their theme colors.
- Visit `/profile`, `/login`, `/does-not-exist` and `/anime/unknown`. The first requires login and shows the profile, the second shows login, and the last two show the 404 screen. Test `/signup`, avatar saving, logout and protected `/battle` returns using [the Phase 4 checklist](phase-4-accounts.md).
- At 360px width: open/close the navigation menu, select a route, and check that the menu closes. Confirm no horizontal scroll.
- Use Tab and Enter to navigate links; check visible focus and the skip-to-content link.
- Turn on the operating system's reduced-motion preference. Decorative motion should stop.
- Run `npm test`, `npm run validate:data` and `npm run build`; they should succeed. Visit routes using `npm run preview`.

## Reusable component interfaces

- `Button`: `to`, `variant` (`primary` / `secondary`), `children`, native button/link props.
- `Card`: `children`, `className`, native div props.
- `Modal`: `open`, `onClose`, `title`, `children`. Native dialog provides focus trapping, Escape handling and focus return; backdrop clicks close it.
- `Badge`: `children`, optional `color`, `className`.
- `ProgressBar`: `value`, `max`, `label`, `color`. Values are clamped and exposed accessibly.
- `CharacterAvatar`: `character`, optional `className`; shared lazy image/fallback renderer with role icon.
- `CharacterCard`: `character` object or legacy name/anime/image/rarity/powerScore props, plus role/stats/abilityTags, selected and onSelect. Uses CharacterAvatar, stat bars and ability chips.
- `LocalHeroArt`: optional decorative covers only from `/public/hero/`; missing files leave gradients. No web downloads.


## Verification

Production build, data validation and bundled form-selection/identity checks pass. Guide server rendering is checked. The `/characters` route loads its roster chunk on demand and shows an accessible loading status. Visual, mobile, keyboard and dialog checks remain manual; no browser binary is installed in this environment. The user-requested guide changes the UI; battle/account/gameplay phases remain pending.

## Revised phase order and fallback checks

See [task memory](../TASKS.md). Phase 3 is parked; after Phase 2 review proceed to Phase 4. Check `/characters` for readable initials/role icon, anime color and rarity frame. Use keyboard selectors and inspect narrow screens. Test CharacterCard with null image, valid local image and broken local path: fallback remains on errors, stats/chips are readable. Home/portals must retain gradients without covers. Add your own covers per `public/hero/README.md` and verify text contrast. Move Match is Phase 7; no silhouette game is planned.
