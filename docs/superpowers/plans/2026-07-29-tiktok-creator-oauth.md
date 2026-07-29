# TikTok Creator OAuth Implementation Plan

> **Superseded note (2026-07-29):** Product primary platform is now **China / Douyin (中国抖音)** — see `docs/DISCOVERY_AND_DOSSIER.md`. This plan implements **international TikTok OAuth for creator login only** — a **leftover**, not Douyin login, and unrelated to Douyin discovery. Credentials reuse Strom's existing TikTok Developer App (no new account); never paste secret values. Kept for historical/implementation reference.

> **For agentic workers:** Implement task-by-task. Spec: `docs/superpowers/specs/2026-07-29-tiktok-creator-oauth-design.md`

**Goal:** Creators log in via TikTok OAuth; session cookie `role=creator` + `influencerId`; Act-as remains fallback.

**Architecture:** Next.js routes `/api/auth/tiktok/start|callback` → token exchange → upsert User/TikTokAccount → `lumen_session` → creator portal prefers JWT.

**Tech Stack:** Next.js App Router, Prisma/SQLite, jose, TikTok Login Kit v2 API

## Files

| File | Role |
| --- | --- |
| `web/prisma/schema.prisma` | `User.influencerId`, `TikTokAccount` |
| `web/src/server/env.ts` | `tiktokOAuthConfig()` |
| `web/src/server/tiktok-oauth.ts` | start URL, exchange, user.info |
| `web/src/server/auth.ts` | SessionUser.influencerId, upsert creator |
| `web/src/app/api/auth/tiktok/start/route.ts` | redirect to TikTok |
| `web/src/app/api/auth/tiktok/callback/route.ts` | callback |
| `web/src/app/creator/login/page.tsx` | Login with TikTok UI |
| `web/src/app/creator/layout.tsx` | show TikTok session / logout |
| `web/src/hooks/useCreatorSession.ts` | prefer JWT influencerId |
| `web/src/app/api/invitations/route.ts` | creator-scoped list/respond |
| `web/src/app/api/briefs/route.ts` | creator-scoped list |
| `.github/workflows/deploy.yml` | TikTok secrets → .env |
| `web/.env.example` | document vars |
| health `0.4.9`, CHANGELOG, CREATOR_PORTAL_GUIDE |

## Tasks

- [ ] Schema + prisma generate
- [ ] tiktok-oauth + auth upsert
- [ ] API start/callback
- [ ] Creator login page + layout session
- [ ] Session hook + API scoping
- [ ] Deploy env + docs + health 0.4.9
