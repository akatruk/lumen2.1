# Creator Portal Guide

**Audience:** Creators invited to a Lumen Influencer Marketplace campaign
**Portal:** https://influencers.lumen.universalgravity.org/creator
**Language:** English
**Product version:** 0.4.9+
**Primary platform:** China / **Douyin (中国抖音)**. See the honest login note below — creator login OAuth is currently international TikTok only, a leftover from the pre-Douyin pilot, **not** 抖音登录 (Douyin login).

This guide tells you exactly what to do in the **Creator portal**. You publish content on **your own** social account (primarily **Douyin**; Instagram etc. as secondary). Lumen is the collaboration workspace with the brand — not a posting tool.

---

## Before you start — honest login status

| Item | Detail |
| --- | --- |
| Browser | Chrome or Safari; prefer **HTTPS** (link above) |
| Douyin login (抖音登录) | **Not wired yet.** Douyin Open Platform OAuth is planned but not implemented — do not tell creators "Login with Douyin" today. |
| Available login today | **International TikTok Login** at [Creator login](https://influencers.lumen.universalgravity.org/creator/login) → **Continue with intl TikTok**. This is a **leftover** OAuth flow reusing the shared Strom TikTok Developer App (`TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`, no new account) — it authenticates an international TikTok identity, it does **not** log a creator into Douyin. |
| Recommended fallback for Douyin creators | **Act as creator** in the portal sidebar — pick your profile manually until Douyin OAuth ships |
| What you need ready | Draft video link (Drive / Frame.io / unlisted Douyin video), optional private review link, caption draft |
| What you do **not** need | Brand console password, SSH, API keys |

If your profile is missing from the Act-as list, ask the brand to **Add to catalog** from Discover first, or submit a **Claim profile** request (see below).

---

## 5-minute map of the portal

| Menu | Purpose |
| --- | --- |
| **Home** | Snapshot: invitations, briefs, submissions counts + next actions |
| **Invitations** | Accept or decline brand campaign invites |
| **Briefs** | Read deliverables, messaging, restrictions, deadline; acknowledge |
| **Submissions** | Send draft URL + review link; after approval, record your public post URL |
| **Claim profile** | Request ownership of the catalog profile that matches you |

Left sidebar **Act as creator** must show **your** name / `@handle`. If it shows someone else, switch it before you do anything.

---

## Step-by-step workflow

### 1. Sign in

**If you are a Douyin creator (most creators today):** Douyin login is not wired yet. Skip to the fallback — open `/creator`, pick yourself in **Act as creator**, then continue.

**If you happen to have an international TikTok account and want to try the leftover OAuth:**

1. Go to https://influencers.lumen.universalgravity.org/creator/login
2. Click **Continue with intl TikTok** and approve access. (This is explicitly the international TikTok app, not Douyin.)
3. You land on Creator home signed in as your intl TikTok display name.
4. **Fallback (works for everyone, incl. Douyin creators):** open `/creator`, pick yourself in **Act as creator**, then continue.

### 2. Review invitations

1. Open **Invitations**.  
2. Find the campaign invite from the brand (status **Pending**).  
3. Read the message.  
4. Click **Accept** if you want the job, or **Decline** if not.  
5. After Accept, a **brief** is created (or becomes available) for that campaign.

You should only see invites for the profile selected in Act-as.

### 3. Open and acknowledge the brief

1. Open **Briefs**.  
2. Open the campaign brief. Check:
   - Deliverables (e.g. 1 short video + caption)
   - Messaging / talking points
   - Restrictions / prohibited claims (follow these strictly)
   - Deadline
   - Approval rules (usually: draft must be approved before you post publicly)
3. Click **Acknowledge** (or equivalent) so the brand knows you read it.

Do not post publicly until the brand has **Approved** your draft (unless the brief says otherwise).

### 4. Submit your draft

1. Open **Submissions**.  
2. Select the correct **Brief**.  
3. Fill in:
   - **Draft URL** — link to the edit / private file the brand can watch  
   - **Private review link** — optional Frame.io / unlisted link  
   - **Caption** — intended on-platform caption  
4. Click **Submit draft**.  
5. Status becomes **Submitted** (brand reviews in their console).

If the brand requests changes, update the URLs/caption and submit again.

### 5. After brand approval — publish on your account

1. Wait until submission status is **Approved**.  
2. Post the video on **your** Douyin (or agreed platform), following the brief.  
3. Back in **Submissions**, paste the **public post URL**.  
4. Record / confirm publication so the brand can track performance.

You own the social post. The brand records the URL and basic metrics in Lumen.

### 6. (Optional) Claim your profile

If this is your first time and the catalog row is not yet “yours”:

1. Open **Claim profile**.  
2. Confirm Act-as is your profile.  
3. Enter your real name, contact email, and a short proof note (e.g. you control `@handle` and can post a verification code).  
4. Submit. Brand operators review claims under **Claims** in the brand console.

---

## Do / Don’t

**Do**
- Keep Act-as on your own profile for the whole session  
- Follow prohibited claims and approval rules in the brief  
- Use HTTPS links the brand can open without login walls when possible  
- Publish only after **Approved**, then paste the live URL  

**Don’t**
- Switch Act-as to another creator and accept their invites  
- Post guaranteed ROI / medical / whitening claims if the brief forbids them  
- Share `.env`, passwords, or internal brand tools  
- Expect Lumen to upload the video to Douyin (or any platform) for you — it does not  

---

## Troubleshooting

| Problem | What to try |
| --- | --- |
| Act-as list has no me | Ask brand to add you from Discover / catalog; refresh the page |
| Home shows another name | Re-select yourself in Act as creator |
| No invitations | Confirm Act-as; ask brand if invite was sent to your influencer id |
| Accept did nothing | Hard refresh; stay on HTTPS; ask brand if they are logged in (server invites) |
| Brief missing after Accept | Open **Briefs** and refresh; ask brand to click **Issue brief** |
| Draft submit disabled | Select a brief first; acknowledge brief if required |
| Cookie / login confusion | Creators use **/creator/login** (intl TikTok leftover login — not Douyin). Brand **Login** is for brands only. **Act-as is the recommended path for Douyin creators** until Douyin OAuth ships. |

---

## Privacy & content notes (pilot)

- Use public or shared links you are comfortable showing the brand.  
- Do not upload government IDs into the claim form.  
- Follow the brand’s claim guidelines for your market (current primary: China / Douyin campaigns; Thailand F&B pilot guidance is historical); Lumen may flag risky wording later — the brief restrictions still win.  
- You can ask the brand to delete pilot data after the campaign under their retention policy.

---

## Contact

For portal access, wrong profile, or invite issues, contact your **brand / agency operator** (not the public GitHub issues unless they say so).

---

## Related docs (internal)

| Doc | Audience |
| --- | --- |
| [`phase0/SAMPLE_CAMPAIGN_BRIEF.md`](./phase0/SAMPLE_CAMPAIGN_BRIEF.md) | Example F&B brief (Soi 11, historical Thailand pilot — structural template only) |
| [`MANUAL_QA_PHASE2.md`](./MANUAL_QA_PHASE2.md) | Operator QA for collaboration |
| [`ROADMAP.md`](./ROADMAP.md) | Phase 2 / future creator login |

**Note for operators:** the intl TikTok login (`tiktokOAuth: true` in `/api/health`) is a **leftover, not Douyin login** — it reuses the shared Strom TikTok Developer App (`TIKTOK_CLIENT_KEY`/`TIKTOK_CLIENT_SECRET`, redirect `https://influencers.lumen.universalgravity.org/api/auth/tiktok/callback`; no new account, never paste the secret values into docs/commits). Douyin Open Platform OAuth for creator login is **not built yet** — until it ships, Act-as is the correct path for Douyin creators and remains available whenever `CREATOR_AUTH_REQUIRED=false`.
