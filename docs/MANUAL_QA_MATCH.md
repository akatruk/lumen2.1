# Manual QA — Lumen / tech topical match (0.5.8)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.8`  
**Scope:** Manual Lumen-like products (sparse category / “Chinese” language / viral-script pitch) must suggest **content-AI / tech** creators with visible niche reasons — not RE KOLs and not “locked” to another product id.  
**Out of scope:** Live TikHub Discover ranking quality beyond hard-fail demote

## How to run

1. Hard refresh or private window after deploy (clear stale `lumen.products` if an old General card lacks topics — Save again or rely on enrich-at-rank).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.8 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Local unit: tsx rank against Lumen-like sparse product + `prod-7` + `prod-1`.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `version=0.5.8` | **PASS** |
| S2 | `EXPECT_VERSION=0.5.8 ./scripts/qa-smoke.sh …` | SMOKE PASSED | **PASS** |

## Lumen-like manual product (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Create/open product: description *Platform that uses AI to analyze the script of viral social media videos*; audience *Business that wants to make viral videos*; geo China; languages Chinese; benefits *AI social media*; category empty/General | After enrich: category **Technology**; topics include viral/script/ai/content | **PASS** — unit enrich |
| L2 | Suggested influencers | **Alex Chen**, **Wei Fang**, and/or **Nora Li** at top with scores; each row shows **Why:** niche hits | **PASS** — unit + prod-7 DOM `原因：` |
| L3 | Same list | **Zhang Wei / Elena Petrova** absent | **PASS** |
| L4 | Subtitle under Suggested | Shows matched topics (viral / script / tech…), not only “Catalog rank for this product” | **PASS** — `匹配维度：…` on prod |

## Catalog seeds (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open **Lumen Script AI** (`prod-7`) Suggested | Nora / Wei / Alex; Why: viral/script/ai… | **PASS** — Chrome headless |
| C2 | Open **Lumen Cloud Ops Suite** (`prod-6`) Suggested | Tech creators; RE absent | **PASS** |
| C3 | Open **Riverside Bund Residences** (`prod-1`) Suggested | Zhang / Elena; Alex not dominating | **PASS** — Zhang 79 / Elena 76; Alex absent |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Food product Suggested | Food KOLs, not tech-only | **PASS** — prod-2 Lin/Chen/Mei |
| R2 | Languages field “Chinese” on product | Treated as `zh` for lang overlap | **PASS** — unit |
| R3 | `ai` must not match inside `Shanghai's` | No false tech niche from geo copy | **PASS** — unit |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | Auto (agent) — curl/smoke + Chrome headless + tsx invariants |
| Build / commit | `cf1edb9` |
| Deploy run | [30538832760](https://github.com/akatruk/lumen2.1/actions/runs/30538832760) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** |
| Blockers | none |
| Sign-off | **READY TO SHIP** Lumen tech match `0.5.8` |
