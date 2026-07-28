# Influencer Discovery & Dossier (core capability)

**Status:** Product requirement — locked 2026-07-28 (owner direction)  
**Platform (pilot):** TikTok first  
**Principle:** The marketplace **finds** influencers itself. Manual CSV/URL is fallback, not the main path.

## 1. What the product must do

1. **Discover** TikTok creators via an **internal** search/discovery flow (keywords, topics, geo/city, language, follower band, engagement proxies).
2. **Ingest** candidate profiles + recent public videos through an **approved connector** (platform API and/or contracted provider — same class as Lumen TikHub integration; **not** ad-hoc browser scraping).
3. **Analyze** videos with Lumen (transcript, topics, style, entities, brand safety).
4. **Build a dossier** per influencer for future collaboration decisions.
5. **Rank / match** dossiers against a product or campaign.

Operators should not need an external agency spreadsheet to start discovery.

## 2. Influencer dossier (minimum fields)

A dossier is a compact, explainable profile the brand uses before invite:

| Block | Contents |
| --- | --- |
| Identity | Display name, handles, profile URLs, city/country, languages |
| Reach | Followers, avg views, engagement rate, posting cadence |
| Brand / topics | Primary & secondary topics with confidence; recurring entities (dishes, places, brands) |
| Style | Formats (short review, GRWM, vlog…), tone markers |
| Audience | Inferred geo/language/interest signals (confidence + evidence); gaps called out |
| Safety | Brand-safety status + flags + notes |
| Evidence | Links to analyzed videos + short quotes / timestamps |
| Commercial | Suitable products/campaigns, match score + reasons (when ranked) |
| Freshness | Last discovered / last analyzed timestamps |

Dossier must stay **human-readable** — not a black-box embedding dump.

## 3. Discovery UX (brand console)

- Search TikTok candidates from inside the app (query + filters).
- Review result list → open dossier (even before shortlist).
- One-click **Analyze recent videos** (N configurable) → dossier fills/updates.
- Add to shortlist / invite from dossier.
- Optional: paste URL or CSV **only** as supplement (known creator, offline list).

## 4. Architecture ownership

```text
Brand Console → Marketplace API
                    ├── TikTok Discovery Connector (approved API/provider)
                    ├── Influencer + Dossier store (Postgres)
                    └── Lumen Analysis API (async jobs)
```

- **Marketplace** owns search UX, dossier model, ranking, collaboration.
- **Connector** owns platform fetch/normalize (reuse Lumen patterns where possible).
- **Lumen** owns transcription + semantic analysis artifacts.

## 5. Compliance posture

- Internal discovery ≠ uncontrolled scraping.
- Use contracted provider and/or official APIs; log source + collection time on every profile.
- Creator claim / correction / removal still required.
- See `COMPLIANCE_AND_DATA.md`.

## 6. Pilot acceptance (Soi 11)

Operator can:

1. Search TikTok for Bangkok food / nightlife creators from the app.
2. Open ≥1 dossier with topics, style, audience, safety.
3. Run analysis on recent videos and see dossier update.
4. Shortlist and invite using dossier evidence.
