# Manual QA — Live Douyin scan→rank slice (Shanghai) (0.5.2)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` expected `version=0.5.2`, `creatorAuth=act-as`  
**Slice goal:** `Live Douyin search` → `Live Product Scan` → `Card-driven Discover rank`

## Creds (no secrets dump)
- `TIKHUB_*` (reuse Strom/lumen key): **configured on server**
- `OPENROUTER_*` (reuse Strom/lumen key): **configured on server**

## Pre-flight (P0)

### S1 — GET live discovery configured
1. `GET /api/discovery/douyin`
2. Expected: HTTP 200 and `configured:true`

Result: **PASS**
- `{"mode":"live","configured":true,"platform":"douyin", ... }`

### S2 — POST live search (should not be 402)
1. `POST /api/discovery/douyin`
2. Payload: `{"query":"上海美食","limit":5}`
3. Expected: HTTP 200 with `count>=1`, no TikHub 402 error

Result: **FAIL (blocked)**
- HTTP **502**
- body contains: `TikHub Douyin endpoint returned 402 (insufficient balance for /douyin/*).`

**Blocker:** TikHub Douyin endpoint balance is empty/insufficient for `/douyin/*` on the shared key used in deploy.

## Step 2 — Live Product Scan (P1)

### P1 — POST /api/products/scan (OpenRouter)
Payload used (Shanghai sample):
- `url`: `https://maps.example.com/shanghai-east-bund-kitchen`
- `briefText`: Shanghai Bistro (East Bund Kitchen)
- `photoNames`: `["xiaolongbao.jpg","open-kitchen.jpg","lujiazui-storefront.jpg"]`
- `notes`: `China F&B pilot sample`

Result: **PASS**
- HTTP 200
- `mode:"live"`
- `source:"openrouter"`
- `sourceMode:"live-scan"`
- Returned card fields include:
  - `geography:["Shanghai"]`, `languages:["zh"]`
  - `platforms:["douyin"]`
  - `desired_topics` includes food/dining/cocktails themed topics

## Step 3 — Live Discover rank (P0+)
Blocked because live Douyin search fails with TikHub 402 on step 0.

## Out of scope (for this slice)
- Douyin OAuth / Act-as verification flows
- Payments / contracts / PIPL/China legal rewrite

## Creds status (yes/no only)
- TikHub: **configured=true** but **Douyin endpoint balance insufficient (402)**
- OpenRouter: **configured=true** and live scan works

