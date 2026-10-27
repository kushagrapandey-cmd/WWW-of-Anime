# Complete update source

This review snapshot contains the complete contents of each changed/new implementation, test and documentation file. The snapshot itself is excluded. For the plan, assumptions, storage choice and manual steps, see [coins-and-feedback.md](coins-and-feedback.md).

## .env.example

```text
# Local online development. Copy to .env.local; never commit real values.
VITE_AUTH_MODE=online
RESEND_API_KEY=
FEEDBACK_FROM=WWW-of-Anime <onboarding@resend.dev>
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full
APP_ORIGIN=http://localhost:5173
RATE_LIMIT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_OF_AT_LEAST_32_CHARACTERS
# Vercel: APP_ORIGIN must be the exact https://your-project.vercel.app origin.
# DATABASE_URL and RATE_LIMIT_SECRET are server-only; NEVER prefix them with VITE_.
```

## README.md

````markdown
# WWW-of-Anime

**Three worlds. One playground.** An interactive fan project for Naruto, One Piece and Bleach, featuring character exploration, private online battles, quizzes and guessing games.

[Live demo](https://www-of-anime.vercel.app/) · [Architecture & interview guide](docs/architecture-interview-guide.md) · [Development](docs/development.md) · [Deployment](docs/deployment.md)

**Status: public beta.** Production uses Vercel Functions and PostgreSQL for online accounts and progress. An explicit browser-local demo mode remains available for development. Email password recovery and production operations work remain pending.

![WWW-of-Anime home page with crossover hero and primary navigation](docs/screenshots/home.png)

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

Create a CPU match or invite a friend using a private link. Filter by world and optionally include form variants. Each participant drafts five fighters, uses an optional reroll, orders their lineup and locks it. The server checks account ownership, hides the opponent's lineup until completion, computes results and awards rank. Unfinished matches expire after 24 hours; visible tabs refresh match state every four seconds.

![Online Battle Arena setup with opponent, world and form variant controls](docs/screenshots/battle.png)

### Anime quizzes — `/quizzes`

A 90-question authored bank supports Classic, Timed Blitz and Daily Challenge modes. Anime/difficulty filters, answer explanations, XP, accuracy and streaks provide progression. Signed-in attempts and scoring are managed by the server; guest practice remains browser-local. Daily challenges reset at midnight India time.

![Quiz setup and profile progress showing XP, accuracy and daily streak](docs/screenshots/quizzes.png)

### Guessing games — `/games`

Move Match, Clue Chain and Higher or Lower reuse the character roster. Options include multiple-choice or typed answers where supported, timed rounds, hints and resumable attempts. High scores are separate from battle rank and quiz XP.

![Guessing games setup with Move Match, Clue Chain and Higher or Lower options](docs/screenshots/games.png)

### Characters and forms — `/characters`

Explore 120 identities across the three worlds and 237 authored form snapshots in the accepted scope. The form guide displays weighted stats, game power tiers, signature moves, limitations and editorial references. Forms are not complete canon inventories; ratings are provisional gameplay estimates.

![Character form explorer showing Luffy Gear Five, stats, moves and limitations](docs/screenshots/character-forms.png)

### Profile — `/profile`

A protected profile combines an avatar, rank, battle record, quiz progress, game high scores and achievements. Online accounts persist across devices. Account security controls support password changes and revoking all sessions.

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

This project uses **React + Vite, not Next.js**. Production authentication is not JWT-based. Character catalogs and questions are authored JSON; no external anime API or image downloader is required.

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

- CharacterAvatar provides initials, anime gradients, rarity framing and role icons; optional image loading failures retain the fallback. No third-party character artwork is bundled.
- Five-round battle outcomes combine authored power, bounded ability counters, team synergy and seeded luck. Game balance and canon accuracy are separate concerns.
- Turn-based multiplayer uses four-second polling rather than WebSockets. This simplifies serverless hosting but introduces update latency and request load.
- Online scores are server-calculated. Public authored question/roster data means this is not a cheat-proof competitive system.
- Optional sound is generated with Web Audio and starts only after opt-in. Reduced motion and keyboard navigation are supported.
- Email recovery, policy/account-deletion workflows, stronger operational monitoring/backups, further roster calibration and wider compatibility checks remain future work.
- The optional artwork pipeline is deferred; no `fetch-images` command exists.

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

WWW-of-Anime is unofficial and is not affiliated with the rights holders of Naruto, One Piece or Bleach. Names and characters belong to their respective owners. Character stats and crossover outcomes are fan-made game mechanics. Future artwork requires appropriate usage rights. Content may contain spoilers.

### Showcase coins and feedback

Battle Arena wins now earn display-only coins through the server-owned match result. The account stores a transaction ledger, current reward streak and acknowledged milestones; no coin-purchase or redemption feature is enabled. The homepage footer includes contact links and a visitor feedback form.

See [implementation choices, file plan, setup and manual tests](docs/coins-and-feedback.md). Feedback delivery requires a server-only Resend key; the direct email link remains available when delivery is not configured.
````

## docs/coins-and-feedback.md

````markdown
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

After explicit user approval, the sending-only Resend key is configured as a server-only Vercel Production variable and the site has been redeployed. No credential is stored in this repository or exposed to visitors.

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
````

## server/feedback.js

```javascript
import { createHash } from 'node:crypto';
import { fail } from './security.js';
const recipient = 'kushagrapandey102@gmail.com';
export async function sendFeedbackEmail(message) {
  if (!process.env.RESEND_API_KEY) fail(503, 'Email service is not configured.');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `anime-feedback/${message.requestId}/${createHash('sha256').update(JSON.stringify(message)).digest('hex')}` },
    body: JSON.stringify({
      from: process.env.FEEDBACK_FROM || 'WWW-of-Anime <onboarding@resend.dev>',
      to: [recipient], reply_to: message.email,
      subject: 'WWW-of-Anime website feedback',
      text: `From: ${message.name} <${message.email}>\n\n${message.message}`,
    }),
  });
  if (!response.ok) fail(502, 'Could not send feedback. Please retry later or email directly.');
}
export async function feedbackRoute(data, send = sendFeedbackEmail) {
  if (data.website) return { sent: true };
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const message = typeof data.message === 'string' ? data.message.trim() : '';
  if (name.length < 2 || name.length > 80 || /[\r\n]/.test(name) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 3000) fail(400, 'Enter a name, valid email and feedback of 10–3000 characters.');
  const requestId = typeof data.requestId === 'string' && /^[a-zA-Z0-9-]{16,64}$/.test(data.requestId) ? data.requestId : createHash('sha256').update(JSON.stringify({name,email,message})).digest('hex');
  await send({ name, email, message, requestId });
  return { sent: true };
}
```

## server/handler.js

```javascript
import { acknowledgeMilestone } from '../src/services/CoinsService.js';
import { feedbackRoute } from './feedback.js';
import { randomUUID } from 'node:crypto';
import { getDatabase } from './db.js';
import { authRoute,currentUser,updateAvatar,accountSecurity } from './auth.js';
import { matchRoute } from './matches.js';
import { activityRoute } from './activities.js';
import { checkOrigin,fail,rateLimit,rateKey } from './security.js';
const methods = {
 'auth/me':'GET','auth/signup':'POST','auth/login':'POST','auth/logout':'POST',
 'profile/password':'POST','profile/sessions':'POST','profile/avatar':'POST','match/list':'GET','match/view':'GET','activity/list':'GET','activity/view':'GET',
};
function validData(value) {
  if (!value || typeof value!=='object' || Array.isArray(value)) fail(400,'Invalid request.');
  return value;
}
async function body(req) {
  if (req.method==='GET') return {};
  if (req.body !== undefined) {
    if (Buffer.byteLength(typeof req.body==='string'?req.body:JSON.stringify(req.body))>16384) fail(413,'Request is too large.');
    return typeof req.body==='string'?JSON.parse(req.body):req.body;
  }
  let chunks=[],size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>16384) fail(413,'Request is too large.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { fail(400,'Invalid JSON request.'); }
}
export function createHandler({ database, origin=process.env.APP_ORIGIN, secret=process.env.RATE_LIMIT_SECRET,
  sendFeedback, secure=process.env.NODE_ENV==='production' || Boolean(process.env.VERCEL), logger=console }={}) {
  return async (req,res) => {
    const requestId=randomUUID();
    res.setHeader('Content-Type','application/json; charset=utf-8');
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('X-Request-Id',requestId);
    try {
      if (!origin || !secret || secret.length<32) fail(503,'Online service is not configured.');
      const url=new URL(req.url,origin), route=url.searchParams.get('route');
      if (typeof route!=='string' || !/^(auth|profile|match|activity|contact)\/[a-z]+$/.test(route)) fail(404,'Endpoint not found.');
      if (req.method!==(methods[route]??'POST')) fail(405,'Method not allowed.');
      checkOrigin(req,origin);
      const db=database??getDatabase(), ip=rateKey(req,secret);
      // Shared DB limits survive function cold starts. Polling is capped per authenticated account below.
      if (route.startsWith('auth/')) {
        const value=await authRoute(db,route.split('/')[1],validData(await body(req)),req,res,secure,ip);
        res.statusCode=200;res.end(JSON.stringify({data:value}));return;
      }
      if (route==='contact/feedback') {
        await rateLimit(db,`feedback:${ip}`,3,3600);
        const value=await feedbackRoute(validData(await body(req)),sendFeedback);
        res.statusCode=200;res.end(JSON.stringify({data:value}));return;
      }
      const user=await currentUser(db,req,secure);if(!user) fail(401,'Sign in to use online features.');
      await rateLimit(db,`api:${user.id}`,240,60);
      const data=validData(req.method==='GET'?Object.fromEntries(url.searchParams):await body(req));
      let value;
      if (route==='profile/password' || route==='profile/sessions') {
        await rateLimit(db,`security:${user.id}`,10,900);
        value=await accountSecurity(db,user,data,route.split('/')[1]);
      }
      else if (route==='profile/milestone') {
        value=await db.transaction(async client=>{
          const {rows}=await client.query('SELECT profile FROM app_users WHERE id=$1 FOR UPDATE',[user.id]);
          const profile=rows[0].profile;
          let coins;
          try { coins=acknowledgeMilestone(profile,data.milestone); } catch { fail(400,'Milestone has not been earned.'); }
          const next={...profile,coins};
          await client.query('UPDATE app_users SET profile=$2 WHERE id=$1',[user.id,JSON.stringify(next)]);
          return next;
        });
      }
      else if (route==='profile/avatar') value=await updateAvatar(db,user,data.avatar);
      else if (route.startsWith('match/')) {
        if(route==='match/create')await rateLimit(db,`create:${user.id}`,20,3600);
        value=await matchRoute(db,user,route.split('/')[1],data);
      }
      else if (route.startsWith('activity/')) value=await activityRoute(db,user,data.kind,route.split('/')[1],data);
      else fail(404,'Endpoint not found.');
      res.statusCode=200;res.end(JSON.stringify({data:value}));
    } catch(error) {
      // Only intentional application errors expose messages. Unexpected exceptions are 500s and stay generic.
      const publicStatus=Number.isInteger(error?.status)?error.status:500;
      if(publicStatus>=500) logger.error({requestId,code:error?.code??'INTERNAL'});
      res.statusCode=publicStatus;
      res.end(JSON.stringify({error:publicStatus>=500?'Online service is temporarily unavailable.':error.message,requestId}));
    }
  };
}
```

## server/matches.js

```javascript
import { settleCoins } from '../src/services/CoinsService.js';
import { randomUUID } from 'node:crypto';
import { newMatch, changeMatch, matchPlayer, matchView } from './matchEngine.js';
import { applyBattleResult } from '../src/game/profileResult.js';
import { GAME } from '../src/game/config.js';
import { token, digest, fail } from './security.js';
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
export async function matchRoute(db, user, action, data) {
  if (action === 'list') {
    const { rows } = await db.query('SELECT * FROM app_matches WHERE host_id=$1 OR guest_id=$1 ORDER BY created_at DESC LIMIT 20', [user.id]);
    return rows.map(row => {
      const expired = row.state.stage !== 'complete' && new Date(row.expires_at).getTime() <= Date.now();
      return { id: row.id, names: row.state.names, stage: expired ? 'expired' : row.state.stage, createdAt: row.created_at };
    });
  }
  if (action === 'create') {
    const id = randomUUID(), raw = token(), state = newMatch(user, data);
    const { rows } = await db.query("INSERT INTO app_matches(id,host_id,invite_hash,expires_at,state) VALUES($1,$2,$3,now()+interval '24 hours',$4) RETURNING *", [id,user.id,state.mode==='friend'?digest(raw):null,JSON.stringify(state)]);
    return { ...matchView(rows[0],user.id), invite: state.mode==='friend'?raw:null };
  }
  if (action === 'join' && !/^[a-f0-9]{64}$/.test(data.invite ?? '')) fail(404, 'Invite not found.');
  if (action !== 'join' && !uuid.test(data.id ?? '')) fail(404, 'Match not found.');
  return db.transaction(async client => {
    const { rows } = action === 'join'
      ? await client.query('SELECT * FROM app_matches WHERE invite_hash=$1 FOR UPDATE', [digest(data.invite)])
      : await client.query('SELECT * FROM app_matches WHERE id=$1 FOR UPDATE', [data.id]);
    const row = rows[0]; if (!row) fail(404,'Match or invite not found.');
    if (action === 'join') {
      if (row.host_id === user.id) fail(409,'Player 2 must sign in with a different account.');
      if (row.guest_id && row.guest_id !== user.id) fail(409,'This invite has already been accepted.');
      if (new Date(row.expires_at).getTime() <= Date.now()) fail(410,'This invite has expired.');
      if (!row.guest_id) { row.guest_id = user.id; row.state.names[1] = user.username; row.state.stage = 'draft'; row.state.revision++; }
    } else {
      const player = matchPlayer(row,user.id);
      if (row.state.stage !== 'complete' && new Date(row.expires_at).getTime() <= Date.now()) fail(410,'This match has expired. Start a new draft.');
      if (action === 'view') return matchView(row,user.id);
      if (!Number.isInteger(data.revision) || data.revision !== row.state.revision) fail(409,'The match changed. Refresh and try again.');
      if (action === 'invite') {
        if (player !== 0 || row.guest_id || row.state.mode !== 'friend') fail(409,'This match cannot issue another invite.');
        const raw = token(); row.invite_hash = digest(raw); row.state.revision++;
        await client.query('UPDATE app_matches SET invite_hash=$2,state=$3 WHERE id=$1',[row.id,row.invite_hash,JSON.stringify(row.state)]);
        return { ...matchView(row,user.id), invite:raw };
      }
      row.state = changeMatch(row.state,player,{...data,action});
      if (row.state.stage === 'complete') await award(client,row);
    }
    await client.query('UPDATE app_matches SET guest_id=$2,state=$3 WHERE id=$1',[row.id,row.guest_id,JSON.stringify(row.state)]);
    return matchView(row,user.id);
  });
}
async function award(client,row) {
  // Row lock + same transaction makes completion and both profile updates exactly once.
  const ids = [row.host_id,row.guest_id].filter(Boolean).sort();
  const { rows } = await client.query('SELECT id,profile FROM app_users WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE',[ids]);
  const profiles = [row.host_id,row.guest_id].map(id => rows.find(user=>user.id===id)?.profile);
  const ratings = profiles.map(profile => profile?.battleStats.rankPoints ?? GAME.cpuRating);
  row.state.ranks = [];
  for (const [player,profile] of profiles.entries()) {
    if (!profile) continue;
    const result = applyBattleResult(profile,{won:row.state.result.outcome.winner===player,opponentPoints:ratings[1-player]});
    row.state.ranks[player] = { delta:result.delta,rankPoints:result.battleStats.rankPoints };
    await client.query('UPDATE app_users SET profile=$2 WHERE id=$1',[profile.id,JSON.stringify({...profile,coins:settleCoins(profile,{matchId:row.id,won:row.state.result.outcome.winner===player}),battleStats:result.battleStats,achievements:result.achievements})]);
  }
}
```

## src/components/CoinHistory.jsx

```jsx
import { coinState } from '../services/CoinsService';
import { COIN_CONFIG } from '../config/coins';
import Card from './Card';
import Button from './Button';
export default function CoinHistory({ user }) {
  const state = coinState(user);
  return <Card className="profile-section"><h2>YOUR COINS</h2><p><strong>{state.balance} coins</strong> · {state.streak} win streak</p><p>Earn {COIN_CONFIG.win} coins per arena win. From win {COIN_CONFIG.bonusAfter + 1}, earn an extra {COIN_CONFIG.bonusStep} per consecutive win, up to +{COIN_CONFIG.bonusCap}.</p><Button disabled>Redeem (Coming Soon)</Button><p className="profile-empty">Showcase coins only. No cash value or redemption is available. Merch plans may change.</p><h3>COIN HISTORY</h3>{state.ledger.length ? <ul className="coin-history">{[...state.ledger].reverse().map(item => <li key={item.id}><strong>+{item.amount} coins</strong><span>{item.reason === 'loss-streak-reset' ? 'Loss · streak reset' : item.reason === 'win-streak-bonus' ? 'Win + streak bonus' : 'Arena win'}</span><time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time><small>Match: {item.matchId}</small></li>)}</ul> : <p>No coins yet. Win an arena match to start earning.</p>}</Card>;
}
```

## src/components/CoinRewards.jsx

```jsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { coinState, pendingMilestones } from '../services/CoinsService';
import { COIN_CONFIG } from '../config/coins';
import Modal from './Modal';
import Button from './Button';
export default function CoinRewards() {
  const { user, acknowledgeCoinMilestone } = useAuth();
  const previous = useRef(null);
  const [toast, setToast] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const milestone = pendingMilestones(user)[0];
  useEffect(() => {
    const state = coinState(user);
    if (user && previous.current?.id === user.id) {
      const known = previous.current.ids;
      const earned = state.ledger.filter(item => !known.has(item.id)).reduce((sum, item) => sum + item.amount, 0);
      if (earned > 0) setToast(`+${earned} coins`);
    } else { setToast(''); setError(''); }
    previous.current = user ? { id: user.id, ids: new Set(state.ledger.map(item => item.id)) } : null;
  }, [user]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  async function close() {
    if (busy) return;
    setBusy(true); setError('');
    try { await acknowledgeCoinMilestone(milestone); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  }
  return <>{toast && <div className="coin-toast" role="status">{toast}<button aria-label="Dismiss coin reward" onClick={() => setToast('')}>×</button></div>}<Modal open={Boolean(user && milestone)} title={`${milestone ?? ''} COINS EARNED!`} onClose={close}><p>{COIN_CONFIG.milestoneMessage}</p><Button onClick={close} disabled={busy}>{busy ? 'Saving…' : 'Keep earning'}</Button>{error && <p role="alert">{error}</p>}</Modal></>;
}
```

## src/components/ContactFooter.jsx

```jsx
import { useRef, useState } from 'react';
import { api } from '../services/ApiClient';
import Button from './Button';
export default function ContactFooter() {
  const [busy, setBusy] = useState(false), [status, setStatus] = useState(''), [error, setError] = useState('');
  const pending = useRef(false), requestId = useRef(crypto.randomUUID());
  async function submit(event) {
    event.preventDefault();
    if (pending.current) return;
    const form = event.currentTarget;
    pending.current = true; setBusy(true); setError(''); setStatus('');
    try {
      await api('contact/feedback', { ...Object.fromEntries(new FormData(form)), requestId: requestId.current });
      form.reset(); requestId.current = crypto.randomUUID(); setStatus('Feedback sent. Thank you!');
    } catch (reason) { setError(reason.message); }
    finally { pending.current = false; setBusy(false); }
  }
  return <section className="contact-footer container" aria-labelledby="contact-heading"><div><span className="eyebrow">BUILT BY KUSHAGRA PANDEY</span><h2 id="contact-heading">CONTACT <span>ME.</span></h2><p>Found a bug or have an idea for the next arc? Send it my way.</p><div className="contact-links"><a href="https://www.linkedin.com/in/kushagra-pandey-353b71175/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="https://github.com/kushagrapandey-cmd" target="_blank" rel="noopener noreferrer">GitHub</a><a href="mailto:kushagrapandey102@gmail.com">kushagrapandey102@gmail.com</a></div></div><form onSubmit={submit} className="feedback-form"><h3>SEND FEEDBACK</h3><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label><label>Your email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Feedback<textarea name="message" required minLength={10} maxLength={3000} rows={4} /></label><label className="feedback-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label><p>Your message and email go directly to Kushagra so he can reply.</p><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send feedback'}</Button><p role="status">{status}</p>{error && <p role="alert">{error} You can also use the email link.</p>}</form></section>;
}
```

## src/components/Layout.jsx

```jsx
import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef } from 'react';
import RouteErrorBoundary from './RouteErrorBoundary';
import SoundToggle from './SoundToggle';
import ContactFooter from './ContactFooter';
import CoinRewards from './CoinRewards';
import './Rewards.css';
import Navbar from './Navbar';
export default function Layout() {
  const { pathname } = useLocation();
  const main = useRef(null), previous = useRef(pathname);
  useEffect(() => { window.scrollTo(0, 0); if (previous.current !== pathname) main.current?.focus(); previous.current = pathname; }, [pathname]);
  return <><a className="skip-link" href="#main">Skip to content</a><Navbar /><CoinRewards /><main id="main" ref={main} tabIndex={-1}><RouteErrorBoundary key={pathname}><Suspense fallback={<section className="placeholder container"><p role="status">Loading your next arc…</p></section>}><Outlet /></Suspense></RouteErrorBoundary></main><footer>{pathname === '/' && <ContactFooter />}<div className="footer"><span className="footer-brand">WWW<span>-of-Anime</span></span><p>A playground for anime fans. Built for the rivalry.</p><SoundToggle /><span>UNOFFICIAL FAN SITE</span></div></footer></>;
}
```

## src/components/Navbar.jsx

```jsx
import { coinState } from '../services/CoinsService';
import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
const links = [['/', 'Home'], ['/battle', 'Battle'], ['/quizzes', 'Quizzes'], ['/games', 'Games'], ['/characters', 'Characters']];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const { user } = useAuth();
  const coins = coinState(user);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  return <header className="site-header"><div className="nav-wrap"><Link className="brand" to="/" aria-label="WWW-of-Anime home"><span className="brand-icon"><Zap fill="currentColor" size={22} /></span>WWW<span>-of-Anime</span><small>BETA</small></Link><button ref={menu} className="icon-button mobile-menu" aria-expanded={open} aria-controls="navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><nav onKeyDown={event => { if (event.key === 'Escape' && open) { setOpen(false); menu.current?.focus(); } }} id="navigation" className={open ? 'navigation open' : 'navigation'} aria-label="Main navigation">{links.map(([path, label]) => <NavLink end={path === '/'} key={path} to={path}>{label}</NavLink>)}<Link className="coin-nav" to={user ? "/profile" : "/login"}>{user ? `${coins.balance} coins · ${coins.streak} streak` : "Log in to earn coins"}</Link><NavLink className="profile-link" to={user ? "/profile" : "/login"}><UserRound size={17} /> {user ? "Profile" : "Login"}</NavLink></nav></div></header>;
}
```

## src/components/Rewards.css

```css
.navigation .coin-nav { font-size: .75rem; color: var(--accent, #c2ff43); white-space: normal; }
.coin-toast { position: fixed; right: 20px; bottom: 24px; z-index: 90; background: #c2ff43; color: #14121b; padding: 14px 20px; border-radius: 12px; font-weight: 700; box-shadow: 0 8px 24px #0006; }
.coin-toast button { margin-left: 20px; background: none; border: 0; color: inherit; cursor: pointer; font-size: 1.4rem; }
.coin-history { list-style: none; padding: 0; max-height: 360px; overflow: auto; }
.coin-history li { display: grid; gap: 6px; padding: 14px 0; border-bottom: 1px solid #ffffff20; overflow-wrap: anywhere; }
.coin-history time, .coin-history small { color: #aaa6b5; font-size: .75rem; }
.contact-footer { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; padding-top: 48px; padding-bottom: 48px; border-top: 1px solid #ffffff20; text-align: left; }
.contact-footer h2 { margin: 12px 0; font-size: 2.4rem; }
.feedback-form h3 { font-size: 1.6rem; }
.contact-footer h2 span { color: #c2ff43; }
.contact-links { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px; overflow-wrap: anywhere; }
.contact-links a { color: #c2ff43; }
.feedback-form { display: grid; gap: 12px; min-width: 0; }
.feedback-form label { display: grid; gap: 6px; }
.feedback-form input, .feedback-form textarea { width: 100%; padding: 10px; border: 1px solid #ffffff30; border-radius: 8px; background: #15131e; color: #fff; font: inherit; }
.feedback-form p { font-size: .85rem; color: #b9b5c6; }
.feedback-form .feedback-trap { display: none; }
@media (max-width: 1100px) { .nav-wrap { flex-wrap: wrap; } .navigation { gap: 14px; } }
@media (max-width: 700px) { .contact-footer { grid-template-columns: 1fr; gap: 24px; } }
```

## src/config/coins.js

```javascript
export const COIN_CONFIG = Object.freeze({
  win: 10,
  bonusAfter: 2,
  bonusStep: 5,
  bonusCap: 25,
  milestones: Object.freeze([100, 500, 1000]),
  milestoneMessage: 'Coming soon: redeem coins for anime merch like hoodies and more. Keep earning, your coins are saved!',
});
```

## src/context/AuthContext.jsx

```jsx
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AuthService from '../services/AuthService';
import { USERS_KEY, SESSION_KEY } from '../services/localStorageStore';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++generation.current;
    try {
      const current = await AuthService.getCurrentUser();
      if (version === generation.current) { setUser(current); setError(''); }
    } catch (reason) {
      if (version === generation.current) { setUser(null); setError(reason.message); }
    } finally { if (version === generation.current) setLoading(false); }
  }, []);
  useEffect(() => {
    refresh();
    const sync = event => { if (event.key === null || [USERS_KEY, SESSION_KEY].includes(event.key)) refresh(); };
    window.addEventListener('storage', sync);
    return () => { generation.current++; window.removeEventListener('storage', sync); };
  }, [refresh]);
  async function run(method, ...args) {
    const result = await AuthService[method](...args);
    generation.current++;
    setUser(method === 'logOut' ? null : result);
    setError('');
    return result;
  }
  return <AuthContext.Provider value={{ user, loading, error, refresh,
    signUp: data => run('signUp', data), logIn: data => run('logIn', data),
    logOut: () => run('logOut'), updateProfile: data => run('updateProfile', data),
    recordGameResult: session => run('recordGameResult', session),
    recordQuizResult: attempt => run('recordQuizResult', attempt),
    acknowledgeCoinMilestone: milestone => run('acknowledgeCoinMilestone', milestone),
    updateStats: (data, battle) => run('updateStats', data, battle),
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
```

## src/pages/OnlineBattle.jsx

```jsx
import { useEffect,useRef,useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/ApiClient';
import { animeConfig } from '../data/anime';
import Button from '../components/Button';
import ArenaDraft from '../components/battle/ArenaDraft';
import ArenaLineup from '../components/battle/ArenaLineup';
import ArenaResults from '../components/battle/ArenaResults';
import './BattleArena.css';
const retryableDraftActions = new Set(['draw','reroll','keep','lock']);
function ownDraftKey(value) {
  if (!value) return '';
  return JSON.stringify([value.stage,value.team?.map(card=>[card.id,card.formId??null])??[],value.rerolls,value.kept,value.locked]);
}
export default function OnlineBattle() {
  const {user,refresh}=useAuth(), [params,setParams]=useSearchParams();
  const id=params.get('match'),invite=params.get('invite');
  const [match,setMatch]=useState(null),[history,setHistory]=useState([]),[order,setOrder]=useState([]);
  const [mode,setMode]=useState('friend'),[anime,setAnime]=useState('all'),[variants,setVariants]=useState(false);
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[link,setLink]=useState('');
  const current=useRef(null),working=useRef(false),generation=useRef(0),refreshRef=useRef(refresh);
  refreshRef.current=refresh;
  function accept(next) {
    if(current.current?.id===next.id && current.current.revision>next.revision)return;
    if(next.invite){const url=new URL('/battle',location.origin);url.searchParams.set('invite',next.invite);setLink(url.href);}
    current.current=next;setMatch(next);
  }
  useEffect(()=>{setOrder(match?.team??[]);},[match?.id,match?.kept]);
  useEffect(()=>{
    const version=++generation.current;
    if(current.current?.id!==id){current.current=null;setMatch(null);setLink('');}
    setError('');
    async function load(){
      try {
        if(invite){const next=await api('match/join',{invite});if(version===generation.current){accept(next);setParams({match:next.id},{replace:true});}}
        else if(id){const next=await api('match/view',{id},'GET');if(version===generation.current){accept(next);if(next.stage==='complete')await refreshRef.current();}}
        else {const records=await api('match/list',{},'GET');if(version===generation.current)setHistory(records);}
      }catch(reason){if(version===generation.current)setError(reason.message);}
    }
    load();return()=>{generation.current++;};
  },[id,invite,user.id]);
  useEffect(()=>{
    if(!id||match?.stage==='complete')return;
    let stopped=false,timer;
    async function poll(){
      if(!document.hidden&&!working.current){
        try{const next=await api('match/view',{id},'GET');if(!stopped){accept(next);setError('');if(next.stage==='complete')await refreshRef.current();}}
        catch(reason){if(!stopped){if(reason.status===410){current.current=null;setMatch(null);}setError(reason.message);}}
      }
      if(!stopped)timer=setTimeout(poll,4000);
    }
    timer=setTimeout(poll,4000);return()=>{stopped=true;clearTimeout(timer);};
  },[id,match?.stage]);
  async function action(name,extra={}){
    if(working.current)return;working.current=true;setBusy(true);setError('');
    const version=generation.current;
    try{
      let base=current.current;
      for(let attempt=0;attempt<2;attempt++){
        try{
          const next=await api(`match/${name}`,{id:base?.id,revision:base?.revision,...extra});
          if(version===generation.current){accept(next);if(name==='create')setParams({match:next.id});if(next.stage==='complete')await refresh();}
          return;
        }catch(reason){
          if(reason.status!==409||!base?.id||name==='create')throw reason;
          const latest=await api('match/view',{id:base.id},'GET');
          if(version!==generation.current)return;
          const retry=attempt===0&&latest.stage==='draft'&&retryableDraftActions.has(name)&&ownDraftKey(base)===ownDraftKey(latest);
          accept(latest);
          if(!retry){
            if(latest.stage==='complete')await refresh();
            else setError('The match changed in another tab or device. Latest state loaded; your action was not repeated.');
            return;
          }
          base=latest;
        }
      }
    }catch(reason){
      if(version===generation.current){if(reason.status===410){current.current=null;setMatch(null);}setError(reason.message);}
    }finally{working.current=false;setBusy(false);}
  }
  return <div className="container arena-page"><header className="arena-heading"><span className="eyebrow">SERVER-VERIFIED ARENA</span><h1>BATTLE <span>ONLINE.</span></h1><p>Separate accounts. Private teams. Shared showdown.</p></header>
    {error&&<p role="alert" className="account-error">{error}</p>}
    {!id&&!invite&&<><section className="arena-panel"><h2>CHOOSE YOUR RIVAL.</h2><form onSubmit={event=>{event.preventDefault();action('create',{mode,anime,variants});}}>
      <label>Opponent<select value={mode} onChange={e=>setMode(e.target.value)}><option value="friend">Online friend</option><option value="cpu">CPU</option></select></label>
      <label>World<select value={anime} onChange={e=>setAnime(e.target.value)}><option value="all">All worlds</option>{animeConfig.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label className="arena-choice"><input type="checkbox" checked={variants} onChange={e=>setVariants(e.target.checked)}/>Include form variants</label>
      <Button disabled={busy} type="submit">{busy?'Creating match…':'Create match'}</Button></form><p className="arena-note">Invite your friend to open the link on their device and sign in with their own account. Invites and unfinished matches expire after 24 hours.</p></section>
      <section className="arena-panel arena-history"><h2>YOUR ONLINE MATCHES</h2>{!history.length&&<p>No matches yet.</p>}<ul>{history.map(item=><li key={item.id}><span>{item.names.join(' vs ')} · {item.stage}</span><Button disabled={item.stage==='expired'} onClick={()=>setParams({match:item.id})}>{item.stage==='expired'?'Expired':'Open'}</Button></li>)}</ul></section></>}
    {(id||invite)&&!match&&!error&&<p role="status">Loading match…</p>}
    {match?.stage==='waiting'&&<section className="arena-panel"><h2>WAITING FOR YOUR RIVAL.</h2><p>Player 2 must use a separate account. Opening this link yourself cannot join your own match.</p>
      {link?<label>Private invite link<input readOnly value={link} onFocus={e=>e.target.select()}/></label>:<Button disabled={busy} onClick={()=>action('invite')}>Create fresh invite link</Button>}
      <p className="arena-note">Creating a fresh link invalidates the previous link. Keep the invite private.</p></section>}
    {match?.stage==='draft'&&<><p role="status">Your rival has {match.opponent.count}/5 fighters · {match.opponent.locked?'Lineup locked':'Lineup hidden'}</p>
      <fieldset className="online-controls" disabled={busy} aria-busy={busy}>
      {!match.kept&&<ArenaDraft name={user.username} player={0} draft={{teams:[match.team,[]],rerolls:[match.rerolls,0]}} onDraw={()=>action('draw')} onReroll={()=>action('reroll')} onLock={()=>action('keep')}/>}
      {match.kept&&!match.locked&&<ArenaLineup name={user.username} team={order.length?order:match.team} onChange={setOrder} onLock={()=>action('lock',{order:(order.length?order:match.team).map(card=>card.id)})}/>}
      {match.locked&&<section className="arena-panel"><h2>YOUR LINEUP IS LOCKED.</h2><p>Waiting for your rival. The result appears automatically when both players lock.</p></section>}</fieldset></>}
    {match?.stage==='complete'&&<ArenaResults record={match.record} outcome={match.outcome} replay={false} saveState={{busy:false,error:''}} onRematch={()=>action('create',{...match.options,mode:match.mode})} onNew={()=>setParams({})}/>}
    {id&&<Button variant="secondary" onClick={()=>setParams({})}>Back to match list</Button>}
    <p className="arena-note arena-footer">Online results and profiles are stored in the database. Match updates refresh every four seconds while this tab is visible.</p>
  </div>;
}
```

## src/pages/Profile.jsx

```jsx
import CoinHistory from '../components/CoinHistory';
import AccountSecurity from '../components/AccountSecurity';
import { ONLINE } from '../config/online';
import { useEffect, useState } from 'react';
import { LogOut, Swords, CircleHelp, Trophy, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { challengeDate } from '../quiz/date';
import { currentDailyStreak } from '../quiz/profileResult';
import { getAvatar, getRank } from '../data/profile';
import CharacterAvatar from '../components/CharacterAvatar';
import AvatarPicker from '../components/AvatarPicker';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import './Accounts.css';
const achievementLabel = id => id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
export default function Profile() {
  const { user, updateProfile, logOut } = useAuth();
  const [avatar, setAvatar] = useState(user?.avatar ?? 'leaf');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { setAvatar(user?.avatar ?? 'leaf'); }, [user?.avatar]);
  if (!user) return null;
  const rank = getRank(user.battleStats.rankPoints);
  async function saveAvatar() {
    setBusy(true); setError(''); setMessage('');
    try { await updateProfile({ avatar }); setMessage('Avatar saved.'); } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  async function leave() {
    setBusy(true); setError('');
    try { await logOut(); } catch (reason) { setError(reason.message); } finally { setBusy(false); }
  }
  return <div className="container profile-page"><header className="profile-heading"><div><span className="eyebrow">YOUR PLAYER CARD</span><h1>THE NEXT ARC <span>IS YOURS.</span></h1></div><Button variant="secondary" onClick={leave} disabled={busy}><LogOut size={17} />Log out</Button></header>
    <Card className="player-card"><CharacterAvatar character={getAvatar(user.avatar)} className="player-avatar" /><div className="player-identity"><Badge color={rank.color}>{rank.name.toUpperCase()}</Badge><h2>{user.username}</h2><p>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div><div className="rank-progress"><strong>{user.battleStats.rankPoints} rank points</strong><ProgressBar value={rank.progress} max={100} label={`${rank.name} rank progress`} color={rank.color} /><p>{rank.next ? `${rank.next.min - user.battleStats.rankPoints} points to ${rank.next.name}` : 'You reached the top rank.'}</p></div></Card>
    {error && <p className="account-error" role="alert">{error}</p>}
    <div className="profile-grid"><CoinHistory user={user} />{ONLINE && <AccountSecurity />}<Card className="profile-section"><h2><Swords size={22} />BATTLE RECORD</h2><dl className="profile-stats">{[['Wins', user.battleStats.wins], ['Losses', user.battleStats.losses], ['Win streak', user.battleStats.winStreak], ['Best streak', user.battleStats.bestStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Draft a team and build your battle record.</p><Button to="/battle" variant="secondary">Visit Battle Arena</Button></Card>
      <Card className="profile-section"><h2><CircleHelp size={22} />QUIZ PROGRESS</h2><dl className="profile-stats">{[['Quizzes played', user.quizStats.quizzesPlayed], ['Best accuracy', `${user.quizStats.bestScore}%`], ['Quiz XP', user.quizStats.xp], ['Daily streak', currentDailyStreak(user, challengeDate())], ['Best daily streak', user.quizStats.bestDailyStreak]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Classic, 60-second Blitz and Daily Challenge are ready.</p><p className="profile-empty">Best points · Classic {user.quizProgress?.bestScores?.classic ?? 0} · Blitz {user.quizProgress?.bestScores?.blitz ?? 0} · Daily {user.quizProgress?.bestScores?.daily ?? 0}</p><Button to="/quizzes" variant="secondary">Play quizzes</Button></Card>
      <Card className="profile-section"><h2><Gamepad2 size={22} />GAME RECORD</h2><dl className="profile-stats">{[['Games played', user.gameProgress?.gamesPlayed ?? 0], ['Move Match best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('move:')).map(([, score]) => score))], ['Clue Chain best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('clue:')).map(([, score]) => score))], ['Higher or Lower best', Math.max(0, ...Object.entries(user.gameProgress?.highScores ?? {}).filter(([key]) => key.startsWith('power:')).map(([, score]) => score))]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="profile-empty">Highest recorded points per game. Filter/rules boards are listed separately in Games.</p><Button to="/games" variant="secondary">Play guessing games</Button></Card>
      <Card className="profile-section"><AvatarPicker value={avatar} onChange={value => { setAvatar(value); setMessage(''); }} disabled={busy} /><Button onClick={saveAvatar} disabled={busy || avatar === user.avatar}>Save avatar</Button><p role="status" className="save-status">{message}</p></Card>
      <Card className="profile-section"><h2><Trophy size={22} />ACHIEVEMENTS</h2>{user.achievements.length ? <ul className="achievement-list">{user.achievements.map(id => <li key={id}><Trophy size={18} />{achievementLabel(id)}</li>)}</ul> : <div className="achievement-empty"><Trophy size={44} /><h3>YOUR TROPHY SHELF</h3><p>No achievements yet. Win an arena match to earn your first trophy.</p></div>}<div className="rank-ladder"><span>Rank ladder</span><p>Rookie → Fighter → Elite → Master → Legend</p></div></Card>
    </div><p className="local-account-note">{ONLINE ? 'Your profile and completed progress are stored with your online account.' : 'Saved in this browser only. Clearing site data removes local profiles and progress.'}</p>
  </div>;
}
```

## src/services/ApiAuthService.js

```javascript
import { api } from './ApiClient.js';
export class ApiAuthService {
  getCurrentUser(){return api('auth/me',{},'GET');}
  signUp(data){return api('auth/signup',data);}
  logIn(data){return api('auth/login',data);}
  logOut(){return api('auth/logout');}
  acknowledgeCoinMilestone(milestone){return api('profile/milestone',{milestone});}
  updateProfile(data){return api('profile/avatar',data);}
  async updateStats(){throw new Error('Online rank is awarded by the match server.');}
  async getBattleReceipt(){return null;}
  async getQuizReceipt(){return null;}
  async getGameReceipt(){return null;}
  get recordQuizResult(){return ()=>this.getCurrentUser();}
  get recordGameResult(){return ()=>this.getCurrentUser();}
}
```

## src/services/CoinsService.js

```javascript
import { COIN_CONFIG } from '../config/coins.js';

// Pure account-ledger operations. Production calls settlement only inside the
// locked match-completion transaction; the explicit local demo uses this too.
export function coinState(profile) {
  const ledger = profile?.coins?.ledger ?? [];
  return {
    ledger,
    balance: ledger.reduce((sum, item) => sum + item.amount, 0),
    streak: profile?.coins?.streak ?? 0,
    shownMilestones: profile?.coins?.shownMilestones ?? [],
  };
}
export function settleCoins(profile, { matchId, won, timestamp = new Date().toISOString() }) {
  if (!profile?.id) return null;
  if (typeof matchId !== 'string' || !matchId || typeof won !== 'boolean') throw new Error('Invalid coin result.');
  const previous = coinState(profile);
  if (previous.ledger.some(item => item.matchId === matchId)) return profile.coins;
  const streak = won ? previous.streak + 1 : 0;
  const bonus = won ? Math.min(COIN_CONFIG.bonusCap, Math.max(0, streak - COIN_CONFIG.bonusAfter) * COIN_CONFIG.bonusStep) : 0;
  const amount = won ? COIN_CONFIG.win + bonus : 0;
  return {
    streak, shownMilestones: previous.shownMilestones,
    ledger: [...previous.ledger, {
      id: `${profile.id}:${matchId}`, userId: profile.id, amount,
      reason: won ? (bonus ? 'win-streak-bonus' : 'win') : 'loss-streak-reset',
      matchId, timestamp,
    }],
  };
}
export function pendingMilestones(profile) {
  const state = coinState(profile);
  return COIN_CONFIG.milestones.filter(value => state.balance >= value && !state.shownMilestones.includes(value));
}
export function acknowledgeMilestone(profile, milestone) {
  const state = coinState(profile);
  if (!COIN_CONFIG.milestones.includes(milestone) || state.balance < milestone) throw new Error('Milestone has not been earned.');
  return { ledger: state.ledger, streak: state.streak, shownMilestones: [...new Set([...state.shownMilestones, milestone])] };
}
```

## src/services/LocalAuthService.js

```javascript
import { settleCoins, acknowledgeMilestone } from './CoinsService.js';
import { MINI } from '../minigames/config.js';
import { applyMiniResult } from '../minigames/engine.js';
import { validDate } from '../quiz/date.js';
import { QUIZ } from '../quiz/config.js';
import { applyQuizResult } from '../quiz/profileResult.js';
import { GAME } from '../game/config.js';
import { applyBattleResult } from '../game/profileResult.js';
import { profileAvatars } from '../data/profile.js';
import { createLocalStore, USERS_KEY, SESSION_KEY } from './localStorageStore.js';
import { createPasswordTools } from './passwords.js';
const avatarIds = new Set(profileAvatars.map(avatar => avatar.id));
const battleDefaults = { wins: 0, losses: 0, winStreak: 0, bestStreak: 0, rankPoints: 0 };
const quizDefaults = { quizzesPlayed: 0, bestScore: 0, xp: 0, dailyStreak: 0, bestDailyStreak: 0 };
function validateCredentials(username, password, signingUp) {
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) throw new Error('Use a username of 3–24 letters, numbers or underscores.');
  if (typeof password !== 'string' || password.length > 128 || password.length < (signingUp ? 8 : 1)) throw new Error(signingUp ? 'Use a password of 8–128 characters.' : 'Enter your password (up to 128 characters).');
  return username.trim();
}
function publicUser(record) {
  const { credential, battleReceipts, quizReceipts, gameReceipts, ...profile } = record;
  return structuredClone(profile);
}
function numericStats(current, updates, allowed) {
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) throw new Error('Invalid profile statistics.');
  const next = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (!Object.hasOwn(allowed, key) || !Number.isSafeInteger(value) || value < 0) throw new Error('Statistics must be non-negative whole numbers with known fields.');
    next[key] = value;
  }
  return next;
}
// PROTOTYPE ONLY: users, hashes, session and stats are editable in localStorage.
// PBKDF2 avoids storing plaintext; it does NOT provide real authentication/security.
// A backend must enforce credentials, sessions, score updates and authorization.
export class LocalAuthService {
  constructor({ getStorage = () => globalThis.localStorage, getCrypto = () => globalThis.crypto, iterations } = {}) {
    this.store = createLocalStore(getStorage);
    this.passwords = createPasswordTools(getCrypto, iterations);
    this.getCrypto = getCrypto;
  }
  readUsers() {
    const users = this.store.read(USERS_KEY, []);
    if (!Array.isArray(users) || users.some(user => !user || typeof user.id !== 'string' || !/^[a-zA-Z0-9_]{3,24}$/.test(user.username) || !avatarIds.has(user.avatar) || !Number.isFinite(Date.parse(user.createdAt)) || !user.credential || !Array.isArray(user.achievements) || [ [user.battleStats, battleDefaults], [user.quizStats, quizDefaults] ].some(([stats, defaults]) => !stats || Object.keys(defaults).some(key => !Number.isSafeInteger(stats[key]) || stats[key] < 0)))) throw new Error('Saved account data is invalid. Your existing data has not been replaced.');
    if (users.some(user => (user.quizProgress !== undefined && (!user.quizProgress || !(user.quizProgress.lastDailyDate === null || validDate(user.quizProgress.lastDailyDate)) || !user.quizProgress.bestScores || typeof user.quizProgress.bestScores !== 'object' || Array.isArray(user.quizProgress.bestScores) || Object.entries(user.quizProgress.bestScores).some(([mode, score]) => !['classic', 'blitz', 'daily'].includes(mode) || !Number.isSafeInteger(score) || score < 0))) || [user.quizReceipts, user.battleReceipts, user.gameReceipts].some(receipts => receipts !== undefined && (!Array.isArray(receipts) || receipts.some(receipt => !receipt || typeof receipt.id !== 'string'))))) throw new Error('Saved progress data is invalid. Your existing data has not been replaced.');
    if (users.some(user => user.gameProgress !== undefined && (!user.gameProgress || !Number.isSafeInteger(user.gameProgress.gamesPlayed) || user.gameProgress.gamesPlayed < 0 || !user.gameProgress.highScores || typeof user.gameProgress.highScores !== 'object' || Array.isArray(user.gameProgress.highScores) || Object.entries(user.gameProgress.highScores).some(([key, score]) => !/^(move|clue|power):[a-z0-9-]+:(normal|hard|streak|classic):(choice|typed)$/.test(key) || !Number.isSafeInteger(score) || score < 0)))) throw new Error('Saved game progress is invalid. Your existing data has not been replaced.');
    return users;
  }
  async getCurrentUser() {
    const session = this.store.read(SESSION_KEY, null);
    if (!session) return null;
    if (typeof session.userId !== 'string') throw new Error('Saved session data could not be read. Try signing out.');
    const user = this.readUsers().find(record => record.id === session.userId);
    return user ? publicUser(user) : null;
  }
  async signUp({ username, password, avatar = 'leaf' }) {
    username = validateCredentials(username, password, true);
    if (!avatarIds.has(avatar)) throw new Error('Choose an available avatar.');
    const normalized = username.toLowerCase();
    if (this.readUsers().some(user => user.username.toLowerCase() === normalized)) throw new Error('That username is already taken in this browser.');
    const credential = await this.passwords.hash(password);
    // Re-read after asynchronous hashing so concurrent local submissions do not overwrite one another.
    const users = this.readUsers();
    if (users.some(user => user.username.toLowerCase() === normalized)) throw new Error('That username is already taken in this browser.');
    const user = { id: this.getCrypto().randomUUID(), username, avatar, createdAt: new Date().toISOString(), battleStats: { ...battleDefaults }, quizStats: { ...quizDefaults }, achievements: [], credential };
    this.store.write(USERS_KEY, [...users, user]);
    try { this.store.write(SESSION_KEY, { userId: user.id }); } catch { throw new Error('Your profile was created, but the login session could not be saved. Enable browser storage, then log in.'); }
    return publicUser(user);
  }
  async logIn({ username, password }) {
    username = validateCredentials(username, password, false);
    const user = this.readUsers().find(record => record.username.toLowerCase() === username.toLowerCase());
    if (!user || !await this.passwords.verify(password, user.credential)) throw new Error('Username or password does not match an account in this browser.');
    // Do not resurrect an account deleted while password derivation was in flight.
    const latest = this.readUsers().find(record => record.id === user.id);
    if (!latest) throw new Error('This local account is no longer available.');
    this.store.write(SESSION_KEY, { userId: user.id });
    return publicUser(latest);
  }
  async logOut() { this.store.remove(SESSION_KEY); }
  async updateProfile({ avatar }) {
    if (!avatarIds.has(avatar)) throw new Error('Choose an available avatar.');
    return this.updateCurrent(record => ({ ...record, avatar }));
  }
  async acknowledgeCoinMilestone(milestone) {
    return this.updateCurrent(record => ({ ...record, coins: acknowledgeMilestone(record, milestone) }));
  }
  async getGameReceipt(id) {
    const session = this.store.read(SESSION_KEY, null);
    const record = this.readUsers().find(user => user.id === session?.userId);
    return structuredClone(record?.gameReceipts?.find(receipt => receipt.id === id) ?? null);
  }
  async recordGameResult(session) {
    return this.updateCurrent(record => {
      if (record.id !== session.ownerId) throw new Error('The signed-in account changed. Resume this game with its original account.');
      const receipts = record.gameReceipts ?? [];
      if (receipts.some(receipt => receipt.id === session.id)) return record;
      const { result, gameProgress } = applyMiniResult(record, session);
      return { ...record, gameProgress, gameReceipts: [...receipts, { id: session.id, score: result.score }].slice(-MINI.receiptLimit) };
    });
  }
  async getQuizReceipt(id) {
    const session = this.store.read(SESSION_KEY, null);
    const record = this.readUsers().find(user => user.id === session?.userId);
    return structuredClone(record?.quizReceipts?.find(receipt => receipt.id === id) ?? null);
  }
  async recordQuizResult(attempt) {
    return this.updateCurrent(record => {
      if (record.id !== attempt.ownerId) throw new Error('The signed-in account changed. Resume this quiz with its original account.');
      const receipts = record.quizReceipts ?? [];
      if (receipts.some(receipt => receipt.id === attempt.id)) return record;
      if (attempt.mode === 'daily' && record.quizProgress?.lastDailyDate === attempt.date) throw new Error('This daily challenge has already been credited.');
      const { result, ...updates } = applyQuizResult(record, attempt);
      return { ...record, ...updates, quizReceipts: [...receipts, { id: attempt.id, ...result }].slice(-QUIZ.receiptLimit) };
    });
  }
  async getBattleReceipt(id) {
    const session = this.store.read(SESSION_KEY, null);
    const record = this.readUsers().find(user => user.id === session?.userId);
    return structuredClone(record?.battleReceipts?.find(receipt => receipt.id === id) ?? null);
  }
  async updateStats(updates, battle = null) {
    if (!updates || typeof updates !== 'object' || Array.isArray(updates) || Object.keys(updates).some(key => !['battleStats', 'quizStats', 'achievements'].includes(key))) throw new Error('Invalid profile update.');
    return this.updateCurrent(record => {
      if (battle) {
        if (record.id !== battle.ownerId) throw new Error('The signed-in account changed. This battle belongs to its original player.');
        if (typeof battle.id !== 'string' || !/^battle-[a-zA-Z0-9-]{1,80}$/.test(battle.id)) throw new Error('Invalid battle ID.');
        const receipts = record.battleReceipts ?? [];
        if (receipts.some(receipt => receipt.id === battle.id) || record.coins?.ledger.some(item => item.matchId === battle.id)) return record;
        const result = applyBattleResult(record, battle);
        return { ...record, coins: settleCoins(record, { matchId: battle.id, won: battle.won }), battleStats: result.battleStats, achievements: result.achievements,
          battleReceipts: [...receipts, { id: battle.id, delta: result.delta, rankPoints: result.battleStats.rankPoints }].slice(-GAME.receiptLimit) };
      }
      const battleStats = updates.battleStats === undefined ? record.battleStats : numericStats(record.battleStats, updates.battleStats, battleDefaults);
      const quizStats = updates.quizStats === undefined ? record.quizStats : numericStats(record.quizStats, updates.quizStats, quizDefaults);
      if (battleStats.bestStreak < battleStats.winStreak || quizStats.bestScore > 100 || quizStats.bestDailyStreak < quizStats.dailyStreak) throw new Error('Profile statistics are inconsistent.');
      const achievements = updates.achievements ?? record.achievements;
      if (!Array.isArray(achievements) || achievements.length > 100 || achievements.some(id => typeof id !== 'string' || !/^[a-z0-9-]{1,64}$/.test(id))) throw new Error('Invalid achievement IDs.');
      return { ...record, battleStats, quizStats, achievements: [...new Set(achievements)] };
    });
  }
  async updateCurrent(transform) {
    // Keep the read/modify/write synchronous within this adapter to avoid local lost updates.
    const session = this.store.read(SESSION_KEY, null);
    const users = this.readUsers();
    const index = users.findIndex(record => record.id === session?.userId);
    if (index < 0) throw new Error('Sign in before updating your profile.');
    users[index] = transform(users[index]);
    this.store.write(USERS_KEY, users);
    return publicUser(users[index]);
  }
}
```

## tests/coins.test.mjs

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coinState, settleCoins, pendingMilestones, acknowledgeMilestone } from '../src/services/CoinsService.js';
const account = () => ({ id: 'player' });
test('ledger awards 10,10,15,20,25,30,35,35, then loss resets and retry is idempotent', () => {
 const profile = account();
 for (const [index, amount] of [10,10,15,20,25,30,35,35].entries()) {
  profile.coins = settleCoins(profile, { matchId: `match-${index}`, won: true });
  assert.equal(profile.coins.ledger.at(-1).amount, amount);
 }
 assert.equal(coinState(profile).balance, 180);
 const before = structuredClone(profile.coins);
 assert.deepEqual(settleCoins(profile, { matchId: 'match-0', won: true }), before);
 profile.coins = settleCoins(profile, { matchId: 'loss', won: false });
 assert.equal(coinState(profile).streak, 0);
 assert.equal(coinState(profile).balance, 180);
 assert.deepEqual(settleCoins(profile, { matchId: 'loss', won: false }), profile.coins);
 profile.coins = settleCoins(profile, { matchId: 'after-loss', won: true });
 assert.equal(profile.coins.ledger.at(-1).amount, 10);
 assert.equal(profile.coins.ledger.at(-1).userId, 'player');
});
test('guests and old accounts default to zero; milestones are per account, earned and acknowledged once', () => {
 assert.equal(settleCoins(null, { matchId: 'x', won: true }), null);
 assert.equal(coinState(account()).balance, 0);
 assert.deepEqual(pendingMilestones(null), []);
 const profile = account();
 assert.throws(() => acknowledgeMilestone(profile, 100));
 for (let i = 0; i < 35; i++) profile.coins = settleCoins(profile, { matchId: `m-${i}`, won: true });
 assert.deepEqual(pendingMilestones(profile), [100,500,1000]);
 for (const value of [100,500,1000]) profile.coins = acknowledgeMilestone(profile, value);
 assert.deepEqual(pendingMilestones(profile), []);
 assert.deepEqual(acknowledgeMilestone(profile,100), profile.coins);
 assert.deepEqual(coinState(account()).shownMilestones, []);
 assert.throws(() => acknowledgeMilestone(profile, 99));
});
```

## tests/online/online.spec.js

```javascript
import {test,expect} from '@playwright/test';
async function signup(page,name){
 await page.goto('/signup');await page.getByLabel('Username',{exact:true}).fill(name);
 await page.getByLabel('Password',{exact:true}).fill('browser secure password 2026');
 await page.getByLabel('Confirm password',{exact:true}).fill('browser secure password 2026');
 await page.getByRole('button',{name:'Create my profile',exact:true}).click();await expect(page).toHaveURL(/profile/);
}
async function draft(page){for(let i=1;i<=5;i++)await page.getByRole('button',{name:`Reveal fighter ${i}`,exact:true}).click();await page.getByRole('button',{name:'Keep team',exact:true}).click();await expect(page.getByRole('button',{name:'Lock lineup',exact:true})).toBeVisible();}
test('two separate accounts accept an invite, keep private teams and receive one shared result',async({browser,page},info)=>{
 const suffix=Date.now().toString().slice(-8)+info.project.name.slice(-3);
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await signup(page,`Host${suffix}`);await page.goto('/battle');
 await page.getByRole('button',{name:'Create match',exact:true}).click();
 const invite=page.getByLabel('Private invite link');await expect(invite).toBeVisible();const link=await invite.inputValue();
 const rivalContext=await browser.newContext({viewport:info.project.use.viewport});const rival=await rivalContext.newPage();
 await rival.goto(link);await expect(rival).toHaveURL(/login/);
 await rival.getByRole('link',{name:'Create account',exact:true}).click();
 await expect(rival.getByRole('heading',{name:'CHOOSE YOUR PLAYER NAME'})).toBeVisible();
 await rival.getByLabel('Username',{exact:true}).fill(`Rival${suffix}`);
 await rival.getByLabel('Password',{exact:true}).fill('browser secure password 2026');
 await rival.getByLabel('Confirm password',{exact:true}).fill('browser secure password 2026');
 await rival.getByRole('button',{name:'Create my profile',exact:true}).click();
 await expect(rival.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible({timeout:10000});
 await draft(page);await page.getByRole('button',{name:'Lock lineup',exact:true}).click();
 await expect(page.getByRole('heading',{name:'YOUR LINEUP IS LOCKED.'})).toBeVisible();
 await expect(rival.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await draft(rival);await rival.getByRole('button',{name:'Lock lineup',exact:true}).click();
 await expect(rival.locator('.arena-results')).toBeVisible();await expect(page.locator('.arena-results')).toBeVisible({timeout:10000});
 const score=await page.locator('.result-score').innerText();expect(await rival.locator('.result-score').innerText()).toEqual(score);
 const own=await page.evaluate(async()=> (await (await fetch('/api/index?route=auth%2Fme')).json()).data);
 const other=await rival.evaluate(async()=> (await (await fetch('/api/index?route=auth%2Fme')).json()).data);
 expect(own.coins.ledger.length).toBe(1);expect(other.coins.ledger.length).toBe(1);
 expect(own.coins.ledger[0].amount+other.coins.ledger[0].amount).toBe(10);
 const winner=own.coins.ledger[0].amount ? page : rival;
 await expect(winner.locator('.coin-toast')).toContainText('+10 coins');
 expect(errors).toEqual([]);
 const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
 await page.reload();await expect(page.locator('.arena-results')).toBeVisible();
 await rivalContext.close();
});
test('same-account tabs do not replay a stale draft action',async({page},info)=>{
 await signup(page,`Tabs${Date.now().toString().slice(-8)}${info.project.name.slice(-3)}`);
 await page.goto('/battle');
 await page.getByLabel('Opponent').selectOption('cpu');
 await page.getByRole('button',{name:'Create match',exact:true}).click();
 await expect(page.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 const mirror=await page.context().newPage();await mirror.goto(page.url());
 await expect(mirror.getByRole('button',{name:'Reveal fighter 1',exact:true})).toBeVisible();
 await Promise.all([
  page.getByRole('button',{name:'Reveal fighter 1',exact:true}).click(),
  mirror.getByRole('button',{name:'Reveal fighter 1',exact:true}).click(),
 ]);
 await page.reload();
 await expect(page.getByRole('button',{name:'Reveal fighter 2',exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Reveal fighter 3',exact:true})).toHaveCount(0);
 await mirror.close();
});
test('server quizzes and guessing games resume without browser-owned scores',async({page},info)=>{
 await signup(page,`Scholar${Date.now().toString().slice(-8)}${info.project.name.slice(-3)}`);
 await page.goto('/quizzes');await page.getByRole('button',{name:'Start quiz',exact:true}).click();
 await expect(page.locator('.quiz-question-title')).toBeVisible();await page.locator('.quiz-option').first().click();
 await expect(page.locator('.quiz-feedback')).toBeVisible();await page.getByRole('button',{name:'Next question',exact:true}).click();
 await page.reload();await expect(page.getByRole('button',{name:'Resume',exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'Resume',exact:true}).first().click();await expect(page.locator('.quiz-count')).toContainText('QUESTION 2');
 for(let i=2;i<=10;i++){await page.locator('.quiz-option').first().click();await expect(page.locator('.quiz-feedback')).toBeVisible();await page.getByRole('button',{name:i===10?'View results':'Next question',exact:true}).click();}
 await expect(page.locator('.quiz-results')).toBeVisible();await expect(page.getByText(/Progress saved to/)).toBeVisible();
 await page.goto('/games');await page.getByRole('button',{name:'Start game',exact:true}).click();
 await expect(page.locator('.mini-question-title')).toBeVisible();await page.locator('.mini-options button').first().click();
 await expect(page.locator('.mini-feedback')).toBeVisible();await page.getByRole('button',{name:'Next round',exact:true}).click();
 await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();await expect(page.locator('.mini-game-meta')).toContainText('ROUND 2');
 for(let i=2;i<=10;i++){await page.locator('.mini-options button').first().click();await expect(page.locator('.mini-feedback')).toBeVisible();await page.getByRole('button',{name:i===10?'View results':'Next round',exact:true}).click();}
 await expect(page.locator('.mini-result-title')).toBeVisible();
 await page.goto('/profile');await expect(page.locator('.profile-stats').filter({has:page.getByText('Quizzes played',{exact:true})}).locator('dd').first()).toHaveText('1');
 await expect(page.locator('.profile-stats').filter({has:page.getByText('Games played',{exact:true})}).locator('dd').first()).toHaveText('1');
});
test('world details and Home avoid external font and roster requests',async({page})=>{
 const requests=[];page.on('request',request=>requests.push(request.url()));await page.goto('/');
 await expect(page.locator('.portal-facts')).toHaveCount(3);
 expect(requests.some(url=>url.includes('fonts.googleapis'))).toBe(false);
 expect(requests.some(url=>url.includes('onepiece-'))).toBe(false);
 await page.screenshot({path:`/tmp/online-home-${test.info().project.name}.png`,fullPage:true});
 await page.locator('.portal-naruto').click();await expect(page.getByText('700 chapters · 72 volumes',{exact:true})).toBeVisible();
 const widths=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
```

## tests/online/rewards.spec.js

```javascript
import {test,expect} from '@playwright/test';
const emptyProfile = () => ({id:'browser-test-player',username:'CoinTester',avatar:'leaf',createdAt:new Date().toISOString(),achievements:[],battleStats:{wins:0,losses:0,winStreak:0,bestStreak:0,rankPoints:0},quizStats:{quizzesPlayed:0,bestScore:0,xp:0,dailyStreak:0,bestDailyStreak:0}});
test('guest footer contact links, feedback validation and delivery states',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.coin-nav')).toHaveText('Log in to earn coins');
 const footer=page.locator('.contact-footer');
 await expect(footer.getByRole('link',{name:'LinkedIn'})).toHaveAttribute('href','https://www.linkedin.com/in/kushagra-pandey-353b71175/');
 await expect(footer.getByRole('link',{name:'GitHub'})).toHaveAttribute('href','https://github.com/kushagrapandey-cmd');
 await footer.getByLabel('Your name').fill('Visitor');
 await footer.getByLabel('Your email').fill('visitor@example.com');
 await footer.getByLabel('Feedback',{exact:true}).fill('Please add more anime worlds.');
 await page.route('**/api/index?route=contact%2Ffeedback',route=>route.fulfill({status:503,json:{error:'Email service is unavailable.'}}));
 await footer.getByRole('button',{name:'Send feedback'}).click();
 await expect(footer.getByRole('alert')).toContainText('email link');
 await expect(footer.getByLabel('Feedback',{exact:true})).toHaveValue('Please add more anime worlds.');
 await page.unroute('**/api/index?route=contact%2Ffeedback');
 await page.route('**/api/index?route=contact%2Ffeedback',route=>route.fulfill({json:{data:{sent:true}}}));
 await footer.getByRole('button',{name:'Send feedback'}).click();
 await expect(footer.getByRole('status')).toHaveText('Feedback sent. Thank you!');
 await expect(footer.getByLabel('Feedback',{exact:true})).toHaveValue('');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('profile ledger, one-time milestone modals, disabled redemption and account isolation',async({page})=>{
 let profile=emptyProfile();
 profile.coins={streak:4,shownMilestones:[],ledger:[{id:'earned',userId:profile.id,amount:1000,reason:'win',matchId:'test-match',timestamp:new Date().toISOString()}]};
 await page.route('**/api/index?route=auth%2Fme',route=>route.fulfill({json:{data:profile}}));
 await page.route('**/api/index?route=profile%2Fmilestone',async route=>{
  profile.coins.shownMilestones.push(route.request().postDataJSON().milestone);
  await route.fulfill({json:{data:profile}});
 });
 await page.goto('/profile');
 for (const milestone of [100,500,1000]) {
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText(`${milestone} COINS EARNED!`);
  await expect(page.getByRole('dialog')).toContainText('Keep earning, your coins are saved!');
  await page.getByRole('button',{name:'Keep earning',exact:true}).click();
 }
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.locator('.coin-nav')).toHaveText('1000 coins · 4 streak');
 await expect(page.getByRole('button',{name:'Redeem (Coming Soon)'})).toBeDisabled();
 await expect(page.locator('.coin-history li')).toHaveCount(1);
 await page.reload();await expect(page.getByRole('dialog')).not.toBeVisible();
 profile={...emptyProfile(),id:'other-account'};
 await page.reload();await expect(page.locator('.coin-nav')).toHaveText('0 coins · 0 streak');
 await expect(page.locator('.coin-history li')).toHaveCount(0);
});
```

## tests/server/feedback.test.mjs

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feedbackRoute, sendFeedbackEmail } from '../../server/feedback.js';
test('feedback validates input, ignores honeypots and sends only normalized visitor data', async () => {
 let sent;
 const send = async data => { sent = data; };
 await assert.rejects(feedbackRoute({name:'X',email:'bad',message:'short'},send), {status:400});
 assert.equal(sent,undefined);
 await feedbackRoute({website:'spam'},send);
 assert.equal(sent,undefined);
 assert.deepEqual(await feedbackRoute({name:' Visitor ',email:'visitor@example.com',message:' A useful suggestion. ',to:'attacker@example.com'},send),{sent:true});
 const {requestId,...content}=sent;
 assert.deepEqual(content,{name:'Visitor',email:'visitor@example.com',message:'A useful suggestion.'});
 assert.equal(requestId.length,64);
 await assert.rejects(feedbackRoute({name:'Visitor',email:'visitor@example.com',message:'A useful suggestion.'},async()=>{throw new Error('provider unavailable');}),/provider unavailable/);
});
test('missing email config fails honestly without claiming delivery', async()=>{
 const previous=process.env.RESEND_API_KEY;
 delete process.env.RESEND_API_KEY;
 try { await assert.rejects(sendFeedbackEmail({}), {status:503}); }
 finally { if(previous!==undefined)process.env.RESEND_API_KEY=previous; }
});
```

## tests/server/online.test.mjs

```javascript
import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../../server/handler.js';
import { sessionCookie,hashPassword,verifyPassword } from '../../server/security.js';
import { settleCoins } from '../../src/services/CoinsService.js';
import { newMatch,changeMatch,matchView } from '../../server/matchEngine.js';
import { questions,miniRoster } from '../../server/catalog.js';
import { createAttempt } from '../../src/quiz/engine.js';
import { createSession } from '../../src/minigames/engine.js';
import { activityView } from '../../server/activities.js';
let db,server,origin,alice,bob,charlie;
const feedbackMessages=[];
const password='a correct horse battery staple';
async function client(name){
 let cookie='';
 const call=async(route,data={},method='POST',extra={})=>{
  const url=new URL('/api/index',origin);url.searchParams.set('route',route);
  if(method==='GET')for(const [key,value] of Object.entries(data))url.searchParams.set(key,value);
  const response=await fetch(url,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method==='GET'?{}:{Origin:origin,'Content-Type':'application/json'}),...extra},body:method==='GET'?undefined:JSON.stringify(data)});
  const next=response.headers.get('set-cookie');if(next)cookie=next.split(';')[0];
  return {status:response.status,body:await response.json(),cookie:next};
 };
 const signup=await call('auth/signup',{username:name,password});assert.equal(signup.status,200);
 return {call,user:signup.body.data,cookie:()=>cookie};
}
before(async()=>{
 db=new PGlite();await db.exec(readFileSync(new URL('../../server/schema.sql',import.meta.url),'utf8'));
 server=createServer((req,res)=>handler(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 origin=`http://127.0.0.1:${server.address().port}`;
 globalThis.handler=createHandler({database:db,origin,secret:'s'.repeat(48),secure:false,logger:{error(){}},sendFeedback:async message=>{feedbackMessages.push(message);}});
 alice=await client('OnlineAlice');bob=await client('OnlineBob');charlie=await client('OnlineCharlie');
});
after(async()=>{await new Promise(resolve=>server.close(resolve));await db.close();});
test('password hashes, opaque cookies and profiles never expose credentials',async()=>{
 const {rows}=await db.query('SELECT password_hash FROM app_users WHERE id=$1',[alice.user.id]);
 assert(!rows[0].password_hash.includes(password));assert(await verifyPassword(password,rows[0].password_hash));
 assert.notEqual(await hashPassword(password),rows[0].password_hash);
 assert.equal((await alice.call('auth/me',{},'GET')).body.data.username,'OnlineAlice');
 const encoded=JSON.stringify((await alice.call('auth/me',{},'GET')).body);
 assert(!encoded.includes('password_hash'));assert(!encoded.includes('token_hash'));
 assert.match(sessionCookie('x',true),/__Host-aniclash=x.*HttpOnly.*Secure/);
});
test('account validation handles duplicate names, case-insensitive login and malformed JSON bodies',async()=>{
 const duplicate=await alice.call('auth/signup',{username:'onlinealice',password});assert.equal(duplicate.status,409);
 assert.equal((await alice.call('auth/login',{username:'ONLINEALICE',password:'wrong password'})).status,401);
 assert.equal((await alice.call('auth/login',{username:'onlinealice',password})).status,200);
 const malformed=await fetch(`${origin}/api/index?route=auth/signup`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'null'});
 assert.equal(malformed.status,400);assert.equal((await malformed.json()).error,'Invalid request.');
});
test('cross-origin writes, missing cookies, arbitrary profile changes and wrong methods fail',async()=>{
 assert.equal((await alice.call('match/create',{},'POST',{Origin:'https://evil.example'})).status,403);
 assert.equal((await alice.call('auth/signup',{},'GET')).status,405);
 assert.equal((await alice.call('profile/stats',{rankPoints:99999})).status,404);
 const response=await fetch(`${origin}/api/index?route=match/list`);assert.equal(response.status,401);
 assert.equal((await alice.call('profile/avatar',{avatar:'pirate'})).body.data.avatar,'pirate');
});
test('invites require a second account and outsiders cannot inspect or change a match',async()=>{
 const created=await alice.call('match/create',{mode:'friend'});const match=created.body.data;
 assert.equal((await alice.call('match/join',{invite:match.invite})).status,409);
 assert.equal((await bob.call('match/join',{invite:match.invite})).status,200);
 assert.equal((await charlie.call('match/join',{invite:match.invite})).status,409);
 assert.equal((await charlie.call('match/view',{id:match.id},'GET')).status,404);
 assert.equal((await charlie.call('match/draw',{id:match.id,revision:1})).status,404);
});
test('drafts stay private, player IDs cannot spoof turns, stale writes fail and results credit once',async()=>{
 let a=(await alice.call('match/create',{mode:'friend',variants:true})).body.data;
 let b=(await bob.call('match/join',{invite:a.invite})).body.data;
 for(let i=0;i<5;i++){
  a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
  const draw=await alice.call('match/draw',{id:a.id,revision:a.revision,player:1});assert.equal(draw.status,200);a=draw.body.data;
  assert.equal(a.team.length,i+1);assert.equal(a.opponent.count,i);
  const stale=await alice.call('match/draw',{id:a.id,revision:a.revision-1});assert.equal(stale.status,409);
  b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
  assert.equal(b.team.length,i);assert(!JSON.stringify(b).includes(a.team.at(-1).id));assert.equal(b.seed,undefined);
  b=(await bob.call('match/draw',{id:a.id,revision:b.revision})).body.data;
 }
 a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
 a=(await alice.call('match/keep',{id:a.id,revision:a.revision})).body.data;
 b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
 b=(await bob.call('match/keep',{id:a.id,revision:b.revision})).body.data;
 a=(await alice.call('match/view',{id:a.id},'GET')).body.data;
 const order=a.team.map(card=>card.id);
 assert.equal((await alice.call('match/lock',{id:a.id,revision:a.revision,order:b.team.map(card=>card.id)})).status,400);
 a=(await alice.call('match/lock',{id:a.id,revision:a.revision,order})).body.data;
 assert.equal(a.stage,'draft');assert.equal(a.record,undefined);
 b=(await bob.call('match/view',{id:a.id},'GET')).body.data;
 b=(await bob.call('match/lock',{id:a.id,revision:b.revision,order:b.team.map(card=>card.id).reverse()})).body.data;
 assert.equal(b.stage,'complete');assert.equal(b.outcome.rounds.length,5);
 const credited=(await alice.call('auth/me',{},'GET')).body.data;
 assert.equal(credited.coins.ledger.length,1);
 assert.equal(credited.coins.ledger[0].matchId,a.id);
 assert.equal(credited.coins.ledger[0].amount,credited.battleStats.wins?10:0);
 assert.equal((await alice.call('profile/milestone',{milestone:100})).status,400);
 const before=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 assert.equal(before.wins+before.losses,1);
 await alice.call('match/view',{id:a.id},'GET');
 await bob.call('match/lock',{id:a.id,revision:b.revision-1,order:[]});
 assert.deepEqual((await alice.call('auth/me',{},'GET')).body.data.battleStats,before);
 assert.deepEqual((await alice.call('auth/me',{},'GET')).body.data.coins,credited.coins);
});
test('quiz answers and reconstruction seed stay private, results persist across sessions exactly once',async()=>{
 let state=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'classic'}})).body.data;
 assert.equal(state.questions[0].answerIndex,undefined);assert.equal(state.questions[0].explanation,undefined);assert.equal(state.seed,'');
 assert.equal((await bob.call('activity/view',{kind:'quiz',id:state.id},'GET')).status,404);
 for(let i=0;i<10;i++){
  const answer=await alice.call('activity/answer',{kind:'quiz',id:state.id,revision:state.revision,input:0});assert.equal(answer.status,200);state=answer.body.data;
  assert.equal(typeof state.questions[i].answerIndex,'number');
  state=(await alice.call('activity/next',{kind:'quiz',id:state.id,revision:state.revision})).body.data;
 }
 assert.equal(state.status,'complete');assert.equal(state.saved,true);
 const before=(await alice.call('auth/me',{},'GET')).body.data.quizStats;
 assert.equal(before.quizzesPlayed,1);
 await alice.call('activity/save',{kind:'quiz',id:state.id});
 assert.deepEqual((await alice.call('auth/me',{},'GET')).body.data.quizStats,before);
 const fresh=await alice.call('auth/login',{username:'OnlineAlice',password});assert.equal(fresh.status,200);
 assert.equal((await alice.call('activity/list',{kind:'quiz'},'GET')).body.data[0].id,state.id);
});
test('daily attempts are unique, server-owned and resumable',async()=>{
 const first=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'daily'}})).body.data;
 const second=(await alice.call('activity/start',{kind:'quiz',settings:{mode:'daily'}})).body.data;
 assert.equal(first.id,second.id);assert.equal(first.deadline,second.deadline);
 assert.equal((await alice.call('activity/answer',{kind:'quiz',id:first.id,revision:0,input:9})).status,400);
});
test('mini games hide targets and challenger scores in actual API data',async()=>{
 const move=(await bob.call('activity/start',{kind:'mini',settings:{mode:'move',anime:'all',hard:true,answerMode:'choice',streak:false}})).body.data;
 assert.equal(move.rounds[0].target.id,undefined);assert.equal(move.rounds[0].target.name,undefined);assert.deepEqual(move.rounds[1],{});
 const power=(await bob.call('activity/start',{kind:'mini',settings:{mode:'power',anime:'all',hard:false,answerMode:'choice',streak:true}})).body.data;
 assert.equal(power.rounds[0].pair[1].powerScore,undefined);assert.equal(power.rounds[0].pair[1].stats,undefined);assert.equal(power.seed,'');
 const result=await bob.call('activity/answer',{kind:'mini',id:power.id,revision:power.revision,input:'higher'});
 assert.equal(result.status,200);assert.equal(typeof result.body.data.rounds[0].pair[1].powerScore,'number');
});
test('expired invites and unfinished matches are rejected while history marks them expired',async()=>{
 const match=(await bob.call('match/create',{mode:'friend'})).body.data;
 await db.query("UPDATE app_matches SET expires_at=now()-interval '1 second' WHERE id=$1",[match.id]);
 assert.equal((await charlie.call('match/join',{invite:match.invite})).status,410);
 assert.equal((await bob.call('match/view',{id:match.id},'GET')).status,410);
 const history=(await bob.call('match/list',{},'GET')).body.data;
 assert.equal(history.find(item=>item.id===match.id).stage,'expired');
 const old=bob.cookie();await bob.call('auth/logout');
 const response=await fetch(`${origin}/api/index?route=auth/me`,{headers:{Cookie:old}});
 assert.equal((await response.json()).data,null);
});
test('database-backed login limits reject repeated attempts',async()=>{
 for(let i=0;i<12;i++)await charlie.call('auth/login',{username:'AbsentUser',password:'bad'});
 assert.equal((await charlie.call('auth/login',{username:'AbsentUser',password:'bad'})).status,429);
});

