import type {
  DiscoveryCandidate,
  DiscoverySearchParams,
  Influencer,
  InfluencerDossier,
  LanguageCode,
  VideoAnalysis,
} from "@/types";
import { loadJson, saveJson } from "@/lib/storage";
import { marketplace } from "@/services/marketplace";
import { mockTikTokConnector } from "./mock-tiktok.connector";
import { liveTikTokConnector } from "./live-tiktok.connector";
import type { TikTokDiscoveryConnector } from "./types";

const KEYS = {
  dossiers: "lumen.discovery.dossiers",
  lastSearch: "lumen.discovery.lastSearch",
} as const;

function getConnector(): TikTokDiscoveryConnector {
  // Client hint: NEXT_PUBLIC_DISCOVERY_MODE=live → call server TikHub route.
  // Server still requires DISCOVERY_MODE=live + TIKHUB_API_KEY.
  const mode = (process.env.NEXT_PUBLIC_DISCOVERY_MODE ?? "demo").toLowerCase();
  return mode === "live" ? liveTikTokConnector : mockTikTokConnector;
}

function loadDossiers(): Record<string, InfluencerDossier> {
  return loadJson(KEYS.dossiers, {} as Record<string, InfluencerDossier>);
}

function saveDossiers(map: Record<string, InfluencerDossier>) {
  saveJson(KEYS.dossiers, map);
}

function catalogHasHandle(handle: string): boolean {
  const h = handle.toLowerCase();
  return marketplace.listInfluencers().some((inf) =>
    inf.platforms.some((p) => p.handle.toLowerCase() === h),
  );
}

function dossierFromCandidate(
  c: DiscoveryCandidate,
  evidence: InfluencerDossier["evidence"] = [],
): InfluencerDossier {
  return {
    id: `dossier-${c.id}`,
    candidateId: c.id,
    identity: {
      name: c.name,
      handle: c.handle,
      profileUrl: c.profileUrl,
      avatarInitials: c.avatarInitials,
      avatarColor: c.avatarColor,
      city: c.city,
      country: c.country,
      languages: c.languages,
      bio: c.bio,
    },
    reach: {
      followers: c.followers,
      avgViews: c.avgViews,
      engagementRate: c.engagementRate,
      postingFrequency: "3–5 videos / week",
    },
    topics: c.topics.map((name, i) => ({ name, confidence: Math.max(0.55, 0.92 - i * 0.08) })),
    style: { formats: [], tone: [] },
    audience: [],
    brandSafety: { status: "unknown", flags: [], notes: "Pending analysis — not scanned yet." },
    evidence,
    source: c.source,
    discoveredAt: c.collectedAt,
    analysisStatus: "idle",
    inCatalog: catalogHasHandle(c.handle),
  };
}

function buildMockAnalysis(dossier: InfluencerDossier): {
  topics: InfluencerDossier["topics"];
  style: InfluencerDossier["style"];
  audience: InfluencerDossier["audience"];
  brandSafety: InfluencerDossier["brandSafety"];
  evidence: InfluencerDossier["evidence"];
} {
  const baseTopics = dossier.topics.length
    ? dossier.topics
    : [
        { name: "food", confidence: 0.9 },
        { name: "bangkok", confidence: 0.8 },
      ];
  const analysis: VideoAnalysis = {
    language: (dossier.identity.languages[0] ?? "th") as LanguageCode,
    transcript: `Demo transcript for ${dossier.identity.name}: covering ${baseTopics.map((t) => t.name).join(", ")}.`,
    topics: baseTopics,
    style: {
      formats: ["short review", "street food walk"],
      tone: ["energetic", "authentic"],
    },
    entities: baseTopics.map((t) => t.name).concat([dossier.identity.city]),
    brandSafety: { status: "safe", flags: [], notes: "No concerning flags in demo analysis set." },
  };

  const evidence = dossier.evidence.map((e, i) => ({
    ...e,
    analysis: i === 0 ? analysis : e.analysis,
    quote: e.quote ?? (i === 0 ? `…${baseTopics[0]?.name ?? "food"} highlight in ${dossier.identity.city}…` : e.quote),
    timestamp: e.timestamp ?? (i === 0 ? "00:14" : e.timestamp),
  }));

  return {
    topics: baseTopics,
    style: analysis.style,
    audience: [
      {
        label: `${dossier.identity.city} local + tourist corridor`,
        confidence: 0.78,
        evidence: "Geo cues in bio + recent captions",
      },
      {
        label: dossier.identity.languages.includes("th") ? "Thai-speaking viewers" : "English-leaning viewers",
        confidence: 0.74,
        evidence: "Detected delivery language",
      },
      {
        label: `Interest: ${baseTopics[0]?.name ?? "lifestyle"}`,
        confidence: baseTopics[0]?.confidence ?? 0.7,
        evidence: "Topic aggregation across recent videos",
      },
    ],
    brandSafety: analysis.brandSafety,
    evidence,
  };
}

