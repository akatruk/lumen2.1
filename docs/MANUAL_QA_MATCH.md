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
| S1 | `GET /api/health` | `version=0.5.8` | |
| S2 | `EXPECT_VERSION=0.5.8 ./scripts/qa-smoke.sh …` | SMOKE PASSED | |

## Lumen-like manual product (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| L1 | Create/open product: description *Platform that uses AI to analyze the script of viral social media videos*; audience *Business that wants to make viral videos*; geo China; languages Chinese; benefits *AI social media*; category empty/General | After enrich: category **Technology**; topics include viral/script/ai/content | |
| L2 | Suggested influencers | **Alex Chen**, **Wei Fang**, and/or **Nora Li** at top with scores; each row shows **Why:** niche hits | |
| L3 | Same list | **Zhang Wei / Elena Petrova** absent | |
| L4 | Subtitle under Suggested | Shows matched topics (viral / script / tech…), not only “Catalog rank for this product” | |

## Catalog seeds (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Open **Lumen Script AI** (`prod-7`) Suggested | Nora / Wei / Alex; Why: viral/script/ai… | |
| C2 | Open **Lumen Cloud Ops Suite** (`prod-6`) Suggested | Tech creators; RE absent | |
| C3 | Open **Riverside Bund Residences** (`prod-1`) Suggested | Zhang / Elena; Alex not dominating | |

## Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Food product Suggested | Food KOLs, not tech-only | |
| R2 | Languages field “Chinese” on product | Treated as `zh` for lang overlap | |
| R3 | `ai` must not match inside `Shanghai's` | No false tech niche from geo copy | |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| Blockers | |
| Sign-off | |
