# Architecture

## 1. Architecture Principle

The marketplace should be a separate application connected to the existing Lumen platform. It should reuse Lumen's video ingestion, transcription, semantic analysis, and content-processing capabilities instead of duplicating them.

## 2. High-Level Components

```text
Brand Console ───────┐
                     ├── Marketplace API ── PostgreSQL / pgvector
Creator Portal ──────┘          │
                                ├── Redis / BullMQ
                                ├── Object Storage
                                ├── TikTok Discovery Connector (approved API/provider)
                                ├── Data Source Connectors (CSV/URL fallback, claim)
                                └── Lumen Analysis API
                                         │
                                         └── Transcription and Video Analysis
```

### Brand Console

Supports product setup, **in-app TikTok discovery**, influencer **dossiers**, filters, match comparison, shortlists, campaign creation, invitations, content review, and reporting.

### Creator Portal

Supports profile claiming, account verification, invitations, briefs, content submissions, revisions, and publication records.

### Marketplace API

Owns marketplace users, brands, products, influencer records, **dossiers**, campaigns, invitations, submissions, and match results.

### Lumen Analysis API

Accepts an authorized video reference or media object and returns a normalized analysis result. The marketplace should treat Lumen as an asynchronous service.

### TikTok Discovery Connector

Searches and fetches public TikTok creator/video metadata through an **approved** platform API or contracted provider (same integration class as Lumen’s TikHub usage). Normalizes results into influencer + video snapshots for dossier build. Uncontrolled scraping is out of scope.

### Data Source Connectors

Additional connectors translate CSV import, manual URL paste, or creator-authorized connection into the same influencer and video format (fallback paths).

Canonical product spec: [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md).

## 3. Service Boundary

The marketplace owns:

- influencer **discovery** (TikTok in-app), dossier management, and profile management;
- brands, products, and campaigns;
- matching and ranking;
- invitations and collaboration;
- marketplace reporting;
- future agreements and payments.

Lumen owns:

- media ingestion and preparation;
- speech-to-text;
- language and content analysis;
- reusable AI prompts and workflows;
- processing status and technical output artifacts.

## 4. Integration Contract

The initial integration can use REST endpoints and asynchronous job polling. Events can be introduced when processing volume requires them.

### Submit Analysis

```json
{
  "externalId": "video-source-id",
  "sourceUrl": "https://example.com/video",
  "languageHints": ["th", "en"],
  "requestedAnalyses": [
    "transcript",
    "topics",
    "style",
    "entities",
    "brand_safety"
  ],
  "callbackUrl": "https://marketplace.example.com/webhooks/lumen"
}
```

### Normalized Result

```json
{
  "jobId": "analysis-job-id",
  "status": "completed",
  "language": "th",
  "transcript": "...",
  "topics": [
    {
      "name": "travel",
      "confidence": 0.93
    }
  ],
  "style": {
    "formats": ["short_review"],
    "tone": ["informal", "energetic"]
  },
  "entities": ["Phuket"],
  "brandSafety": {
    "status": "review",
    "flags": []
  },
  "modelVersion": "..."
}
```

The final API schema must include versioning, idempotency keys, retry behavior, and signed webhooks.

## 5. Suggested Data Model

### Discovery

- `Influencer`
- `SocialAccount`
- `InfluencerSource`
- `VideoSnapshot`
- `VideoAnalysis`
- `AudienceProfile`
- `InfluencerCategory`

### Commercial

- `Brand`
- `Product`
- `Campaign`
- `CampaignRequirement`
- `InfluencerMatch`
- `Shortlist`
- `Invitation`

### Delivery

- `Brief`
- `Deliverable`
- `Submission`
- `Review`
- `Publication`
- `PerformanceSnapshot`

### Future Transactions

- `AgreementTemplate`
- `Agreement`
- `Offer`
- `Payment`
- `Payout`
- `Dispute`

## 6. Matching Pipeline

1. Normalize the product and campaign description.
2. Generate structured requirements and semantic embeddings.
3. Filter candidates by hard constraints such as geography, language, platform, and safety.
4. Calculate individual signal scores.
5. Store the score, confidence, model version, and explanation.
6. Allow operator review and overrides.
7. Learn from campaign decisions and results without hiding the original evidence.

The matching system should combine deterministic rules with semantic similarity. Semantic similarity alone is not sufficient for commercial or safety decisions.

## 7. Security and Privacy

- store only necessary public or authorized data;
- separate public profile data from private contact data;
- encrypt sensitive fields;
- verify webhook signatures;
- use short-lived signed media URLs;
- provide profile claim, correction, and removal processes;
- retain source, collection time, and consent state;
- restrict agreement and payment data by role;
- record administrative actions in an audit log.

## 8. Reliability

- use idempotency keys for imports and analysis submissions;
- process external calls through retryable queues;
- apply connector-specific rate limits;
- keep raw provider payloads out of primary domain models;
- record data freshness and analysis model versions;
- support manual reprocessing;
- expose operational dashboards for failed jobs and stale profiles.

## 9. Deployment

The MVP can use the same general infrastructure pattern as Lumen:

- containerized frontend and API;
- PostgreSQL and Redis;
- object storage for submitted media;
- separate worker processes;
- environment-based configuration;
- automated migrations and health checks.

Marketplace and Lumen deployments should remain independently deployable even if they share infrastructure during the pilot.

