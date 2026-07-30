# Manual QA — Invite threads + product Save (0.5.6)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.6`  
**Scope:** (1) Brand Invitations shows sent + received messages; (2) Add Product Save works when logged in / missing category  
**Out of scope:** Real Douyin messaging; creator portal i18n polish

## How to run

1. Hard refresh or private window after deploy.
2. Mark `PASS` / `FAIL` / `BLOCKED`. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.6 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Demo seed: Settings → Reset demo data if old `lumen.invitations` localStorage lacks `responseMessage` seeds.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `version=0.5.6` | |
| S2 | `EXPECT_VERSION=0.5.6 ./scripts/qa-smoke.sh …` | SMOKE PASSED | |
| S3 | Open `/invitations` | Page loads; cards (not table-only Message column) | |

## Product Save (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | Logged out: Add Product, fill **only** Name+Brand, empty Category, Save | Product appears; category defaults (General/通用); toast Saved | |
| P2 | Logged out: Add Product, empty Name, Save | Toast error (name/brand required); form stays open | |
| P3 | Logged in brand: POST `/api/products` name+brand, `category:""` | 201; category coerced to `General` | |
| P4 | Logged in brand: Add Product via UI name+brand only, Save | Product persists on GET `/api/products` after reload | |

## Invitation threads — brand account (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | `/invitations` (demo seed or after reset) | Each invite shows **You (brand)** bubble with outbound message | |
| I2 | Accepted seed (e.g. Lin Xiaonan) | **Creator** bubble shows reply text + received time | |
| I3 | Pending seed | Creator side shows awaiting copy | |
| I4 | Mobile ≤390px | Sent + received text visible without horizontal table scroll | |
| I5 | Locale 中文 | Thread labels Chinese (你（品牌）/ 创作者 / 等待…) | |

## Send invite preview (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| M1 | `/influencers/[id]` | Editable invite message preview before send | |
| M2 | Edit message → Send invite | Toast success; `/invitations` shows that exact outbound text | |

## Creator reply → brand visibility (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Creator portal → pending invite | Brand message visible; reply textarea | |
| C2 | Accept with custom reply | Brand `/invitations` shows that reply under Creator | |
| C3 | Decline with reply | Status Declined + reply on brand thread | |

## API / schema (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | Prisma `Invitation.responseMessage` after deploy | Column exists (`db push` on boot) | |
| A2 | PATCH `/api/invitations` with status+responseMessage | Persists; GET returns field | |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | |
| Build / commit | |
| Deploy run | |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |
