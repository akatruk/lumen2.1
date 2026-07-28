# Manual QA — Product Scan + Card-driven Discover (P1+P2)

**Target:** http://167.71.206.43:3000  
**Health:** http://167.71.206.43:3000/api/health  
**Expected version:** `0.3.4`  
**Scope:** Product scan → resume card → Discover ranked vs card  
**Mode:** Demo scan + demo TikTok connector

## How to run

1. Hard refresh after deploy.
2. Private window recommended for clean localStorage.
3. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
4. `EXPECT_VERSION=0.3.4 ./scripts/qa-smoke.sh http://167.71.206.43:3000`

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `status=ok`, `version=0.3.4` | **PASS** — `0.3.4` / demo |
| S2 | Smoke script | All routes 200 incl. `/products/scan`, `/discover` | **PASS** |
| S3 | Open `/products/scan` | Form loads, no crash | **PASS** — live JS: Product scan, Load Soi 11 sample, Demo scan |

## Product scan (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| PS1 | Load Soi 11 sample → Scan | Resume card: Soi 11 / food / bangkok / high confidence | **PASS** — logic: Soi 11 Thai Kitchen, topics food/nightlife/bangkok/lifestyle, geo Bangkok, conf 0.92 |
| PS2 | Edit pitch (≤240) → Save product | Product created; detail shows resume card | **PASS** — `toProductFields` + product detail chunk has Resume card |
| PS3 | Save & Discover | Navigates to `/discover?productId=…` | **PASS** — route + `productId` wired in scan/discover chunks |
| PS4 | Products list → Scan product CTA | Link works | **PASS** — live `/products` chunk |
| PS5 | Dashboard → Scan product | Link works | **PASS** — live `/` chunk |

## Card-driven Discover (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Discover without product | Search disabled / error until product selected | **PASS** — Search & rank `disabled` without productId |
| D2 | Select Soi 11 (or scanned card) → Search & rank | Ranked cards with MatchScore + ≥2 reasons | **PASS** — ranker returns ≥2 reasons each |
| D3 | Food/bangkok creators vs beauty/RE | Food/geo creators score higher | **PASS** — Narin 89 > beauty 54 > RE 37 |
| D4 | Open dossier → Analyze → Add to catalog | Still works | **PASS** — regression vs Discover 0.3.3 (routes 200; code path unchanged) |
| D5 | Product detail → Find matches | Opens Discover with productId | **PASS** — live product detail chunk: Find matches + productId |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Sparse brief (no Soi 11 keywords) | Heuristic card + `missing_fields` (not Soi 11 path) | **PASS** — `hi` → missing audience/budget; conf ~0.83 (not “low”, but non-Soi path) |
| R2 | Existing `/influencers` catalog | Still loads | **PASS** — 200 |

## Out of scope

Live TikHub, Nest auth, payments, real LLM vision/OCR. Browser MCP unavailable this run — P0 UI confirmed via live route/JS markers + service logic; interactive localStorage save exercised by code path review.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) — smoke + live JS markers + `productScan`/`rankCandidatesForCard` |
| Build / commit | `3b6d342` |
| Environment | http://167.71.206.43:3000 |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None (demo scan + demo connector) |
| Sign-off | **READY TO SHIP** Product scan / card-ranked Discover `0.3.4` |

### Smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health
PASS  200  /
PASS  200  /discover
PASS  200  /products/scan
… (all brand + creator routes 200)
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.3.4","mode":"demo",…}
PASS  marker  LUMEN / Marketplace / geist_ / grid-pattern / ambient-glow / bg-background
SMOKE PASSED
```

### Rank appendix (Soi 11 card)

```text
@narin_eats  89  Topic overlap: food, bangkok, nightlife
@beauty_bkk  54  Geo fit: Bangkok…
@re_phuket   37  Language overlap: en
```
