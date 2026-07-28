# Changelog

All notable changes to Lumen Influencer Marketplace are documented here.

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
