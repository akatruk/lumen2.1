# Phase 0 — Approved MVP Scope (Pilot)

**Pilot:** Bangkok F&B · Soi 11 Thai Kitchen  
**Horizon:** validate video-based matching + collaboration workflow before contracts/payments  
**Status:** APPROVED (2026-07-28)

## In scope

### Brand console

- Product + campaign CRUD for the pilot brand
- Influencer catalog: search, filters (platform, city, language, topic, followers, match)
- Explainable match score vs product/campaign (weights configurable)
- Shortlists + compare (2–4)
- Invitations (pending / accepted / declined / expired)
- Briefs after acceptance
- Reviews: approve / request changes
- Claims queue (verify / reject)
- Analysis jobs queue (submit + progress + failure visibility)
- Import preview: profile URL list + CSV (no live scrape in pilot UI)
- Activity / audit trail for workflow actions
- Settings: default videos-to-analyze, match weights, demo reset (until real tenant settings)

### Creator portal

- Session as claimed/demo creator
- Accept / decline invitations
- Acknowledge briefs
- Submit draft or private review link
- Record publication URL after approval
- Submit profile claim

### Analysis (via Lumen)

- Analyze N recent videos per creator (default N=3–5, configurable)
- Produce: transcript, language, topics, style, entities, brand-safety flags, confidence + evidence refs
- Async job model (queue → processing → completed/failed)

### Data

- Thailand-focused creators; TikTok primary
- Languages th/en for pilot KPIs
- Pilot set ≥50 profiles (see `influencer-pilot-set.csv`); demo UI may show a subset

## Out of scope (pilot)

| Item | Why |
| --- | --- |
| Payments / escrow / tax | Phase 3 + legal |
| Micro-contracts / e-sign | Phase 3 |
| Uncontrolled scraping | Compliance |
| Auto-publish to socials | Creators own accounts |
| Real-time platform analytics for all networks | Provider cost; manual snapshots OK |
| Multi-tenant agency workspaces | Phase 4 |
| RU/ZH as launch KPI | Optional analysis only |
| Public consumer feed | Not marketplace |

## Exit criteria (pilot success)

1. Operator imports F&B creators (CSV/URL) and runs analysis jobs to completion.
2. Brand gets explainable shortlist for Soi 11 campaign with evidence.
3. At least one invitation → brief → draft → approve → publish URL path completes.
4. Every recommendation and status change is auditable.
5. No dependency on payments or contracts to finish the loop.

## Acceptance scenario (canonical)

**Brand:** Bangkok Bites Co.  
**Product:** Soi 11 Thai Kitchen (`prod-2`)  
**Campaign:** Soi 11 Soft Opening (`camp-2`)  
**Creator:** Narin Chaiyaphum (`inf-1`) or CSV pilot food creator  
**Path:** Invite → Accept → Brief ack → Draft submit → Brand approve → Publication URL → Performance snapshot (views/likes/comments)

This scenario is already exercised in demo; production hardening must preserve it with real persistence.
