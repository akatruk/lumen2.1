# Changelog

All notable changes to Lumen Influencer Marketplace are documented here.

## [0.4.8] — 2026-07-28

### Fixed / improved — UX audit top-5

- **Safety badge honesty:** pre-analysis dossiers use `unknown` / `PENDING ANALYSIS` (not false `safe`).
- **Creator Act-as sync:** `useCreatorSessionId` + session event bus; home/invites/briefs/subs/claim follow Act-as without stale seed subtitle.
- **Dashboard:** 2 primary CTAs (Scan + Discover); secondary under More; kill “demo set” / “demo audit trail” copy.
- **Sidebar:** Core / More groups; Login moved to footer (out of mid-nav).
- **Resume card:** Decision (pitch/topics/geo/prohibited + conf) vs Details accordion.

### QA

- Checklist: `docs/MANUAL_QA_UX_TOP5_2026-07-28.md`.

## [0.4.7] — 2026-07-28

### Fixed / improved — BA P1 honesty + match reasons + creator Act-as + card quality

- **Mode badge:** sidebar/creator show `Live · TikHub + LLM` when live-capable (no more false `Demo · mock data`).
- **Match reasons:** ranker prefers reach / ER / avg views / lang / niche; Discover UI shows up to **4** reasons (was 2 → identical topic+geo).
- **Creator Act-as:** discovered `inf-disc-tt-*` listed first as `[TikHub]`; `disc-tt-*` ↔ catalog id aliases for invites/briefs.
- **Resume card:** merge brief prohibitions into `prohibited_claims`; calibrate confidence from filled fields (not LLM self-score alone).
- Dossier Evidence subtitle reflects TikHub vs demo source.

### QA

- 2026-07-28 HTTPS manual QA **ALL P0/P1 PASS** — checklist `docs/MANUAL_QA_BA_P1_PACK.md`.
- Followers live non-zero; reasons include Reach/ER/views; Act-as `[TikHub]`; scan conf 0.92 + prohibitions on rich brief; badge Live.
- Feature `1c163ae`; smoke `0.4.7`.

## [0.4.6] — 2026-07-28

### Fixed — TikHub followers/reach mapping (BA P1)

- Root cause: TikHub web search returns reach on `item.authorStats.followerCount` / `authorStatsV2`, not on `author.followerCount` (always absent → Discover showed **0**).
- `normalizeTikHubItem` now reads authorStats (+ V2 / snake_case fallbacks); minFollowers filter treats unknown `0` as fail when threshold > 0.
- Fixture: `web/scripts/tikhub.followers.fixture.ts`. Health `0.4.6`.

## [0.4.5] — 2026-07-28

### Changed — Presentation demo videos remaster (live stack)

- Rebuild EN/ZH walkthroughs for live TikHub, live OpenRouter scan, brand auth/persist, invite→brief.
- Fresh live screenshots (`/login`, `/products/scan`, `/discover`, `/invitations`, creator portal, …).
- Updated `SCRIPT_4MIN.md` / `SCRIPT_4MIN_ZH.md`, slide generators + `slides.html`.
- Cache-bust `demo.mp4?v=0.4.5` / `demo-zh.mp4?v=0.4.5`; health `0.4.5`.
- Public: https://influencers.lumen.universalgravity.org/presentation

## [0.4.4] — 2026-07-28

### Added — Invite + brief server persistence (BA Priority B / option A)

- Prisma `Invitation` + `CampaignBrief`; `/api/invitations` + `/api/briefs` (session-gated).
- Accept can auto-create brief; brand "Issue brief" + creator acknowledge sync when logged in.
- `hydrateBrandPersistence` also pulls invites/briefs into localStorage (same-browser creator demo).
- Spec: `docs/superpowers/specs/2026-07-28-invite-brief-persist-design.md`.
- Health `0.4.4`.

### QA

- 2026-07-28 full loop: checklist `1b6457a` → build → Deploy → live HTTPS QA **ALL P0/P1 PASS**.
- Invite → Accept+autoBrief → Acknowledge; smoke `0.4.4`; TikHub live regression count=3.
- Feature commit `860502f`. Checklist: `docs/MANUAL_QA_INVITE_BRIEF.md`.

## [0.4.3] — 2026-07-28

### Added — Brand persistence hydrate (products + shortlists)

- Logged-in brand: `GET /api/products` + new `GET/POST/PUT /api/shortlists` as server SoT.
- `marketplace.hydrateBrandPersistence()` on login / products / shortlists / discover.
- Async create/update for products & shortlists when session exists; anonymous demo stays localStorage.
- Prisma `Shortlist` model (`itemsJson`). BA status: `docs/reports/BA_STATUS_2026-07-28_v2.md`.
- Health `0.4.3`.

### QA

