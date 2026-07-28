# Phase 0 — Approved MVP Scope (Pilot)

**Pilot:** Bangkok F&B · Soi 11 Thai Kitchen  
**Horizon:** validate video-based matching + collaboration workflow before contracts/payments  
**Status:** APPROVED (2026-07-28)

## In scope

### Brand console

- Product + campaign CRUD for the pilot brand
- **In-app TikTok discovery** (search/filters) → candidate list
- **Influencer dossier** (topics/brand signals, style, audience, safety, evidence)
- Influencer catalog: search, filters (platform, city, language, topic, followers, match)
- Explainable match score vs product/campaign (weights configurable)
- Shortlists + compare (2–4)
- Invitations (pending / accepted / declined / expired)
- Briefs after acceptance
- Reviews: approve / request changes
- Claims queue (verify / reject)
- Analysis jobs queue (submit + progress + failure visibility)
- Fallback import: profile URL list + CSV (supplement only)
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

- Thailand-focused creators; **TikTok discovered in-app**
- Languages th/en for pilot KPIs
- Seed/fixture CSV (`influencer-pilot-set.csv`) for demos/tests only — **not** the production acquisition model
- Dossiers persisted with freshness + source attribution

## Out of scope (pilot)

| Item | Why |
| --- | --- |
| Payments / escrow / tax | Phase 3 + legal |
| Micro-contracts / e-sign | Phase 3 |
| Uncontrolled DIY scraping | Compliance — use approved connector |
| Auto-publish to socials | Creators own accounts |
| Real-time platform analytics for all networks | Provider cost; manual snapshots OK |
| Multi-tenant agency workspaces | Phase 4 |
| RU/ZH as launch KPI | Optional analysis only |
| Public consumer feed | Not marketplace |
| Agency-only creator sourcing as the main path | Product must self-discover |

## Exit criteria (pilot success)

1. Operator **searches TikTok from the app**, opens dossiers, and runs analysis jobs to completion.
2. Brand gets explainable shortlist for Soi 11 campaign with dossier evidence.
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
