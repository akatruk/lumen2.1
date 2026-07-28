# Manual QA — Strom/Lumen Design Theme Port

**Target:** http://167.71.206.43:3000  
**Health:** http://167.71.206.43:3000/api/health  
**Expected version:** `0.3.0`  
**Scope:** Visual parity with Strom V2 / Lumen FRONTEND (cyber-glass, dark default, blue primary)  
**Mode:** Demo (mock + localStorage)

## How to run

1. Hard refresh or private window after deploy (CSS/JS cache).
2. Desktop Chrome + one mobile width ≤390px.
3. Mark each case `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.
4. Run smoke: `./scripts/qa-smoke.sh http://167.71.206.43:3000`

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.3.0` | |
| T-S2 | `./scripts/qa-smoke.sh http://167.71.206.43:3000` | All routes HTTP 200 | |
| T-S3 | Open `/` | Dashboard loads; no blank/white crash | |
| T-S4 | Open `/creator` | Creator shell loads | |

## Theme foundation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T1 | Fresh load (no theme cookie) | **Dark** cyber-terminal default (near-black bg, light text) | |
| T2 | Fonts | Geist / Geist Mono feel (not Source Sans); mono labels on nav indexes | |
| T3 | Accent color | Royal/neon **blue** primary (not teal/sky) on active nav, CTAs, focus rings | |
| T4 | Background chrome | Subtle grid pattern + ambient blue glow visible behind content | |
| T5 | Cards | Glass panels with corner tick marks; hover border leans primary | |
| T6 | Theme toggle (sidebar footer) | Switches dark ↔ light; light = white/blue clean mode | |
| T7 | Theme persists | Reload keeps chosen theme | |

## Brand console shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-B1 | Sidebar brand | `LUMEN 2.1` + `Marketplace` chip; glass sidebar | |
| T-B2 | Nav items | Mono `[01]`… indexes; active item = primary tint + left bar | |
| T-B3 | Click each nav link | All brand routes load under themed shell | |
| T-B4 | Footer | “Open creator portal →” + ThemeToggle + demo note | |
| T-B5 | Mobile ≤390px | Hamburger opens glass drawer; closes after nav | |

## Creator portal shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-C1 | `/creator` sidebar | `LUMEN 2.1` + `Creator` chip; same glass language | |
| T-C2 | Active nav | Blue primary active state + indexes | |
| T-C3 | Theme toggle in creator footer | Works independently of brand tab (same cookie) | |
| T-C4 | Cross-link “← Brand console” | Returns to `/` with themed brand shell | |

## Component / page spot checks (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-P1 | Dashboard KPIs + cards | Token colors; no leftover teal/slate-50 “SaaS light” look in dark mode | |
| T-P2 | `/influencers` filters + MatchScore | Inputs/selects use border-border + primary focus; scores readable | |
| T-P3 | `/influencers/[id]` signal bars | Progress fill is **primary blue** | |
| T-P4 | Buttons primary/secondary/ghost | Strom-style primary blue / secondary muted / ghost | |
| T-P5 | Badges | Mono uppercase bordered chips | |
| T-P6 | Toast (e.g. add to shortlist) | Glass toast, not emerald-50 paper | |
| T-P7 | `/presentation` | Page themed; video players still render | |
| T-P8 | `/analysis-jobs` progress bar | Primary blue fill | |

## Regression smoke (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-R1 | Create product / campaign forms | Usable in dark + light | |
| T-R2 | Shortlist compare | Table readable on dark | |
| T-R3 | Creator accept invite / brand reviews | Actions still work (function not visual-only) | |
| T-R4 | Console while navigating main nav | No uncaught client errors | |

## Out of scope (do not fail)

- Pixel-perfect clone of every Strom page (product routes differ).
- next-intl LanguageSwitcher (marketplace still EN-only i18n stub).
- Real Lumen API / auth / payments.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | |
| Build / commit | |
| Environment | http://167.71.206.43:3000 |
| Desktop browser | |
| Mobile check | |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Automated smoke appendix

```text
(paste ./scripts/qa-smoke.sh output after deploy)
```
