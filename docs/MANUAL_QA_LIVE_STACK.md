# Manual QA — Live TikHub / LLM scan / Auth+DB (0.4.0)

**Default:** demo (no keys). **Live:** set env on droplet + rebuild for `NEXT_PUBLIC_*`.

## Enable live on droplet

```bash
# /opt/lumen-marketplace/.env (or export before compose)
DISCOVERY_MODE=live
PRODUCT_SCAN_MODE=live
NEXT_PUBLIC_DISCOVERY_MODE=live
NEXT_PUBLIC_PRODUCT_SCAN_MODE=live
TIKHUB_API_KEY=...
OPENROUTER_API_KEY=...
AUTH_SECRET=long-random
DATABASE_URL=file:/app/data/lumen.db
```

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
