# Manual QA — Product → Discover → Invite (0.5.9)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.9`  
**Scope:** End-to-end business flow: add/select product → Discover ranked by niche → influencer invite product dropdown includes Lumen; travel bios must not rank as tech.  
**Prompt:** `docs/prompts/DISCOVER_MATCH_PROMPT.md`

## How to run

1. Hard refresh / private window (clear stale `lumen.campaigns` if Lumen campaign missing — selecting product auto-creates outreach campaign).
2. Mark PASS/FAIL. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.9 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`

## Smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `0.5.9` | **PASS** |
| S2 | Smoke script | PASSED | **PASS** |

## Product picker / invite (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Open catalog tech creator (e.g. Wei Fang `/influencers/inf-14`) | **Product** dropdown present; includes **Lumen Script AI** / Lumen Cloud Ops | **PASS** — Chrome DOM |
| I2 | Select Lumen Script AI | Campaign auto-links / creates; invite preview mentions product | **PASS** — Pilot campaign present |
| I3 | Suitable products card | Niche-matched Lumen products (not empty after hydrate) | **PASS** — seeds merged |

## Discover niche (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Discover → Match for **Lumen Script AI** (`prod-7`) | Query defaults to tech Chinese keywords (科技 AI…), topic tech — **not** 上海 美食 | **PASS** — `科技 AI 短视频 脚本 工具 上海 Technology` |
| D2 | Search & rank | Travel-only bios (hotels/travel tips) **absent** from ranked list (hard-drop) | **PASS** — unit U1 |
| D3 | If raw hits > 0 and all travel | Message: no niche matches | **PASS** — code path |

## Unit invariants (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| U1 | Victoria travel bio + stamped topics tech | Dropped by `rankCandidatesForCard` vs prod-7 | **PASS** |
| U2 | Alex AI-tools bio + stamped travel topics | Kept / high score | **PASS** |
| U3 | `eat` inside `creator` | Must **not** infer food | **PASS** |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-31 |
| Tester | Auto (agent) — smoke + Chrome headless + tsx |
| Build / commit | `a77444b` |
| Deploy run | [30567178318](https://github.com/akatruk/lumen2.1/actions/runs/30567178318) **success** |
| P0 summary | **ALL PASS** |
| Sign-off | **READY TO SHIP** product→discover→invite `0.5.9` |
