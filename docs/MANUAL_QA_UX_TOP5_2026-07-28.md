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
| H1 | `GET /api/health` HTTPS | `status=ok`, `version=0.4.8`, `mode=live-capable` | **PASS** |
| H2 | Smoke script | brand + creator routes 200 | **PASS** — `SMOKE PASSED` |

---

## 1. Safety badge honesty (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | Discover → Search → open dossier **before** Run analysis (clear cached dossiers if needed) | Brand safety badge **`PENDING ANALYSIS`**, notes pending / not scanned | **PASS** — Chrome headless |
| S2 | Badge must **not** say SAFE pre-analysis | No green SAFE pretence | **PASS** |
| S3 | Analyze CTA present on dossier | `Analyze recent videos` (or equivalent) | **PASS** |

---

## 2. Creator home ↔ Act-as sync (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | `/creator` Act-as has `[TikHub]` (inject/add discovered if empty catalog) | TikHub creator near top | **PASS** — `[TikHub] QA TikHub Creator UX48` |
| C2 | Select `[TikHub]` on Home | Subtitle name matches Act-as | **PASS** — `QA TikHub Creator UX48 · manage…` |
| C3 | Switch Act-as again without navigation | Home subtitle refreshes | **PASS** |
| C4 | `/creator/invitations` after switch | Page loads scoped to session | **PASS** |

---

## 3. Dashboard CTA declutter + copy (P0)

> **Historical (2026-07-29):** Recorded against the Thailand F&B / TikTok pilot build. Current product primary is **China / Douyin** (the "Discover TikTok" CTA below now points at Douyin discovery) — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md). Dates/PASS results below are preserved as an audit record.

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| D1 | Load `/` header | Only **Scan product** + **Discover TikTok** as primary buttons | **PASS** |
| D2 | **More actions** ▾ | Add product / Create campaign / Import / Start analysis | **PASS** |
| D3 | Recommended subtitle | “Highest match scores in catalog” (not demo set) | **PASS** |
| D4 | Activity subtitle | “Recent workspace activity” (not demo audit trail) | **PASS** |

---

## 4. Sidebar Core / More + Login out (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| N1 | Sidebar sections | **Core** then **More** labels | **PASS** |
| N2 | Core items | Dashboard, Discover, Products, Campaigns, Influencers | **PASS** |
| N3 | Login | Footer (after More), not mid-nav | **PASS** |
| N4 | Login link | `/login` | **PASS** |

---

## 5. Resume card Decision vs Details (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | `/products/scan` → Load Soi 11 → Scan | **Decision** block before Details in DOM | **PASS** |
| R2 | Decision fields | Pitch, topics/geo/prohibited + conf badge | **PASS** |
| R3 | Details accordion | Collapsed by default | **PASS** |
| R4 | Expand Details | Budget/tone/metrics editable | **PASS** |

---

## Sign-off

| Field | Value |
| --- | --- |
| Tester | Auto (Chrome headless + smoke) |
| Date | 2026-07-28 |
| Environment | https://influencers.lumen.universalgravity.org |
| Version observed | `0.4.8` |
| Verdict | **ALL P0 PASS — SHIP** |
| Deploy | GitHub Actions Deploy `30375380610` success |
| Feature commit | `6066d53` |
| Notes | Fresh dossier cache required for S1 if prior analysis cached in `localStorage` |

```bash
EXPECT_VERSION=0.4.8 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org
curl -sS https://influencers.lumen.universalgravity.org/api/health | jq .
```
