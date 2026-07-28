# Phase 0 — Validated Lumen Analysis Output

**Purpose:** freeze the analysis contract the marketplace expects from Lumen before real wiring.  
**Validation basis:** demo fixtures in `web/src/data/mock.ts` + architecture contract in `docs/ARCHITECTURE.md`.  
**Date:** 2026-07-28

## 1. Job lifecycle (required)

```text
queued → processing → completed
                   ↘ failed (error message required)
```

Marketplace must show progress % and terminal error text without crashing.

## 2. Minimum viable analysis payload

For each analyzed video:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `externalId` | string | yes | Idempotency / dedupe |
| `sourceUrl` | string | yes | Provenance |
| `language` | string | yes | BCP-47-ish (`th`, `en`, …) |
| `transcript` | string | yes* | *or explicit `transcriptUnavailable` |
| `topics[]` | `{name, confidence}` | yes | ≥1 topic when transcript exists |
| `style[]` | string | yes | e.g. short review, GRWM |
| `entities[]` | string | no | dishes, places, brands |
| `brandSafety` | `{status, flags[], notes}` | yes | `safe` \| `review` \| `risk` |
| `confidence` | 0–1 | yes | Overall analysis confidence |
| `evidenceRefs[]` | string | recommended | timestamps / quote snippets |

Creator rollup used by matching:

| Field | Source |
| --- | --- |
| primary/secondary topics | aggregate video topics |
| languages | detected + profile |
| contentStyle | aggregate |
| brandSafety | worst-of recent set |
| postingFrequency | metadata or heuristic |
| engagement summaries | public metrics snapshot |

## 3. Match explanation contract (marketplace-owned)

Weights (pilot defaults from PRD):

| Signal | Weight |
| ---: | ---: |
| Topic relevance | 25% |
| Audience / geography | 20% |
| Engagement quality | 15% |
| Language | 10% |
| Content style | 10% |
| Brand safety | 10% |
| Posting consistency | 5% |
| Commercial fit | 5% |

Every score must expose:

- `overall` 0–100  
- `confidence`  
- `breakdown` per signal  
- `reasons[]` human-readable (≥2 bullets)

Missing data **reduces confidence**, does not invent precision.

## 4. Validation against demo fixtures

| Check | Result |
| --- | --- |
| Narin food videos expose topics `food` / `bangkok` / `nightlife` | PASS (mock) |
| Brand safety statuses include safe + review examples | PASS |
| Match reasons cite topical + geo + language evidence | PASS |
| Failed job row can render error without crash | PASS (QA Phase 1) |
| Analysis job progresses Queued→Processing→Completed in demo | PASS |

**Caveat:** demo is deterministic fixtures — not live model quality. Production exit needs ≥10 real TikTok food videos through Lumen with human spot-check of topics/safety.

## 5. Integration acceptance tests (for Phase 1 backend)

1. Submit analysis for a public TikTok URL → job id returned  
2. Poll/webhook → completed payload validates against schema above  
3. Marketplace stores artifacts + freshness timestamp  
4. Re-submit same `externalId` is idempotent  
5. Failure path stores operator-visible error  

## 6. Sample (normalized) completed video

```json
{
  "externalId": "vid-narin-soi11-001",
  "sourceUrl": "https://tiktok.com/@narineatsbkk/video/example",
  "language": "th",
  "transcript": "…pad kra pao… Soi 11…",
  "topics": [
    { "name": "food", "confidence": 0.96 },
    { "name": "bangkok", "confidence": 0.91 },
    { "name": "nightlife", "confidence": 0.84 }
  ],
  "style": ["short review", "street food walk"],
  "entities": ["pad kra pao", "Sukhumvit", "Soi 11"],
  "brandSafety": { "status": "safe", "flags": [], "notes": "No concerning flags." },
  "confidence": 0.91,
  "evidenceRefs": ["00:12 topic:food", "00:28 entity:pad kra pao"]
}
```
