# Manual QA — Google SSO brand login (0.5.3)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.3`, `googleOAuth=true`  
**Secrets:** GitHub Actions secrets `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (Deploy → droplet `.env`)

## How to run

1. Hard refresh `/login` after deploy.
2. Prefer private window for clean session.
3. Mark `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail (except interactive Google account pick when blocked by consent).
4. Smoke: `EXPECT_VERSION=0.5.3 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`

## P0

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| G1 | `GET /api/health` | `googleOAuth=true`, `version=0.5.3` | **PASS** |
| G2 | Open `/login` → locale 中文 | Button **使用 Google 继续** | **PASS** — live browser |
| G2b | Locale EN | Button **Continue with Google** | **PASS** — live browser |
| G3a | `GET /api/auth/google/start` | HTTP 307 → `accounts.google.com` with correct `client_id`, `redirect_uri=…/api/auth/google/callback`, `scope=openid email profile`, non-empty `state` | **PASS** |
| G3b | Click Google → pick **test user** → consent | Redirect `/login?google=1` → session → `/products/scan` | **BLOCKED** — needs human Google test-user click (consent screen Testing) |
| G4 | Logout → Google again same account | Same `User` row (link-by-email / googleId), no duplicate | **BLOCKED** — depends on G3b |
| G5 | `POST /api/auth` register + login email/password | Session cookie; `GET /api/auth` returns user | **PASS** — register/login/`GET` OK |

## Ops / CI

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| O1 | Repo secrets list includes `GOOGLE_CLIENT_*` | Present | **PASS** |
| O2 | Deploy writes droplet `.env` with Google keys | Container env non-empty lengths | **PASS** — ID 73 / SECRET 35 / CALLBACK 71 |
| O3 | `EXPECT_VERSION=0.5.3 ./scripts/qa-smoke.sh …` | SMOKE PASSED | **PASS** |

## Google Console checklist

Redirect URIs:

- `https://influencers.lumen.universalgravity.org/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (local)

Consent screen: add yourself as **test user** while app is in Testing — required to clear G3b/G4.

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | Auto (agent) — curl/smoke/API + live browser; G3b/G4 human-gated |
| Feature commits | `f81c366` · `759c1ad` · `9b66287` |
| Docs / QA commit | `023f24b` |
| Deploy run (secrets wiring) | [30451654311](https://github.com/akatruk/lumen2.1/actions/runs/30451654311) **success** |
| Deploy run (docs QA) | [30451853088](https://github.com/akatruk/lumen2.1/actions/runs/30451853088) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **PASS** (G3b/G4 **BLOCKED** pending Google test-user interactive sign-in) |
| Smoke | `EXPECT_VERSION=0.5.3` **PASSED** |
| Sign-off | **READY TO SHIP** for SSO plumbing; human completes one Google login to unlock G3b/G4 |
