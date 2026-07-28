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
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.3.3` | |
| S2 | `EXPECT_VERSION=0.3.3 ./scripts/qa-smoke.sh …` | All routes 200 including `/discover` | |
| S3 | Open `/discover` | Page loads; no blank crash | |

## Discover search (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Open `/discover` | Demo connector badge visible | |
| D2 | Search `food bangkok` | ≥3 creator cards (handles, followers, topics) | |
| D3 | Sidebar → Discover | Nav item present; active on `/discover` | |
| D4 | Dashboard → Discover TikTok | Navigates to `/discover` | |

## Dossier (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D5 | Open dossier from a result | Identity + reach + evidence stubs | |
| D6 | Analyze recent videos | Status → ready; topics/style/audience/safety filled | |
| D7 | Add to catalog | Toast; appears on `/influencers`; shortlist controls | |
| D8 | Reload `/influencers` | Discovered creator still present (localStorage) | |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Empty query with defaults | Still returns candidates | |
| R2 | High min followers (e.g. 500000) | Fewer/empty results, no crash | |
| R3 | Direct `/discover/unknown-id` without prior search | Error + back link, no crash | |

## Out of scope (do not fail)

Live TikHub, Nest API, real Lumen ASR, Instagram/YouTube discovery.

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

### Automated smoke appendix

```text
(paste after deploy)
```
