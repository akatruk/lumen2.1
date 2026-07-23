# Changelog

All notable changes to Lumen Influencer Marketplace are documented here.

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
