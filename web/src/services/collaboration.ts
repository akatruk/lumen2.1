import type {
  ActivityEvent,
  CampaignBrief,
  CreatorSession,
  PerformanceSnapshot,
  ProfileClaim,
  Submission,
  SubmissionFeedback,
  SubmissionStatus,
} from "@/types";
import { loadJson, saveJson } from "@/lib/storage";
import { marketplace, influencerIdsMatch } from "@/services/marketplace";

const KEYS = {
  claims: "lumen.claims",
  briefs: "lumen.briefs",
  submissions: "lumen.submissions",
  performance: "lumen.performance",
  creatorSession: "lumen.creatorSession",
  activity: "lumen.activity",
} as const;

const CREATOR_SESSION_EVENT = "lumen:creator-session";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function pushActivity(type: ActivityEvent["type"], message: string) {
  const event: ActivityEvent = {
    id: uid("act"),
    type,
    message,
    createdAt: new Date().toISOString(),
  };
  const existing = loadJson(KEYS.activity, [] as ActivityEvent[]);
  saveJson(KEYS.activity, [event, ...existing].slice(0, 60));
  // Keep marketplace activity in sync when that key is used elsewhere
  if (typeof window !== "undefined") {
    const shared = loadJson("lumen.activity", [] as ActivityEvent[]);
    saveJson("lumen.activity", [event, ...shared].slice(0, 60));
  }
  return event;
}

const SEED_CLAIMS: ProfileClaim[] = [
  {
    id: "claim-1",
    influencerId: "inf-8",
    claimantName: "Tom Hughes",
    claimantEmail: "tom.creator.demo@example.com",
    proofNote: "I control @tomhughesbkk YouTube — can post verification code.",
    status: "PendingReview",
    createdAt: "2026-07-20T09:00:00Z",
  },
];

const SEED_BRIEFS: CampaignBrief[] = [
  {
    id: "brief-1",
    campaignId: "camp-2",
    invitationId: "inv-2",
    influencerId: "inf-1",
    title: "Soi 11 Soft Opening — dinner feature",
    deliverables: [
      "1 TikTok (30–45s) tasting signature dishes",
      "1 Instagram Reel with booking CTA",
      "Disclose paid partnership",
    ],
    messaging: "Late-night Thai kitchen energy, walk-in friendly, highlight pad kra pao and cocktails.",
    restrictions: ["No Michelin claims", "No competitor restaurant shoutouts"],
    deadline: "2026-07-28",
    approvalRules: "Brand must approve draft before public post.",
    status: "Sent",
    createdAt: "2026-07-13T10:00:00Z",
  },
];

const SEED_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    campaignId: "camp-2",
    invitationId: "inv-2",
    influencerId: "inf-1",
    briefId: "brief-1",
    status: "Submitted",
    draftUrl: "https://example.com/demo-drafts/narin-soi11-v1.mp4",
    privateReviewLink: "https://example.com/reviews/narin-soi11",
    caption: "Late-night pad kra pao run near Soi 11 — soft opening week.",
    feedback: [
      {
        id: "fb-1",
        authorRole: "creator",
        message: "Draft v1 uploaded for review.",
        createdAt: "2026-07-21T14:00:00Z",
      },
    ],
    createdAt: "2026-07-21T14:00:00Z",
    updatedAt: "2026-07-21T14:00:00Z",
  },
];

const SEED_PERFORMANCE: PerformanceSnapshot[] = [
  {
    id: "perf-1",
    campaignId: "camp-4",
    influencerId: "inf-12",
    submissionId: "sub-seed-published",
    publicationUrl: "https://instagram.com/p/demo-mina-samui-tour",
    recordedAt: "2026-07-10T12:00:00Z",
    views: 78000,
    likes: 6400,
    comments: 290,
    clicks: 410,
    notes: "Completed Samui tour campaign snapshot.",
  },
];

function getClaims() {
  return loadJson(KEYS.claims, SEED_CLAIMS);
}
function getBriefs() {
  return loadJson(KEYS.briefs, SEED_BRIEFS);
}
function getSubmissions() {
  return loadJson(KEYS.submissions, SEED_SUBMISSIONS);
}
function getPerformance() {
  return loadJson(KEYS.performance, SEED_PERFORMANCE);
}

