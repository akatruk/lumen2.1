# Influencer Discovery & Dossier (core capability)

**Status:** Product requirement — locked 2026-07-28, **primary platform updated to Douyin 2026-07-29** (owner direction)
**Platform (primary):** **Douyin (中国抖音 / douyin.com)** — via TikHub, credentials reused from Strom/lumen (`TIKHUB_API_KEY`, no new account)
**Platform (historical/leftover):** International TikTok — the original Thailand F&B pilot targeted TikTok first; that discovery path is now a **deprecated alias** (`/api/discovery/tiktok` → same Douyin implementation) kept only for backward compatibility. Creator identity is **Act-as Douyin**. International TikTok OAuth was removed in 0.5.1.
**Principle:** The marketplace **finds** influencers itself. Manual CSV/URL is fallback, not the main path.

## 1. What the product must do

1. **Discover** Douyin creators via an **internal** search/discovery flow (keywords, topics, geo/city, language, follower band, engagement proxies).
2. **Ingest** candidate profiles + recent public videos through **TikHub** (`POST /api/v1/douyin/search/fetch_general_search_v1` — same provider/class as Lumen's TikHub integration; **not** ad-hoc browser scraping).
3. **Analyze** videos with Lumen (transcript, topics, style, entities, brand safety).
4. **Build a dossier** per influencer for future collaboration decisions.
5. **Rank / match** dossiers against a product or campaign.

Operators should not need an external agency spreadsheet to start discovery.

## 2. Influencer dossier (minimum fields)

A dossier is a compact, explainable profile the brand uses before invite:

| Block | Contents |
| --- | --- |
| Identity | Display name, handles, profile URLs (`douyin.com/user/{id}`), city/country, languages |
| Reach | Followers, avg views, engagement rate, posting cadence |
| Brand / topics | Primary & secondary topics with confidence; recurring entities (products, places, brands) |
| Style | Formats (short review, GRWM, vlog…), tone markers |
| Audience | Inferred geo/language/interest signals (confidence + evidence); gaps called out |
| Safety | Brand-safety status + flags + notes |
| Evidence | Links to analyzed videos + short quotes / timestamps |
| Commercial | Suitable products/campaigns, match score + reasons (when ranked) |
| Freshness | Last discovered / last analyzed timestamps |

Dossier must stay **human-readable** — not a black-box embedding dump.

## 3. Discovery UX (brand console)

- Search Douyin candidates from inside the app (query + filters).
- Review result list → open dossier (even before shortlist).
- One-click **Analyze recent videos** (N configurable) → dossier fills/updates.
- Add to shortlist / invite from dossier.
- Optional: paste URL or CSV **only** as supplement (known creator, offline list).

## 4. Architecture ownership

```text
Brand Console → Marketplace API
                    ├── Douyin Discovery Connector (TikHub — reused from Strom/lumen)
                    ├── Influencer + Dossier store (Postgres)
                    └── Lumen Analysis API (async jobs)
```

- **Marketplace** owns search UX, dossier model, ranking, collaboration.
- **Connector** owns platform fetch/normalize (reuse Lumen/Strom TikHub patterns).
- **Lumen** owns transcription + semantic analysis artifacts.

Implementation reference: `web/src/server/tikhub.ts` (`fetchDouyinSearchVideos`, `videosToCandidates`) behind `POST /api/discovery/douyin`. `POST /api/discovery/tiktok` remains only as a deprecated alias route that calls the same Douyin implementation — it does not talk to intl TikTok.

## 5. Compliance posture

- Internal discovery ≠ uncontrolled scraping.
- Use the contracted TikHub provider and/or official APIs; log source + collection time on every profile.
- Creator claim / correction / removal still required.
- Never create a second TikHub/OpenRouter/TikTok account — reuse the existing Strom/lumen credentials; never paste secret values into docs or commits.
- See `phase0/COMPLIANCE_AND_DATA.md` (historical Thailand review — principles still apply, geography/PDPA specifics need a China-specific pass before production).

## 6. Pilot acceptance (historical — Soi 11 / Thailand)

The original acceptance scenario below is preserved for historical/regression reference; it predates the Douyin pivot and used TikTok as the discovery surface.

Operator can:

1. Search TikTok for Bangkok food / nightlife creators from the app.
2. Open ≥1 dossier with topics, style, audience, safety.
3. Run analysis on recent videos and see dossier update.
4. Shortlist and invite using dossier evidence.

**Current equivalent acceptance:** search Douyin for a China-market query (e.g. city + topic in zh or pinyin), open ≥1 dossier, run analysis, shortlist/invite using dossier evidence — same flow, Douyin data.
