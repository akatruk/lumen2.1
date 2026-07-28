# Phase 0 — Data & Compliance Review

**Scope:** Thailand F&B pilot · Lumen Influencer Marketplace  
**Date:** 2026-07-28  
**Classification:** Working review (not legal advice)

## 1. Data we intend to process

| Data class | Examples | Source | Sensitivity |
| --- | --- | --- | --- |
| Public profile metadata | handle, bio, follower counts, public URLs | Manual/CSV / approved provider / creator auth | Low–medium |
| Public video metadata | captions, timestamps, public stats | Same | Low–medium |
| Derived analysis | transcript, topics, style, safety flags | Lumen Analysis | Medium |
| Contact / claim | email, claim evidence | Creator-submitted | High |
| Campaign workflow | briefs, drafts, review notes, publish URLs | Brand + creator | Medium–high |
| Performance snapshots | views/likes/comments | Creator report or API | Low–medium |

## 2. Approved collection methods (pilot)

**Primary (required product capability)**

1. **In-app TikTok discovery** via Marketplace → approved connector (official API and/or contracted provider, e.g. same class as Lumen TikHub)
2. Automatic pull of public profile metadata + recent public videos for dossier + Lumen analysis
3. Source + collection timestamp recorded on every profile/video

**Secondary (fallback)**

4. Manual paste of public profile URLs  
5. CSV import of profile URLs + optional public metrics (operator-attested)  
6. Creator-initiated profile claim + corrections / removal request  

**Forbidden**

1. Uncontrolled DIY scraping / ToS-violating automation outside an approved connector  
2. Purchasing shady “follower dumps” without provenance  
3. Storing private DMs or non-public content without authorization  

See also [`../DISCOVERY_AND_DOSSIER.md`](../DISCOVERY_AND_DOSSIER.md).

## 3. Retention (pilot defaults — tune with counsel)

| Record | Default retention |
| --- | --- |
| Analysis artifacts | 180 days unless campaign-linked |
| Campaign + submissions | 365 days after campaign end |
| Claim evidence | Until resolved + 90 days |
| Audit log | 365 days minimum |
| Soft-deleted profiles | 30-day purge window after removal request |

## 4. Rights & creator controls

- Claim / verify profile  
- Correct inaccurate fields  
- Request removal / delist from marketplace discovery  
- Decline invitations without penalty in-product  

## 5. Brand-safety & advertising risk (F&B)

- Enforce prohibited claims list from product/campaign (see Soi 11 brief)  
- Alcohol content: age-appropriate; no minor targeting  
- No fabricated awards / health cures  
- Human review required when analysis `brandSafety.status = review|risk`

## 6. Cross-border / PDPA notes (Thailand)

Pilot stores creator and brand operational data that may include personal data under PDPA. Before production:

1. Appoint/confirm data controller entity  
2. Publish privacy notice covering marketplace + analysis  
3. Define lawful basis for processing public vs submitted data  
4. Ensure subprocessors (hosting, Lumen analysis, email) have DPAs  
5. Document cross-border transfer if infra is outside TH  

**Flag:** Current demo on DO droplet + localStorage is **not** PDPA-ready production.

## 7. Platform ToS posture

| Platform | Pilot posture |
| --- | --- |
| TikTok | **In-app discovery via approved connector**; creator claim/correction; prefer official API or contracted provider (Lumen-compatible) |
| Instagram | Same |
| YouTube | Same; lower priority for F&B pilot |

## 8. Residual risks (accept / mitigate)

| Risk | Mitigation |
| --- | --- |
| Stale public metrics | Show freshness timestamp; re-analyze before shortlist lock |
| Wrong identity / fake claim | Manual verify queue; require proof links |
| Transcript errors → bad match | Show confidence + evidence clips; operator override |
| Operator CSV with scraped rows | Import attestation checkbox + audit who imported |

## 9. Phase 0 compliance exit

- [x] Allowed/forbidden sources written  
- [x] Creator rights listed  
- [x] Retention defaults proposed  
- [ ] Legal counsel sign-off on PDPA notice (external — open)  
- [ ] Provider contract if/when non-manual source added (open)

Open items do **not** block writing backend specs; they block **production** go-live with real personal data.
