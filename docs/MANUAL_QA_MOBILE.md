# Manual QA — Mobile shell (0.5.4)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.4`  
**Scope:** Brand console + creator portal usable at 375×812; desktop ≥1024 unchanged  
**Mode:** any (`live-capable` OK)

## How to run

1. Hard refresh after deploy.
2. DevTools → iPhone SE / 375×812 (and spot-check 390, 768, 1280).
3. Smoke: `EXPECT_VERSION=0.5.4 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.

---

## 0. Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | `GET /api/health` HTTPS | `status=ok`, `version=0.5.4` | |
| H2 | Smoke script | brand + creator routes 200 | |

---

## 1. Brand shell / drawer (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| B1 | 375px `/` | Top bar full width (logo + lang/theme + menu); **no** permanent `w-64` sidebar; **no** horizontal page scroll | |
| B2 | Tap menu | Drawer slides from left + dim backdrop; body does not scroll behind | |
| B3 | Tap backdrop | Drawer closes | |
| B4 | Open drawer → Esc | Drawer closes | |
| B5 | Open drawer → tap Discover (or any Core/More link) | Navigates + drawer closes | |
| B6 | Open every Core + More nav item | Each page loads; content readable; primary CTAs tappable | |
| B7 | Menu button tap target | ≥ ~44×44 css px | |
| B8 | 1280px `/` | Fixed left sidebar `w-64` as before; no mobile top bar; layout matches pre-0.5.4 desktop | |

---

## 2. High-traffic pages @ 375px (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | Dashboard `/` | Title/actions stack; tiles 1–2 cols; tables scroll inside card only if needed | |
| P2 | Discover `/discover` | Filters stack; Search CTA full-width reachable; result cards usable | |
| P3 | Product scan `/products/scan` | Form fields full width; Save CTAs not off-screen | |
| P4 | Influencers `/influencers` | Cards default OK; table view = horizontal scroll **inside** table region only | |
| P5 | Campaigns `/campaigns` | List + create form usable without page sideways scroll | |
| P6 | Analysis jobs `/analysis-jobs` | Influencer select not forcing page overflow; table scrolls locally | |

---

## 3. Creator portal (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | 375px `/creator` | Mobile top bar + hamburger; no permanent sidebar | |
| C2 | Drawer → Invitations / Briefs / Submissions / Claim | Navigate + drawer closes; no page sideways scroll | |
| C3 | 1280px `/creator` | Desktop sidebar unchanged | |

---

## 4. Safe area / chrome (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | Notched device or DevTools with safe-area | Top bar / drawer respect `env(safe-area-inset-*)` (no content under notch/home indicator) | |
| S2 | Main padding | Tighter on mobile (`p-4`); `md:p-8` from tablet up | |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Feature commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| Smoke | |
| Sign-off | |
