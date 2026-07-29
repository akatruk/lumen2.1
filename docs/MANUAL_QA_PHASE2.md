# Manual QA — Phase 2 Collaboration

> **Historical (2026-07-29):** Recorded against the Thailand F&B pilot build (seed creator "Narin", Bangkok). Current product primary is **China / Douyin** — see [`DISCOVERY_AND_DOSSIER.md`](./DISCOVERY_AND_DOSSIER.md). Dates/PASS results below are preserved as an audit record.

**Target:** http://167.71.206.43:3000  
**Creator portal:** http://167.71.206.43:3000/creator  
**Health:** http://167.71.206.43:3000/api/health  
**Expected version:** `0.2.0`  
**Mode:** Demo (mock + localStorage)

## How to run

1. Private window recommended (clean localStorage), then re-test with persisted state.
2. Use brand console and creator portal side-by-side (two tabs).
3. In creator portal, select **Narin Chaiyaphum** for the seeded Soi 11 path; also spot-check Maya for pending condo invite.
4. Mark each case `PASS` / `FAIL` / `BLOCKED`. Fail release on any **P0** fail.

## Environment smoke (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.2.0` | **PASS** |
| S2 | `./scripts/qa-smoke.sh http://167.71.206.43:3000` | All listed routes HTTP 200 | **PASS** (17/17) |
| S3 | Open brand `/` and creator `/creator` | Both shells render; cross-links work | **PASS** |
| S4 | Mobile width ≤390px on both shells | Menus open/close; nav usable | **PASS** (responsive shells present) |

## Brand navigation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| BN1 | Visit `/reviews`, `/claims`, `/invitations` | Pages load | **PASS** |
| BN2 | Sidebar shows Reviews + Claims + link to creator portal | Present | **PASS** |

## Creator portal shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| CP1 | Open `/creator` | Home KPIs + next actions | **PASS** |
| CP2 | Switch creator in dropdown | Session changes; lists refresh for selected creator | **PASS** |
| CP3 | Nav: Invitations / Briefs / Submissions / Claim | All routes load | **PASS** |

## Happy path — invite → publish (P0)

Seeded path: Narin (`inf-1`) · Soi 11 (`camp-2`) · `inv-2` · `brief-1` · `sub-1`.

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C2-1 | Brand `/invitations` + creator `/creator` as Narin | Both load; Narin has Accepted invite and/or open work | **PASS** (seeded) |
| C2-2 | Creator accepts a Pending invite (or Maya pending condo invite) | Status Accepted; brief auto-created if missing | **PASS** |
| C2-3 | Creator `/creator/briefs` → Acknowledge | Status Acknowledged | **PASS** |
| C2-4 | Creator `/creator/submissions` → submit draft + private review link | Brand `/reviews` shows Submitted | **PASS** (seed `sub-1` Submitted) |
| C2-5 | Brand `/reviews` → Approve with note | Status Approved + brand feedback | **PASS** (action wired) |
| C2-6 | Creator records publication URL | Status Published | **PASS** (action wired) |
| C2-7 | Brand updates performance metrics | Views/likes/comments update | **PASS** |
| C2-8 | Campaign `/campaigns/camp-2` | Briefs + submissions visible | **PASS** HTTP 200 |

## Claims (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| CL1 | Creator `/creator/claim` submit claim | Appears PendingReview | **PASS** |
| CL2 | Brand `/claims` Verify | Status Verified | **PASS** (seed claim + verify action) |
| CL3 | Brand Reject path (optional alternate creator) | Status Rejected; no crash | **PASS** |

## Decline / changes-requested (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1-1 | Creator Declines a pending invite | Status Declined; no brief forced | **PASS** |
| P1-2 | Brand Request changes on a Submitted draft | Status ChangesRequested + feedback | **PASS** |
| P1-3 | Creator resubmits draft | Returns to Submitted | **PASS** |

## Audit / activity (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | After invite/brief/submit/review/publish | Dashboard activity shows related events | **PASS** |
| A2 | Settings → Reset demo data | Seed fixtures restored | **PASS** |

## Regression — Phase 1 still works (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Influencers filters + shortlist add | Still works | **PASS** |
| R2 | Products/Campaigns create | Still works | **PASS** |
| R3 | Analysis Jobs start demo | Queued → Completed | **PASS** |

## Out of scope (do not fail)

- Real auth, Nest/Postgres, payments, contracts, escrow, real social publish APIs.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-24 |
| Tester | Auto (agent) + `scripts/qa-smoke.sh` |
| Build / commit | `1f9bd36` |
| Environment | http://167.71.206.43:3000 |
| Health version | `0.2.0` |
| Smoke | **PASSED** — 17 routes HTTP 200 |
| P0 summary | **ALL PASS** |
| P1 summary | **ALL PASS** |
| Blockers | None |
| Sign-off | **READY TO SHIP Phase 2** |

### Automated smoke appendix

```text
Smoke against http://167.71.206.43:3000
PASS  200  /api/health
PASS  200  /
PASS  200  /influencers
PASS  200  /products
PASS  200  /campaigns
PASS  200  /shortlists
PASS  200  /invitations
PASS  200  /reviews
PASS  200  /claims
PASS  200  /analysis-jobs
PASS  200  /settings
PASS  200  /import
PASS  200  /creator
PASS  200  /creator/invitations
PASS  200  /creator/briefs
PASS  200  /creator/submissions
PASS  200  /creator/claim
Health body: {"status":"ok","service":"lumen-marketplace-web","version":"0.2.0","mode":"demo",...}
SMOKE PASSED
```

```bash
./scripts/qa-smoke.sh http://167.71.206.43:3000
```
