# Lumen Influencer Marketplace

Lumen Influencer Marketplace is a Thailand-focused platform that helps brands discover, understand, and work with social media creators.

The product uses the existing Lumen video-analysis pipeline to turn creator profiles and videos into structured insights. Brands can then match products with relevant influencers, build campaign shortlists, request content, review submissions, and measure results.

## Product Goal

Create a practical marketplace where:

- brands can find influencers whose content and audience fit their products;
- influencer profiles are enriched by analysis of their recent videos;
- campaign teams can compare candidates using consistent signals;
- creators can receive briefs, submit content, and track campaign status;
- micro-contracts, payments, and automated publishing can be added after the marketplace workflow is validated.

## Initial Market

- Geography: Thailand
- Creator platforms: TikTok, Instagram, and YouTube
- Languages: Thai and English first; Russian and Chinese can be added for Thailand-focused audiences
- Customer types: local brands, agencies, hospitality businesses, real-estate companies, tourism businesses, restaurants, and e-commerce sellers

## Core Workflow

1. A brand creates a product or campaign.
2. Influencer candidates are imported from approved data sources or added manually.
3. The platform collects permitted profile metadata and recent public videos.
4. Lumen transcribes and analyzes the videos.
5. The system identifies topics, language, style, audience signals, brand-safety signals, and commercial fit.
6. Influencers are ranked against the product or campaign.
7. The brand creates a shortlist and sends invitations.
8. Selected creators receive a brief and submit draft content.
9. The brand reviews and approves the content.
10. The creator publishes to their social account and campaign results are recorded.

## MVP Scope

The first release should include:

- brand, product, and campaign management;
- influencer profile import by URL or CSV;
- creator search and filters;
- analysis of recent creator videos;
- topic and language classification;
- product-to-influencer matching;
- transparent match scores with supporting reasons;
- shortlist and campaign invitation workflow;
- creator portal for accepting invitations;
- content brief, submission, review, and approval;
- basic campaign reporting;
- audit log and role-based access.

Micro-contracts, escrow, automated payments, and automatic social publishing are planned for a later phase.

## Proposed Applications

### Brand Console

Used by brands and agencies to manage products, discover influencers, create campaigns, review submissions, and view performance.

### Creator Portal

Used by influencers to claim a profile, manage account information, accept campaign invitations, review briefs, submit content, and view campaign status.

### Lumen Analysis Service

The existing Lumen platform remains responsible for video ingestion, transcription, semantic analysis, content classification, and reusable AI workflows.

## Suggested Architecture

- Frontend: Next.js and React
- API: NestJS
- Database: PostgreSQL with pgvector
- Background jobs: Redis and BullMQ
- Media storage: S3-compatible object storage or Cloudinary
- Video processing: existing Lumen services
- Authentication: email/password and social sign-in
- Integrations: compliant platform APIs, approved data providers, and creator-authorized account connections

See [Architecture](docs/ARCHITECTURE.md) for service boundaries and [Product Requirements](docs/PRODUCT_REQUIREMENTS.md) for the MVP specification.

## Responsible Data Collection

The platform should use official APIs, approved data providers, manual imports, or creator-authorized connections. It should not depend on uncontrolled scraping that violates platform terms or creates unstable access.

Only the minimum required public or authorized data should be stored. Influencers must be able to claim their profile, correct information, and request removal where applicable.

## Delivery Phases

### Phase 1: Discovery MVP

- product and campaign setup;
- **in-app TikTok discovery** and influencer **dossiers**;
- manual/CSV influencer import (fallback);
- video analysis via Lumen;
- filters, scoring, and shortlists;
- internal campaign workflow.

### Phase 2: Creator Collaboration

- creator onboarding and profile claiming;
- invitations and negotiations;
- briefs, submissions, review, and approval;
- campaign performance tracking.

### Phase 3: Marketplace Transactions

- micro-contract templates;
- electronic acceptance;
- payments and payout records;
- commission model;
- disputes and compliance workflows.

## Project Status

**Phase 0 Product Validation: complete** — see [`docs/phase0/`](docs/phase0/README.md) (F&B / Soi 11 pilot). Discovery model: **app finds TikTok creators and builds dossiers** — [`docs/DISCOVERY_AND_DOSSIER.md`](docs/DISCOVERY_AND_DOSSIER.md).

Phase 1–2 Discovery + Collaboration **demo UI** lives in `web/` (Next.js + TypeScript + Tailwind). It uses mock Thailand data and a mock Lumen Analysis client (catalog is fixture-based today; live TikTok discovery is the next production build). Shortlists, products, campaigns, and settings persist in browser `localStorage`.

### Local development

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000

### Docker

```bash
docker compose up --build -d
```

App: http://localhost:3000

### GitHub Actions

- `CI` — lint + build on PRs and pushes that touch `web/`
- `Deploy` — on push to `main` (or manual dispatch): rsync to droplet + `docker compose up --build`

Required repository secrets:

| Secret | Example |
| --- | --- |
| `DEPLOY_HOST` | `167.71.206.43` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_PATH` | `/opt/lumen-marketplace` |
| `DEPLOY_SSH_KEY` | private key authorized on the host |

Also create GitHub Environment `production` (optional protection rules).

Live demo: http://167.71.206.43:3000 · health: http://167.71.206.43:3000/api/health

### Implemented in Phase 1

- Dashboard, Influencers (filters + product match ranking + card/table), Influencer detail with match explanation
- Products and Campaigns CRUD
- Shortlists with compare (2–4)
- Invitations (demo outreach records)
- Analysis Jobs demo queue
- Influencer import preview (URL / CSV, no scraping)
- Settings with locale/weights placeholders + reset demo data
- Activity feed + toasts

### Implemented in Phase 2

- Creator portal (`/creator`) — invitations, briefs, submissions, profile claim
- Brand Reviews + Claims queues
- Full demo workflow: invite → brief → draft → approve → publish → performance snapshot

### Not in Phase 1/2

Micro-contracts, payments, escrow, auto-publishing, real Lumen/API/Postgres wiring.

