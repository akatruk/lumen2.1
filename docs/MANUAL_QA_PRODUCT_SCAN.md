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
| S1 | `GET /api/health` | `status=ok`, `version=0.3.4` | |
| S2 | Smoke script | All routes 200 incl. `/products/scan`, `/discover` | |
| S3 | Open `/products/scan` | Form loads, no crash | |

## Product scan (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| PS1 | Load Soi 11 sample → Scan | Resume card: Soi 11 / food / bangkok / high confidence | |
| PS2 | Edit pitch (≤240) → Save product | Product created; detail shows resume card | |
| PS3 | Save & Discover | Navigates to `/discover?productId=…` | |
| PS4 | Products list → Scan product CTA | Link works | |
| PS5 | Dashboard → Scan product | Link works | |

## Card-driven Discover (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Discover without product | Search disabled / error until product selected | |
| D2 | Select Soi 11 (or scanned card) → Search & rank | Ranked cards with MatchScore + ≥2 reasons | |
| D3 | Food/bangkok creators vs beauty/RE | Food/geo creators score higher | |
| D4 | Open dossier → Analyze → Add to catalog | Still works | |
| D5 | Product detail → Find matches | Opens Discover with productId | |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Sparse brief (no Soi 11 keywords) | Low-confidence card + missing_fields | |
| R2 | Existing `/influencers` catalog | Still loads | |

## Out of scope

Live TikHub, Nest auth, payments, real LLM vision/OCR.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | |
| Build / commit | |
| Environment | http://167.71.206.43:3000 |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Smoke appendix

```text
(paste after deploy)
```
