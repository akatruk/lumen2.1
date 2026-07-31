/**
 * Fixture: Discover persist — lastSearch shape + dossier reach merge.
 * Run: cd web && npx --yes tsx scripts/discovery.persist.fixture.ts
 */
import type { DiscoveryCandidate, InfluencerDossier, LastDiscoverySearch } from "../src/types";
import { mergeDossierReachFromCandidate } from "../src/services/discovery/discovery.service";

const sample: LastDiscoverySearch = {
  params: {
    query: "AI",
    city: "Shanghai",
    language: "zh",
    topic: "tech",
    minFollowers: 0,
    limit: 12,
  },
  results: [],
  productId: "prod-7",
  at: new Date().toISOString(),
};
if (!sample.productId) throw new Error("productId required on LastDiscoverySearch");

const candidate: DiscoveryCandidate = {
  id: "disc-dy-82678166699",
  name: "小狮妹玩AI",
  handle: "@82678166699",
  profileUrl: "https://www.douyin.com/user/82678166699",
  avatarInitials: "小玩",
  avatarColor: "#0F766E",
  city: "Shanghai",
  country: "CN",
  languages: ["zh"],
  topics: ["ai", "tech"],
  followers: 128_000,
  avgViews: 32_000,
  engagementRate: 0,
  bio: "AI是一个工具",
  source: "tikhub",
  collectedAt: new Date().toISOString(),
};

const dossierZero: InfluencerDossier = {
  id: "dossier-disc-dy-82678166699",
  candidateId: candidate.id,
  identity: {
    name: candidate.name,
    handle: candidate.handle,
    profileUrl: candidate.profileUrl,
    avatarInitials: candidate.avatarInitials,
    avatarColor: candidate.avatarColor,
    city: candidate.city,
    country: candidate.country,
    languages: candidate.languages,
    bio: candidate.bio,
  },
  reach: {
    followers: 0,
    avgViews: 0,
    engagementRate: 3_204_500,
    postingFrequency: "3–5 videos / week",
  },
  topics: [{ name: "ai", confidence: 0.9 }],
  style: { formats: [], tone: [] },
  audience: [],
  brandSafety: { status: "unknown", flags: [], notes: "Pending" },
  evidence: [],
  source: "tikhub",
  discoveredAt: candidate.collectedAt,
  analysisStatus: "idle",
  inCatalog: false,
};

const merged = mergeDossierReachFromCandidate(dossierZero, candidate);
if (merged.reach.followers !== 128_000) {
  throw new Error(`expected followers 128000, got ${merged.reach.followers}`);
}
if (merged.reach.avgViews !== 32_000) {
  throw new Error(`expected avgViews 32000, got ${merged.reach.avgViews}`);
}
if (merged.reach.engagementRate !== 0) {
  throw new Error(`expected ER 0, got ${merged.reach.engagementRate}`);
}

const unchanged = mergeDossierReachFromCandidate(merged, {
  ...candidate,
  followers: 0,
});
if (unchanged.reach.followers !== 128_000) {
  throw new Error("zero incoming must not wipe enriched reach");
}

console.log("discovery.persist.fixture PASS", {
  productId: sample.productId,
  followers: merged.reach.followers,
});
