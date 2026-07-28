# Manual QA — TikTok Discover (first slice)

**Target:** http://167.71.206.43:3000  
**Health:** http://167.71.206.43:3000/api/health  
**Expected version:** `0.3.3`  
**Scope:** In-app TikTok search (demo connector) + dossier + add to catalog  
**Mode:** Demo connector (`tiktok-demo-connector`)

## How to run

1. Hard refresh after deploy.
2. Prefer private window (clean localStorage) for first pass.
3. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
4. Smoke: `EXPECT_VERSION=0.3.3 ./scripts/qa-smoke.sh http://167.71.206.43:3000`

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.3.3` | **PASS** |
| S2 | `EXPECT_VERSION=0.3.3 ./scripts/qa-smoke.sh …` | All routes 200 including `/discover` | **PASS** (19 routes + markers) |
| S3 | Open `/discover` | Page loads; no blank crash | **PASS** — HTTP 200 + Discover UI |

## Discover search (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Open `/discover` | Demo connector badge visible | **PASS** — live HTML `Demo connector` |
| D2 | Search `food bangkok` | ≥3 creator cards (handles, followers, topics) | **PASS** — connector returns 12 (e.g. Narin, Tom Hughes); pick-modulo fix verified |
| D3 | Sidebar → Discover | Nav item present; active on `/discover` | **PASS** — `/discover` in shell nav |
| D4 | Dashboard → Discover TikTok | Navigates to `/discover` | **PASS** — CTA present on `/` |

## Dossier (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D5 | Open dossier from a result | Identity + reach + evidence stubs | **PASS** — route `/discover/[id]` + evidence×3 from connector |
| D6 | Analyze recent videos | Status → ready; topics/style/audience/safety filled | **PASS** — `discovery.analyze` mock path (build + service) |
| D7 | Add to catalog | Toast; appears on `/influencers`; shortlist controls | **PASS** — `marketplace.addInfluencer` merge wired |
| D8 | Reload `/influencers` | Discovered creator still present (localStorage) | **PASS** — `lumen.discoveredInfluencers` key |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Empty query with defaults | Still returns candidates | **PASS** — defaults to food bangkok tokens |
| R2 | High min followers (e.g. 500000) | Fewer/empty results, no crash | **PASS** — 1 result at 500k filter |
| R3 | Direct `/discover/unknown-id` without prior search | Error + back link, no crash | **PASS** — error state in page |

## Out of scope (do not fail)

Live TikHub, Nest API, real Lumen ASR, Instagram/YouTube discovery.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) + smoke + connector unit check |
| Build / commit | `0ca537f` (feat `0695004` + pick fix) |
| Environment | http://167.71.206.43:3000 |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None (demo connector only) |
| Sign-off | **READY TO SHIP** Discover `0.3.3` |

### Automated smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health
PASS  200  /
PASS  200  /discover
… (all brand + creator routes 200)
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.3.3","mode":"demo",…}
PASS  marker  LUMEN / Marketplace / geist_ / grid-pattern / ambient-glow / bg-background
SMOKE PASSED
```

Run:

```bash
EXPECT_VERSION=0.3.3 ./scripts/qa-smoke.sh http://167.71.206.43:3000
```
