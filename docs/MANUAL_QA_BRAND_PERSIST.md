# Manual QA — Brand persistence hydrate (0.4.3)

**Target:** https://influencers.lumen.universalgravity.org  
**Expected version:** `0.4.3`  
**Scope:** Logged-in products + shortlists server SoT; anonymous demo unchanged.

## How to run

1. Private window A + B (or two browsers).
2. Smoke: `EXPECT_VERSION=0.4.3 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
3. Mark PASS/FAIL. Fail release on P0 fail.

## Checks

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | GET /api/health | version 0.4.3 | |
| H2 | Smoke script | SMOKE PASSED | |
| A1 | Register brand on /login | Session cookie Secure | |
| P1 | Create product (UI or POST /api/products) | Appears in GET /api/products | |
| P2 | Refresh /products | Same product (hydrated) | |
| S1 | Create shortlist | POST /api/shortlists 201 | |
| S2 | Add influencer to shortlist | items persisted on GET | |
| S3 | Browser B login same account | Sees products + shortlists | |
| D1 | Logged out create product | localStorage only; API 401 | |
| G1 | Gate live TikHub still demo without keys | unchanged | |

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Commit | |
| P0 summary | |
| Sign-off | |
