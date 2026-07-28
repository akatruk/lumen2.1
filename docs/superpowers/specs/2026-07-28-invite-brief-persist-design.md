# Design: Invite → Accept → Brief server persistence (option A)

**Date:** 2026-07-28  
**Status:** draft — awaiting approval  
**App version target:** 0.4.4  
**Related:** BA Priority B, `docs/reports/BA_STATUS_2026-07-28_v2.md`

## Goal

Brand-authenticated persistence for **invitations** and **campaign briefs**, mirroring products/shortlists. Creator portal stays mock persona (`lumen.creatorSession`); same-browser localStorage remains the shared surface after brand hydrate (option **A**).

## Non-goals

- Creator auth / multi-device creator respond
- Claims, submissions, payments
- Nest/Postgres migration
- Changing Discover / TikHub / LLM scan

## Data

### Prisma

```prisma
model Invitation {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(...)
  influencerId String
  campaignId   String
  status       String    @default("Pending") // Pending|Accepted|Declined|Expired
  message      String
  respondedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  briefs       CampaignBrief[]
}

model CampaignBrief {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(...)
  invitationId     String
  invitation       Invitation @relation(...)
  campaignId       String
  influencerId     String
  title            String
  deliverablesJson String   @default("[]")
  messaging        String
  restrictionsJson String   @default("[]")
  deadline         String
  approvalRules    String
  status           String   @default("Sent") // Draft|Sent|Acknowledged
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

`User` gains `invitations` + `briefs` relations.

### API (session-gated like `/api/shortlists`)

| Method | Path | Body | Result |
| --- | --- | --- | --- |
| GET | `/api/invitations` | — | `{ invitations }` |
| POST | `/api/invitations` | `{ influencerId, campaignId, message? }` | `{ invitation }` 201 |
| PATCH | `/api/invitations` | `{ id, status: Accepted\|Declined }` | `{ invitation, brief? }` — on Accept, auto-create brief if none |
| GET | `/api/briefs` | — | `{ briefs }` |
| POST | `/api/briefs` | full brief fields | `{ brief }` 201 (brand "Issue brief") |
| PATCH | `/api/briefs` | `{ id, status: Acknowledged }` or patch | `{ brief }` |

Anonymous → 401; client falls back to localStorage.

## Client behavior

1. Extend `hydrateBrandPersistence()` → also `GET /api/invitations` + `GET /api/briefs`, replace `lumen.invitations` / `lumen.briefs`.
2. Async mutators when session exists:
   - `createInvitationAsync` (influencer detail)
   - `respondInvitationAsync` (creator invitations — writes server if brand cookie present in same browser; else local)
   - `createBriefAsync` / `acknowledgeBriefAsync`
3. Mount hydrate on `/invitations`, creator invitations/briefs pages (best-effort).
4. Logged-out demo: unchanged seed + localStorage.

## Acceptance

| ID | Case | Expected |
| --- | --- | --- |
| I1 | Brand login → Invite to campaign | Row in `GET /api/invitations` |
| I2 | Refresh / other tab same login | Invite still listed after hydrate |
| I3 | Creator Accept (same browser, brand cookie) | status Accepted + brief created server-side |
| I4 | Brand `/invitations` Issue brief | Brief in `GET /api/briefs` |
| I5 | Logged out | local demo still works; API 401 |
| I6 | Health | `0.4.4` |

## Risks

- Creator without brand cookie: Accept stays local-only (explicit option A limit).
- Campaigns remain local IDs (`camp-*`); fine for pilot — store as string FKs, no Campaign table yet.

## Ship

Manual QA doc + changelog + deploy HTTPS. Demo modes / TikHub / OpenRouter unchanged.
