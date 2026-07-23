# Manual QA — Phase 1 Discovery MVP

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
| S1 | `GET /api/health` | JSON `status=ok`, HTTP 200 | |
| S2 | Open `/` | Dashboard loads, no blank screen | |
| S3 | Open mobile menu (≤390px) | Sidebar opens/closes; all nav links work | |
| S4 | Browser console while clicking main nav | No uncaught errors | |

## Navigation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| N1 | Click each sidebar item | Routes: `/`, `/influencers`, `/products`, `/campaigns`, `/shortlists`, `/invitations`, `/analysis-jobs`, `/settings` | |
| N2 | Open `/import` from Dashboard quick action | Import screen loads | |

## Dashboard (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | View KPI tiles | Influencers, analyzed videos, active campaigns, shortlisted counts shown | |
| D2 | Recommended influencers | ≥1 cards/rows with match score; click opens profile | |
| D3 | Topics + recent jobs + activity | Sections render with Thailand-related demo data | |
| D4 | Quick actions | Add Product / Create Campaign / Import / Start Analysis navigate correctly | |

## Influencers catalog (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Open `/influencers` | ≥12 creators visible | |
| I2 | Search by name/handle | List filters | |
| I3 | Filter platform / city / language / topic / followers / match | List updates; empty state possible without crash | |
| I4 | Sort by match / followers / engagement / name | Order changes | |
| I5 | Toggle cards ↔ table | Both views usable | |
| I6 | Match for product dropdown | Scores re-rank for selected product | |
| I7 | Add to shortlist from card | Toast; creator appears in chosen shortlist | |

## Influencer detail (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | Open any creator | Profile, accounts, metrics, topics, style render | |
| P2 | Match explanation | Overall score + 8 signal bars + reasons | |
| P3 | Videos section | Transcript/topics/style/entities where present | |
| P4 | Brand safety | Status + flags/notes | |
| P5 | Save team notes | Persists after reload (localStorage) | |
| P6 | Invite to campaign | Creates invitation; visible on `/invitations` | |

## Products (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| PR1 | Open `/products` | ≥5 demo products | |
| PR2 | Create product | Appears in list after save | |
| PR3 | Edit product | Changes persist | |
| PR4 | Open product detail | Suggested influencers shown | |

## Campaigns (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open `/campaigns` | ≥4 campaigns with status badges | |
| C2 | Create campaign | Appears with Draft/selected status | |
| C3 | Edit campaign | Changes persist | |
| C4 | Open campaign detail | Brief fields complete | |

## Shortlists (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| SL1 | Open `/shortlists` | ≥3 shortlists | |
| SL2 | Create shortlist | Appears in left list | |
| SL3 | Add/remove influencer | Membership updates | |
| SL4 | Edit item note + shortlist notes | Persist | |
| SL5 | Compare 2–4 creators | Comparison table shows signals | |

## Analysis jobs (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | Open `/analysis-jobs` | Queue table with mixed statuses | |
| A2 | Start Analysis | New job Queued → Processing → Completed with progress | |
| A3 | Failed job row | Shows error text, no crash | |

## Import (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| IM1 | Preview URLs | Preview table fills | |
| IM2 | Preview CSV / file choose | Preview table fills | |
| IM3 | Confirm demo import | Jobs queued; success banner | |
| IM4 | Confirm no live scraping claims in UI copy | Demo/provider wording only | |

## Invitations & Settings (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| V1 | `/invitations` | Pending/Accepted rows; links work | |
| ST1 | Change default videos / weights → Save | Toast/saved indicator; reload keeps values | |
| ST2 | Reset demo data | Reloads seed fixtures | |

## Out of scope (do not fail)

- Micro-contracts, payments, escrow, creator portal, real Lumen API, auth, Postgres.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Environment | http://167.71.206.43:3000 |
| Desktop browser | |
| Mobile check | |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Automated smoke appendix

Run from repo root after deploy:

```bash
./scripts/qa-smoke.sh http://167.71.206.43:3000
```
