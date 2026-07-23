# Changelog

All notable changes to Lumen Influencer Marketplace are documented here.

## [0.1.0] — 2026-07-24

### Added

- Phase 1 Discovery MVP brand console (`web/`) on Next.js + TypeScript + Tailwind.
- Screens: Dashboard, Influencers (filters, card/table, product match ranking), Influencer detail with explainable match score, Products CRUD, Campaigns CRUD, Shortlists + compare, Invitations, Analysis Jobs demo queue, Import preview, Settings.
- Mock Thailand dataset (12 influencers, 5 products, 4 campaigns, 3 shortlists, 10 analysis jobs, sample videos).
- Service layer (`marketplace`, `lumen-analysis`) with localStorage persistence for demo state.
- Docker Compose packaging and droplet deploy path (`167.71.206.43:3000`).
- GitHub Actions CI (lint/build) and Deploy (rsync + compose) workflows.
- Health endpoint `/api/health`.
- Manual QA checklist (`docs/MANUAL_QA.md`) and smoke script (`scripts/qa-smoke.sh`).

### Changed

- README updated for local/Docker/Actions usage and Phase 1 scope.

### Fixed

- Deploy workflow waits/retries until container health responds after recreate.

### QA

- Manual QA execution on 2026-07-24 against http://167.71.206.43:3000 — **P0/P1 ALL PASS**, sign-off READY TO SHIP (commit `91e951c`).

### Out of scope (still)

- NestJS/Postgres, real Lumen API, auth, payments, escrow, creator portal, auto-publishing.
