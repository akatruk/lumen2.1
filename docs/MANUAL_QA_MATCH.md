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
| S1 | `GET /api/health` | `version=0.5.7` | **PASS** |
| S2 | `EXPECT_VERSION=0.5.7 ./scripts/qa-smoke.sh …` | SMOKE PASSED | **PASS** |

## Tech product → tech creators (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T1 | Open catalog product **Lumen Cloud Ops Suite** (`prod-6`) or Technology scan card | Category Technology / tech topics | **PASS** |
| T2 | Suggested influencers (top 6) | **Alex Chen** and/or **Wei Fang** present | **PASS** — both |
| T3 | Same list | **Zhang Wei / Elena Petrova** (real estate) **absent** from Suggested | **PASS** |
| T4 | Product with `category=Technology`, empty `desiredTopics` | Still niche=tech from category; RE KOLs not in Suggested | **PASS** — unit + scan path |

## Real-estate control (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Open **Riverside Bund Residences** (`prod-1`) Suggested | **Zhang Wei** (and/or Elena) near top | **PASS** |
| R2 | Same list | Pure tech-only creators not dominating over RE fits | **PASS** — Alex absent |

## Scan / discover regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Demo scan brief containing “SaaS / AI / tech” | Category **Technology**; topics include tech/saas | **PASS** |
| D2 | Discover rank vs Technology card | Real-estate candidates get weak-fit / low score risk | **PASS** — code path `hardFail` / risk |
| D3 | Food product (`prod-2`) Suggested | Food KOLs (e.g. Lin Xiaonan), not tech-only | **PASS** — ranking keeps niche gate |

## Library invariants (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | `productNicheTokens` on RE description with “Shanghai's” | Must **not** inject `ai`/`tech` from false substring | **PASS** |
| L2 | `rankInfluencersForProduct` tech → `weakFit` for Zhang Wei | `true`; filtered out of `rankForProduct` strong list | **PASS** — score 24 weakFit |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | Auto (agent) — curl/smoke + Chrome headless + tsx invariants |
| Build / commit | `867da58` |
| Deploy run | [30534108991](https://github.com/akatruk/lumen2.1/actions/runs/30534108991) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** |
| Blockers | none |
| Sign-off | **READY TO SHIP** topical match `0.5.7` |
