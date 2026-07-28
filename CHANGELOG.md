# Changelog

All notable changes to Lumen Influencer Marketplace are documented here.

## [0.3.4] — 2026-07-28

### Added — Product scan → resume card → card-ranked Discover

- `/products/scan`: URL/brief/photos → Product Resume Card (demo extract, editable).
- Card persists on Product; product detail shows resume + **Find matches**.
- Discover requires product context; ranks TikTok candidates with score + reasons vs card.
- `product-scan.service` + `match.service`; health `0.3.4`.
- QA: `docs/MANUAL_QA_PRODUCT_SCAN.md`.

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
