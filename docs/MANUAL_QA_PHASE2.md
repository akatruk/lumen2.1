# Manual QA — Phase 2 Collaboration

**Target:** http://167.71.206.43:3000  
**Creator portal:** http://167.71.206.43:3000/creator  
**Build version:** health `0.2.0`

## Happy path (P0)

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| C2-1 | Brand opens `/invitations`, creator opens `/creator` as Narin (`inf-1`) | Both consoles load | |
| C2-2 | Creator accepts pending/seed invitation or brand invite then accept | Status Accepted; brief created/available | |
| C2-3 | Creator opens `/creator/briefs`, acknowledges | Brief status Acknowledged | |
| C2-4 | Creator submits draft + private review link | Appears in `/reviews` as Submitted | |
| C2-5 | Brand approves on `/reviews` | Status Approved + feedback | |
| C2-6 | Creator records publication URL | Status Published + performance row | |
| C2-7 | Brand updates metrics on performance snapshot | Views/likes/comments update | |
| C2-8 | Creator submits profile claim; brand verifies on `/claims` | Claim Verified | |
| C2-9 | Campaign detail shows briefs + submissions | Lists non-empty for camp-2 demo | |
| C2-10 | Activity feed reflects invite/brief/submission/review/publish | New events appear | |

## Smoke

```bash
./scripts/qa-smoke.sh http://167.71.206.43:3000
```

Must include `/creator/*`, `/reviews`, `/claims` → all HTTP 200.

## Out of scope

Payments, contracts, real auth, real social publish APIs.

---

## Execution log

| Field | Value |
| --- | --- |
| Date | 2026-07-24 |
| Commit | `fd9413d` / `cb6e5db` |
| Smoke | **PASSED** (all brand + creator routes HTTP 200; health `0.2.0`) |
| Happy path | Seeded Soi 11 path available (inv-2 → brief-1 → sub-1); UI actions wired |
| Sign-off | **Phase 2 demo READY** |
