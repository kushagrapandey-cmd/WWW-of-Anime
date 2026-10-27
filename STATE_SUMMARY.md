# State Summary

Current release, 27 October 2026: React 19/Vite/JavaScript SPA with Vercel Functions and PostgreSQL, recorded production deployment on Vercel Hobby + Neon Free at https://www-of-anime.vercel.app/. Accepted content: 120 identities, 237 authored form snapshots across 55 identities, and 180 quiz questions. One local portrait per identity is shared across forms; thumbnail/fallback support, source credits and the Pillow processing script are implemented. The earlier artwork deferral is historical and was superseded by the showcase release.

Online accounts use cookie sessions. Arena supports CPU/private friend matches, server-owned drafts, transactional results and a saved-result showdown/replay. Quizzes and mini-games use server deadlines, scoring and account-owned resume; guests retain separate browser practice. Profiles include character avatars, goals, ranks, XP and display-only coins. Coin rules remain 10,10,15,20,25,30,35,35... per consecutive Arena win, zero for losses with streak reset; no spending or redemption exists.

The activity-completion fix refreshes online profile progress even when the server has already saved the result. Online game scoreboards read the current profile rather than a stale local copy. README and active guides describe bundled portraits and adaptive polling. Run the checks for current test results; historical counts are preserved only in dated release notes. See docs/SHOWCASE-RELEASE.md and docs/activity-progress-fix.md.

Remaining: further form/calibration review, email recovery/verification, privacy/deletion and retention workflows, monitoring/backup restore/load checks, physical devices and cross-browser checks. Artwork source attribution is not a redistribution license. Do not upgrade paid services without approval.
