# Manual QA — Invite + Brief persistence (0.4.4)

> **Historical (2026-07-29):** Recorded against the Thailand F&B / TikTok pilot build. Current product primary is **China / Douyin** — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md). Dates/PASS results below are preserved as an audit record.

**Target:** https://influencers.lumen.universalgravity.org  
**Ops fallback:** http://167.71.206.43:3000  
**Health:** `/api/health`  
**Expected version:** `0.4.4`  
**Scope:** Brand invite → Accept → auto-brief → Acknowledge on SQLite (option A)  
**Mode:** live-capable (TikHub + OpenRouter keys present); invite APIs session-gated

## How to run

1. Prefer HTTPS (Secure cookies). Local DNS flaky → `curl --resolve influencers.lumen.universalgravity.org:443:167.71.206.43 …`
2. Smoke: `EXPECT_VERSION=0.4.4 ./scripts/qa-smoke.sh http://167.71.206.43:3000`
3. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.

## Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | `GET /api/health` (HTTPS or :3000) | `status=ok`, `version=0.4.4` | **PASS** — `0.4.4` / live-capable |
| H2 | Smoke script | All routes 200 + theme markers | **PASS** — SMOKE PASSED |
| H3 | Container logs | prisma db push OK | **PASS** — schema in sync |
| H4 | `GET /api/discovery/tiktok` | `mode=live`, `configured=true` | **PASS** |
| H5 | `GET /api/products/scan` | `mode=live`, `configured=true` | **PASS** |

## Invite → brief (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Register brand via `POST /api/auth` on HTTPS | User + `Set-Cookie` with `Secure` | **PASS** |
| I2 | `POST /api/invitations` | 201 invitation Pending | **PASS** — MQA soft opening |
| I3 | `GET /api/invitations` | Contains new invite | **PASS** — count 1 |
| I4 | `PATCH` Accept + `autoBrief` | Accepted + brief Sent | **PASS** — MQA brief |
| I5 | `GET /api/briefs` | Brief listed | **PASS** — 1 |
| I6 | `PATCH /api/briefs` Acknowledged | Acknowledged | **PASS** |
| I7 | `GET /api/invitations` without cookie | 401 | **PASS** |
| I8 | `/invitations`, `/creator/invitations`, `/creator/briefs` | HTTP 200 | **PASS** |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Live TikHub bangkok food | `source=tikhub`, count≥1 | **PASS** — count 3 |
| R2 | `/products/scan`, `/discover` | 200 | **PASS** |

## Out of scope

Creator auth across devices; submissions/claims server persist; payments.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) — smoke + HTTPS curl |
| Build / commit | `1b6457a` (checklist); feature `860502f` |
| Environment | https://influencers.lumen.universalgravity.org + :3000 |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None |
| Sign-off | **READY TO SHIP** invite→accept→brief `0.4.4` |

### Smoke appendix

```text
Smoke against http://167.71.206.43:3000
… all brand + creator routes 200
Health body: version 0.4.4 mode live-capable
SMOKE PASSED
```

### Invite appendix

```text
register → Secure cookie
POST invite → Pending cms4rmhsq…
Accept+autoBrief → Accepted + MQA brief Sent
Acknowledge → Acknowledged
unauth GET /api/invitations → Unauthorized
TikHub regression → source=tikhub count=3
```
