# Phase 0 — Locked Product Decisions

**Status:** APPROVED for pilot planning (agent-authored 2026-07-28; product owner may override)  
**Demo reference:** http://167.71.206.43:3000  
**Related:** [MVP_SCOPE.md](./MVP_SCOPE.md) · [SAMPLE_CAMPAIGN_BRIEF.md](./SAMPLE_CAMPAIGN_BRIEF.md) · [COMPLIANCE_AND_DATA.md](./COMPLIANCE_AND_DATA.md)

These decisions close `PRODUCT_REQUIREMENTS.md` §10 and unlock backend Phase 1–2 hardening.

## Decision summary

| # | Question | Decision |
| --- | --- | --- |
| D1 | Pilot product category | **Restaurant / F&B (Bangkok)** |
| D2 | First brand persona | **Bangkok Bites Co. — Soi 11 Thai Kitchen** (`prod-2` / `camp-2`) |
| D3 | Influencer data sources (MVP) | **Manual URL + CSV import + creator claim**; no uncontrolled scraping |
| D4 | Publishing model | **Creators publish only to their own social accounts** |
| D5 | Launch languages | **Thai + English** required; RU/ZH not pilot KPIs |
| D6 | Outreach model | **Brand/agency-managed outreach** + creator portal for accept/brief/submit |
| D7 | Pilot campaign metrics | Views, likes, comments, saves (if available), posts published, time-to-approve, optional foot-traffic / promo redemptions (manual) |
| D8 | Primary discovery surface | **TikTok first**; Instagram secondary; YouTube optional |

## Rationale (short)

1. **F&B over Real Estate / Skincare** — shortest content cycle, clearer video→match signal (food topics), lower regulated-claims risk than property ROI or whitening claims, and already has the richest demo path (Narin · Soi 11).
2. **Soi 11 Thai Kitchen** — concrete venue, Sukhumvit corridor, bilingual diners, soft-opening style campaign already seeded.
3. **No scraping** — ToS and ops risk; CSV + URL + claim is enough to validate matching before buying a provider.
4. **Own-account publish** — matches creator reality and keeps auto-publish out of scope.
5. **th/en only for pilot KPIs** — matches restaurant diner mix; RU/ZH stay available in analysis but do not gate success.

## Explicit non-goals for Phase 0 / pilot

- Payments, escrow, micro-contracts (Phase 3).
- Multi-brand agency workspaces (Phase 4).
- Live scraping / unofficial APIs.
- Auto-DM / auto-outreach.
- Hosting a public consumer video feed on Lumen.

## Success gate to exit Phase 0

- [x] Decisions locked in this file
- [x] MVP scope approved doc
- [x] Sample campaign brief
- [x] Sample influencer set ≥50 (`influencer-pilot-set.csv`)
- [x] Analysis output contract validated on demo fixtures
- [x] Data & compliance review written

**Next:** Phase 1–2 production hardening (API, auth, real Lumen jobs) using this pilot as the acceptance scenario.