export const collaboration = {
  getCreatorSession(): CreatorSession | null {
    return loadJson<CreatorSession | null>(KEYS.creatorSession, null);
  },

  setCreatorSession(influencerId: string | null) {
    if (!influencerId) {
      if (typeof window !== "undefined") window.localStorage.removeItem(KEYS.creatorSession);
    } else {
      saveJson(KEYS.creatorSession, { influencerId } satisfies CreatorSession);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(CREATOR_SESSION_EVENT, { detail: { influencerId } }),
      );
    }
  },

  /** Subscribe to Act-as changes (same-tab). Returns unsubscribe. */
  subscribeCreatorSession(cb: (influencerId: string | null) => void) {
    if (typeof window === "undefined") return () => {};
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ influencerId: string | null }>).detail?.influencerId ?? null;
      cb(id);
    };
    window.addEventListener(CREATOR_SESSION_EVENT, handler);
    return () => window.removeEventListener(CREATOR_SESSION_EVENT, handler);
  },

  listClaims() {
    return getClaims().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  submitClaim(input: {
    influencerId: string;
    claimantName: string;
    claimantEmail: string;
    proofNote: string;
  }) {
    const claim: ProfileClaim = {
      id: uid("claim"),
      ...input,
      status: "PendingReview",
      createdAt: new Date().toISOString(),
    };
    saveJson(KEYS.claims, [claim, ...getClaims()]);
    pushActivity("claim", `Profile claim submitted for ${input.claimantName}`);
    return claim;
  },

  reviewClaim(id: string, status: "Verified" | "Rejected", reviewNote = "") {
    const claims = getClaims();
    const idx = claims.findIndex((c) => c.id === id);
    if (idx < 0) return undefined;
    claims[idx] = {
      ...claims[idx],
      status,
      reviewNote,
      reviewedAt: new Date().toISOString(),
    };
    saveJson(KEYS.claims, claims);
    pushActivity("claim", `Claim ${status.toLowerCase()} for ${claims[idx].claimantName}`);
    return claims[idx];
  },

  listBriefs(filter?: { influencerId?: string; campaignId?: string }) {
    return getBriefs()
      .filter(
        (b) => !filter?.influencerId || influencerIdsMatch(b.influencerId, filter.influencerId),
      )
      .filter((b) => !filter?.campaignId || b.campaignId === filter.campaignId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createBrief(input: Omit<CampaignBrief, "id" | "createdAt" | "status"> & { status?: CampaignBrief["status"] }) {
    const brief: CampaignBrief = {
      ...input,
      id: uid("brief"),
      status: input.status ?? "Sent",
      createdAt: new Date().toISOString(),
    };
    saveJson(KEYS.briefs, [brief, ...getBriefs()]);
    const inf = marketplace.getInfluencer(brief.influencerId);
    pushActivity("brief", `Brief issued to ${inf?.name ?? brief.influencerId}: ${brief.title}`);
    return brief;
  },

  async createBriefAsync(
    input: Omit<CampaignBrief, "id" | "createdAt" | "status"> & { status?: CampaignBrief["status"] },
  ): Promise<CampaignBrief> {
    if (typeof window === "undefined") return this.createBrief(input);
    try {
      const auth = await fetch("/api/auth", { credentials: "same-origin" });
      const session = (await auth.json()) as { user: unknown };
      if (!session.user) return this.createBrief(input);
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as { brief?: CampaignBrief; error?: string };
      if (!res.ok || !data.brief) throw new Error(data.error || "Failed to create brief");
      const rest = getBriefs().filter((b) => b.id !== data.brief!.id);
      saveJson(KEYS.briefs, [data.brief, ...rest]);
      const inf = marketplace.getInfluencer(data.brief.influencerId);
      pushActivity("brief", `Brief issued to ${inf?.name ?? data.brief.influencerId}: ${data.brief.title}`);
      return data.brief;
    } catch {
      return this.createBrief(input);
    }
  },

  acknowledgeBrief(id: string) {
    const briefs = getBriefs();
    const idx = briefs.findIndex((b) => b.id === id);
    if (idx < 0) return undefined;
    briefs[idx] = { ...briefs[idx], status: "Acknowledged" };
    saveJson(KEYS.briefs, briefs);
    pushActivity("brief", `Brief acknowledged: ${briefs[idx].title}`);
    return briefs[idx];
  },

  async acknowledgeBriefAsync(id: string) {
    if (typeof window === "undefined") return this.acknowledgeBrief(id);
    try {
      const auth = await fetch("/api/auth", { credentials: "same-origin" });
      const session = (await auth.json()) as { user: unknown };
      if (!session.user) return this.acknowledgeBrief(id);
      const res = await fetch("/api/briefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, status: "Acknowledged" }),
      });
      const data = (await res.json()) as { brief?: CampaignBrief; error?: string };
      if (!res.ok || !data.brief) throw new Error(data.error || "Failed to acknowledge brief");
      const rest = getBriefs().filter((b) => b.id !== data.brief!.id);
      saveJson(KEYS.briefs, [data.brief, ...rest]);
      pushActivity("brief", `Brief acknowledged: ${data.brief.title}`);
      return data.brief;
    } catch {
      return this.acknowledgeBrief(id);
    }
  },

  listSubmissions(filter?: { influencerId?: string; campaignId?: string; status?: SubmissionStatus }) {
    return getSubmissions()
      .filter(
        (s) => !filter?.influencerId || influencerIdsMatch(s.influencerId, filter.influencerId),
      )
      .filter((s) => !filter?.campaignId || s.campaignId === filter.campaignId)
      .filter((s) => !filter?.status || s.status === filter.status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  upsertSubmission(input: {
    campaignId: string;
    invitationId: string;
    influencerId: string;
    briefId: string;
    draftUrl?: string;
    privateReviewLink?: string;
    caption?: string;
  }) {
    const existing = getSubmissions().find(
      (s) => s.briefId === input.briefId && s.influencerId === input.influencerId,
    );
    const now = new Date().toISOString();
    if (existing) {
      const next: Submission = {
        ...existing,
        draftUrl: input.draftUrl ?? existing.draftUrl,
        privateReviewLink: input.privateReviewLink ?? existing.privateReviewLink,
        caption: input.caption ?? existing.caption,
        status: "Submitted",
        updatedAt: now,
        feedback: [
          ...existing.feedback,
          {
            id: uid("fb"),
            authorRole: "creator",
            message: "Updated draft submitted for review.",
            createdAt: now,
          },
        ],
      };
      saveJson(
        KEYS.submissions,
        getSubmissions().map((s) => (s.id === existing.id ? next : s)),
      );
      pushActivity("submission", `Draft updated by creator for brief ${input.briefId}`);
      return next;
    }

    const created: Submission = {
      id: uid("sub"),
      ...input,
      status: "Submitted",
      feedback: [
        {
          id: uid("fb"),
          authorRole: "creator",
          message: "Draft submitted for review.",
          createdAt: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    saveJson(KEYS.submissions, [created, ...getSubmissions()]);
    pushActivity("submission", `New draft submitted for campaign ${input.campaignId}`);
    return created;
  },

  brandReview(submissionId: string, action: "approve" | "request_changes", message: string) {
    const subs = getSubmissions();
    const idx = subs.findIndex((s) => s.id === submissionId);
    if (idx < 0) return undefined;
    const now = new Date().toISOString();
    const fb: SubmissionFeedback = {
      id: uid("fb"),
      authorRole: "brand",
      message,
      createdAt: now,
    };
    subs[idx] = {
      ...subs[idx],
      status: action === "approve" ? "Approved" : "ChangesRequested",
      updatedAt: now,
      feedback: [...subs[idx].feedback, fb],
    };
    saveJson(KEYS.submissions, subs);
    pushActivity(
      "review",
      action === "approve"
        ? `Submission approved (${submissionId})`
        : `Changes requested on submission (${submissionId})`,
    );
    return subs[idx];
  },

  publishSubmission(submissionId: string, publicationUrl: string) {
    const subs = getSubmissions();
    const idx = subs.findIndex((s) => s.id === submissionId);
    if (idx < 0) return undefined;
    if (subs[idx].status !== "Approved") {
      throw new Error("Only approved submissions can be published");
    }
    const now = new Date().toISOString();
    subs[idx] = {
      ...subs[idx],
      status: "Published",
      publicationUrl,
      updatedAt: now,
      feedback: [
        ...subs[idx].feedback,
        {
          id: uid("fb"),
          authorRole: "creator",
          message: `Published: ${publicationUrl}`,
          createdAt: now,
        },
      ],
    };
    saveJson(KEYS.submissions, subs);

    const snap: PerformanceSnapshot = {
      id: uid("perf"),
      campaignId: subs[idx].campaignId,
      influencerId: subs[idx].influencerId,
      submissionId,
      publicationUrl,
      recordedAt: now,
      views: 0,
      likes: 0,
      comments: 0,
      notes: "Initial publication recorded. Metrics can be updated later.",
    };
    saveJson(KEYS.performance, [snap, ...getPerformance()]);
    pushActivity("publish", `Publication recorded: ${publicationUrl}`);
    return subs[idx];
  },

  updatePerformance(id: string, patch: Partial<PerformanceSnapshot>) {
    const rows = getPerformance();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return undefined;
    rows[idx] = { ...rows[idx], ...patch, id };
    saveJson(KEYS.performance, rows);
    return rows[idx];
  },

  listPerformance(filter?: { campaignId?: string; influencerId?: string }) {
    return getPerformance()
      .filter((p) => !filter?.campaignId || p.campaignId === filter.campaignId)
      .filter((p) => !filter?.influencerId || p.influencerId === filter.influencerId)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  },

  /** End-to-end demo: invitation accepted → brief → draft → approve → publish */
  ensureWorkflowDemo() {
    return {
      invitationId: "inv-2",
      briefId: "brief-1",
      submissionId: "sub-1",
    };
  },
};
