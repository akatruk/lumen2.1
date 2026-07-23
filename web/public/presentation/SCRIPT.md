# Narration Script — ~7:30 (EN)

Speak naturally. Bracketed text = on-screen action, not spoken.

---

## 0:00–0:40 — Hook + title

**Slide: Title**

Today I want to show **Lumen Influencer Marketplace** — a Thailand-focused platform that helps brands discover creators, understand their content with Lumen video analysis, and collaborate from invitation all the way to a published post.

This is not another follower-count directory. We score fit using topics, language, geography, style, engagement quality, and brand safety — with explanations humans can trust.

---

## 0:40–1:40 — Problem

**Slide: The problem**

Agency and brand teams in Thailand still do this manually:

- hunting creators across TikTok, Instagram, YouTube;
- watching dozens of videos;
- guessing whether the audience and messaging fit a condo, a restaurant, skincare, a tour, or a gym;
- chasing briefs and drafts in chat threads.

Follower count does not answer: *Does this creator’s recent content match this product?*

That gap costs time, budget, and brand risk.

---

## 1:40–2:40 — Solution + market

**Slide: Solution**

Lumen Influencer Marketplace connects three pieces:

1. **Brand console** — products, campaigns, discovery, shortlists, reviews.
2. **Creator portal** — invitations, briefs, drafts, publication.
3. **Lumen analysis** — transcription and content intelligence on recent videos (mock in the demo; real Lumen API next).

**Initial market:** Thailand. Platforms: TikTok, Instagram, YouTube. Languages: Thai and English first; Russian and Chinese ready for later.

Customers: local brands, agencies, hospitality, real estate, tourism, F&B, e-commerce.

---

## 2:40–4:40 — Live demo: Discovery (Phase 1)

**[Switch to browser: http://167.71.206.43:3000]**

### Dashboard (~20s)
Here is the brand console dashboard — Thailand pilot metrics, recommended creators, topics, analysis jobs, and activity.

### Influencers (~50s)
Open **Influencers**. We have a catalog of Thailand creators — Bangkok, Phuket, Chiang Mai, Pattaya, Samui.

Filter by platform, city, language, topic. Sort by match score. Switch card and table views.

Select **Match for product** — for example the Phuket condo — and scores re-rank for that offer.

### Profile (~40s)
Open a creator. You see audience metrics, topics, style, brand-safety signals, recent videos with transcripts and analysis, and an **explainable match score**: topic relevance, audience and geography, language, content style, engagement, posting consistency, brand safety, commercial fit.

Add to shortlist. Invite to campaign.

### Products & campaigns (~30s)
Products and campaigns are first-class objects — condo, restaurant, skincare, island tour, fitness membership — with geography, languages, benefits, and prohibited claims.

---

## 4:40–6:40 — Live demo: Collaboration (Phase 2)

**[Keep browser; open second tab `/creator`]**

This is the collaboration loop we just shipped.

### Brand: Invitations & Reviews (~40s)
From the brand side: invitations, then **Reviews**. Drafts arrive with private review links. Approve or request changes. After publish, record performance snapshots.

### Creator portal (~60s)
In the **Creator portal**, a creator — here Narin in Bangkok — accepts an invitation, acknowledges the brief, submits a draft URL and private review link, and after approval records the publication URL on their own social account.

We also support **profile claim** — creators request ownership; brand operators verify or reject.

### End-to-end sentence (~20s)
So the validated path is:

**Invite → Accept → Brief → Draft → Review → Approve → Publish → Performance.**

No payments or contracts yet — that is Phase 3. First we prove matching and workflow.

---

## 6:40–7:20 — Architecture & roadmap

**Slide: Architecture / Roadmap**

Today the demo runs as a Next.js app with a service layer and mock Lumen client — ready to swap for NestJS, PostgreSQL, and the real Lumen Analysis API.

Roadmap:

- **Phase 1** — Discovery MVP — done.
- **Phase 2** — Collaboration — done in demo.
- **Phase 3** — Commercial marketplace — contracts, payments, payouts.
- **Phase 4** — Scale — more data sources, learning from campaign outcomes, multi-market.

Responsible data: official APIs and approved providers — no uncontrolled scraping.

---

## 7:20–7:50 — Close

**Slide: Close / CTA**

Lumen Influencer Marketplace turns video understanding into campaign decisions — for Thailand brands that need creators who actually fit.

Demo is live. Happy to walk through a pilot category next — real estate, F&B, beauty, or tourism.

Thank you.

---

## Timing cheatsheet

| Block | Time |
| --- | ---: |
| Hook | 0:40 |
| Problem | 1:00 |
| Solution | 1:00 |
| Discovery demo | 2:00 |
| Collaboration demo | 2:00 |
| Architecture + close | 1:10 |
| **Total** | **~7:50** |

Stretch to 10 min: linger on one full match explanation + one full approve→publish click-through.  
Cut to 5 min: skip Products deep-dive and Claims; keep one discovery profile + one collaboration loop.
