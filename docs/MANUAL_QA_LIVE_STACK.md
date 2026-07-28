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
| H1 | `GET /api/health` | `status=ok`, `version=0.4.1` | **PASS** — `0.4.1` / `demo` |
| H2 | Smoke script all routes | All 200 + theme markers | **PASS** — `SMOKE PASSED` |
| H3 | Container logs | `Running prisma db push…` / schema in sync, no `prisma: not found` | **PASS** — db push OK, Ready |

## Discovery gates (P0 demo / P1 live)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `GET /api/discovery/tiktok` | JSON with `mode` (+ `configured`) | **PASS** — `mode=demo`, `configured=false` |
| D2 | `POST /api/discovery/tiktok` without live | `DISCOVERY_MODE is not live` | **PASS** — gate + hint |
| D3 | UI `/discover` | Route loads (demo connector) | **PASS** — HTTP 200 |
| D4 | live + `TIKHUB_API_KEY`: bangkok food | Real handles, source tikhub | **BLOCKED** — `TIKHUB_API_KEY` empty |

## Product scan gates (P0 demo / P1 live)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/products/scan` | `mode=demo`, `configured=false` without key | **PASS** |
| S2 | UI `/products/scan` Soi 11 / Demo scan markers | Page + Demo scan / Soi 11 | **PASS** — 200 + markers |
| S3 | live + OpenRouter: POST scan brief | Card `sourceMode: live-scan` | **BLOCKED** — `OPENROUTER_API_KEY` empty |

## Auth + persistence (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | `POST /api/auth` register | 200 user; `Set-Cookie` **without** `Secure` | **PASS** — HttpOnly; SameSite=lax; no Secure |
| A2 | `GET /api/auth` with jar | Same user | **PASS** |
| A3 | `POST /api/products` authenticated | Product created | **PASS** — `MQA Serum` |
| A4 | `GET /api/products` | Product listed | **PASS** |
| A5 | `GET /api/products` without cookie | 401 Unauthorized | **PASS** |
| A6 | `/login` page | HTTP 200 | **PASS** |
| A7 | `POST /api/auth` `{"action":"logout"}` | session cleared; products 401 | **PASS** — `{"ok":true}` → user null → 401 |

## Ops (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| O1 | Droplet `.env` after Deploy | `AUTH_SECRET` set; modes demo; `COOKIE_SECURE=false` | **PASS** — modes demo; AUTH len=64; API keys len=0 |
| O2 | Volume `lumen-data` | `lumen.db` present after recreate | **PASS** — `/app/data/lumen.db` 36KB after redeploy |

## Out of scope

Payments, Nest rewrite, live TikHub/LLM without keys, dossier server sync polish.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) — curl + smoke + droplet logs |
| Build / commit | `2e53422` (QA doc); runtime image from `3fb451e` feature fix + Deploy after `2e53422` |
| Environment | http://167.71.206.43:3000 |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** (O1/O2); **BLOCKED** D4/S3 pending API keys |
| Blockers | Live TikHub + live LLM need `TIKHUB_API_KEY` + `OPENROUTER_API_KEY` GH secrets |
| Sign-off | **READY TO SHIP** demo auth/persist + live wiring `0.4.1` (live connectors gated) |

### Smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health … /login … all brand+creator routes
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.4.1","mode":"demo",…}
PASS  marker  LUMEN / Marketplace / geist_ / grid-pattern / ambient-glow / bg-background
SMOKE PASSED
```

### Auth appendix

```text
set-cookie: lumen_session=…; Path=/; …; HttpOnly; SameSite=lax   # no Secure
register → user id cms4kze5w…
session → same user
POST /api/products → MQA Serum
GET /api/products → 1 row
GET without cookie → Unauthorized
logout → ok; session null; products Unauthorized
```
