# Delivery Roadmap

## Phase 0: Product Validation

**Status: COMPLETE (2026-07-28)** — package in [`docs/phase0/`](./phase0/README.md).  
Open for production: external PDPA/legal sign-off (does not block backend specs).

Goals:

- [x] select one pilot product category → **Restaurant / F&B (Bangkok)**;
- [x] identify the first brand or agency users → **Bangkok Bites Co. / Soi 11 Thai Kitchen**;
- [x] confirm the initial influencer data source → **manual URL + CSV + creator claim** (no scraping);
- [x] define launch languages and campaign metrics → **th/en**; views/likes/comments/saves + cycle time;
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
- influencer import by profile URL and CSV;
- influencer catalog and filters;
- Lumen video-analysis integration;
- topic, language, style, and safety summaries;
- explainable product-to-influencer matching;
- shortlists and internal notes.

Exit criteria:

- operators can analyze the pilot creator set;
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

Start with a narrow pilot:

- one product category;
- TikTok as the first discovery surface;
- Thailand-based creators;
- Thai and English analysis;
- manual/CSV import plus one approved data provider;
- 100–500 creator profiles;
- brand-managed outreach;
- no payments in the application.

This scope validates whether video-based matching produces better campaign shortlists before the project invests in contracts, payments, and full marketplace automation.

