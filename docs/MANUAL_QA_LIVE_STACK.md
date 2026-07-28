# Manual QA — Live TikHub / LLM scan / Auth+DB (0.4.0)

**Default:** demo (no keys). **Live:** set env on droplet + rebuild for `NEXT_PUBLIC_*`.

## Enable live on droplet

Prefer GitHub → repo **Secrets** / **Variables** (Deploy workflow writes `/opt/lumen-marketplace/.env`):

| Kind | Name | Example |
| --- | --- | --- |
| secret | `TIKHUB_API_KEY` | TikHub token |
| secret | `OPENROUTER_API_KEY` | OpenRouter key |
| secret | `AUTH_SECRET` | long random |
| var | `DISCOVERY_MODE` | `live` |
| var | `PRODUCT_SCAN_MODE` | `live` |
| var | `NEXT_PUBLIC_DISCOVERY_MODE` | `live` (needs rebuild) |
| var | `NEXT_PUBLIC_PRODUCT_SCAN_MODE` | `live` (needs rebuild) |

Or hand-write `/opt/lumen-marketplace/.env` then `docker compose up --build -d`.

Rebuild required for `NEXT_PUBLIC_*` (baked at build). Server keys can change at runtime without rebuild.

## Checks

| ID | Steps | Expected |
| --- | --- | --- |
| H1 | GET /api/health | version 0.4.0 |
| D1 | GET /api/discovery/tiktok | mode + configured |
| D2 | demo Discover search | Demo connector works |
| D3 | live + key: bangkok food | Real handles, source tikhub |
| S1 | demo Product scan Soi 11 | demo-scan card |
| S2 | live + OpenRouter key | live-scan card |
| A1 | /login register | cookie session |
| A2 | scan save while logged in | row in /api/products |
| A3 | logout | 401 on /api/products |
| A4 | HTTP demo: no `COOKIE_SECURE` | Set-Cookie without Secure; session sticks |
