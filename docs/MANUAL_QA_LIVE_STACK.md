# Manual QA — Live stack: TikHub / LLM scan / Auth+DB (0.4.1)

**Target:** http://167.71.206.43:3000  
**Health:** http://167.71.206.43:3000/api/health  
**Expected version:** `0.4.1`  
**Scope:** Prisma boot, HTTP session cookies, brand auth, product persistence, demo discovery/scan gates, live-mode wiring  
**Mode this run:** Demo (no TikHub/OpenRouter keys on droplet). Live API cases marked **BLOCKED** until secrets set.

## How to run

1. Hard refresh after deploy.
2. Prefer private window for UI cookie tests.
3. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
4. Smoke: `EXPECT_VERSION=0.4.1 ./scripts/qa-smoke.sh http://167.71.206.43:3000`
5. Curl helpers use a cookie jar: `COOKIE=$(mktemp)`.

## Enable live (post-keys)

Prefer GitHub → repo **Secrets** / **Variables** (Deploy writes `/opt/lumen-marketplace/.env`):

| Kind | Name | Example |
| --- | --- | --- |
| secret | `TIKHUB_API_KEY` | TikHub token |
| secret | `OPENROUTER_API_KEY` | OpenRouter key |
| secret | `AUTH_SECRET` | long random (already set) |
| var | `DISCOVERY_MODE` | `live` |
| var | `PRODUCT_SCAN_MODE` | `live` |
| var | `NEXT_PUBLIC_DISCOVERY_MODE` | `live` (rebuild) |
| var | `NEXT_PUBLIC_PRODUCT_SCAN_MODE` | `live` (rebuild) |
| var | `COOKIE_SECURE` | `false` on HTTP demo; `true` behind HTTPS |

Rebuild required for `NEXT_PUBLIC_*`. Server keys can change at runtime without rebuild.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | `GET /api/health` | `status=ok`, `version=0.4.1` | |
| H2 | Smoke script all routes | All 200 + theme markers | |
| H3 | Container logs | `Running prisma db push…` / schema in sync, no `prisma: not found` | |

## Discovery gates (P0 demo / P1 live)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `GET /api/discovery/tiktok` | JSON with `mode` (+ `configured` if status route) | |
| D2 | `POST /api/discovery/tiktok` `{"keyword":"skincare","limit":3}` without live | `DISCOVERY_MODE is not live` (or equivalent gate) | |
| D3 | UI `/discover` demo search with product | Demo connector ranks (regression) | |
| D4 | live + `TIKHUB_API_KEY`: bangkok food | Real handles, source tikhub | |

## Product scan gates (P0 demo / P1 live)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/products/scan` | `mode=demo`, `configured=false` without key | |
| S2 | UI `/products/scan` Soi 11 sample → Demo scan | Resume card `demo-scan` | |
| S3 | live + OpenRouter: POST scan brief | Card `sourceMode: live-scan` | |

## Auth + persistence (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | `POST /api/auth` register | 200 user JSON; `Set-Cookie: lumen_session` **without** `Secure` | |
| A2 | `GET /api/auth` with jar | Same user (session sticks over HTTP) | |
| A3 | `POST /api/products` authenticated | Product created | |
| A4 | `GET /api/products` | Product listed | |
| A5 | `GET /api/products` without cookie | 401 Unauthorized | |
| A6 | `/login` page | HTTP 200 | |
| A7 | logout (`DELETE`/`action=logout` per API) | session cleared; products 401 | |

## Ops (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| O1 | Droplet `.env` present after Deploy | `AUTH_SECRET` set; modes default demo | |
| O2 | Volume `lumen-data` | Users/products survive container recreate | |

## Out of scope

Payments, Nest rewrite, live TikHub/LLM without keys, dossier server sync polish.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Environment | http://167.71.206.43:3000 |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Smoke appendix

```text
(paste EXPECT_VERSION=0.4.1 ./scripts/qa-smoke.sh output)
```

### Auth appendix

```text
(paste register / session / products curl evidence)
```