- 2026-07-28 https://influencers.lumen.universalgravity.org — health `0.4.3`, commit `17cbc3e`.
- Auth → product + shortlist CRUD on SQLite **PASS**; unauth 401 **PASS**.
- Checklist: `docs/MANUAL_QA_BRAND_PERSIST.md`. BA: `docs/reports/BA_STATUS_2026-07-28_v2.md`.
- 2026-07-28 **Live TikHub enabled** (`DISCOVERY_MODE=live`, key in GH secret): `POST /api/discovery/tiktok` query `bangkok food` → `source=tikhub`, 8 real creators **PASS**. Product scan still demo (no OpenRouter key yet).
- 2026-07-28 **Live OpenRouter product scan**: `PRODUCT_SCAN_MODE=live`, `POST /api/products/scan` → `source=openrouter` resume card **PASS**.

## [0.4.2] — 2026-07-28

### Added — Public HTTPS via nginx + Let's Encrypt

- DNS: `influencers.lumen.universalgravity.org` → droplet `167.71.206.43`
- nginx reverse proxy `:80`/`:443` → `127.0.0.1:3000`; HTTP→HTTPS redirect
- Certbot cert + renew timer; config: `deploy/nginx/influencers.lumen.universalgravity.org.conf`
- `COOKIE_SECURE=true` (GH var + droplet `.env`) for Secure session cookies
- Ops notes: `docs/DEPLOY_NGINX.md`

### QA

- 2026-07-28 `https://influencers.lumen.universalgravity.org/api/health` → `0.4.1` ok
- HTTP 301 → HTTPS; register Set-Cookie includes `Secure`; session sticks

## [0.4.1] — 2026-07-28

### Fixed — Prisma schema apply on Alpine (auth/persistence)

- Entrypoint calls `node …/prisma/build/index.js db push` (no broken `npx prisma`).
- Fail hard if schema push fails; `prisma` moved to runtime deps.
- Session cookie `Secure` only when `COOKIE_SECURE=true` (HTTP demo droplet otherwise drops auth).
- Deploy writes droplet `.env` from GitHub secrets/vars (`TIKHUB_API_KEY`, `OPENROUTER_API_KEY`, `AUTH_SECRET`, mode vars).
- Health `0.4.1`.

### QA

- 2026-07-28 live http://167.71.206.43:3000 — health `0.4.1`, commit `2e53422` / fix `3fb451e`, smoke **PASS**.
- Auth register → HTTP session (no Secure) → product CRUD → logout **PASS**.
- Demo gates for TikHub/LLM **PASS**; live D4/S3 **BLOCKED** (API keys empty).
- Checklist: `docs/MANUAL_QA_LIVE_STACK.md`.

## [0.4.0] — 2026-07-28

### Added — Live TikHub, LLM product scan, brand auth + SQLite persistence

- `DISCOVERY_MODE=live` + `TIKHUB_API_KEY` → `/api/discovery/tiktok` + `liveTikTokConnector` (videos→creators).
- `PRODUCT_SCAN_MODE=live` + `OPENROUTER_API_KEY` → `/api/products/scan` LLM resume cards (`sourceMode: live-scan`).
- Brand `/login` (JWT httpOnly cookie) + `/api/auth` + Prisma SQLite products API (`/api/products`).
- Demo modes remain default without keys. Docker volume `lumen-data` for DB.
- Health `0.4.0` (`live-capable` when a live mode env is set).

## [0.3.6] — 2026-07-28

### Fixed — Match/catalog P0 hardening

- `rankCandidatesForCard`: honor platform filter (non-TikTok cards no longer rank TikTok demo candidates).
- Guard NaN/corrupt product fields so match cannot return `NaN` scores or throw on missing `description`.
- `marketplace.addInfluencer`: merge by handle as well as id (no catalog duplicates).
- Health `0.3.6`. Audit: `docs/reports/BACKEND_AUDIT_2026-07-28.md`.

### QA

- 2026-07-28 live http://167.71.206.43:3000 — health `0.3.6`, Deploy `a97e2f3`, smoke **PASS**.

## [0.3.5] — 2026-07-28

### Changed — Presentation demo videos remaster

- Rebuild EN/ZH walkthroughs for cyber-glass dark UI + Product scan + card-ranked Discover.
- Updated `SCRIPT_4MIN.md` / `SCRIPT_4MIN_ZH.md`, dark `slides.html` + PNG slide generators.
- New live screenshots (`/products/scan`, `/discover`, …); VO: Ava Multilingual / Xiaoxiao Neural.
- Cache-bust defaults `demo.mp4?v=0.3.5` / `demo-zh.mp4?v=0.3.5`; health `0.3.5`.

## [0.3.4] — 2026-07-28

### Added — Product scan → resume card → card-ranked Discover

- `/products/scan`: URL/brief/photos → Product Resume Card (demo extract, editable).
- Card persists on Product; product detail shows resume + **Find matches**.
- Discover requires product context; ranks TikTok candidates with score + reasons vs card.
- `product-scan.service` + `match.service`; health `0.3.4`.
- QA: `docs/MANUAL_QA_PRODUCT_SCAN.md`.
- Build prompts: `docs/prompts/BUSINESS_FLOW_PROMPT.md`, `docs/prompts/NEXT_BUILD_PROMPT.md`.

