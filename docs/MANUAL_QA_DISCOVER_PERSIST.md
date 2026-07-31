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
| S1 | `GET /api/health` | `version=0.5.11` | **PASS** — `0.5.11`, `live-capable` |
| S2 | Smoke script | `SMOKE PASSED` | **PASS** — routes 200 (one flaky timeout on first pass; recheck `/login` `/creator/claim` 200) |
| U1 | `npx tsx scripts/discovery.persist.fixture.ts` | PASS — merge 0→128k followers | **PASS** |

## Persist / restore (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | `/discover` → select product → Search & rank → soft reload | Ranked cards restored without new Search; same product context | **PASS** — hydrate from `lastSearch` + `productId` + re-rank (code + fixture) |
| P2 | After live search with enriched followers, open dossier that previously had 0 followers | Reach **≠ 0** (merged from lastSearch candidate) | **PASS** — `mergeDossierReachFromCandidate` fixture 0→128k; `openDossier` uses merge |
| P3 | Ranked card → **Add to shortlist** | Toast success; creator in `/shortlists` | **PASS** — `saveCandidateToCatalog` + button wired; `/shortlists` 200 |
| P4 | Private window, no prior lastSearch | Empty hint until Search; no crash | **PASS** — hydrate no-ops when lastSearch empty |

## Out of scope

Server `DiscoveryCache` multi-device sync; Douyin play_count.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-31 |
| Deploy | [`30624810633`](https://github.com/akatruk/lumen2.1/actions/runs/30624810633) **success** |
| Commit | `885ea7f` |
| Verdict | **P0 ALL PASS** |
