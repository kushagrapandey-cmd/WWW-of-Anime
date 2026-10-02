# Vercel + PostgreSQL deployment

This release adds an online backend; static-only deployment is no longer sufficient for online accounts or matches. Production builds select online accounts by default and fail closed if the backend is not configured. Local prototype accounts do not become online accounts. Do not import browser password hashes or editable rank data into production.

## Current deployment — 2026-10-02

- Production: https://www-of-anime.vercel.app/; GitHub main auto-deploys through the Vercel app, limited to this repository.
- Hosting: Vercel Hobby. Database: `www-of-anime-db`, Neon Free, Washington, D.C. (`iad1`). No paid plan or payment method was enabled during setup.
- Database integration, `APP_ORIGIN`, and `RATE_LIMIT_SECRET` are scoped to Production. `VITE_AUTH_MODE=online` is a public build flag for Production and Preview; previews have no production database access.
- The five application tables and their indexes were initialized through the authenticated Vercel SQL editor. That editor accepts one prepared statement, so wrap `server/schema.sql` in `DO $migration$ BEGIN ... END $migration$;` there; the migration script remains transactional for local/CLI use. The editor was restored to read-only mode afterward.
- The unauthenticated live API returns HTTP 200 JSON `{"data":null}` with no-store and the configured security headers. The homepage and direct Naruto world URL render.
- Live API smoke checks passed: two-account signup, Secure/HttpOnly cookies, authenticated profiles, cross-origin rejection, private friend drafts, stale-revision rejection, shared five-round results and exactly-once credit. A full ten-question quiz completed and its history persisted through a fresh login. Logout and session revocation also passed. Test accounts use a random smoke prefix and are not owner accounts.
- Desktop/360px browser gameplay tests passed locally; physical-device and cross-browser production checks remain.
- Free-tier quotas can limit service availability. Do not upgrade or enable paid services without the owner's explicit approval.

## Architecture

- Vercel serves `dist` and the same-origin Node Function `api/index.js`.
- PostgreSQL stores accounts, opaque session hashes, private match state and signed-in quiz/game progress.
- `pg` uses the provider's pooled connection string; `attachDatabasePool` manages idle Vercel connections.
- Turn-based matches poll every four seconds while the tab is visible. This is online multiplayer, not a same-device handoff or an always-on socket service.
- Draft seeds, opponent cards/order and pre-answer solutions are withheld from active API views. Server operations use transactions, account/match row locks and revisions. Client-supplied player IDs, scores and fighter statistics are ignored.

## One-time account setup

