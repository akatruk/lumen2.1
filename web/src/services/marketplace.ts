import type {
  ActivityEvent,
  AnalysisJob,
  AppSettings,
  Campaign,
  DashboardStats,
  ImportPreviewRow,
  Influencer,
  Invitation,
  Platform,
  Product,
  Shortlist,
  VideoSnapshot,
} from "@/types";
import {
  MOCK_ANALYSIS_JOBS,
  MOCK_CAMPAIGNS,
  MOCK_INFLUENCERS,
  MOCK_PRODUCTS,
  MOCK_SHORTLISTS,
  MOCK_VIDEOS,
} from "@/data/mock";
import { loadJson, saveJson } from "@/lib/storage";
import { lumenAnalysis } from "@/services/lumen-analysis";

const KEYS = {
  products: "lumen.products",
  campaigns: "lumen.campaigns",
  shortlists: "lumen.shortlists",
  jobs: "lumen.jobs",
  influencerNotes: "lumen.influencerNotes",
  settings: "lumen.settings",
  invitations: "lumen.invitations",
  activity: "lumen.activity",
} as const;

const defaultSettings: AppSettings = {
  locale: "en",
  defaultVideosToAnalyze: 5,
  matchWeights: {
    topicRelevance: 25,
    audienceGeography: 20,
    language: 10,
    contentStyle: 10,
    engagementQuality: 15,
    postingConsistency: 5,
    brandSafety: 10,
    commercialFit: 5,
  },
};

