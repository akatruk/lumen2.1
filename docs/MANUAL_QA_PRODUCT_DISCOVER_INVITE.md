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
| S1 | `GET /api/health` | `0.5.9` | |
| S2 | Smoke script | PASSED | |

## Product picker / invite (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | Open catalog tech creator (e.g. Wei Fang `/influencers/inf-14`) | **Product** dropdown present; includes **Lumen Script AI** / Lumen Cloud Ops | |
| I2 | Select Lumen Script AI | Campaign auto-links / creates; invite preview mentions product | |
| I3 | Suitable products card | Niche-matched Lumen products (not empty after hydrate) | |

## Discover niche (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Discover → Match for **Lumen Script AI** (`prod-7`) | Query defaults to tech Chinese keywords (科技 AI…), topic tech — **not** 上海 美食 | |
| D2 | Search & rank | Travel-only bios (hotels/travel tips) **absent** from ranked list (hard-drop) | |
| D3 | If raw hits > 0 and all travel | Message: no niche matches | |

## Unit invariants (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| U1 | Victoria travel bio + stamped topics tech | Dropped by `rankCandidatesForCard` vs prod-7 | |
| U2 | Alex AI-tools bio + stamped travel topics | Kept / high score | |
| U3 | `eat` inside `creator` | Must **not** infer food | |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Deploy run | |
| P0 summary | |
| Sign-off | |
