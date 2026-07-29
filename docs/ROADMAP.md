# Delivery Roadmap

> **Primary platform note (2026-07-29):** Product truth is **China / Douyin / zh**. Phase 0 below documents the original Thailand F&B / TikTok pilot and is kept as **historical** record; it is superseded as the current narrative by Douyin-first discovery — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md).

## Phase 0: Product Validation (historical — Thailand pilot)

**Status: COMPLETE (2026-07-28)** — package in [`docs/phase0/`](./phase0/README.md).  
Open for production: external PDPA/legal sign-off (does not block backend specs).

Goals:

- [x] select one pilot product category → **Restaurant / F&B (Bangkok)** *(historical; current primary market is China)*;
- [x] identify the first brand or agency users → **Bangkok Bites Co. / Soi 11 Thai Kitchen** *(historical)*;
- [x] confirm the initial influencer data source → in-app discovery (approved connector) + dossier; CSV/URL fallback — **originally TikTok, now Douyin** as primary;
- [x] define launch languages and campaign metrics → historical **th/en**; current primary **zh**; views/likes/comments/saves + cycle time;
- [x] confirm that creators publish to their own social accounts → **yes**.

Deliverables:

- [x] approved MVP scope → `phase0/MVP_SCOPE.md`;
- [x] sample campaign brief → `phase0/SAMPLE_CAMPAIGN_BRIEF.md`;
- [x] sample set of 50–100 influencer profiles → `phase0/influencer-pilot-set.csv` (60 rows);
- [x] validated Lumen analysis output → `phase0/LUMEN_ANALYSIS_VALIDATION.md`;
- [x] data and compliance review → `phase0/COMPLIANCE_AND_DATA.md`.

## Phase 1: Discovery MVP

Capabilities:

- authentication and roles;
- brand, product, and campaign records;
- **in-app Douyin discovery** + influencer **dossier** (topics/brand, style, audience, safety); international TikTok discovery kept only as a deprecated alias route;
- influencer import by profile URL and CSV (fallback);
- influencer catalog and filters;
- Lumen video-analysis integration;
- topic, language, style, and safety summaries;
- explainable product-to-influencer matching;
- shortlists and internal notes.

Exit criteria:

- operators can discover Douyin creators in-app, open dossiers, and analyze videos;
- recommendations can be reviewed with source evidence;
- brands can produce a usable shortlist.

## Phase 2: Collaboration

Capabilities:

- creator profile claim and verification;
- campaign invitations;
- creator portal;
- campaign briefs and deliverables;
- draft upload or private review link;
- feedback, revision, and approval;
- publication URL and basic performance snapshots.

Exit criteria:

- one campaign completes the workflow from invitation to publication;
- all important status changes are audited;
- both brand and creator users can complete their tasks without operator database access.

## Phase 3: Commercial Marketplace

Capabilities:

- offers and negotiation;
- micro-contract templates;
- electronic acceptance;
- campaign pricing and commission records;
- payments and payouts through an approved provider;
- cancellations and disputes.

Before this phase, contract templates, identity checks, tax handling, consumer/business obligations, and payment flows require legal and accounting review for the operating jurisdictions.

## Phase 4: Scale and Automation

Capabilities:

- additional approved data sources;
- scheduled profile refresh;
- campaign performance integrations;
- recommendation learning from completed campaigns;
- agency multi-workspace support;
- automated alerts and operational dashboards;
- additional markets and languages.

## Recommended First Build

Historical note: the original narrow pilot targeted F&B / Bangkok with TikTok as the first discovery surface. The current build targets:

- China-based creators, product categories to be selected per brand;
- Douyin as the primary discovery surface (**in-app search → dossier**), via the reused TikHub connector;
- Chinese (zh) analysis primary; Thai/English retained from the historical pilot;
- brand-managed outreach;
- no payments in the application.

This scope validates whether **internal discovery + video-based dossiers** produce better campaign shortlists before the project invests in contracts, payments, and full marketplace automation.

