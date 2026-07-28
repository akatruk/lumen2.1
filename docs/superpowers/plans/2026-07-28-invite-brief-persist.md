# Invite + Brief Persistence Implementation Plan

> **For agentic workers:** Implement task-by-task. Checkboxes track progress.

**Goal:** Server-persist invitations + campaign briefs for logged-in brands (option A); hydrate into localStorage for same-browser creator demo.

**Architecture:** Mirror shortlists — Prisma models, session-gated Next route handlers, async marketplace/collaboration mutators, extend `hydrateBrandPersistence`.

**Tech Stack:** Next.js route handlers, Prisma SQLite, existing JWT cookie auth.

**Spec:** `docs/superpowers/specs/2026-07-28-invite-brief-persist-design.md`

---

### Files

| File | Role |
| --- | --- |
| `web/prisma/schema.prisma` | Invitation + CampaignBrief |
| `web/src/server/invitation-mapper.ts` | DB ↔ types |
| `web/src/server/brief-mapper.ts` | DB ↔ types |
| `web/src/app/api/invitations/route.ts` | GET/POST/PATCH |
| `web/src/app/api/briefs/route.ts` | GET/POST/PATCH |
| `web/src/services/marketplace.ts` | async invite + hydrate |
| `web/src/services/collaboration.ts` | async brief + replaceBriefs |
| UI pages | async calls + hydrate on mount |
| health / changelog / MANUAL_QA | 0.4.4 ship |

### Tasks

- [ ] 1. Prisma models + mappers + API routes
- [ ] 2. marketplace/collaboration async + hydrate
- [ ] 3. Wire UI pages
- [ ] 4. Build, deploy, QA, changelog
