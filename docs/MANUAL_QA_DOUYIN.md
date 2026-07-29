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
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.5.0` | |
| S2 | `EXPECT_VERSION=0.5.0 ./scripts/qa-smoke.sh …` | Key routes 200 incl. `/`, `/discover`, `/products/scan`, `/creator`, `/presentation` | |
| S3 | Open `/` | CTA **Discover Douyin** (not Discover TikTok); China workspace copy | |

## Discovery API (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | `GET /api/discovery/douyin` | `platform=douyin`, `tikhubPath` contains `/douyin/`, `configured` bool | |
| A2 | `GET /api/discovery/tiktok` | Same Douyin backend; `deprecatedAlias=true`, `prefer=/api/discovery/douyin` | |
| A3 | Fixture `cd web && npx tsx scripts/tikhub.followers.fixture.ts` | PASS; candidate `disc-dy-*`, `country=CN`, `languages` zh, url `douyin.com` | |

## Discover UI — demo (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Open `/discover` | Search default / placeholder CN (e.g. 上海 美食); Douyin copy | |
| D2 | Search with product card selected (demo mode) | ≥1 ranked candidates; no crash | |
| D3 | Open dossier | Evidence labeled **Douyin** (not TikTok); stubs or live | |
| D4 | Platform filters on `/influencers`, `/import`, scan | **Douyin** primary option present | |

## Product scan / match (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | `/products/scan` default / demo brief | Platforms default **douyin**; geography China/Shanghai when CN brief | |
| P2 | Create/save product without platforms | Persists `platforms` including douyin default | |
| P3 | Discover rank vs card with `platforms:["douyin"]` | Matches returned (not empty solely due to platform filter) | |

## Creator auth honesty (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open `/creator/login` | Copy says **intl TikTok Login (not Douyin)** / leftover | |
| C2 | Health `tiktokOAuth` | Reflects whether `TIKTOK_CLIENT_*` set; must not imply Douyin OAuth | |

## Live Douyin TikHub (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Server `DISCOVERY_MODE=live` + `TIKHUB_API_KEY` set | Health / discovery GET `configured=true` | |
| L2 | `POST /api/discovery/douyin` `{query:"上海美食",limit:5}` | `platform=douyin`; candidates with `douyin.com` URLs **OR** clear 402 balance error (not silent TikTok fallback) | |
| L3 | Confirm no call to `/api/v1/tiktok/web/*` on primary path | Code/path = Douyin only | |

## Docs / presentation (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| Doc1 | `docs/DISCOVERY_AND_DOSSIER.md` | Douyin primary narrative | |
| Doc2 | `SCRIPT_4MIN.md` / `_ZH` | Douyin/China talk-track | |
| Doc3 | `/presentation` EN+ZH mp4 | Plays; **note stale** if VO still Thailand/TikTok | |

## Out of scope (do not fail)

Douyin Open Platform OAuth, Instagram/YouTube live discovery, mp4 remaster, topping up TikHub Douyin credits.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | |
| Build / commit | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |
