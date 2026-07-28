# Live TikHub + LLM Scan + Auth/Persistence — Implementation Plan

> **For agentic workers:** execute task-by-task; ship demo-safe defaults.

**Goal:** Replace demo-only discovery/scan with optional live TikHub + OpenRouter, add brand auth and server persistence for products/cards — without Nest rewrite.

**Architecture:** Next.js route handlers hold secrets. Client connectors call `/api/*`. `DISCOVERY_MODE` / `PRODUCT_SCAN_MODE` default `demo`. Prisma SQLite for users + products (+ resume card JSON). JWT httpOnly cookie for brand sessions.

**Tech Stack:** Next 16 route handlers, Prisma + SQLite, jose (JWT), bcryptjs, TikHub REST, OpenRouter chat completions.

---

### Files
- Create: `web/src/server/env.ts`, `tikhub.ts`, `openrouter.ts`, `auth.ts`, `db.ts`
- Create: `web/src/app/api/discovery/tiktok/route.ts`, `api/products/scan/route.ts`, `api/auth/*`, `api/products/route.ts`
- Create: `web/prisma/schema.prisma`, `web/.env.example`
- Create: `web/src/services/discovery/live-tiktok.connector.ts`
- Modify: `discovery.service.ts`, `product-scan.service.ts`, `marketplace.ts` (server sync hooks), `docker-compose.yml`, `Dockerfile`, health version

### Modes
- No keys → demo paths still work
- Live + key → real API
- Auth optional: anonymous demo localStorage; logged-in brand uses server products
