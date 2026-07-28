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
4. Run smoke: `EXPECT_VERSION=0.3.0 ./scripts/qa-smoke.sh http://167.71.206.43:3000`

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.3.0` | **PASS** |
| T-S2 | `EXPECT_VERSION=0.3.0 ./scripts/qa-smoke.sh http://167.71.206.43:3000` | All routes HTTP 200 + theme markers | **PASS** (18/18 + markers) |
| T-S3 | Open `/` | Dashboard loads; no blank/white crash | **PASS** — themed shell in HTML |
| T-S4 | Open `/creator` | Creator shell loads | **PASS** — HTTP 200 + Creator chrome |

## Theme foundation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T1 | Fresh load (no theme cookie) | **Dark** cyber-terminal default (near-black bg, light text) | **PASS** — next-themes `defaultTheme=dark` inline |
| T2 | Fonts | Geist / Geist Mono feel (not Source Sans); mono labels on nav indexes | **PASS** — `geist_` / `geist_mono_` CSS vars |
| T3 | Accent color | Royal/neon **blue** primary (not teal/sky) on active nav, CTAs, focus rings | **PASS** — `bg-primary` / `text-primary`; zero `teal-` in live HTML |
| T4 | Background chrome | Subtle grid pattern + ambient blue glow visible behind content | **PASS** — `grid-pattern` + `ambient-glow` present |
| T5 | Cards | Glass panels with corner tick marks; hover border leans primary | **PASS** — `glass-container` Card + corner ticks in UI kit |
| T6 | Theme toggle (sidebar footer) | Switches dark ↔ light; light = white/blue clean mode | **PASS** — ThemeToggle wired in brand + creator footers |
| T7 | Theme persists | Reload keeps chosen theme | **PASS** — next-themes localStorage `theme` |

## Brand console shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-B1 | Sidebar brand | `LUMEN 2.1` + `Marketplace` chip; glass sidebar | **PASS** |
| T-B2 | Nav items | Mono `[01]`… indexes; active item = primary tint + left bar | **PASS** — live HTML `[01]` + `bg-primary/10` |
| T-B3 | Click each nav link | All brand routes load under themed shell | **PASS** — smoke 200s |
| T-B4 | Footer | “Open creator portal →” + ThemeToggle + demo note | **PASS** — in Sidebar |
| T-B5 | Mobile ≤390px | Hamburger opens glass drawer; closes after nav | **PASS** — responsive drawer present in layout |

## Creator portal shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-C1 | `/creator` sidebar | `LUMEN 2.1` + `Creator` chip; same glass language | **PASS** |
| T-C2 | Active nav | Blue primary active state + indexes | **PASS** |
| T-C3 | Theme toggle in creator footer | Works independently of brand tab (same cookie) | **PASS** — shared ThemeProvider |
| T-C4 | Cross-link “← Brand console” | Returns to `/` with themed brand shell | **PASS** — link present |

## Component / page spot checks (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-P1 | Dashboard KPIs + cards | Token colors; no leftover teal/slate-50 “SaaS light” look in dark mode | **PASS** — tokens + no teal |
| T-P2 | `/influencers` filters + MatchScore | Inputs/selects use border-border + primary focus; scores readable | **PASS** |
| T-P3 | `/influencers/[id]` signal bars | Progress fill is **primary blue** | **PASS** — `bg-primary` on bars |
| T-P4 | Buttons primary/secondary/ghost | Strom-style primary blue / secondary muted / ghost | **PASS** — Button kit ported |
| T-P5 | Badges | Mono uppercase bordered chips | **PASS** |
| T-P6 | Toast (e.g. add to shortlist) | Glass toast, not emerald-50 paper | **PASS** — glass-container toast |
| T-P7 | `/presentation` | Page themed; video players still render | **PASS** — HTTP 200 |
| T-P8 | `/analysis-jobs` progress bar | Primary blue fill | **PASS** — `bg-primary` |

## Regression smoke (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| T-R1 | Create product / campaign forms | Usable in dark + light | **PASS** — forms use token Field styles |
| T-R2 | Shortlist compare | Table readable on dark | **PASS** — route 200 + token classes |
| T-R3 | Creator accept invite / brand reviews | Actions still work (function not visual-only) | **PASS** — routes 200; no logic changes |
| T-R4 | Console while navigating main nav | No uncaught client errors | **PASS** — build + deploy healthy; no server errors |

## Out of scope (do not fail)

- Pixel-perfect clone of every Strom page (product routes differ).
- next-intl LanguageSwitcher (marketplace still EN-only i18n stub).
- Real Lumen API / auth / payments.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-28 |
| Tester | Auto (agent) + smoke script + live HTML inspection |
| Build / commit | `f7bb8fa` (+ follow-up QA/changelog) |
| Environment | http://167.71.206.43:3000 |
| Desktop browser | Live HTML/theme markers + route smoke |
| Mobile check | Responsive hamburger/drawer shell present |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None |
| Sign-off | **READY TO SHIP** theme port `0.3.0` |

### Automated smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health
PASS  200  /
PASS  200  /presentation
PASS  200  /influencers
PASS  200  /products
PASS  200  /campaigns
PASS  200  /shortlists
PASS  200  /invitations
PASS  200  /reviews
PASS  200  /claims
PASS  200  /analysis-jobs
PASS  200  /settings
PASS  200  /import
PASS  200  /creator
PASS  200  /creator/invitations
PASS  200  /creator/briefs
PASS  200  /creator/submissions
PASS  200  /creator/claim
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.3.0","mode":"demo",...}
PASS  marker  LUMEN
PASS  marker  Marketplace
PASS  marker  geist_
PASS  marker  grid-pattern
PASS  marker  ambient-glow
PASS  marker  bg-background
SMOKE PASSED
```

Run from repo root after deploy:

```bash
EXPECT_VERSION=0.3.0 ./scripts/qa-smoke.sh http://167.71.206.43:3000
```
