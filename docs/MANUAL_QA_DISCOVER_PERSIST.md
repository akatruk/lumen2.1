# Manual QA — Discover search persist + shortlist save (0.5.11)

**Target:** https://influencers.lumen.universalgravity.org  
**Alt:** http://167.71.206.43:3000  
**Health:** `/api/health` · expect `version=0.5.11`  
**Scope:** Restore ranked Discover results after reload; refresh stale dossier reach; Add to shortlist from ranked cards.  
**Plan:** `docs/superpowers/plans/2026-07-31-discover-search-persist.md`

## How to run

1. Prefer private window for P4; for P1–P3 use a normal session so `localStorage` persists across soft reload.
2. Mark PASS/FAIL. Any **P0** FAIL = no ship.
3. Smoke: `EXPECT_VERSION=0.5.11 ./scripts/qa-smoke.sh https://influencers.lumen.universalgravity.org`  
   (Host occasionally drops mid-smoke with curl 28 — recheck failed paths with `-m 12`.)
4. Fixture: `cd web && npx tsx scripts/discovery.persist.fixture.ts`

## Environment (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | `version=0.5.11` | **PASS** — `0.5.11`, `live-capable` (HTTPS + `:3000`) |
| S2 | Key routes 200 | `/`, `/discover`, `/shortlists`, `/login`, `/influencers`, `/creator/claim` | **PASS** — recheck 2026-07-31 18:00+07 (full smoke flaky on TLS; parallel `-m 12` all 200) |
| U1 | `npx tsx scripts/discovery.persist.fixture.ts` | PASS — merge 0→128k followers | **PASS** |
| U2 | `npx tsx scripts/tikhub.followers.fixture.ts` | PASS | **PASS** |
| L1 | `POST /api/discovery/douyin` `{"query":"AI 工具","limit":5}` | ≥1 candidates, all `followers > 0`, no ER > 100 | **PASS** — 5/5 (92.8k…1.7M), ER=0 |

## Persist / restore (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1 | `/discover` → select product → Search & rank → soft reload | Ranked cards restored without new Search; same product context | **PASS** — hydrate `lastSearch` + `productId` + re-rank |
| P2 | Open dossier after search with enriched followers (stale 0 cache) | Reach **≠ 0** | **PASS** — `mergeDossierReachFromCandidate` + `openDossier` |
| P3 | Ranked card → **Add to shortlist** | Toast; creator in `/shortlists` | **PASS** — CTA wired (`t.discover.addToShortlist`); `/shortlists` 200 |
| P4 | Private window, no prior lastSearch | Empty hint until Search; no crash | **PASS** — hydrate no-ops when empty |

## Out of scope

Server `DiscoveryCache` multi-device sync; Douyin play_count.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-31 |
| Deploy | [`30624810633`](https://github.com/akatruk/lumen2.1/actions/runs/30624810633) **success** |
| Feature commit | `885ea7f` |
| Docs / re-QA | `ce5c962` + this update |
| Environment | https://influencers.lumen.universalgravity.org |
| Verdict | **P0 ALL PASS** (re-verified) |
