# Static deployment

This repository is ready for a static prototype deployment. No hosting account or deployment was created during Phase 8. Use the repository root as the project root and Node 24 (minimum supported runtime 22.12).

## Verify locally

```bash
git pull --ff-only
npm ci
npm test
npm run validate:data
npx playwright install --with-deps chromium
npm run test:e2e
npm run build
npm run preview
```

Visit port 4173. Check `/`, `/characters`, `/games`, `/quizzes`, `/signup` and `/battle` after logging in. Test a direct URL and a browser refresh, not just navigation from Home. In environments without a default browser download, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` can point to an existing compatible Chromium executable; the repository does not bundle a browser.

## Vercel

1. Import `kushagrapandey-cmd/WWW-of-Anime` into your Vercel account and select `main`.
2. Choose the Vite preset, root `.`, build command `npm run build`, output directory `dist`, install command `npm ci`, Node 24.
3. Keep the tracked `vercel.json`. Its SPA rewrite serves `index.html` for direct routes such as `/games` and `/profile`.
4. Leave `VITE_REQUIRE_LOGIN` unset to require a local account for Battle, or set it to `false` before building to enable guest Battle. No API secrets are needed.
5. Deploy, then run the smoke checklist below on the issued URL. Later commits to the connected branch can trigger builds through your hosting settings.

Source: [Vercel’s official Vite and SPA guidance](https://vercel.com/docs/frameworks/frontend/vite).

## Netlify

1. Import the same GitHub repository into your Netlify account and select `main`.
2. Root `.`, build command `npm run build`, publish directory `dist`, Node 24. The tracked `netlify.toml` supplies these build and runtime settings.
3. Keep its `/* → /index.html` status-200 rewrite. Existing static files remain served; other routes enter React Router.
4. Set `VITE_REQUIRE_LOGIN=false` only if you want guest Battle; rebuilding is required after a Vite environment change.
5. Deploy and use the same smoke checklist.

Source: [Netlify’s official SPA setup](https://docs.netlify.com/build/configure-builds/javascript-spas/) and [rewrite behavior](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/).

## Hosted smoke checklist

- Open and refresh `/games`, `/quizzes?mode=daily` and `/characters` directly. Expect the app, not a server 404. Unknown routes show the app’s 404 screen.
- At 360px, open the menu, navigate and use Escape with a keyboard. Check visible focus, readable text and no horizontal scroll.
- Create a demo account, complete a CPU battle and replay it. Replaying must leave profile totals unchanged.
- Complete a quiz and guessing game, leave/resume an unfinished game and reload the profile.
- Verify missing images retain the generated avatars/gradients. Sound starts off; enabling it is optional.
- Check browser Console for runtime errors. If a stale deployed chunk fails, the app offers Reload while retaining navigation.

## Prototype limits

Profiles, sessions and scores are stored by browser origin. Codespaces, localhost, a preview domain and a production domain have separate storage. Changing the domain does not transfer progress. Local account hashing does not provide server authentication; users can edit scores and account data. Use demo passwords and do not treat these profiles as public secure accounts or a competitive leaderboard.

External Google Fonts are optional; CSS has system-font fallbacks. Covers and character artwork remain optional. Phase 3 is parked and `fetch-images` does not exist. This phase prepares deployment settings and instructions, not a live public launch or cross-browser certification.
