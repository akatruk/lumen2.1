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
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.2`, `creatorAuth=act-as` | |
| S2 | `EXPECT_VERSION=0.5.2 ./scripts/qa-smoke.sh …` | Key routes 200 | |
| S3 | Open `/` | China / Douyin workspace copy; CTA Discover Douyin | |

## Market chrome (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| M1 | `/discover` city filter | CN cities only: Shanghai, Beijing, Guangzhou, Shenzhen, Hangzhou, Chengdu; default **Shanghai** | |
| M2 | `/influencers` city filter + subtitle | Same CN list; no Bangkok/Phuket/Chiang Mai | |
| M3 | `/products/scan` → **Load Shanghai sample** | Brief/card 沪上小馆 / 东岸厨房 / Shanghai; CTA **not** “Soi 11” | |
| M4 | Scan → Demo scan | Card geo China/Shanghai, langs zh, platforms douyin, conf high | |
| M5 | Grep HTML/JS markers | No `Load Soi 11` / `Bangkok, Phuket` as UI defaults | |

## Douyin regression (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | `GET /api/discovery/douyin` | `platform=douyin`, `tikhubPath` contains `/douyin/` | |
| D2 | `GET /api/discovery/tiktok` | Deprecated alias → same Douyin; `deprecatedAlias=true` | |
| D3 | `/creator/login` | Act-as Douyin only; **no** intl TikTok OAuth CTA / routes | |
| D4 | `GET /api/auth/tiktok/start` | 404 (removed) | |

## Demo data / collaboration (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Mock products / influencers UI | China cities, ¥ / Douyin narratives (not Soi 11 / Move Thailand) | |
| C2 | Campaign / invite path if seeded | China brief/caption language | |

## Presentation (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| V1 | `/presentation` EN | `demo.mp4?v=0.5.2` HTTP 200; VO China/Douyin | |
| V2 | `/presentation` 中文 | `demo-zh.mp4?v=0.5.2` HTTP 200 | |
| V3 | `/presentation/slides.html` | “China first”, CN cities, Douyin | |

## Live Douyin TikHub (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Discovery GET `configured` | `true` when key present | |
| L2 | `POST /api/discovery/douyin` `{query:"上海美食",limit:5}` | candidates **or** explicit 402 balance — no TikTok fallback | |

## Out of scope

phase0 historical Thailand banners; topping up TikHub Douyin credits; sibling repo `lumen`.

---

## Pre-ship execution log (local)

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | Auto (agent) |
| Build | local `tsc` + `npm run build` green |
| Notes | Pre-ship checklist authored; live results filled after deploy |

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Creds configured | TIKHUB / OPENROUTER: (yes/no only) |
| Sign-off | |
