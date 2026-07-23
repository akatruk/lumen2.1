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
- manual/CSV influencer import;
- video analysis;
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

This repository currently contains the initial product and architecture documentation. Implementation will be planned after the MVP scope, data sources, and publishing model are confirmed.

