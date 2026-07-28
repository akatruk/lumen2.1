# Manual QA — Invite + Brief persistence (0.4.4)

**Target:** https://influencers.lumen.universalgravity.org  
**Expected version:** `0.4.4`

| ID | Steps | Expected | Result |
| --- | --- | --- | --- |
| H1 | GET /api/health | 0.4.4 | |
| I1 | Brand login → Invite influencer to campaign | POST invite 201; GET lists it | |
| I2 | Refresh / hydrate | Invite still present | |
| I3 | Creator Accept (same browser + brand cookie) | Accepted + brief auto-created | |
| I4 | Brand Issue brief (if needed) | Brief in GET /api/briefs | |
| I5 | Creator Acknowledge | status Acknowledged | |
| I6 | No cookie API | 401 | |
| D1 | Logged-out demo invite | localStorage still works | |

## Execution log

| Field | Value |
| --- | --- |
| Date | |
| Commit | |
| Sign-off | |
