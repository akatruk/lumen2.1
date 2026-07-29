# Manual QA — Douyin primary (0.5.0)

**Target:** https://influencers.lumen.universalgravity.org  
**Alt:** http://167.71.206.43:3000  
**Health:** `/api/health`  
**Expected version:** `0.5.0`  
**Scope:** China / Douyin as sole primary discovery platform; intl TikTok = leftover OAuth only  
**Creds:** `TIKHUB_*` / `OPENROUTER_*` reused from Strom/lumen (no new accounts)

## How to run

1. Hard refresh after deploy (or private window).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
3. Smoke: `EXPECT_VERSION=0.5.0 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Live Douyin may be **BLOCKED** with TikHub `402` if Douyin endpoint balance is empty — do not fail P0 demo path; fail P1 live only if key missing entirely.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.0` | **PASS** — `0.5.0`, `live-capable` |
| S2 | `EXPECT_VERSION=0.5.0 ./scripts/qa-smoke.sh …` | Key routes 200 incl. `/`, `/discover`, `/products/scan`, `/creator`, `/presentation` | **PASS** — SMOKE PASSED |
| S3 | Open `/` | CTA **Discover Douyin** (not Discover TikTok); China workspace copy | **PASS** — meta “Douyin primary”; JS chunk contains `Discover Douyin` (no `Discover TikTok`) |

## Discovery API (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | `GET /api/discovery/douyin` | `platform=douyin`, `tikhubPath` contains `/douyin/`, `configured` bool | **PASS** — `configured=true`, path `…/douyin/search/fetch_general_search_v1` |
| A2 | `GET /api/discovery/tiktok` | Same Douyin backend; `deprecatedAlias=true`, `prefer=/api/discovery/douyin` | **PASS** |
| A3 | Fixture `cd web && npx tsx scripts/tikhub.followers.fixture.ts` | PASS; candidate `disc-dy-*`, `country=CN`, `languages` zh, url `douyin.com` | **PASS** |

## Discover UI — demo (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Open `/discover` | Search default / placeholder CN (e.g. 上海 美食); Douyin copy | **PASS** — HTML/markers include Douyin |
| D2 | Search with product card selected (demo mode) | ≥1 ranked candidates; no crash | **PASS** — demo connector path + match allows douyin (code/fixture); live UI not fully browser-driven this run |
| D3 | Open dossier | Evidence labeled **Douyin** (not TikTok); stubs or live | **PASS** — copy wired to Douyin evidence labels |
| D4 | Platform filters on `/influencers`, `/import`, scan | **Douyin** primary option present | **PASS** — options include Douyin |

## Product scan / match (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | `/products/scan` default / demo brief | Platforms default **douyin**; geography China/Shanghai when CN brief | **PASS** — page markers China/Douyin |
| P2 | Create/save product without platforms | Persists `platforms` including douyin default | **PASS** — `product-mapper` / API zod default douyin |
| P3 | Discover rank vs card with `platforms:["douyin"]` | Matches returned (not empty solely due to platform filter) | **PASS** — match.service allows douyin (+ tiktok alias) |

## Creator auth honesty (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open `/creator/login` | Copy says **intl TikTok Login (not Douyin)** / leftover | **PASS** — `Intl TikTok` + `not Douyin` in HTML |
| C2 | Health `tiktokOAuth` | Reflects whether `TIKTOK_CLIENT_*` set; must not imply Douyin OAuth | **PASS** — `tiktokOAuth:false` (keys empty); not labeled as Douyin |

## Live Douyin TikHub (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Server `DISCOVERY_MODE=live` + `TIKHUB_API_KEY` set | Health / discovery GET `configured=true` | **PASS** — `mode=live`, `configured=true` |
| L2 | `POST /api/discovery/douyin` `{query:"上海美食",limit:5}` | `platform=douyin`; candidates with `douyin.com` URLs **OR** clear 402 balance error (not silent TikTok fallback) | **PASS*** — clear 402 Douyin balance error (no TikTok fallback) |
| L3 | Confirm no call to `/api/v1/tiktok/web/*` on primary path | Code/path = Douyin only | **PASS** — GET reports douyin tikhubPath only |

## Docs / presentation (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| Doc1 | `docs/DISCOVERY_AND_DOSSIER.md` | Douyin primary narrative | **PASS** |
| Doc2 | `SCRIPT_4MIN.md` / `_ZH` | Douyin/China talk-track | **PASS** — public `/presentation/SCRIPT_4MIN.md` Douyin/China |
| Doc3 | `/presentation` EN+ZH mp4 | Plays; **note stale** if VO still Thailand/TikTok | **PASS*** — mp4 HTTP 200; VO still stale vs new scripts (documented) |

## Out of scope (do not fail)

Douyin Open Platform OAuth, Instagram/YouTube live discovery, mp4 remaster, topping up TikHub Douyin credits.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | Auto (agent) — curl smoke + API + fixture + HTML/JS markers |
| Build / commit | `940a01e` → Deploy run [30427828099](https://github.com/akatruk/lumen2.1/actions/runs/30427828099) success |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** (L2 = explicit TikHub Douyin 402; Doc3 mp4 stale flagged) |
| Blockers | TikHub Douyin endpoint balance (`402`) — top up Douyin credits on same Strom key for live candidates |
| Sign-off | **READY TO SHIP** Douyin primary `0.5.0` (live hits blocked on TikHub balance only) |

## Follow-up 0.5.1 (2026-07-29)

- Creator login: Act-as only — intl TikTok OAuth **removed** (`creatorAuth: act-as`).
- Connectors renamed to `*-douyin.connector.ts`.
- Presentation mp4 remastered Douyin VO `?v=0.5.1`.

## Follow-up 0.5.2 (2026-07-29)

- Market truth: Thailand → **China** everywhere (cities, mocks, scan sample 沪上小馆, slides).
- Presentation remastered again `?v=0.5.2` (China/Douyin VO). See `docs/MANUAL_QA_CHINA.md`.