function influencerFromDossier(d: InfluencerDossier): Influencer {
  return {
    id: d.influencerId ?? `inf-disc-${d.candidateId.replace(/^disc-/, "")}`,
    name: d.identity.name,
    avatarInitials: d.identity.avatarInitials,
    avatarColor: d.identity.avatarColor,
    country: d.identity.country,
    city: d.identity.city,
    languages: d.identity.languages,
    topics: d.topics.map((t) => t.name),
    platforms: [
      {
        platform: "tiktok",
        handle: d.identity.handle,
        url: d.identity.profileUrl,
        followers: d.reach.followers,
        avgViews: d.reach.avgViews,
        engagementRate: d.reach.engagementRate,
      },
    ],
    followers: d.reach.followers,
    avgViews: d.reach.avgViews,
    engagementRate: d.reach.engagementRate,
    analyzedVideos: d.evidence.filter((e) => e.analysis).length,
    matchScore: Math.min(
      95,
      55 + Math.round((d.topics[0]?.confidence ?? 0.5) * 30) + (d.identity.city === "Bangkok" ? 8 : 0),
    ),
    verificationStatus: "unverified",
    claimStatus: "Unclaimed",
    contentStyle: [...d.style.formats, ...d.style.tone].filter(Boolean),
    postingFrequency: d.reach.postingFrequency,
    brandSafety: d.brandSafety,
    suitableProductIds: d.topics.some((t) => t.name === "food" || t.name === "nightlife") ? ["prod-2"] : [],
    notes: `Discovered via ${d.source}`,
    bio: d.identity.bio,
  };
}

export const discovery = {
  connectorLabel(): string {
    return getConnector().label;
  },

  async search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]> {
    const results = await getConnector().search(params);
    saveJson(KEYS.lastSearch, { params, results, at: new Date().toISOString() });
    return results;
  },

  getLastSearch(): { params: DiscoverySearchParams; results: DiscoveryCandidate[]; at: string } | null {
    return loadJson(KEYS.lastSearch, null);
  },

  async openDossier(candidate: DiscoveryCandidate): Promise<InfluencerDossier> {
    const map = loadDossiers();
    const existing = Object.values(map).find((d) => d.candidateId === candidate.id);
    if (existing) {
      existing.inCatalog = catalogHasHandle(candidate.handle);
      map[existing.id] = existing;
      saveDossiers(map);
      return existing;
    }

    const fetchVideos = getConnector().fetchRecentVideos;
    const evidence = fetchVideos ? await fetchVideos(candidate.id) : [];
    const dossier = dossierFromCandidate(candidate, evidence);
    map[dossier.id] = dossier;
    saveDossiers(map);
    return dossier;
  },

  getDossier(dossierId: string): InfluencerDossier | undefined {
    const d = loadDossiers()[dossierId];
    if (!d) return undefined;
    return { ...d, inCatalog: catalogHasHandle(d.identity.handle) };
  },

  getDossierByCandidateId(candidateId: string): InfluencerDossier | undefined {
    return Object.values(loadDossiers()).find((d) => d.candidateId === candidateId);
  },

  listDossiers(): InfluencerDossier[] {
    return Object.values(loadDossiers()).sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
  },

  async analyze(dossierId: string): Promise<InfluencerDossier> {
    const map = loadDossiers();
    const d = map[dossierId];
    if (!d) throw new Error("Dossier not found");

    d.analysisStatus = "running";
    map[dossierId] = d;
    saveDossiers(map);

    await new Promise((r) => setTimeout(r, 700));

    if (!d.evidence.length && getConnector().fetchRecentVideos) {
      d.evidence = await getConnector().fetchRecentVideos!(d.candidateId);
    }

    const filled = buildMockAnalysis(d);
    const next: InfluencerDossier = {
      ...d,
      ...filled,
      analysisStatus: "ready",
      lastAnalyzedAt: new Date().toISOString(),
      inCatalog: catalogHasHandle(d.identity.handle),
    };
    map[dossierId] = next;
    saveDossiers(map);
    return next;
  },

  saveToCatalog(dossierId: string): Influencer {
    const map = loadDossiers();
    const d = map[dossierId];
    if (!d) throw new Error("Dossier not found");

    const existing = marketplace.listInfluencers().find((inf) =>
      inf.platforms.some((p) => p.handle.toLowerCase() === d.identity.handle.toLowerCase()),
    );
    if (existing) {
      d.influencerId = existing.id;
      d.inCatalog = true;
      map[dossierId] = d;
      saveDossiers(map);
      return existing;
    }

    const influencer = influencerFromDossier(d);
    marketplace.addInfluencer(influencer);
    d.influencerId = influencer.id;
    d.inCatalog = true;
    map[dossierId] = d;
    saveDossiers(map);
    return influencer;
  },

  clearDemoDiscovery() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(KEYS.dossiers);
    window.localStorage.removeItem(KEYS.lastSearch);
  },
};
