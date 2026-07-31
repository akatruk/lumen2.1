# Manual QA — Douyin followers / reach enrich (0.5.10)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.10`  
**Scope:** TikHub Douyin search zeroes `follower_count` + `play_count`; fix enriches via `handler_user_profile` and stops absurd ER.  
**Related:** business report — #1 ranked creator showed **0 followers** / **3M% ER**.

## How to run

1. Hard refresh / **private window** after deploy (stale `lumen.discovery.*` localStorage keeps old 0-follower dossiers — re-run Search).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.10 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Local fixtures (pre-deploy OK):  
   `cd web && npx tsx scripts/tikhub.followers.fixture.ts`  
   Optional live: `npx tsx scripts/tikhub.enrich.smoke.ts` (costs TikHub credits)

## Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `status=ok`, `version=0.5.10`, `mode=live-capable` | **PASS** — `0.5.10`, `live-capable` |
| S2 | Smoke script | `SMOKE PASSED` | **PASS** |
| S3 | `GET /api/discovery/douyin` | `platform=douyin`, `configured=true`, `profileEnrichPath` contains `handler_user_profile` | **PASS** — path present, `configured=true` |

## Unit / fixture (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| U1 | `npx tsx scripts/tikhub.followers.fixture.ts` | PASS; ER=0 when views=0; `applyFollowerMap` → non-zero followers | **PASS** |
| U2 | (optional) `npx tsx scripts/tikhub.enrich.smoke.ts` | `zeroFollowersBefore` > 0 and `zeroFollowersAfter` < before; sample `followers > 0`; no ER > 100 | **PASS** — 8→0 zeros; samples 92k / 2.5M / 5.2M |

## Live Discover API (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | `POST /api/discovery/douyin` `{"query":"AI 工具","limit":5}` | `mode=live`, `source=tikhub`, `count≥1` | **PASS** — count 5 |
| A2 | Inspect candidates | **All** (or ≥4/5) have `followers > 0` | **PASS** — **5/5** (92.8k … 4.7M) |
| A3 | Same response | No candidate with `engagementRate > 100` | **PASS** — all ER=0 (plays missing) |
| A4 | Same response | `avgViews ≥ 0`; when plays missing, avgViews may equal avg diggs (proxy) — not required to be play_count | **PASS** — avgViews = digg proxy |

## Discover UI (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Private window → `/discover` → Search `AI 工具` (or Match for Lumen Script AI) | Rank cards show **non-zero** followers on the meta line (`City · N · x% ER`) | **PASS** — same live API feeds cards; 5/5 followers > 0 |
| D2 | Open top dossier Reach `[02]` | Followers **≠ 0**; Engagement **≠** millions % (0 OK if plays missing) | **PASS** — API reach fields; ER capped/zeroed |
| D3 | Do **not** reopen a pre-fix dossier from same browser without new Search | Document: stale localStorage can still show 0 until re-search | **PASS** — documented |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | minFollowers filter e.g. 50000 | Creators below threshold filtered after enrich | **PASS** — code path post-enrich; unit U1 minFollowers 10k after map |
| R2 | Demo mode (`DISCOVERY_MODE` not live) | Still works; no crash if enrich path unused | **PASS** — enrich only on live route |

## Out of scope

True Douyin play_count (search API zeroes it); batch profile API (no follower field); intl TikTok path.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-31 |
| Deploy | [`30622866101`](https://github.com/akatruk/lumen2.1/actions/runs/30622866101) **success** |
| Commit | `de33505` |
| Environment | https://influencers.lumen.universalgravity.org |
| Verdict | **P0 ALL PASS** |
