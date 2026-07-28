# Backend audit — 2026-07-28

**Scope:** `web/src/services/**`, `storage.ts`, types, mock, `/api/health`, core pages  
**Protocol:** `docs/prompts/BACKEND_AUDIT_FIX_PROMPT.md`  
**Health after fixes:** `0.3.6`

## Triage

| Severity | Count | Action |
| --- | --- | --- |
| **P0** | 3 (+1 catalog harden) | **FIXED** |
| **P1** | 6 | Report only |
| **P2** | 7 | Report / roadmap |

---

## FINDINGS

| ID | Sev | Where | Repro / fact | Impact | Fix |
| --- | --- | --- | --- | --- | --- |
| F1 | **P0** | `match.service.ts` platform filter | Card `platforms:["instagram"]` still ranked TikTok candidates (`!allowed.has("tiktok") && !allowed.length` was dead logic) | Врёт бизнесу: матч игнорирует выбранную платформу | **FIXED** — skip all when `!allowed.has("tiktok")` (demo is TT-only) |
| F2 | **P0** | `match.service.ts` `clamp` | `engagementRate: NaN` → score `NaN` | UI/sort ломается, reasons с NaN | **FIXED** — `clamp` rejects non-finite |
| F3 | **P0** | `match.service.ts` `cardOf` | Corrupt product `{id,name}` → throw on `description.slice` | White screen / Search failed на битом localStorage | **FIXED** — defensive defaults |
| F4 | **P0** | `marketplace.addInfluencer` | Same handle, different id → duplicate catalog rows | Catalog pollution | **FIXED** — merge by handle + id |
| F5 | P1 | `product-scan.service` confidence | Sparse `hi` → conf ~0.83 with missing_fields | BA: «уверенная» карточка при дырах | Калибровать conf ↓ при missing (не P0) |
| F6 | P1 | Discover double-save | Double-click Save creates 2 products | Demo clutter | disable button while saving |
| F7 | P1 | Product ↔ resumeCard drift | Manual edit product fields without updating card | Rank may use stale synthesized card | sync on product update |
| F8 | P1 | `rankForProduct` (catalog) | Legacy catalog rank ≠ Discover card ranker | Два разных score UX | unify later |
| F9 | P1 | demo connector empty query | Falls back to food bangkok — OK but opaque | Operator confusion | surface default query in UI |
| F10 | P1 | `saveJson` no quota catch | QuotaExceeded → uncaught | Rare crash | try/catch + toast |
| F11 | P2 | Math.random ids | uid() | Demo collision unlikely | crypto.randomUUID later |
| F12 | P2 | Artificial scan delay | 500–900ms | UX only | — |
| F13 | P2 | No unit tests on match/scan | — | Regressions | add jest/vitest |
| F14 | P2 | Nest/auth/DB absent | — | Roadmap A | — |
| F15 | P2 | TikHub live absent | Mock connector | Roadmap P3 | — |
| F16 | P2 | Live Lumen Analysis absent | Mock client | Roadmap | — |
| F17 | P2 | Payments/contracts | — | Phase 3 | — |

**Checked OK (not findings):**
- `storage.loadJson` — SSR guard + try/catch corrupt JSON
- `resetDemoData` clears discovery + collaboration keys
- Discover UI requires `productId`; errors caught
- Dossier missing candidate → clear error
- `publishSubmission` only when `Approved`
- No `NEXT_PUBLIC_*` API secrets
- Demo badges present (`Demo connector`, `Demo scan`)
- Collaboration illegal publish throws
- Build TypeScript PASS

---

## Applied P0 fixes

### 1. Platform filter (`match.service.ts`)
Before: condition never skipped when platforms = `[instagram]`.  
After: if card platforms exclude `tiktok` → `[]` matches (demo connector is TikTok-only).

### 2. Finite scores + corrupt-safe `cardOf`
- `clamp` returns `lo` on non-finite.
- Missing `description` / arrays no longer throw.
- Reasons always ≥2 on ranked rows.

### 3. Catalog idempotency (`marketplace.addInfluencer`)
Merge/replace when same influencer id **or** same platform handle.

### Verify
```
Soi 11 rank: Narin 89 > beauty 54 > RE 37 (finite)
ig-only platforms → 0 matches
NaN engagement → finite score
corrupt product → no throw, finite scores
npm run build → PASS
```

---

## Not fixed (by design / roadmap)

- Live TikHub, Nest, auth, Postgres, payments
- Confidence calibration (P1)
- Unifying catalog `rankForProduct` with Discover ranker (P1)

---

## Verification appendix

| Check | Result |
| --- | --- |
| `npm run build` | PASS |
| Soi 11 scan+rank | 89 / 54 / 37 |
| Platform filter | 0 matches for IG-only card |
| Health version | **0.3.6** (local; deploy when pushed) |

**Commit/push:** not done (await explicit request).