test('password changes and global logout revoke every existing session',async()=>{
 const account=await client('SecureAccount');
 const old=account.cookie();
 assert.equal((await account.call('profile/password',{currentPassword:'incorrect',newPassword:'another secure password'})).status,401);
 const changed=await account.call('profile/password',{currentPassword:password,newPassword:'another secure password'});assert.equal(changed.status,200);
 const revoked=await fetch(`${origin}/api/index?route=auth/me`,{headers:{Cookie:old}});assert.equal((await revoked.json()).data,null);
 assert.equal((await account.call('auth/login',{username:'SecureAccount',password})).status,401);
 assert.equal((await account.call('auth/login',{username:'SecureAccount',password:'another secure password'})).status,200);
 assert.equal((await account.call('profile/sessions')).status,200);
 assert.equal((await account.call('auth/me',{},'GET')).body.data,null);
});
test('CPU drafts and simultaneous commands use server state and grant one additional result',async()=>{
 const before=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 let state=(await alice.call('match/create',{mode:'cpu',anime:'naruto'})).body.data;
 const [first,second]=await Promise.all([alice.call('match/draw',{id:state.id,revision:state.revision}),alice.call('match/draw',{id:state.id,revision:state.revision})]);
 assert.deepEqual([first.status,second.status].sort(),[200,409]);
 state=(await alice.call('match/view',{id:state.id},'GET')).body.data;
 while(state.team.length<5)state=(await alice.call('match/draw',{id:state.id,revision:state.revision})).body.data;
 state=(await alice.call('match/reroll',{id:state.id,revision:state.revision})).body.data;assert.equal(state.rerolls,0);
 state=(await alice.call('match/keep',{id:state.id,revision:state.revision})).body.data;
 state=(await alice.call('match/lock',{id:state.id,revision:state.revision,order:state.team.map(card=>card.id)})).body.data;
 assert.equal(state.stage,'complete');assert.equal(new Set(state.record.teams.flat().map(card=>card.id)).size,10);
 const after=(await alice.call('auth/me',{},'GET')).body.data.battleStats;
 assert.equal(after.wins+after.losses,before.wins+before.losses+1);
});


