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
| H1 | `GET /api/health` HTTPS | `status=ok`, `version=0.4.7`, `mode=live-capable` | |
| H2 | Smoke script / routes 200 | `/`, `/products/scan`, `/discover`, `/influencers`, `/creator`, `/presentation`, `/reviews` | |
| H3 | Sidebar footer badge | Text contains **`Live · TikHub + LLM`** (not `Demo · mock data`) | |
| H4 | Creator portal footer | Same live badge (or equivalent), not Demo | |

## 1. TikHub followers / reach (P0) — from 0.4.6

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| F1 | `POST /api/discovery/tiktok` `{query:"bangkok food",limit:5}` | `mode=live`, `source=tikhub`, `count≥1` | |
| F2 | Inspect candidates | **≥1** candidate with `followers > 0` | |
| F3 | zeros | zeros among returned set ideally **0**; if any zero, note handle | |
| F4 | UI Discover → Search & rank (any product card) | Card line shows non-zero followers (not `Bangkok · 0 ·`) | |

## 2. Richer match reasons (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Save Soi 11 / open Discover with `productId` → Search & rank | Ranked list ≥1 | |
| R2 | Open top match card reasons | **≥3** bullets visible (UI allows 4) | |
| R3 | Reasons content | Includes at least one of: Reach / ER / Avg views (not only Topic+Geo) | |
| R4 | Compare top-2 creators | Reach or ER numbers **differ** between cards when follower/ER differ | |

## 3. Honest mode badge (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| B1 | Load `/` dark UI | Sidebar: `Live · TikHub + LLM` | |
| B2 | Load `/discover` | Badge still Live; page may also show `TIKHUB LIVE` | |
| B3 | Load `/creator` | Live badge present; no conflicting Demo-only label as sole status | |

## 4. Creator Act-as for live-discovered (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Discover → Open dossier → **Add to catalog** | Button → Already in catalog | |
| C2 | `/influencers` | Creator appears (e.g. handle visible) | |
| C3 | `/creator` Act-as dropdown | Option labeled **`[TikHub]`** with name/handle near top | |
| C4 | Select TikHub creator | Session shows “live catalog” / name matches | |
| C5 | Alias check (API/UI) | Invite with `disc-tt-*` or catalog `inf-disc-tt-*` resolves via `getInfluencer` / invitations filter | |

## 5. Resume card quality (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `/products/scan` → Load Soi 11 sample → Scan | Badge LIVE LLM; card fields filled | |
| S2 | Prohibited claims | Non-empty; includes medical / competitor style prohibitions from brief | |
| S3 | Confidence | **≥ 0.70** for rich Soi sample (not stuck ~0.4) | |
| S4 | `POST /api/products/scan` rich brief | `source=openrouter`, `prohibited_claims` non-empty, `confidence≥0.7` | |
| S5 | Sparse `briefText=hi` | Low confidence / many `missing_fields`; not Soi11 path | |

## 6. Regression (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| X1 | Discover without product | Search & rank **disabled** | |
| X2 | Product detail → Find matches | `/discover?productId=…` | |
| X3 | Dossier Evidence subtitle | TikHub source → not “demo connector” wording | |
| X4 | `/presentation` EN + 中文 | Videos `?v=0.4.5` (or current) load | |
| X5 | HTTPS register/login | Cookie Secure; `/api/products` 200 when authed | |

## Out of scope

Payments; creator auth across devices; OCR/URL scraping; Lumen Analysis live API.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Environment | |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Appendix — paste evidence

```text
(health JSON, discovery followers sample, scan confidence/prohibited, Act-as option text)
```
