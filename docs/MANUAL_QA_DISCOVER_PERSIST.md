# Manual QA — Discover search persist + shortlist save (0.5.11)

**Target:** https://influencers.lumen.universalgravity.org  
**Health:** `/api/health` · expect `version=0.5.11`  
**Scope:** Restore ranked Discover results after reload; refresh stale dossier reach; Add to shortlist from ranked cards.  
**Plan:** `docs/superpowers/plans/2026-07-31-discover-search-persist.md`

## How to run

1. Prefer private window for P4; for P1–P3 use a normal session so `localStorage` persists across soft reload.
2. Mark PASS/FAIL. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.11 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`
4. Fixture: `cd web && npx tsx scripts/discovery.persist.fixture.ts`

## Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `version=0.5.11` | |
| S2 | Smoke script | `SMOKE PASSED` | |
| U1 | `npx tsx scripts/discovery.persist.fixture.ts` | PASS — merge 0→128k followers | |

## Persist / restore (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | `/discover` → select product → Search & rank → soft reload | Ranked cards restored without new Search; same product context | |
| P2 | After live search with enriched followers, open dossier that previously had 0 followers | Reach **≠ 0** (merged from lastSearch candidate) | |
| P3 | Ranked card → **Add to shortlist** | Toast success; creator in `/shortlists` | |
| P4 | Private window, no prior lastSearch | Empty hint until Search; no crash | |

## Out of scope

Server `DiscoveryCache` multi-device sync; Douyin play_count.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Deploy | |
| Commit | |
| Verdict | |
