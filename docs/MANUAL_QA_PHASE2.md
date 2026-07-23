# Manual QA — Phase 2 Collaboration

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
| S1 | `GET /api/health` | HTTP 200, `status=ok`, `version=0.2.0` | |
| S2 | `./scripts/qa-smoke.sh http://167.71.206.43:3000` | All listed routes HTTP 200 | |
| S3 | Open brand `/` and creator `/creator` | Both shells render; cross-links work | |
| S4 | Mobile width ≤390px on both shells | Menus open/close; nav usable | |

## Brand navigation (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| BN1 | Visit `/reviews`, `/claims`, `/invitations` | Pages load | |
| BN2 | Sidebar shows Reviews + Claims + link to creator portal | Present | |

## Creator portal shell (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| CP1 | Open `/creator` | Home KPIs + next actions | |
| CP2 | Switch creator in dropdown | Session changes; lists refresh for selected creator | |
| CP3 | Nav: Invitations / Briefs / Submissions / Claim | All routes load | |

## Happy path — invite → publish (P0)

Seeded path: Narin (`inf-1`) · Soi 11 (`camp-2`) · `inv-2` · `brief-1` · `sub-1`.

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C2-1 | Brand `/invitations` + creator `/creator` as Narin | Both load; Narin has Accepted invite and/or open work | |
| C2-2 | Creator accepts a Pending invite (or Maya pending condo invite) | Status Accepted; brief auto-created if missing | |
| C2-3 | Creator `/creator/briefs` → Acknowledge | Status Acknowledged | |
| C2-4 | Creator `/creator/submissions` → submit draft + private review link | Brand `/reviews` shows Submitted | |
| C2-5 | Brand `/reviews` → Approve with note | Status Approved + brand feedback | |
| C2-6 | Creator records publication URL | Status Published | |
| C2-7 | Brand updates performance metrics | Views/likes/comments update | |
| C2-8 | Campaign `/campaigns/camp-2` | Briefs + submissions visible | |

## Claims (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| CL1 | Creator `/creator/claim` submit claim | Appears PendingReview | |
| CL2 | Brand `/claims` Verify | Status Verified | |
| CL3 | Brand Reject path (optional alternate creator) | Status Rejected; no crash | |

## Decline / changes-requested (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| P1-1 | Creator Declines a pending invite | Status Declined; no brief forced | |
| P1-2 | Brand Request changes on a Submitted draft | Status ChangesRequested + feedback | |
| P1-3 | Creator resubmits draft | Returns to Submitted | |

## Audit / activity (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| A1 | After invite/brief/submit/review/publish | Dashboard activity shows related events | |
| A2 | Settings → Reset demo data | Seed fixtures restored | |

## Regression — Phase 1 still works (P1)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| R1 | Influencers filters + shortlist add | Still works | |
| R2 | Products/Campaigns create | Still works | |
| R3 | Analysis Jobs start demo | Queued → Completed | |

## Out of scope (do not fail)

- Real auth, Nest/Postgres, payments, contracts, escrow, real social publish APIs.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Tester | |
| Build / commit | |
| Environment | http://167.71.206.43:3000 |
| Health version | |
| Smoke | |
| P0 summary | |
| P1 summary | |
| Blockers | |
| Sign-off | |

### Automated smoke appendix

```bash
./scripts/qa-smoke.sh http://167.71.206.43:3000
```
