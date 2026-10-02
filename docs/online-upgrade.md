# Online upgrade and handoff

## What changed

- Recovered the published Phase 7–8 files because this resumed workspace was still at Phase 6. Earlier uncommitted backend work was not present; this implementation was rebuilt against published Phase 8 without changing roster data.
- Home world cards now show manga/anime lengths; world pages include creator, premise, powers, watch notes, manga spoiler cutoff and official links. Ongoing-series lengths use lower bounds.
- Self-hosted the existing Bangers/Poppins fonts with swap rendering, removed remote Google Fonts and separated guessing-game identities from the large form inventory. Routes remain lazy-loaded. Load performance still depends on the device, network and production cold starts; no universal speed claim is made.
- Added a same-origin Vercel Node API, PostgreSQL migration, server accounts, private random-token sessions, login limits, origin validation, request bounds, security headers and account-security controls.
- Replaced local multiplayer in online mode with account-owned drafts and random invite links. Server-generated teams, identity exclusion, lineup validation, both-player rank updates and replay snapshots use transactional state. CPU mode uses the same server authority.
- Added account-owned quiz/game state, server deadlines, server scoring, hidden answer projections and database-backed resume/history. Guests retain clearly identified local practice. Production defaults to online mode, so missing backend configuration cannot quietly create local accounts.

## Browser checks

Two independent Chromium contexts complete a shared match, including sign-up from an invite, private drafting, lineup locks, shared results and reload. Checks run at desktop and 360px. Quiz/game resume and world pages also run in both layouts. API integration checks run against PostgreSQL through PGlite and cover authorization, stale writes, hidden data, idempotent credit, daily uniqueness, session revocation, password changes and login limits.

## Known limitations

- Deployed at https://www-of-anime.vercel.app/ on Vercel Hobby + Neon Free. Production-only credentials/settings and the database schema are configured; see deployment.md for live verification.
- Four-second polling trades instant updates for a simpler turn-based deployment. Requests stop while hidden and reconnect on future polls; expired unfinished matches require a new draft.
- Email reset/verification, data-deletion/support policy, provider monitoring/backups and load testing remain before an unrestricted launch.
- Local accounts/history remain separate from online accounts. Do not migrate tamperable browser rankings or password hashes as trusted server records.
- Quiz questions and fighter ratings are public content elsewhere in the app; withholding active solutions prevents simple response inspection, not all cheating or collusion.
- Prototype storage adapters remain available only for explicit demo builds/local practice. Phase 3 artwork acquisition stays parked, character scope stays 120 identities/237 forms.

See [deployment.md](deployment.md) for exact setup, variables, commands and current costs. Never send secret credentials in chat.

## Final validation

78 unit/integration tests (8 local auth + 59 game/quiz/sound/registry + 11 PostgreSQL API checks), 16 prototype Chromium scenarios and 6 online Chromium scenarios pass. Both desktop and 360px layouts are covered. Data validation, production builds and a production-dependency audit pass (no known production dependency vulnerabilities reported). Browser screenshots were visually reviewed. These local checks do not certify other browsers or physical devices. Production deployment and separate live smoke checks are recorded in deployment.md.
