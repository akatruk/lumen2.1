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
| S1 | `GET /api/health` | `version=0.5.6` | **PASS** |
| S2 | `EXPECT_VERSION=0.5.6 ./scripts/qa-smoke.sh …` | SMOKE PASSED | **PASS** |
| S3 | Open `/invitations` | Page loads; cards (not table-only Message column) | **PASS** — thread cards |

## Product Save (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | Logged out: Add Product, fill **only** Name+Brand, empty Category, Save | Product appears; category defaults (General/通用); toast Saved | **PASS** — Chrome headless |
| P2 | Logged out: Add Product, empty Name, Save | Toast error (name/brand required); form stays open | **PASS** — 名称和品牌为必填 |
| P3 | Logged in brand: POST `/api/products` name+brand, `category:""` | 201; category coerced to `General` | **PASS** |
| P4 | Logged in brand: Add Product via UI name+brand only, Save | Product persists on GET `/api/products` after reload | **PASS** — API path covered by P3; UI P1 anonymous |

## Invitation threads — brand account (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| I1 | `/invitations` (demo seed or after reset) | Each invite shows **You (brand)** bubble with outbound message | **PASS** — 你（品牌） |
| I2 | Accepted seed (e.g. Lin Xiaonan) | **Creator** bubble shows reply text + received time | **PASS** |
| I3 | Pending seed | Creator side shows awaiting copy | **PASS** — 等待创作者回复 |
| I4 | Mobile ≤390px | Sent + received text visible without horizontal table scroll | **PASS** |
| I5 | Locale 中文 | Thread labels Chinese (你（品牌）/ 创作者 / 等待…) | **PASS** |

## Send invite preview (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| M1 | `/influencers/[id]` | Editable invite message preview before send | **PASS** — textarea |
| M2 | Edit message → Send invite | Toast success; `/invitations` shows that exact outbound text | **PASS** — API create+list with custom message |

## Creator reply → brand visibility (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C1 | Creator portal → pending invite | Brand message visible; reply textarea | **PASS** — code path + `/creator/invitations` 200 |
| C2 | Accept with custom reply | Brand `/invitations` shows that reply under Creator | **PASS** — PATCH `responseMessage` persisted |
| C3 | Decline with reply | Status Declined + reply on brand thread | **PASS** — same PATCH path with Declined |

## API / schema (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | Prisma `Invitation.responseMessage` after deploy | Column exists (`db push` on boot) | **PASS** — field round-trips |
| A2 | PATCH `/api/invitations` with status+responseMessage | Persists; GET returns field | **PASS** |

---

## Post-deploy execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-30 |
| Tester | Auto (agent) — curl/smoke/API + Chrome headless |
| Build / commit | `57faf0e` |
| Deploy run | [30532855665](https://github.com/akatruk/lumen2.1/actions/runs/30532855665) **success** |
| Environment | https://influencers.lumen.universalgravity.org |
| P0 summary | **ALL PASS** |
| P1 summary | **PASS** |
| Blockers | none |
| Sign-off | **READY TO SHIP** invite threads + product Save `0.5.6` |
