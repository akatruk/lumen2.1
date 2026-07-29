# Manual QA — Google SSO brand login (0.5.3)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.3`, `googleOAuth=true`  
**Secrets:** droplet `/opt/lumen-marketplace/.env.google` only (not GH/Vault)

## P0

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| G1 | `GET /api/health` | `googleOAuth=true`, `0.5.3` | |
| G2 | Open `/login` (zh) | Button 使用 Google 继续 | |
| G3 | Click Google → pick test user | Redirect back signed in → `/products/scan` | |
| G4 | Logout → Google again | Same user, no duplicate email row | |
| G5 | Email/password still works for non-Google users | Sign in OK | |

## Ops

Google Console redirect URIs must include:

- `https://influencers.lumen.universalgravity.org/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (local)

Consent screen: add yourself as **test user** while app is in Testing.
