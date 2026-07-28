# Manual QA — Invite + Brief persistence (0.4.4)

**Target:** https://influencers.lumen.universalgravity.org  
**Expected version:** `0.4.4`

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | GET /api/health | 0.4.4 | **PASS** — live-capable |
| I1 | Brand register → POST invite | 201 invitation | **PASS** |
| I2 | GET /api/invitations | listed | **PASS** — 1 |
| I3 | PATCH Accept + autoBrief | Accepted + brief Sent | **PASS** |
| I4 | PATCH brief Acknowledged | Acknowledged | **PASS** |
| I5 | Smoke IP:3000 | SMOKE PASSED | **PASS** |
| I6 | No cookie | 401 | **PASS** |

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Commit | `860502f` |
| Tester | Auto (HTTPS curl) |
| Sign-off | **READY TO SHIP** invite→accept→brief persistence `0.4.4` |
