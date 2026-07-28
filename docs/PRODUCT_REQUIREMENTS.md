# Product Requirements

## 1. Overview

Lumen Influencer Marketplace connects brands with influencers in Thailand. It analyzes creator videos using the existing Lumen pipeline and recommends creators whose content, audience, and style match a product or campaign.

## 2. Problem

Brands currently spend significant manual effort finding creators, watching videos, classifying content, checking brand fit, contacting candidates, and tracking deliverables. Follower count alone does not explain whether a creator is relevant to a specific product.

Creators also lack a consistent workflow for receiving qualified campaign offers, reviewing briefs, submitting content, and tracking approvals.

## 3. Users

### Brand Manager

- creates products and campaigns;
- defines target audiences and campaign requirements;
- searches for influencers;
- reviews match explanations;
- creates shortlists and sends invitations;
- reviews submitted content.

### Agency Operator

- manages campaigns for multiple brands;
- imports and verifies influencer profiles;
- monitors outreach and campaign delivery;
- exports reports.

### Influencer

- claims or creates a profile;
- connects social accounts;
- receives and accepts invitations;
- reviews briefs;
- submits videos or links;
- tracks approval and campaign status.

### Administrator

- manages users and access;
- reviews data-source health;
- handles reports, removals, and disputes;
- monitors analysis jobs and audit events.

## 4. Core Entities

- **Brand**: company or campaign owner.
- **Product**: item, service, property, venue, or offer promoted by a campaign.
- **Campaign**: objectives, audience, platforms, budget range, dates, and deliverables.
- **Influencer**: creator identity, location, languages, categories, contact state, and verification state.
- **Social Account**: platform handle, URL, public metrics, and authorization state.
- **Video Snapshot**: permitted video metadata, transcript, analysis, and observed metrics.
- **Audience Profile**: inferred or authorized geography, language, interests, and demographics.
- **Match**: score and explanation connecting an influencer to a product or campaign.
- **Invitation**: outreach record and creator response.
- **Brief**: requested deliverables, messaging, restrictions, deadlines, and approval rules.
- **Submission**: draft video, caption, link, review status, and feedback.
- **Agreement**: future micro-contract and acceptance record.
- **Performance Snapshot**: campaign-specific reach, engagement, clicks, leads, or sales.

## 5. Functional Requirements

### 5.1 Product and Campaign Setup

The user can:

- create a brand and product;
- add product description, category, price range, target location, target audience, and prohibited claims;
- create a campaign with platforms, deliverables, dates, budget range, and success metrics.

### 5.2 Influencer Collection & Discovery

The system can:

- **discover TikTok influencers from inside the product** (internal search: keywords, topics, geo, language, reach band);
- ingest candidates through an **approved connector** (platform API and/or contracted provider — not uncontrolled scraping);
- build and refresh an **influencer dossier** (brand/topics, style, audience signals, safety, evidence from recent videos);
- import influencer profile URLs manually or by CSV as a **fallback**;
- avoid duplicate profiles;
- record data source, collection time, and authorization status;
- allow a creator to claim or request removal of a profile.

Canonical spec: [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md).

### 5.3 Video Analysis

For each selected creator, the system can analyze a configurable number of recent videos and produce:

- transcript and detected language;
- primary and secondary topics;
- content formats and presentation style;
- recurring entities, products, locations, and calls to action;
- brand-safety flags;
- engagement and posting-frequency summaries;
- confidence values and links to source evidence.

### 5.4 Matching

The system calculates a match using:

- topic relevance;
- language and geography;
- audience relevance;
- content style;
- engagement quality;
- posting consistency;
- brand safety;
- budget compatibility, when known;
- previous campaign performance, when available.

Every score must include a human-readable explanation. Operators can adjust weights and override a recommendation.

### 5.5 Marketplace Workflow

The brand can:

- filter and compare influencers;
- save a shortlist;
- send an invitation with a campaign summary;
- track pending, accepted, declined, and expired invitations;
- issue a full brief after acceptance;
- review submissions and request changes;
- approve a final submission;
- record a publication URL and performance snapshots.

### 5.6 Creator Portal

The creator can:

- manage profile and contact details;
- connect or verify social accounts;
- accept or decline invitations;
- view campaign briefs;
- ask questions;
- upload a draft or provide a private review link;
- respond to feedback;
- submit the final publication link.

## 6. Match Score

The first scoring model should be understandable and configurable rather than fully automated.

Suggested initial weights:

| Signal | Weight |
| --- | ---: |
| Topic relevance | 25% |
| Audience and geography | 20% |
| Language | 10% |
| Content style | 10% |
| Engagement quality | 15% |
| Posting consistency | 5% |
| Brand safety | 10% |
| Commercial fit | 5% |

Weights can be changed per campaign. Missing data must reduce confidence rather than silently produce a precise score.

## 7. Non-Functional Requirements

- queue-based processing for video analysis;
- idempotent imports and analysis jobs;
- source attribution and data freshness timestamps;
- encryption for private contact and agreement data;
- role-based access control;
- audit history for invitations, approvals, and agreements;
- configurable retention policies;
- monitoring for failed imports and analysis jobs;
- localization-ready user interface.

## 8. Out of Scope for the First Release

- escrow and money movement;
- tax calculation;
- automated legal advice;
- fully automated outreach;
- public consumer video feed;
- automatic publishing without creator authorization;
- real-time metrics for every social platform;
- automated contract enforcement.

## 9. MVP Success Criteria

- an operator can **discover** a creator on TikTok from the app, open a dossier, and analyze recent videos;
- a brand can create a product and receive explainable creator recommendations;
- a campaign can progress from shortlist to accepted invitation;
- a creator can submit content for review;
- a brand can approve content and record the publication URL;
- every recommendation and workflow action is traceable.

## 10. Decisions Required Before Implementation

**Resolved in Phase 0 (2026-07-28).** Canonical record: [`docs/phase0/PHASE0_DECISIONS.md`](./phase0/PHASE0_DECISIONS.md).

| # | Question | Decision |
| --- | --- | --- |
| 1 | Which influencer data sources are approved for the MVP? | **Primary: in-app TikTok discovery** via approved API/provider connector → Lumen analysis → dossier. Fallback: manual URL + CSV + creator claim. No uncontrolled DIY scraping. |
| 2 | Will creators publish only to their own social accounts, or will Lumen also host public videos? | **Own social accounts only.** No public consumer feed / auto-publish in MVP. |
| 3 | Which product category will be used for the pilot? | **Restaurant / F&B (Bangkok)** — brand: Bangkok Bites Co., product: Soi 11 Thai Kitchen. |
| 4 | Which languages are required at launch? | **Thai + English** for pilot KPIs. RU/ZH optional in analysis, not launch gates. |
| 5 | Will the MVP support direct creator contact or agency-managed outreach only? | **Brand/agency-managed outreach** plus creator portal for accept / brief / submit. |
| 6 | Which campaign metrics are required for the pilot? | Views, likes, comments, saves (if available), posts published, invite→publish cycle time; optional foot-traffic / promo redemptions (manual). |

