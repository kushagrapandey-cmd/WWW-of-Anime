# Phase 4 — local accounts and profiles

Implemented after the user closed Phase 2 at its current scope on 2026-10-02. No character/form records changed. Phase 3 remains parked; Phase 5 gameplay is now implemented; see [the arena guide](phase-5-arena.md).

## Working behavior

- `/signup` creates a local profile and signs in. `/login` checks credentials, supports password visibility and friendly validation, and returns to the protected route including query/hash.
- `/profile` always requires login. `/battle` requires login by default and now opens the playable arena. `VITE_REQUIRE_LOGIN=false` opens the guest arena with player name fields; it does not expose anonymous profile editing.
- Navbar switches between Login and Profile. Login survives reload. Logout preserves the account/progress and clears its session; other same-origin tabs refresh on storage changes.
- Profile includes username, joined date, saved avatar picker, battle/quiz counters, rank progress, achievements and logout. New statistics are zero; no fake played games or earned achievements are added.
- All six profile archetypes use the shared `CharacterAvatar` renderer and no artwork download. Account/profile/Battle chunks remain lazy routes.

## Service contract and schema

`src/services/AuthService.js` selects the adapter. React pages use AuthContext rather than storage directly. Every service method is async so an API adapter can replace the local adapter:

| Method | Argument | Result |
| --- | --- | --- |
| signUp | `{username, password, avatar?}` | Public profile; signs in |
| logIn | `{username, password}` | Public profile; signs in |
| logOut | none | Clears session |
| getCurrentUser | none | Public profile or null |
| updateProfile | `{avatar}` | Updated current profile |
| updateStats | `{battleStats?, quizStats?, achievements?}` | Updated current profile |

Statistics patches set absolute known totals, not increments. Future game services must calculate totals from the current profile, await the update and refresh context through its wrapper. Stats must be safe non-negative integers; best accuracy is 0–100, best streaks cannot trail current streaks, and achievement IDs are deduplicated. Caller-supplied user IDs, usernames and credential changes are rejected by this update API.

Stored account: `id`, `username`, `avatar`, `createdAt`, `battleStats {wins, losses, winStreak, bestStreak, rankPoints}`, `quizStats {quizzesPlayed, bestScore, xp, dailyStreak, bestDailyStreak}`, `achievements[]`, private `credential {algorithm, iterations, salt, hash}`. Credential fields never appear in public profiles. Username uniqueness is case-insensitive. Passwords retain their exact spaces.

Keys: `www-of-anime:accounts:v1` and `www-of-anime:session:v1`. Invalid data is reported without silently replacing accounts. Browser quota/permission errors are surfaced. If account creation succeeds but session saving fails, the message directs the user to log in rather than silently losing the account.

## Passwords and prototype boundary

Passwords are derived with Web Crypto PBKDF2/SHA-256, 600,000 iterations, independent random 16-byte salts and 256-bit hashes. [MDN deriveBits](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits) documents the API; use HTTPS (Codespaces) or localhost for crypto availability.

**This is not real authentication/security.** Local accounts, session identifiers, password hashes and stats are accessible/editable in browser storage. Salted hashing avoids plaintext passwords; it does not prevent client-side tampering, malicious scripts, credential attacks or forged stats. Do not use a real password. A production ApiAuthService must authenticate on the server, authorize users, enforce score updates and provide real session handling. No backend, recovery email, cross-device sync or production account claims are added.

## Player rank

| Rank | Minimum points |
| --- | ---: |
| Rookie | 0 |
| Fighter | 100 |
| Elite | 300 |
| Master | 600 |
| Legend | 1000 |

Ranks derive from `battleStats.rankPoints`, separate from character rarity/power. Phase 5 calculates Elo-style gains/losses; this phase does not manufacture a played battle to demonstrate promotion.

## Run and test

```bash
npm ci
npm test
npm run validate:data
npm run build
npm run dev
```

Manual checklist:

1. Open `/battle?mode=cpu#setup` while logged out: redirected to `/login`. Switch to Create account, enter a valid username/password, confirm it and submit. You return to the original Battle URL.
2. Try short/duplicate usernames, short passwords and mismatched confirmation; check friendly errors and password visibility. Log in with the wrong password, then the right one. Username case may differ; password spaces must match.
3. Open `/profile`, choose an avatar and save. Reload; avatar/profile remain. Confirm Rookie rank, zero counters and an empty trophy shelf.
4. Log out; `/profile` returns to login. Log in again; profile remains. In two same-origin tabs, logout/storage clearing should refresh the other tab.
5. Copy `.env.example` to `.env.local`, set `VITE_REQUIRE_LOGIN=false`, restart dev. `/battle` accepts guest names without login; `/profile` stays protected. Restore true afterward.
6. At 360px and desktop widths: check form/picker/grid fit, Tab focus, password toggle, error focus, radio arrow keys and mobile-menu closure.

Eight committed Node tests exercise the actual LocalAuthService, Web Crypto hashing, reload/session persistence, account isolation, concurrent signup, failed partial storage writes, validation and ranks/return URLs. DOM integration checks exercise real form events, protected redirects (including query/hash), profile/rank rendering, avatar saving, logout and storage-event session sync. A separate guest-mode check verifies anonymous Battle names while profiles stay protected. All character/form records and weights/tiers remain unchanged. Browser visual QA remains pending: no installed browser binary; the Playwright download failed in this environment. No browser-interaction success is claimed.
