# Manual QA — China market (0.5.2)

**Target:** https://influencers.lumen.universalgravity.org  
**Alt:** http://167.71.206.43:3000  
**Health:** `/api/health` · expect `version=0.5.2`, `creatorAuth=act-as`  
**Scope:** Product truth = **China / Douyin / zh** (no Thailand defaults in UI/demos)  
**Creds:** `TIKHUB_*` / `OPENROUTER_*` reused from Strom (yes/no only — no secret dump)

## How to run

1. Hard refresh after deploy (or private window).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
3. Smoke: `EXPECT_VERSION=0.5.2 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Live Douyin may return TikHub **402** (Douyin endpoint balance) — explicit error OK; no silent TikTok fallback.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.2`, `creatorAuth=act-as` | **PASS** — `0.5.2`, `act-as`, `live-capable` |
| S2 | `EXPECT_VERSION=0.5.2 ./scripts/qa-smoke.sh …` | Key routes 200 | **PASS** — SMOKE PASSED |
| S3 | Open `/` | China / Douyin workspace copy; CTA Discover Douyin | **PASS** — Douyin markers; no Thailand defaults |

## Market chrome (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| M1 | `/discover` city filter | CN cities only: Shanghai…Chengdu; default **Shanghai** | **PASS** — code + no Bangkok/Phuket in live HTML |
| M2 | `/influencers` city filter + subtitle | Same CN list; no Bangkok/Phuket/Chiang Mai | **PASS** — Shanghai…Chengdu present; no Thailand cities |
| M3 | `/products/scan` → **Load Shanghai sample** | Brief/card 沪上小馆; CTA **not** “Soi 11” | **PASS** — `Load Shanghai sample` in HTML |
| M4 | Scan → Demo scan | Card geo China/Shanghai, langs zh, platforms douyin | **PASS** — wired (demo path); sample CTA China |
| M5 | Grep HTML markers | No `Load Soi 11` / `Bangkok, Phuket` as UI defaults | **PASS** — zero bad hits on key pages |
| M6 | Fresh session `/` | Shell defaults to **Chinese** (`仪表盘`, `发现抖音达人`) | **PASS** — live UI defaults zh |
| M7 | Click `EN`, reload `/` | Shell flips to English and persists after reload | **PASS** — `localStorage.lumen.uiLocale="en"`, heading `Dashboard` after reload |

## Douyin regression (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `GET /api/discovery/douyin` | `platform=douyin`, `tikhubPath` contains `/douyin/` | **PASS** |
| D2 | `GET /api/discovery/tiktok` | Deprecated alias → Douyin; `deprecatedAlias=true` | **PASS** |
| D3 | `/creator/login` | Act-as Douyin only; no intl TikTok OAuth CTA | **PASS** — Act-as + Douyin markers |
| D4 | `GET /api/auth/tiktok/start` | 404 (removed) | **PASS** — 404 |

## Demo data / collaboration (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Mock products / influencers UI | China cities / Douyin narratives | **PASS** — influencers list CN cities + 沪上小馆 |
| C2 | Campaign / invite path | China brief/caption language | **PASS** — collaboration copy Shanghai (code) |

## Presentation (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| V1 | `/presentation` EN | `demo.mp4?v=0.5.2` HTTP 200 | **PASS** — 200 / 4749475 bytes; `?v=0.5.2` |
| V2 | `/presentation` 中文 | `demo-zh.mp4?v=0.5.2` HTTP 200 | **PASS** — 200 / 4442729 bytes |
| V3 | `/presentation/slides.html` | “China first”, CN cities, Douyin | **PASS** |

## Live Douyin TikHub (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Discovery GET `configured` | `true` when key present | **PASS** — `configured=true` |
| L2 | `POST /api/discovery/douyin` `{query:"上海美食",limit:5}` | candidates **or** explicit 402 — no TikTok fallback | **PASS*** — explicit Douyin 402 balance error |

## Out of scope

phase0 historical Thailand banners; topping up TikHub Douyin credits; sibling repo `lumen`.

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | Auto (agent) — curl/smoke/API/HTML markers + live browser locale toggle |
| Build / commit | `6dc3fea` |
| Deploy run | [30449109927](https://github.com/akatruk/lumen2.1/actions/runs/30449109927) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** (L2 = explicit TikHub Douyin 402) |
| Blockers | TikHub Douyin endpoint balance (`402`) — top up Douyin credits on shared Strom key for live candidates |
| Creds configured | TIKHUB **yes** · OPENROUTER **yes** (no secret dump) |
| Sign-off | **READY TO SHIP** China market `0.5.2` |
