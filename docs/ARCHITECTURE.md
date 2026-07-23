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
                                ├── Data Source Connectors
                                └── Lumen Analysis API
                                         │
                                         └── Transcription and Video Analysis
```

### Brand Console

Supports product setup, discovery, filters, match comparison, shortlists, campaign creation, invitations, content review, and reporting.

### Creator Portal

Supports profile claiming, account verification, invitations, briefs, content submissions, revisions, and publication records.

### Marketplace API

Owns marketplace users, brands, products, influencer records, campaigns, invitations, submissions, and match results.

### Lumen Analysis API

Accepts an authorized video reference or media object and returns a normalized analysis result. The marketplace should treat Lumen as an asynchronous service.

### Data Source Connectors

Each connector translates an approved platform API, data provider, CSV import, or creator-authorized connection into a common influencer and video format.

## 3. Service Boundary

The marketplace owns:

- influencer discovery and profile management;
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

