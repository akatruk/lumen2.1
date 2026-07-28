# Manual QA — Invite + Brief persistence (0.4.4)

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
| H1 | `GET /api/health` (HTTPS or :3000) | `status=ok`, `version=0.4.4` | |
| H2 | Smoke script | All routes 200 + theme markers | |
| H3 | Container logs | prisma db push OK (Invitation/CampaignBrief) | |
| H4 | `GET /api/discovery/tiktok` | `mode=live`, `configured=true` | |
| H5 | `GET /api/products/scan` | `mode=live`, `configured=true` | |

## Invite → brief (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Register brand via `POST /api/auth` on HTTPS | User + `Set-Cookie` with `Secure` | |
| I2 | `POST /api/invitations` `{influencerId,campaignId,message}` | 201 invitation Pending | |
| I3 | `GET /api/invitations` | Contains new invite | |
| I4 | `PATCH /api/invitations` Accept + `autoBrief` | status Accepted + brief Sent | |
| I5 | `GET /api/briefs` | Brief listed for invitation | |
| I6 | `PATCH /api/briefs` `{status:Acknowledged}` | status Acknowledged | |
| I7 | `GET /api/invitations` without cookie | 401 | |
| I8 | Pages `/invitations`, `/creator/invitations`, `/creator/briefs` | HTTP 200 | |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Live TikHub `POST …/discovery/tiktok` query bangkok food | `source=tikhub`, count≥1 | |
| R2 | Logged-out demo still usable | `/products/scan`, `/discover` 200 | |

## Out of scope

Creator auth across devices; submissions/claims server persist; payments.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Smoke appendix

```text
(paste)
```

### Invite appendix

```text
(paste)
```
