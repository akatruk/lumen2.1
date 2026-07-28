# Design: Creator login via TikTok OAuth

**Date:** 2026-07-29  
**Status:** approved — implementing 0.4.9  
**App version target:** 0.4.9  
**Repo:** lumen2.1 (Influencer Marketplace)  
**Decision:** Login-only OAuth; reuse Strom TikTok Developer App + new redirect URI

## Goal

Creators sign into the Creator portal with **Login with TikTok**. Session is a real `lumen_session` cookie (`role=creator`), not Act-as localStorage. Invites / briefs / submissions are scoped to the creator’s linked `influencerId`.

## Non-goals

- TikTok **video.publish** / **video.upload** (Strom already has publish; not this slice)
- Replacing brand email/password login
- Removing Act-as entirely (kept as **admin / demo fallback** when no TikTok session)
- Multi-platform OAuth (Instagram / YouTube)
- Full KYC / claim auto-approve

## Credentials / ops

| Item | Value |
| --- | --- |
| TikTok app | **Reuse Strom** `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` |
| New redirect URI (add in TikTok Developer Portal) | `https://influencers.lumen.universalgravity.org/api/auth/tiktok/callback` |
| Local redirect (optional) | `http://localhost:3000/api/auth/tiktok/callback` |
| Marketplace env | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `TIKTOK_REDIRECT_URI`, `TIKTOK_SCOPES` (default `user.info.basic`) |
| Deploy | Wire secrets into lumen2.1 GitHub Actions → droplet `.env` (same pattern as `AUTH_SECRET`) |

Manual prerequisite before live QA: operator adds redirect URI on the shared TikTok app.

## Architecture

```text
Creator → GET /api/auth/tiktok/start
       → TikTok authorize (scope user.info.basic)
       → GET /api/auth/tiktok/callback?code&state
       → exchange code → user.info
       → upsert User(role=creator) + TikTokAccount
       → resolve influencerId (catalog match)
       → set lumen_session cookie
       → redirect /creator
```

### Components

| Unit | Responsibility |
| --- | --- |
| `web/src/server/tiktok-oauth.ts` | Auth URL, state JWT, token exchange, user.info fetch |
| `web/src/app/api/auth/tiktok/start/route.ts` | Begin OAuth (no prior session required) |
| `web/src/app/api/auth/tiktok/callback/route.ts` | Callback, upsert, set cookie, redirect |
| `web/src/server/auth.ts` | Extend `SessionUser` with optional `influencerId`; `loginOrRegisterCreatorFromTikTok` |
| Prisma `User` + `TikTokAccount` | Persist identity + tokens (refresh for future; login-only now) |
| Creator layout / pages | Prefer session `influencerId`; Act-as only if no creator session |
| `/creator/login` | Page with **Login with TikTok** CTA (+ short note on Act-as fallback for ops) |

### State parameter

Signed JWT (jose, `AUTH_SECRET`), ~10m TTL:

```ts
{ purpose: "tiktok-creator-oauth", nonce: string }
```

No `userId` required pre-login (unlike Strom “connect” which assumes logged-in brand). CSRF via nonce stored in short-lived httpOnly cookie `lumen_tiktok_oauth` (or embedded in state only — prefer state-only JWT with `jti` + server-side one-time use table if easy; MVP: signed state JWT is enough).

### Token exchange

`POST https://open.tiktokapis.com/v2/oauth/token/`  
fields: `client_key`, `client_secret`, `code`, `grant_type=authorization_code`, `redirect_uri`

### User info

`GET https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name`  
(+ `username` if scope/product allows; otherwise match on display_name / later claim)

## Data model

```prisma
model User {
  // existing fields...
  role           String  @default("brand") // brand | creator
  influencerId   String? // catalog / discovery id when role=creator
  tiktokAccounts TikTokAccount[]
}

model TikTokAccount {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  openId         String   @unique
  unionId        String?
  displayName    String
  avatarUrl      String   @default("")
  username       String?  // @handle if available
  accessToken    String
  refreshToken   String   @default("")
  scope          String   @default("")
  expiresAt      DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

Password for TikTok-only creators: store a random unusable `passwordHash` (or make `passwordHash` optional — prefer random hash to avoid schema null churn).

### Influencer binding

On login, set `User.influencerId`:

1. Existing `TikTokAccount.openId` → reuse that user’s `influencerId`
2. Else match catalog/discovered influencer where platform handle equals TikTok `username` (case-insensitive)
3. Else create lightweight discovered influencer stub `inf-tt-{openIdSlice}` and bind
4. Expose `influencerId` in JWT session payload

Invites already key off `influencerId` (+ aliases `disc-tt-*` ↔ `inf-disc-tt-*`). Binding must use the same alias rules.

## Session / API scoping

- `SessionUser`: `{ id, email, name, role, influencerId? }`
- Creator email synthetic: `tt_{openId}@tiktok.oauth.lumen` (internal; not shown as primary UI identity) or use TikTok display name only in UI
- Creator portal: `useCreatorSessionId` reads **JWT influencerId first**; falls back to Act-as localStorage only if `role !== creator`
- `GET/PATCH /api/invitations` (and briefs): if `role=creator`, filter by `influencerId` (and aliases), ignore brand `userId` ownership for list/respond; respond still updates the brand-owned row
- Logout: existing `/api/auth` logout clears cookie; also clear Act-as optional

## UI

1. `/creator/login` — primary button Login with TikTok; link back to brand `/login`
2. Creator layout — if unauthenticated and not Act-as override: soft gate banner + CTA to `/creator/login` (do not hard-block Act-as demos on day one — env `CREATOR_AUTH_REQUIRED=false` default; set `true` when pilot ready)
3. When TikTok session present: show “Signed in as {displayName} · TikTok” + Logout; hide or collapse Act-as
4. Update `docs/CREATOR_PORTAL_GUIDE.md` — Login with TikTok steps first; Act-as as fallback

## Error handling

| Case | Behavior |
| --- | --- |
| Missing TikTok env | `/start` returns 503 `{ error: "TikTok OAuth not configured" }` |
| User denies consent | Redirect `/creator/login?error=denied` |
| Invalid/expired state | Redirect `/creator/login?error=state` |
| Token/info API fail | Log server-side; redirect `/creator/login?error=oauth` |
| Secure cookie | Production HTTPS: `COOKIE_SECURE=true` (already) |

## Testing

| Layer | Check |
| --- | --- |
| Unit | state JWT round-trip; influencer alias bind helper |
| Manual | Start → TikTok sandbox/real → callback → `/creator` shows TikTok name; invites filtered |
| Regression | Brand email login unchanged; Act-as still works when `CREATOR_AUTH_REQUIRED=false` |
| Ops | Redirect URI present on Strom TikTok app; secrets on lumen2.1 deploy |

## Rollout

1. Add redirect URI in TikTok portal (human)  
2. Add GH secrets + deploy env for lumen2.1  
3. Ship 0.4.9 code  
4. Manual QA HTTPS  
5. Update creator guide  

## Open points (defaults)

| Topic | Default |
| --- | --- |
| Require auth for `/creator/*` | Off initially (`CREATOR_AUTH_REQUIRED=false`) |
| Username field availability | Best-effort; fallback display_name + stub influencer |
| Token encryption at rest | Store plaintext in SQLite for MVP (same class as many demos); note in compliance follow-up |

---

**Approve this spec to proceed to implementation plan + code.**
