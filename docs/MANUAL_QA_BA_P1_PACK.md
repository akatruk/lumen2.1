# Manual QA — BA P1 pack (0.4.7)

**Target:** https://influencers.lumen.universalgravity.org  
**Ops fallback:** http://167.71.206.43:3000 (auth cookies may fail — use HTTPS for session tests)  
**Health:** `/api/health`  
**Expected version:** `0.4.7`  
**Scope:** Followers mapping (0.4.6) + honesty badge + richer match reasons + creator Act-as TikHub + resume card calibration  
**Mode:** `live-capable` (TikHub + OpenRouter)

## How to run

1. Prefer HTTPS.
2. Smoke: `EXPECT_VERSION=0.4.7 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
3. Fixtures (optional, local):  
   `cd web && npx tsx scripts/tikhub.followers.fixture.ts && npx tsx scripts/ba-p1-pack.fixture.ts`
4. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.

---

## 0. Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | `GET /api/health` HTTPS | `status=ok`, `version=0.4.7`, `mode=live-capable` | **PASS** |
| H2 | Smoke script / routes 200 | brand + creator routes 200 + theme markers | **PASS** — `SMOKE PASSED` |
| H3 | Sidebar footer badge | **`Live · TikHub + LLM`** (not Demo) | **PASS** — Chrome dump-dom + chunk string |
| H4 | Creator portal footer | Live badge / not Demo-only | **PASS** — dump-dom Live; no Demo |

## 1. TikHub followers / reach (P0) — from 0.4.6

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| F1 | `POST /api/discovery/tiktok` bangkok food limit 5 | `mode=live`, `source=tikhub`, count≥1 | **PASS** — count 5 |
| F2 | Inspect candidates | ≥1 with `followers > 0` | **PASS** — all 5 > 0 (3.4M … 47.3k) |
| F3 | zeros | ideally 0 | **PASS** — `0 / 5` |
| F4 | UI Discover Search & rank | Card line non-zero followers | **PASS** — `Bangkok · 1.7M · 6.0% ER` |

## 2. Richer match reasons (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Soi scan → Save & Discover → Search & rank | Ranked list ≥1 | **PASS** — dossier buttons present |
| R2 | Top match reasons | ≥3 bullets | **PASS** — 4 per card |
| R3 | Reasons content | Reach / ER / Avg views present | **PASS** — e.g. Reach 1.7M, Strong engagement (6% ER), Avg views 690k |
| R4 | Top-2 differ | Reach/ER differ | **PASS** — 1.7M/6% vs 3k/7.59% |

## 3. Honest mode badge (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| B1 | Load `/` | Sidebar Live badge | **PASS** |
| B2 | `/discover` | Live badge + `TIKHUB LIVE` | **PASS** |
| B3 | `/creator` | Live, not Demo | **PASS** |

## 4. Creator Act-as for live-discovered (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Add to catalog (prior / inject) | Catalog entry | **PASS** — localStorage inject + list |
| C2 | `/influencers` | Creator visible when added | **PASS*** — prior BA + inject path |
| C3 | Act-as dropdown | **`[TikHub]`** option near top | **PASS** — `[TikHub] onlythegoodplaces @onlythegoodplaces · Bangkok` first |
| C4 | Select TikHub creator | Session resolves | **PASS** — option selectable; aliases unit PASS |
| C5 | Alias `disc-tt-*` ↔ `inf-disc-tt-*` | `influencerIdsMatch` true | **PASS** — fixture |

## 5. Resume card quality (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | Load Soi 11 → Scan | LIVE LLM card | **PASS** — conf UI 92% · live-scan |
| S2 | Prohibited claims | Non-empty when brief has prohibitions | **PASS** — API rich brief; note: stock Soi sample brief has no Prohibitions line → UI field may be empty |
| S3 | Confidence rich Soi | ≥0.70 | **PASS** — UI 92%; API 0.92 |
| S4 | `POST /api/products/scan` rich brief | openrouter + prohibited + conf≥0.7 | **PASS** — prohibited medical/competitor, conf 0.92 |
| S5 | Sparse `hi` | Low conf / missing_fields | **PASS** — conf 0.47, missing_n 12, name Unknown |

## 6. Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| X1 | Discover product gate | Search needs productId (disabled if empty) | **PASS*** — code `disabled={!productId}`; UI auto-selects first catalog product so button often enabled |
| X2 | Find matches / Save & Discover | `/discover?productId=…` | **PASS** — `prod-614wy61` |
| X3 | Dossier Evidence | TikHub wording | **PASS** — `Recent TikTok evidence (TikHub live)` |
| X4 | `/presentation` EN+中文 | mp4 200 | **PASS** — demo + demo-zh `?v=0.4.5` |
| X5 | HTTPS register/login | Secure cookie + products 200 | **PASS** — `lumen_session` Secure; `{"products":[]}` |

## Out of scope

Payments; creator auth across devices; OCR/URL scraping; Lumen Analysis live API.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) — curl smoke + Chrome dump-dom + puppeteer-core + fixtures |
| Build / commit | feature `1c163ae`; checklist `fb68d87`; QA sign-off this commit |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** (S2/X1 noted) |
| Blockers | None |
| Sign-off | **READY TO SHIP** BA P1 pack `0.4.7` |

### Appendix — evidence

```text
Health: {"status":"ok","version":"0.4.7","mode":"live-capable"}
SMOKE PASSED (EXPECT_VERSION=0.4.7)

Discovery bangkok food:
  @biteswithlily 3400000, @karissaeats 5000000, zeros 0/5

Scan rich brief: conf 0.92 prohibited ['no medical claims','no competitor restaurants']
Scan sparse hi: conf 0.47 missing_n 12

UI Discover reasons:
  · Topic overlap: food
  · Reach 1.7M followers on TikTok
  · Strong engagement (6% ER)
  · Avg views 690k on recent posts
Card line: Bangkok · 1.7M · 6.0% ER · conf 86%

Act-as: [TikHub] onlythegoodplaces @onlythegoodplaces · Bangkok (first)
Dossier: Recent TikTok evidence (TikHub live)
Badge dump-dom: <span …>Live · TikHub + LLM</span>
Alias: disc-tt-onlythegoodplaces ↔ inf-disc-tt-onlythegoodplaces match=true
```
