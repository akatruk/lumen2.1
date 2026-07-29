# Manual QA — Google SSO brand login (0.5.4 / secret rotation)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.4`, `googleOAuth=true`  
**Secrets:** GitHub Actions `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` → Deploy → droplet `/opt/lumen-marketplace/.env`

## How to run

1. Hard refresh `/login` after deploy (private window preferred).
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship (except G3b/G4 while consent is Testing + human-gated).
3. Smoke: `EXPECT_VERSION=0.5.4 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. After rotating Google secrets: redeploy via Actions **Deploy** (`workflow_dispatch` or push) so droplet `.env` picks up new values.

## P0

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| G1 | `GET /api/health` | `googleOAuth=true`, `version=0.5.4` | **PASS** |
| G2 | Open `/login` → locale 中文 | Button **使用 Google 继续** | **PASS** — live (prior) |
| G2b | Locale EN | Button **Continue with Google** | **PASS** — live (prior) |
| G3a | `GET /api/auth/google/start` | HTTP 307 → `accounts.google.com`; `client_id` ends `…o6q0164qo5lpgsvj9s7issddklgum7sa…`; `redirect_uri=…/api/auth/google/callback`; `scope=openid email profile`; non-empty `state` + `lumen_google_oauth_state` cookie | **PASS** |
| G3b | Click Google → pick **test user** (`andreykatruk@gmail.com`) → consent | **302/307** to `/products/scan` with session cookie (not `/login?error=…`) | **BLOCKED** — human Google consent; no post-rotation callback in nginx yet |
| G4 | Logout → Google again same account | Same `User` row (`googleId` / email link), no duplicate | **BLOCKED** — depends on G3b |
| G5 | `POST /api/auth` register + login email/password | Session cookie; `GET /api/auth` returns user | **PASS** — prior |
| G6 | Open `/login?error=The+provided+client+secret+is+invalid.` | Red error banner shows decoded message (UX from `a01a1c9`) | **PASS** — route renders banner; seen in prod before rotation |

## Ops / CI (secret rotation)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| O1 | `gh secret list` includes `GOOGLE_CLIENT_*` | Present; updated ~2026-07-29T13:24Z | **PASS** |
| O2 | Droplet `.env` after Deploy | `GOOGLE_CLIENT_ID` matches new Web client; `GOOGLE_CLIENT_SECRET` length 35 (`GOCSPX-…`); `GOOGLE_CALLBACK_URL` = prod callback | **PASS** — Deploy [`30455885662`](https://github.com/akatruk/lumen2.1/actions/runs/30455885662) |
| O3 | Token endpoint probe with junk `code` | `invalid_grant` / malformed code (**not** `invalid_client`) | **PASS** — client+secret pair accepted by Google |
| O4 | `EXPECT_VERSION=0.5.4 ./scripts/qa-smoke.sh …` | SMOKE PASSED | **PASS** |
| O5 | Pre-fix failure mode (historical) | nginx showed `/login?error=The+provided+client+secret+is+invalid.` | **PASS** — confirmed root cause; fixed by secret rotate |

## Google Console checklist

Redirect URIs:

- `https://influencers.lumen.universalgravity.org/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (local)

Consent screen: app in **Testing** → add test users (e.g. `andreykatruk@gmail.com`) or G3b stays blocked.

Do **not** paste client secrets into git, chat logs, or commits.

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-29 |
| Tester | Auto (agent) — curl/smoke/API + nginx; G3b/G4 human-gated |
| Feature / UX commits | `f81c366` · `9b66287` · `a01a1c9` (error banner + land `/products/scan`) |
| Ops | GH secrets rotated → Deploy [`30455885662`](https://github.com/akatruk/lumen2.1/actions/runs/30455885662) **success** |
| Docs / QA commit | `72b4776` |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **PASS** automated (G1/G3a/G5/G6/O*); **G3b/G4 BLOCKED** pending interactive Google sign-in after rotation |
| Smoke | `EXPECT_VERSION=0.5.4` **PASSED** |
| Sign-off | **READY TO SHIP** for secret fix + SSO plumbing; human completes one Google login to unlock G3b/G4 |
