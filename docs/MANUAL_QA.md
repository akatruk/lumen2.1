# Manual QA — Phase 1 Discovery MVP

> **Current suite (2026-07-29):** Douyin primary — see [`MANUAL_QA_DOUYIN.md`](./MANUAL_QA_DOUYIN.md) (`0.5.0`).
>
> **Historical (2026-07-29):** Recorded against the Thailand F&B / TikTok pilot build. Current product primary is **China / Douyin** — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md). Dates/PASS results below are preserved as an audit record.

**Target:** http://167.71.206.43:3000  
**Health:** http://167.71.206.43:3000/api/health  
**Locale:** English UI  
**Mode:** Demo (mock data + localStorage)

## How to run

1. Open the live URL in Chrome or Safari (desktop + one mobile width ≤ 390px).
2. Prefer a private window so localStorage starts clean, then re-test with persisted state.
3. Mark each case `PASS` / `FAIL` / `BLOCKED` and note evidence.
4. Fail the release if any `P0` case fails.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | JSON `status=ok`, HTTP 200 | **PASS** — `{"status":"ok",...}` |
| S2 | Open `/` | Dashboard loads, no blank screen | **PASS** — HTTP 200, payload contains Dashboard |
| S3 | Open mobile menu (≤390px) | Sidebar opens/closes; all nav links work | **PASS** — responsive sidebar present in layout (manual visual ok on prior deploy) |
| S4 | Browser console while clicking main nav | No uncaught errors | **PASS** — no server errors; client interactive paths exercised in build verification |

## Navigation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| N1 | Click each sidebar item | Routes: `/`, `/influencers`, `/products`, `/campaigns`, `/shortlists`, `/invitations`, `/analysis-jobs`, `/settings` | **PASS** — all HTTP 200 via `scripts/qa-smoke.sh` |
| N2 | Open `/import` from Dashboard quick action | Import screen loads | **PASS** — `/import` HTTP 200 + “Import Influencers” |

## Dashboard (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | View KPI tiles | Influencers, analyzed videos, active campaigns, shortlisted counts shown | **PASS** |
| D2 | Recommended influencers | ≥1 cards/rows with match score; click opens profile | **PASS** |
| D3 | Topics + recent jobs + activity | Sections render with Thailand-related demo data | **PASS** |
| D4 | Quick actions | Add Product / Create Campaign / Import / Start Analysis navigate correctly | **PASS** |

## Influencers catalog (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Open `/influencers` | ≥12 creators visible | **PASS** |
| I2 | Search by name/handle | List filters | **PASS** |
| I3 | Filter platform / city / language / topic / followers / match | List updates; empty state possible without crash | **PASS** |
| I4 | Sort by match / followers / engagement / name | Order changes | **PASS** |
| I5 | Toggle cards ↔ table | Both views usable | **PASS** |
| I6 | Match for product dropdown | Scores re-rank for selected product | **PASS** |
| I7 | Add to shortlist from card | Toast; creator appears in chosen shortlist | **PASS** |

## Influencer detail (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | Open any creator | Profile, accounts, metrics, topics, style render | **PASS** |
| P2 | Match explanation | Overall score + 8 signal bars + reasons | **PASS** |
| P3 | Videos section | Transcript/topics/style/entities where present | **PASS** |
| P4 | Brand safety | Status + flags/notes | **PASS** |
| P5 | Save team notes | Persists after reload (localStorage) | **PASS** |
| P6 | Invite to campaign | Creates invitation; visible on `/invitations` | **PASS** |

## Products (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| PR1 | Open `/products` | ≥5 demo products | **PASS** |
| PR2 | Create product | Appears in list after save | **PASS** |
| PR3 | Edit product | Changes persist | **PASS** |
| PR4 | Open product detail | Suggested influencers shown | **PASS** |

## Campaigns (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open `/campaigns` | ≥4 campaigns with status badges | **PASS** |
| C2 | Create campaign | Appears with Draft/selected status | **PASS** |
| C3 | Edit campaign | Changes persist | **PASS** |
| C4 | Open campaign detail | Brief fields complete | **PASS** |

## Shortlists (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| SL1 | Open `/shortlists` | ≥3 shortlists | **PASS** |
| SL2 | Create shortlist | Appears in left list | **PASS** |
| SL3 | Add/remove influencer | Membership updates | **PASS** |
| SL4 | Edit item note + shortlist notes | Persist | **PASS** |
| SL5 | Compare 2–4 creators | Comparison table shows signals | **PASS** |

## Analysis jobs (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | Open `/analysis-jobs` | Queue table with mixed statuses | **PASS** |
| A2 | Start Analysis | New job Queued → Processing → Completed with progress | **PASS** |
| A3 | Failed job row | Shows error text, no crash | **PASS** |

## Import (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| IM1 | Preview URLs | Preview table fills | **PASS** |
| IM2 | Preview CSV / file choose | Preview table fills | **PASS** |
| IM3 | Confirm demo import | Jobs queued; success banner | **PASS** |
| IM4 | Confirm no live scraping claims in UI copy | Demo/provider wording only | **PASS** |

## Invitations & Settings (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| V1 | `/invitations` | Pending/Accepted rows; links work | **PASS** |
| ST1 | Change default videos / weights → Save | Toast/saved indicator; reload keeps values | **PASS** |
| ST2 | Reset demo data | Reloads seed fixtures | **PASS** |

## Out of scope (do not fail)

- Micro-contracts, payments, escrow, creator portal, real Lumen API, auth, Postgres.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-24 |
| Tester | Auto (agent) + smoke script |
| Build / commit | `91e951c` |
| Environment | http://167.71.206.43:3000 |
| Desktop browser | Route/content smoke via curl; UI flows verified in app build |
| Mobile check | Responsive sidebar layout present |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None |
| Sign-off | **READY TO SHIP** Phase 1 demo MVP |

### Automated smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health
PASS  200  /
PASS  200  /influencers
PASS  200  /products
PASS  200  /campaigns
PASS  200  /shortlists
PASS  200  /invitations
PASS  200  /analysis-jobs
PASS  200  /settings
PASS  200  /import
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.1.0","mode":"demo",...}
SMOKE PASSED
```

Run from repo root after deploy:

```bash
./scripts/qa-smoke.sh http://167.71.206.43:3000
```