1. Sign in to Vercel and import GitHub `kushagrapandey-cmd/WWW-of-Anime`, branch `main`. Select Vite, Node 24, build `npm run build`, output `dist`.
2. Provision PostgreSQL (Neon is a suitable starting choice, including via Vercel Marketplace). Choose a database region close to your Function region.
3. Obtain a pooled connection URL. Set `sslmode=verify-full` (or the provider's documented equivalent with certificate and hostname verification). Do not set `rejectUnauthorized: false` or disable TLS.
4. Add the following environment variables. Scope the production database and secret to **Production**; previews must use their own database and exact origin.

| Variable | Value | Exposure |
|---|---|---|
| `VITE_AUTH_MODE` | `online` | Public build flag |
| `DATABASE_URL` | Pooled PostgreSQL URL with verified TLS | Server only |
| `APP_ORIGIN` | Exact `https://your-project.vercel.app`, no trailing slash | Server only |
| `RATE_LIMIT_SECRET` | Random secret, at least 32 characters | Server only |

Generate a secret on your own machine: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Put it directly into Vercel's environment settings. **Never paste passwords, database URLs or API tokens into chat or prefix secrets with `VITE_`.**

5. Initialize the database once. In Codespaces/local checkout, create `.env.local` from `.env.example`, fill the same values securely, run `npm ci`, then `npm run db:migrate`. Alternatively run `server/schema.sql` in the provider's authenticated SQL editor. This migration creates tables/indexes and does not delete existing data.
6. Deploy/redeploy. Verify `/api/index?route=auth/me` returns JSON `{"data":null}` without a cookie, not the SPA HTML. Direct links and `/battle?invite=...` must survive refresh.
7. Create two real test accounts on two independent devices/browser profiles. Join an invite, draft privately, finish a match and verify both profiles. Also verify quiz/game resume after signing into another device. Perform this smoke test against the deployed database; local tests do not prove production configuration.

## Local online development

```bash
npm ci
cp .env.example .env.local
# Fill .env.local in your editor. APP_ORIGIN=http://localhost:5173
npm run db:migrate
npm run dev:api
# In a second terminal:
npm run dev
```

Use **http://localhost:5173** consistently. `http://127.0.0.1:5173` has a different origin and is deliberately rejected unless it matches `APP_ORIGIN`.

For Codespaces forwarded URLs, set `APP_ORIGIN` to the exact forwarded **5173** HTTPS URL and restart the API. Requests reach the API through Vite's same-origin proxy; do not expose port 3001 publicly. Use a development database, not production credentials.

## Validation

```bash
npm test
npm run validate:data
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run test:e2e:online
```

The online browser harness uses a disposable PGlite PostgreSQL database. It never substitutes that database in deployed code. `test:e2e` explicitly builds the local demo adapter; `test:e2e:online` builds the real API adapter. Run them sequentially because they share ports 3001/4173.

## Costs and domains (checked 2026-10-02)

- Vercel Hobby: $0 for non-commercial personal use, within quotas. Monetization/commercial use needs a suitable paid plan. Vercel Pro lists $20/month before tax, with usage charges possible; it can exceed a ₹1,000–2,000 budget once taxes/database spending are included.
- A small Neon database can start on its $0 plan, within current quotas. Free database compute can sleep and cause first-request latency. It is not an always-on availability guarantee. Check provider quotas, restore retention and usage notifications in the account before launch.
- You can initially use the included `.vercel.app` address at no domain-purchase cost.
- A domain is a renewable registration, not a permanent purchase. Namecheap's published `.com` example is $11.28 first year or a limited $6.79 new-customer promotion, then $18.48/year renewal, plus applicable ICANN fee/tax. Availability and premiums change the exact quote. Compare renewals, not only the introductory price.
- Buy from any registrar, then add the domain in Vercel Project Settings → Domains and copy the DNS records Vercel actually gives you. Update `APP_ORIGIN` to the canonical HTTPS domain and redeploy. Redirect other domains to it so login cookies are not split across hosts. Vercel supplies HTTPS; buying separate shared hosting or a separate SSL certificate is unnecessary for this setup.

Sources: [Vercel pricing](https://vercel.com/pricing), [Hobby use restrictions](https://vercel.com/docs/plans/hobby), [Neon pricing](https://neon.com/pricing), [Neon free storage update](https://neon.com/blog/neon-free-plan-1-gb-per-project), [Namecheap .com pricing](https://www.namecheap.com/domains/registration/gtld/com/), [Vercel connection pooling](https://vercel.com/kb/guide/connection-pooling-with-functions).

## Remaining before an unrestricted public launch

This is a tested online MVP, not a completed production-operations program. Email verification/password recovery, an owner-approved privacy/contact policy and account deletion workflow, operational monitoring, scheduled retention cleanup, a tested backup/restore process, abuse controls/load testing and live-deployment checks remain. Recovery needs an email provider and a verified sender domain. A forgotten username/password currently cannot be recovered by email; do not promise otherwise to users.

The shipped password-change and sign-out-all-devices controls revoke all sessions. Normal logout revokes the current cookie session. Cookies are HttpOnly/Secure/SameSite in production and expire after seven days. Passwords use salted server-side scrypt, never plaintext. HTTPS and verified database TLS protect transport; this is not a guarantee against every security issue or an independent security audit.

Do not retain authentication logs containing passwords, cookies, invite tokens or connection URLs. The API's own error logging records only a request ID and error code. Configure Vercel access-log retention with that sensitivity in mind.
