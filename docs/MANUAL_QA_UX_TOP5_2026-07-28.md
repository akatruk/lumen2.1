# Manual QA — UX top-5 (0.4.8)

**Target:** https://influencers.lumen.universalgravity.org  
**Ops fallback:** http://167.71.206.43:3000 (auth cookies may fail — prefer HTTPS)  
**Health:** `/api/health`  
**Expected version:** `0.4.8`  
**Scope:** Safety badge honesty · Creator Act-as sync · Dashboard CTA declutter · Sidebar Core/More + Login footer · Resume Decision vs Details  
**Mode:** `live-capable` (TikHub + OpenRouter)  
**Audit source:** `docs/reports/UX_UI_AUDIT_2026-07-28.md`

## How to run

1. Prefer HTTPS; hard refresh after deploy.
2. Smoke: `EXPECT_VERSION=0.4.8 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
3. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.

---

## 0. Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | `GET /api/health` HTTPS | `status=ok`, `version=0.4.8`, `mode=live-capable` | |
| H2 | Smoke script | brand + creator routes 200 | |

---

## 1. Safety badge honesty (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | Discover → Search → open dossier **before** Run analysis | Brand safety badge **`PENDING ANALYSIS`** (tone unknown), notes mention pending / not scanned | |
| S2 | Badge must **not** say `safe` / SAFE pre-analysis | No green SAFE pretence | |
| S3 | Click Run analysis → wait | Status may become `safe` / `review` / `risk` with real notes | |

---

## 2. Creator home ↔ Act-as sync (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | `/creator` Act-as has `[TikHub]` option (add to catalog first if needed) | TikHub creator near top | |
| C2 | Select `[TikHub]` creator while on Home | Subtitle name matches Act-as (not stuck on seed e.g. Narin) | |
| C3 | Switch Act-as again without navigation | Home subtitle + invite/brief/sub counts refresh | |
| C4 | Open `/creator/invitations` after switch | List scoped to Act-as id (aliases ok) | |

---

## 3. Dashboard CTA declutter + copy (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Load `/` header | Only **Scan product** + **Discover TikTok** as primary buttons | |
| D2 | **More actions** ▾ | Add product / Create campaign / Import / Start analysis | |
| D3 | Recommended subtitle | **not** “demo set” — e. of “Highest match scores in catalog” | |
| D4 | Activity subtitle | **not** “demo audit trail” | |

---

## 4. Sidebar Core / More + Login out (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| N1 | Sidebar sections | **Core** then **More** labels | |
| N2 | Core items | Dashboard, Discover, Products, Campaigns, Influencers | |
| N3 | Login | In **footer** (with Mode/Theme), **not** mid-nav between Products/Campaigns | |
| N4 | Login link works | `/login` | |

---

## 5. Resume card Decision vs Details (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | `/products/scan` → Load Soi 11 → Scan | Resume card shows **Decision** block first | |
| R2 | Decision fields | Pitch, topics, geography, prohibited + conf badge | |
| R3 | Details accordion (collapsed by default) | Name, brand, budget, tone, metrics inside | |
| R4 | Expand Details | Fields editable; Save still works | |

---

## Sign-off

| Field | Value |
| --- | --- |
| Tester | |
| Date | |
| Environment | https://influencers.lumen.universalgravity.org |
| Version observed | |
| Verdict | |
| Notes | |

```bash
EXPECT_VERSION=0.4.8 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org
curl -sS https://influencers.lumen.universalgravity.org/api/health | jq .
```