### QA

- 2026-07-28 live http://167.71.206.43:3000 — health `0.3.4`, Deploy run success (`3b6d342`).
- Smoke **PASS** (incl. `/products/scan`, `/discover`); P0/P1 **ALL PASS**; Soi 11 rank Narin 89 > beauty 54 > RE 37; sign-off **READY TO SHIP**.

## [0.3.3] — 2026-07-28

### Added — TikTok Discover (demo connector)

- `/discover` in-app TikTok creator search (query + city/language/topic/followers).
- `/discover/[id]` influencer dossier (identity, reach, topics, style, audience, safety, evidence).
- Demo `MockTikTokConnector` + `discovery.service` (localStorage); add-to-catalog merges into Influencers.
- Manual QA: `docs/MANUAL_QA_DISCOVERY.md`. Smoke covers `/discover`.
- Health version `0.3.3`.

### Fixed

- Discovery mock `pick()` signed-shift crash on synthetic candidates (`0ca537f`).

### QA

- 2026-07-28 live http://167.71.206.43:3000 — health `0.3.3`.
- Smoke **PASS** (incl. `/discover`); Discover P0/P1 **ALL PASS**; sign-off **READY TO SHIP**.

## [0.3.2] — 2026-07-28

### Changed — Discovery model

- Product requirement: **in-app TikTok discovery** builds influencer **dossiers** (topics/brand, style, audience, safety, evidence). CSV/URL are fallback only.
- New canonical doc: `docs/DISCOVERY_AND_DOSSIER.md`.
- Updated Phase 0 decisions, MVP scope, PRD §5.2/§9/§10, architecture, roadmap, compliance.

## [0.3.1] — 2026-07-28

### Added — Phase 0 product validation

- Locked pilot decisions: F&B / Bangkok Bites Co. (Soi 11), th+en, own-account publish, manual+CSV+claim data sources.
- Docs package under `docs/phase0/`: decisions, MVP scope, sample brief, analysis validation, compliance review.
- Pilot influencer CSV (60 rows, F&B-leaning) for import validation.
- ROADMAP Phase 0 marked complete; PRD §10 resolved.

## [0.3.0] — 2026-07-28

### Changed — Strom/Lumen visual system

- Ported Strom V2 cyber-glass design tokens into `web/` (`globals.css`): dark default, royal/neon blue primary, glass panels, ambient glow + grid.
- Switched fonts to Geist + Geist Mono; added `next-themes` ThemeProvider (default dark) and ThemeToggle.
- Restyled brand + creator shells to match Lumen sidebar language (mono indexes, primary active bar, glass drawer).
- Reworked UI kit (Button, Card, Badge, Field, Toast) onto semantic tokens; swept pages off slate/teal SaaS look.

### Added

- Manual QA checklist: `docs/MANUAL_QA_THEME.md`.
- Smoke script theme markers + optional `EXPECT_VERSION`.

### QA

- 2026-07-28 live demo http://167.71.206.43:3000 — health `0.3.0`.
- Smoke **18/18 PASS** + theme markers; theme P0/P1 **ALL PASS**; sign-off **READY TO SHIP**.

## [0.2.0] — 2026-07-24

### Added — Phase 2 Collaboration

- Creator portal (`/creator`) with session switcher across demo influencers.
- Creator flows: accept/decline invitations, acknowledge briefs, submit draft/private review links, record publication URL after approval.
- Profile claim submission (creator) and claim review queue (brand `/claims`).
- Brand Reviews workspace (`/reviews`): approve / request changes, performance snapshot updates.
- Campaign detail now shows issued briefs and submissions.
- Invitations console can issue briefs after acceptance.
- Collaboration service layer (`services/collaboration.ts`) with audited activity events.
- Smoke script covers creator + collaboration routes.
- Expanded manual QA: `docs/MANUAL_QA_PHASE2.md`.

### Workflow covered

Invitation → Accept → Brief → Draft submission → Brand review → Approve → Publication URL → Performance snapshot.

### QA

- 2026-07-24 live demo http://167.71.206.43:3000 — health `0.2.0`.
- Smoke **17/17 PASS**; Phase 2 P0/P1 **ALL PASS**; sign-off **READY TO SHIP** (commit `1f9bd36`).

## [0.1.0] — 2026-07-24

### Added

- Phase 1 Discovery MVP brand console (`web/`) on Next.js + TypeScript + Tailwind.
- Screens: Dashboard, Influencers, Products, Campaigns, Shortlists, Invitations, Analysis Jobs, Import, Settings.
- Mock Thailand dataset and mock Lumen analysis client.
- Docker Compose + GitHub Actions CI/Deploy.
- Health endpoint `/api/health`.
- Manual QA checklist and smoke script.

### Fixed

- Deploy workflow waits/retries until container health responds after recreate.

### Out of scope (still)

- NestJS/Postgres, real Lumen API, auth, payments, escrow, auto-publishing.
