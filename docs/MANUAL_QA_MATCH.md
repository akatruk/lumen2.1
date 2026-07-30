# Manual QA — Product↔influencer topical match (0.5.7)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.7`  
**Scope:** Suggested influencers / catalog rank must follow product **category + niche topics** (not global demo score + China geo)  
**Out of scope:** Live TikHub Discover ranking quality beyond hard-fail demote

## How to run

1. Hard refresh or private window after deploy (clear `lumen.products` / reset demo if stale).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.7 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Optional unit check (local): `npx tsx` rank script against `prod-6` / Technology scan card.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `version=0.5.7` | |
| S2 | `EXPECT_VERSION=0.5.7 ./scripts/qa-smoke.sh …` | SMOKE PASSED | |

## Tech product → tech creators (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T1 | Open catalog product **Lumen Cloud Ops Suite** (`prod-6`) or Technology scan card | Category Technology / tech topics | |
| T2 | Suggested influencers (top 6) | **Alex Chen** and/or **Wei Fang** present | |
| T3 | Same list | **Zhang Wei / Elena Petrova** (real estate) **absent** from Suggested | |
| T4 | Product with `category=Technology`, empty `desiredTopics` | Still niche=tech from category; RE KOLs not in Suggested | |

## Real-estate control (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Open **Riverside Bund Residences** (`prod-1`) Suggested | **Zhang Wei** (and/or Elena) near top | |
| R2 | Same list | Pure tech-only creators not dominating over RE fits | |

## Scan / discover regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Demo scan brief containing “SaaS / AI / tech” | Category **Technology**; topics include tech/saas | |
| D2 | Discover rank vs Technology card | Real-estate candidates get weak-fit / low score risk | |
| D3 | Food product (`prod-2`) Suggested | Food KOLs (e.g. Lin Xiaonan), not tech-only | |

## Library invariants (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | `productNicheTokens` on RE description with “Shanghai's” | Must **not** inject `ai`/`tech` from false substring | |
| L2 | `rankInfluencersForProduct` tech → `weakFit` for Zhang Wei | `true`; filtered out of `rankForProduct` strong list | |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | |
| Build / commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |
