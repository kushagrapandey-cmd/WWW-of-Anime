# Coins and homepage feedback

## File plan

- `src/config/coins.js`: all award values, milestone thresholds and modal copy.
- `src/services/CoinsService.js`: shared ledger settlement, balance calculation and milestone acknowledgement.
- `server/matches.js`: settle both players inside the existing locked completion transaction.
- `server/handler.js`: authenticated milestone acknowledgement and public rate-limited feedback route.
- `server/feedback.js`: validate visitor input and send to a fixed recipient through Resend.
- `src/services/{LocalAuthService,ApiAuthService}.js`, `src/context/AuthContext.jsx`: share the existing account adapters.
- `src/components/{CoinRewards,CoinHistory,ContactFooter}.jsx`: reward notifications, profile ledger and homepage contact form.
- `src/components/{Navbar,Layout}.jsx`, `src/pages/{Profile,OnlineBattle}.jsx`: integrate rewards and refresh profiles on completed match loads.
- `src/components/Rewards.css`: scoped styles for the new sections.
- `.env.example`: server-only email configuration.
- `tests/coins.test.mjs`, `tests/server/{feedback,online}.test.mjs`, `tests/online/{rewards,online}.spec.js`: reward rules, account authorization, retry safety and UI coverage.

## Existing stack and storage

The current repository is React 19 + Vite + React Router, with a Node API on Vercel and Neon PostgreSQL. It is not a Next.js app. No framework or storage migration was introduced.

Online ledgers live in `app_users.profile.coins`, alongside the existing profile data. Each immutable transaction contains `id`, `userId`, `amount`, `reason`, `matchId` and `timestamp`. Balance is always the sum of ledger amounts; there is no editable balance field. Loss entries have amount zero and document streak resets. Streak and acknowledged milestones live with the account ledger. The explicit local demo uses the same pure coins module through its local account adapter.

The server locks the match and both player accounts, calculates the existing outcome, and saves profile statistics and the ledger in the same database transaction. Unique match IDs are checked again inside the coins service. The application offers no add-coins endpoint and never accepts a client-supplied award amount. Completing a match, refreshing it, retrying stale commands or reopening it cannot mint extra coins. Local demo data remains editable by a browser owner, as with all of its existing local account data.

No schema migration is required. Legacy accounts receive empty ledgers on their first settlement. For this pre-launch implementation, the complete ledger remains in the profile JSON; a larger launch should move it to a dedicated indexed table with a unique `(user_id, match_id)` constraint and paginated history.

## Rules and assumptions

Only Battle Arena wins qualify, including CPU matches. Quizzes and guessing-game points are unchanged. Existing wins are not backfilled: balances and reward streaks begin at zero on launch. The reward streak may therefore initially differ from an older battle-statistics streak.

Consecutive wins earn 10, 10, 15, 20, 25, 30, 35, 35... coins. A loss resets the reward streak. The first win after a loss earns 10 again. Coins are display-only, have no monetary value, and cannot be redeemed. There are no checkout, payment or shipping flows.

At 100, 500 and 1000 coins, a milestone dialog opens. Dismissing it saves an acknowledgement to the account. If several milestones are pending, they appear in order. An acknowledgement that fails to save is retried; a closed dialog stays dismissed across reloads/devices after successful acknowledgement. No modal opens for guests. Logging in does not toast old winnings; an active account receives a toast when its refreshed ledger gains a win.

## Feedback setup

The homepage footer has verified LinkedIn, GitHub and email links. Visitors can submit without an account. Feedback is sent only to `kushagrapandey102@gmail.com`; a visitor address is used as Reply-To. Input length checks, a honeypot, same-origin checks and database-backed limits (3 submissions per IP per hour) protect the endpoint. A request ID and payload hash provide a Resend idempotency key for retries. The form retains text on failure and provides a direct email fallback.

Set server-only `RESEND_API_KEY` in Vercel Production. It must never have a `VITE_` prefix or be committed. `FEEDBACK_FROM` is optional and defaults to `WWW-of-Anime <onboarding@resend.dev>`. That sender can deliver only to the Resend account owner's address; use a verified sender/domain for other recipients. No paid plan or custom domain is required for owner-directed feedback. Without the key, the endpoint returns an error rather than claiming a message was sent.

During this implementation, automatic approval review blocked transferring the newly created sending-only key to the production Vercel project. The form and endpoint can be deployed, but live email remains pending that configuration approval.

## Manual verification

1. Open Home logged out. Check the menu's “Log in to earn coins” link, all three contact links, and the footer at 360px and desktop widths.
2. Log in with a new account. Navbar and Profile show zero coins and streak. History is empty and Redeem is disabled.
3. Complete an arena match. Winner gets 10 coins and a toast; loser receives a zero-coin history entry and streak zero. Both accounts keep independent histories.
4. Refresh, reopen the completed match, and retry a stale lock request. The ledger must still contain exactly one transaction for that match per account.
5. Win consecutively. Verify awards 10, 10, 15, 20, 25, 30, 35, 35. Lose, then win: the award returns to 10.
6. At each milestone, dismiss the modal and reload/re-login. It must stay dismissed. The browser milestone test uses mocked profiles to cover all thresholds without modifying production balances.
7. Log out and switch accounts. Previous balances, histories and modals must not appear on the other account.
8. Submit invalid feedback: browser/server validation rejects it. With the key configured, submit a normal message and confirm receipt in the owner inbox. If email is unavailable, text stays in the form and a visible error links to direct email.

## Automated verification commands

```sh
npm ci
npm test
npm run validate:data
npm run build
npm run test:e2e:online
```

For an existing Chromium binary, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` before browser tests. Browser tests run against disposable PGlite and do not create accounts in production.
