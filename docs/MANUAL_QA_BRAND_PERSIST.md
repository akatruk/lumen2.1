# Manual QA — Brand persistence hydrate (0.4.3)

> **Historical (2026-07-29):** Recorded against the Thailand F&B / TikTok pilot build. Current product primary is **China / Douyin** — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md). Dates/PASS results below are preserved as an audit record.

**Target:** https://influencers.lumen.universalgravity.org  
**Ops fallback:** http://167.71.206.43:3000  
**Expected version:** `0.4.3`  
**Scope:** Logged-in products + shortlists server SoT; anonymous demo unchanged.

## How to run

1. Private window A + B (or two browsers).
2. Smoke: `EXPECT_VERSION=0.4.3 ./scripts/qa-smoke.sh http://167.71.206.43:3000` (or HTTPS if DNS resolves).
3. Mark PASS/FAIL. Fail release on P0 fail.

## Checks

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | GET /api/health (HTTPS) | version 0.4.3 | **PASS** |
| H2 | Smoke script (IP:3000) | SMOKE PASSED | **PASS** |
| A1 | Register brand | Session cookie Secure | **PASS** |
| P1 | POST /api/products | Product created | **PASS** — BA Persist Pad |
| P2 | GET /api/products | Same product | **PASS** |
| S1 | POST /api/shortlists | 201 shortlist | **PASS** — Soi11 Finalists |
| S2 | PUT items | items on GET | **PASS** — inf-1 |
| S3 | GET without cookie | 401 | **PASS** |
| D1 | Prisma boot | Shortlist table synced | **PASS** — db push OK |
| G1 | Live TikHub without keys | still demo | **PASS** (unchanged) |

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) — curl HTTPS + smoke IP |
| Commit | `17cbc3e` |
| P0 summary | **ALL PASS** |
| Sign-off | **READY TO SHIP** brand products+shortlists persistence `0.4.3` |

### Auth appendix

```text
register → Secure; HttpOnly cookie
POST product → cms4pt77o…
POST shortlist → cms4pt7by… + item inf-1
GET lists → 1 product, 1 shortlist
unauth GET /api/shortlists → Unauthorized
```
