import type {
  DiscoveryCandidate,
  DiscoverySearchParams,
  InfluencerDossier,
  LanguageCode,
} from "@/types";
import type { TikTokDiscoveryConnector } from "./types";
import { MOCK_INFLUENCERS } from "@/data/mock";

const COLORS = ["#0F766E", "#1D4ED8", "#BE185D", "#7C3AED", "#B45309", "#0369A1", "#15803D"];

const SYNTH_FIRST = [
  "Ploy",
  "Beam",
  "Mint",
  "Gun",
  "Fah",
  "Ohm",
  "June",
  "Bam",
  "Tawan",
  "Mook",
  "Krit",
  "Sea",
  "Sky",
  "Jade",
];
const SYNTH_LAST = ["Saetang", "Wong", "Srisuk", "Lim", "Chai", "Anan", "Wattana", "Meesuk"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(arr: T[], seed: number): T {
  const i = Math.abs(seed | 0) % arr.length;
  return arr[i]!;
}

function tokensFromQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,+/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

function inferTopics(tokens: string[], fallback: string[]): string[] {
  const topicMap: Record<string, string> = {
    food: "food",
    eat: "food",
    eats: "food",
    restaurant: "food",
    pad: "food",
    kra: "food",
    pao: "food",
    thai: "food",
    nightlife: "nightlife",
    bar: "nightlife",
    cocktail: "nightlife",
    travel: "travel",
    island: "island",
    beach: "travel",
    skincare: "skincare",
    beauty: "beauty",
    fitness: "fitness",
    condo: "real estate",
    property: "real estate",
    lifestyle: "lifestyle",
    bangkok: "bangkok",
  };
  const found = new Set<string>();
  for (const t of tokens) {
    if (topicMap[t]) found.add(topicMap[t]);
    for (const [k, v] of Object.entries(topicMap)) {
      if (t.includes(k)) found.add(v);
    }
  }
  if (found.size === 0) fallback.forEach((t) => found.add(t));
  return [...found].slice(0, 4);
}

function inferCity(tokens: string[], paramCity?: string): string {
  if (paramCity && paramCity !== "All") return paramCity;
  const cities = ["bangkok", "phuket", "chiang", "pattaya", "samui", "hua"];
  const map: Record<string, string> = {
    bangkok: "Bangkok",
    phuket: "Phuket",
    chiang: "Chiang Mai",
    pattaya: "Pattaya",
    samui: "Koh Samui",
    hua: "Hua Hin",
  };
  for (const t of tokens) {
    for (const c of cities) {
      if (t.includes(c)) return map[c];
    }
  }
  return "Bangkok";
}

function scoreCandidate(
  inf: { city: string; topics: string[]; languages: LanguageCode[]; followers: number; name: string },
  tokens: string[],
  city: string,
  language: DiscoverySearchParams["language"],
  topic?: string,
  minFollowers = 0,
): number {
  if (inf.followers < minFollowers) return -1;
  if (language && language !== "all" && !inf.languages.includes(language)) return -1;
  if (topic && topic !== "All" && topic !== "all" && !inf.topics.includes(topic)) {
    // soft miss — still allow if query tokens match
  }
  let score = 0;
  if (inf.city === city) score += 40;
  for (const t of tokens) {
    if (inf.topics.some((x) => x.includes(t) || t.includes(x))) score += 18;
    if (inf.name.toLowerCase().includes(t)) score += 10;
    if (inf.city.toLowerCase().includes(t)) score += 12;
  }
  if (topic && topic !== "All" && inf.topics.includes(topic)) score += 25;
  score += Math.min(20, Math.log10(Math.max(1000, inf.followers)) * 4);
  return score;
}

function toCandidateFromMock(
  inf: (typeof MOCK_INFLUENCERS)[0],
  collectedAt: string,
): DiscoveryCandidate {
  const tt = inf.platforms.find((p) => p.platform === "tiktok") ?? inf.platforms[0];
  return {
    id: `disc-${inf.id}`,
    name: inf.name,
    handle: tt.handle,
    profileUrl: tt.url,
    avatarInitials: inf.avatarInitials,
    avatarColor: inf.avatarColor,
    city: inf.city,
    country: inf.country,
    languages: inf.languages,
    topics: inf.topics,
    followers: inf.followers,
    avgViews: inf.avgViews,
    engagementRate: inf.engagementRate,
    bio: inf.bio,
    source: "tiktok-demo-connector",
    collectedAt,
  };
}

function makeSynthetic(
  query: string,
  city: string,
  topics: string[],
  index: number,
  collectedAt: string,
  language: LanguageCode,
): DiscoveryCandidate {
  const seed = hash(`${query}|${city}|${index}`);
  const first = pick(SYNTH_FIRST, seed);
  const last = pick(SYNTH_LAST, seed >> 3);
  const name = `${first} ${last}`;
  const handle = `@${first.toLowerCase()}${topics[0]?.replace(/\s/g, "").slice(0, 4) ?? "eats"}${seed % 97}`;
  const followers = 12_000 + (seed % 380_000);
  const initials = `${first[0]}${last[0]}`.toUpperCase();
  return {
    id: `disc-synth-${seed.toString(36)}`,
    name,
    handle,
    profileUrl: `https://tiktok.com/${handle}`,
    avatarInitials: initials,
    avatarColor: pick(COLORS, seed),
    city,
    country: "Thailand",
    languages: language === "th" ? ["th", "en"] : ["en", "th"],
    topics: topics.length ? topics : ["food", "lifestyle"],
    followers,
    avgViews: Math.round(followers * (0.12 + (seed % 20) / 100)),
    engagementRate: Number((2.5 + (seed % 50) / 10).toFixed(1)),
    bio: `${city} creator covering ${topics.slice(0, 2).join(" & ") || "lifestyle"} for TikTok.`,
    source: "tiktok-demo-connector",
    collectedAt,
  };
}

export const mockTikTokConnector: TikTokDiscoveryConnector = {
  id: "tiktok-demo-connector",
  label: "Demo connector",

  async search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 420 + (hash(params.query) % 280)));

    const collectedAt = new Date().toISOString();
    const tokens = tokensFromQuery(params.query || "food bangkok");
    const city = inferCity(tokens, params.city);
    const topics = inferTopics(tokens, params.topic && params.topic !== "All" ? [params.topic] : ["food", "bangkok"]);
    const minFollowers = params.minFollowers ?? 0;
    const limit = params.limit ?? 12;
    const language = params.language ?? "all";

    const scored = MOCK_INFLUENCERS.map((inf) => ({
      inf,
      score: scoreCandidate(inf, tokens, city, language, params.topic, minFollowers),
    }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score);

    const fromCatalog = scored
      .filter((x) => x.score >= 15 || x.inf.topics.some((t) => topics.includes(t)))
      .slice(0, Math.min(6, limit))
      .map((x) => toCandidateFromMock(x.inf, collectedAt));

    const seen = new Set(fromCatalog.map((c) => c.handle.toLowerCase()));
    const synthLang: LanguageCode =
      language && language !== "all" ? language : tokens.includes("th") ? "th" : "en";

    const synthetic: DiscoveryCandidate[] = [];
    let i = 0;
    while (fromCatalog.length + synthetic.length < limit && i < 20) {
      const c = makeSynthetic(params.query || "food", city, topics, i, collectedAt, synthLang);
      i += 1;
      if (c.followers < minFollowers) continue;
      if (seen.has(c.handle.toLowerCase())) continue;
      seen.add(c.handle.toLowerCase());
      synthetic.push(c);
    }

    // Deduplicate creators (video-search → unique creators)
    return [...fromCatalog, ...synthetic].slice(0, limit);
  },

  async fetchRecentVideos(candidateId: string): Promise<InfluencerDossier["evidence"]> {
    const seed = hash(candidateId);
    const titles = [
      "Soft opening walk-in · pad kra pao",
      "Late-night Soi 11 bites",
      "Bangkok food crawl highlight",
      "Cocktail + share plates review",
    ];
    return [0, 1, 2].map((i) => {
      const s = seed + i * 17;
      return {
        videoId: `${candidateId}-vid-${i}`,
        title: pick(titles, s),
        url: `https://tiktok.com/@demo/video/${s}`,
        publishedAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
        views: 8_000 + (s % 120_000),
        quote: i === 0 ? "…pad kra pao hits hard on Soi 11…" : undefined,
        timestamp: i === 0 ? "00:18" : undefined,
      };
    });
  },
};