const SEED_INVITATIONS: Invitation[] = [
  {
    id: "inv-1",
    influencerId: "inf-2",
    campaignId: "camp-1",
    status: "Pending",
    message: "We'd like you to cover the Kata Beach soft launch with a walkthrough.",
    createdAt: "2026-07-18T10:00:00Z",
  },
  {
    id: "inv-2",
    influencerId: "inf-1",
    campaignId: "camp-2",
    status: "Accepted",
    message: "Soft opening dinner feature for Soi 11 Thai Kitchen.",
    createdAt: "2026-07-12T09:00:00Z",
  },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function getProducts(): Product[] {
  return loadJson(KEYS.products, MOCK_PRODUCTS);
}

function getCampaigns(): Campaign[] {
  return loadJson(KEYS.campaigns, MOCK_CAMPAIGNS);
}

function getShortlists(): Shortlist[] {
  return loadJson(KEYS.shortlists, MOCK_SHORTLISTS);
}

function getJobs(): AnalysisJob[] {
  return loadJson(KEYS.jobs, MOCK_ANALYSIS_JOBS);
}

function getInfluencerNotes(): Record<string, string> {
  return loadJson(KEYS.influencerNotes, {} as Record<string, string>);
}

function getInvitations(): Invitation[] {
  return loadJson(KEYS.invitations, SEED_INVITATIONS);
}

function getActivity(): ActivityEvent[] {
  return loadJson(KEYS.activity, [
    {
      id: "act-1",
      type: "analysis",
      message: "Completed analysis for Narin Chaiyaphum (5 videos)",
      createdAt: "2026-07-20T08:12:00Z",
    },
    {
      id: "act-2",
      type: "shortlist",
      message: "Added Maya Riverton to Phuket Condo Finalists",
      createdAt: "2026-07-02T10:00:00Z",
    },
    {
      id: "act-3",
      type: "invite",
      message: "Invitation sent to Maya Riverton for Kata Condo Soft Launch Q3",
      createdAt: "2026-07-18T10:00:00Z",
    },
  ] as ActivityEvent[]);
}

function pushActivity(type: ActivityEvent["type"], message: string) {
  const event: ActivityEvent = {
    id: uid("act"),
    type,
    message,
    createdAt: new Date().toISOString(),
  };
  saveJson(KEYS.activity, [event, ...getActivity()].slice(0, 40));
  return event;
}

export const marketplace = {
  getSettings(): AppSettings {
    return loadJson(KEYS.settings, defaultSettings);
  },

  saveSettings(settings: AppSettings) {
    saveJson(KEYS.settings, settings);
  },

  resetDemoData() {
    Object.values(KEYS).forEach((key) => {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
    });
  },

  listActivity(): ActivityEvent[] {
    return getActivity().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getDashboard(): DashboardStats {
    const influencers = MOCK_INFLUENCERS;
    const shortlists = getShortlists();
    const campaigns = getCampaigns();
    const topicMap = new Map<string, number>();
    for (const inf of influencers) {
      for (const t of inf.topics) topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
    }
    const shortlisted = new Set(shortlists.flatMap((s) => s.items.map((i) => i.influencerId)));
    return {
      influencers: influencers.length,
      analyzedVideos: influencers.reduce((sum, i) => sum + i.analyzedVideos, 0),
      activeCampaigns: campaigns.filter((c) => c.status === "Active").length,
      shortlistedInfluencers: shortlisted.size,
      topicStats: [...topicMap.entries()]
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
    };
  },

  listInfluencers(): Influencer[] {
    const notes = getInfluencerNotes();
    return MOCK_INFLUENCERS.map((inf) => ({
      ...inf,
      notes: notes[inf.id] ?? inf.notes,
    })).sort((a, b) => b.matchScore - a.matchScore);
  },

  getInfluencer(id: string): Influencer | undefined {
    return this.listInfluencers().find((i) => i.id === id);
  },

  rankForProduct(productId: string): Influencer[] {
    const product = this.getProduct(productId);
    if (!product) return this.listInfluencers();
    return this.listInfluencers()
      .map((inf) => {
        const topicHits = inf.topics.filter((t) => product.desiredTopics.includes(t)).length;
        const langHits = inf.languages.filter((l) => product.languages.includes(l)).length;
        const geoHit = product.geography.some(
          (g) => inf.city === g || inf.country === g || g === "Thailand",
        )
          ? 8
          : 0;
        const linked = inf.suitableProductIds.includes(productId) ? 12 : 0;
        const adjusted = Math.min(
          99,
          Math.round(inf.matchScore * 0.7 + topicHits * 6 + langHits * 4 + geoHit + linked),
        );
        return { ...inf, matchScore: adjusted };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  },

  getVideosForInfluencer(id: string): VideoSnapshot[] {
    return MOCK_VIDEOS.filter((v) => v.influencerId === id);
  },

  updateInfluencerNotes(id: string, notes: string) {
    const all = getInfluencerNotes();
    all[id] = notes;
    saveJson(KEYS.influencerNotes, all);
  },

  listProducts(): Product[] {
    return getProducts().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getProduct(id: string): Product | undefined {
    return getProducts().find((p) => p.id === id);
  },

  createProduct(input: Omit<Product, "id" | "createdAt">): Product {
    const product: Product = {
      ...input,
      id: uid("prod"),
      createdAt: new Date().toISOString(),
    };
    saveJson(KEYS.products, [product, ...getProducts()]);
    pushActivity("product", `Created product ${product.name}`);
    return product;
  },

  updateProduct(id: string, patch: Partial<Product>): Product | undefined {
    const products = getProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx < 0) return undefined;
    products[idx] = { ...products[idx], ...patch, id };
    saveJson(KEYS.products, products);
    return products[idx];
  },

  listCampaigns(): Campaign[] {
    return getCampaigns().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getCampaign(id: string): Campaign | undefined {
    return getCampaigns().find((c) => c.id === id);
  },

  createCampaign(
    input: Omit<Campaign, "id" | "createdAt" | "candidateCount" | "shortlistCount">,
  ): Campaign {
    const campaign: Campaign = {
      ...input,
      id: uid("camp"),
      createdAt: new Date().toISOString(),
      candidateCount: 0,
      shortlistCount: 0,
    };
    saveJson(KEYS.campaigns, [campaign, ...getCampaigns()]);
    pushActivity("campaign", `Created campaign ${campaign.name}`);
    return campaign;
  },

  updateCampaign(id: string, patch: Partial<Campaign>): Campaign | undefined {
    const campaigns = getCampaigns();
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx < 0) return undefined;
    campaigns[idx] = { ...campaigns[idx], ...patch, id };
    saveJson(KEYS.campaigns, campaigns);
    return campaigns[idx];
  },

  listShortlists(): Shortlist[] {
    return getShortlists().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getShortlist(id: string): Shortlist | undefined {
    return getShortlists().find((s) => s.id === id);
  },

  createShortlist(input: {
    name: string;
    productId?: string;
    campaignId?: string;
    notes?: string;
  }): Shortlist {
    const shortlist: Shortlist = {
      id: uid("sl"),
      name: input.name,
      productId: input.productId,
      campaignId: input.campaignId,
      notes: input.notes ?? "",
      items: [],
      createdAt: new Date().toISOString(),
    };
    saveJson(KEYS.shortlists, [shortlist, ...getShortlists()]);
    pushActivity("shortlist", `Created shortlist ${shortlist.name}`);
    return shortlist;
  },

  addToShortlist(shortlistId: string, influencerId: string, note = "") {
    const lists = getShortlists();
    const list = lists.find((s) => s.id === shortlistId);
    if (!list) return undefined;
    if (!list.items.some((i) => i.influencerId === influencerId)) {
      list.items.push({ influencerId, addedAt: new Date().toISOString(), note });
      const inf = this.getInfluencer(influencerId);
      pushActivity("shortlist", `Added ${inf?.name ?? influencerId} to ${list.name}`);
    }
    saveJson(KEYS.shortlists, lists);
    return list;
  },

  removeFromShortlist(shortlistId: string, influencerId: string) {
    const lists = getShortlists();
    const list = lists.find((s) => s.id === shortlistId);
    if (!list) return undefined;
    list.items = list.items.filter((i) => i.influencerId !== influencerId);
    saveJson(KEYS.shortlists, lists);
    return list;
  },

  updateShortlistItemNote(shortlistId: string, influencerId: string, note: string) {
    const lists = getShortlists();
    const list = lists.find((s) => s.id === shortlistId);
    if (!list) return undefined;
    const item = list.items.find((i) => i.influencerId === influencerId);
    if (item) item.note = note;
    saveJson(KEYS.shortlists, lists);
    return list;
  },

  updateShortlist(id: string, patch: Partial<Shortlist>) {
    const lists = getShortlists();
    const idx = lists.findIndex((s) => s.id === id);
    if (idx < 0) return undefined;
    lists[idx] = { ...lists[idx], ...patch, id };
    saveJson(KEYS.shortlists, lists);
    return lists[idx];
  },

  listInvitations(): Invitation[] {
    return getInvitations().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createInvitation(input: {
    influencerId: string;
    campaignId: string;
    message?: string;
  }): Invitation {
    const invitation: Invitation = {
      id: uid("inv"),
      influencerId: input.influencerId,
      campaignId: input.campaignId,
      status: "Pending",
      message: input.message ?? "Campaign collaboration invitation",
      createdAt: new Date().toISOString(),
    };
    saveJson(KEYS.invitations, [invitation, ...getInvitations()]);
    const inf = this.getInfluencer(input.influencerId);
    const camp = this.getCampaign(input.campaignId);
    pushActivity(
      "invite",
      `Invitation sent to ${inf?.name ?? input.influencerId} for ${camp?.name ?? input.campaignId}`,
    );
    return invitation;
  },

  listJobs(): AnalysisJob[] {
    return getJobs().sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  },

  async startAnalysis(influencerId: string, videoCount: number, source = "Manual URL import") {
    const job: AnalysisJob = {
      id: uid("job"),
      influencerId,
      videoCount,
      source,
      status: "Queued",
      progress: 0,
      startedAt: new Date().toISOString(),
    };
    saveJson(KEYS.jobs, [job, ...getJobs()]);
    const inf = this.getInfluencer(influencerId);
    pushActivity("analysis", `Queued analysis for ${inf?.name ?? influencerId} (${videoCount} videos)`);
    void this.simulateJob(job.id);
    return job;
  },

  async simulateJob(jobId: string) {
    const tick = async (
      status: AnalysisJob["status"],
      progress: number,
      extra: Partial<AnalysisJob> = {},
    ) => {
      await new Promise((r) => setTimeout(r, 700));
      const jobs = getJobs();
      const idx = jobs.findIndex((j) => j.id === jobId);
      if (idx < 0) return;
      jobs[idx] = { ...jobs[idx], status, progress, ...extra };
      saveJson(KEYS.jobs, jobs);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("lumen:jobs-updated"));
      }
    };

    await tick("Processing", 25);
    const job = getJobs().find((j) => j.id === jobId);
    if (!job) return;
    await lumenAnalysis.submitAnalysis({
      externalId: job.influencerId,
      sourceUrl: `demo://influencer/${job.influencerId}`,
      languageHints: ["th", "en"],
      requestedAnalyses: ["transcript", "topics", "style", "entities", "brand_safety"],
    });
    await tick("Processing", 70);
    const result = await lumenAnalysis.getJobResult(`mock-${job.influencerId}`);
    await tick("Completed", 100, {
      completedAt: new Date().toISOString(),
      resultSummary: result.summary,
    });
  },

  previewImport(urls: string[], platform: Platform, videosToAnalyze: number): ImportPreviewRow[] {
    return urls
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => {
        const handleMatch = url.match(/@([\w.]+)/) || url.match(/([\w.]+)\/?$/);
        const handle = handleMatch ? `@${handleMatch[1].replace(/^@/, "")}` : "@unknown";
        return {
          platform,
          url,
          handle,
          name: handle.replace("@", "").replace(/[._]/g, " "),
          city: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Koh Samui"][
            Math.floor(Math.random() * 5)
          ],
          videosToAnalyze,
        };
      });
  },

  parseCsv(text: string, platform: Platform, videosToAnalyze: number): ImportPreviewRow[] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const urls = lines
      .slice(lines[0]?.toLowerCase().includes("url") ? 1 : 0)
      .map((line) => line.split(",")[0]?.trim() ?? "")
      .filter(Boolean);
    return this.previewImport(urls, platform, videosToAnalyze);
  },
};