test('milestone acknowledgements persist per account and cannot change ledger or balance',async()=>{
 const tester=await client('RewardsTester');
 const profile=tester.user;
 for(let index=0;index<35;index++)profile.coins=settleCoins(profile,{matchId:`reward-${index}`,won:true});
 await db.query('UPDATE app_users SET profile=$2 WHERE id=$1',[profile.id,JSON.stringify(profile)]);
 for(const milestone of [100,500,1000]){
  const result=await tester.call('profile/milestone',{milestone,amount:999999,userId:bob.user.id});
  assert.equal(result.status,200);
  assert.deepEqual(result.body.data.coins.ledger,profile.coins.ledger);
 }
 const saved=(await tester.call('auth/me',{},'GET')).body.data.coins;
 assert.deepEqual(saved.shownMilestones,[100,500,1000]);
 assert.deepEqual((await tester.call('profile/milestone',{milestone:100})).body.data.coins,saved);
 assert.equal((await tester.call('profile/milestone',{milestone:42})).status,400);
 const {rows:others}=await db.query('SELECT profile FROM app_users WHERE id=$1',[bob.user.id]);
 assert.deepEqual(others[0].profile.coins.shownMilestones,[]);
});
test('public feedback reaches email adapter, rejects cross-origin input and enforces persistent limits',async()=>{
 async function submit(data,requestOrigin=origin){
  const response=await fetch(`${origin}/api/index?route=contact/feedback`,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(data)});
  return {status:response.status,body:await response.json()};
 }
 const message={name:'Visitor',email:'visitor@example.com',message:'Please add another anime world.'};
 assert.equal((await submit(message,'https://evil.example')).status,403);
 assert.equal((await submit({...message,email:'invalid'})).status,400);
 assert.equal((await submit(message)).status,200);
 assert.equal(feedbackMessages.length,1);
 assert.equal(feedbackMessages[0].message,message.message);
 assert.equal((await submit({...message,message:'Another useful suggestion.'})).status,200);
 assert.equal((await submit(message)).status,429);
 assert.equal(feedbackMessages.length,2);
});
```
