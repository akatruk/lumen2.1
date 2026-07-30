import type {
  DiscoveryCandidate,
  DiscoverySearchParams,
  InfluencerDossier,
  LanguageCode,
} from "@/types";
import type { DouyinDiscoveryConnector } from "./types";
import { MOCK_INFLUENCERS } from "@/data/mock";

const COLORS = ["#0F766E", "#1D4ED8", "#BE185D", "#7C3AED", "#B45309", "#0369A1", "#15803D"];

const SYNTH_FIRST = [
  "小美",
  "阿杰",
  "婷婷",
  "浩然",
  "思雨",
  "子墨",
  "晓雯",
  "宇轩",
  "诗涵",
  "一诺",
  "梓萱",
  "俊杰",
  "雨桐",
  "明轩",
];
const SYNTH_LAST = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄"];

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
    .filter((t) => t.length >= 1);
}

function inferTopics(tokens: string[], fallback: string[]): string[] {
  const topicMap: Record<string, string> = {
    科技: "tech",
    AI: "ai",
    ai: "ai",
    tech: "tech",
    saas: "saas",
    脚本: "script",
    短视频: "short video",
    工具: "tech",
    software: "software",
    food: "food",
    美食: "food",
    探店: "food",
    eat: "food",
    restaurant: "food",
    nightlife: "nightlife",
    夜店: "nightlife",
    travel: "travel",
    旅行: "travel",
    skincare: "skincare",
    护肤: "skincare",
    beauty: "beauty",
    美妆: "beauty",
    fitness: "fitness",
    健身: "fitness",
    condo: "real estate",
    房产: "real estate",
    lifestyle: "lifestyle",
    生活: "lifestyle",
    跨境: "commerce",
    电商: "commerce",
    shanghai: "shanghai",
    上海: "shanghai",
    beijing: "beijing",
    北京: "beijing",
  };
  const found = new Set<string>();
  const blob = tokens.join(" ");
  for (const t of tokens) {
    if (topicMap[t]) found.add(topicMap[t]);
    for (const [k, v] of Object.entries(topicMap)) {
      if (t.includes(k) || blob.includes(k)) found.add(v);
    }
  }
  if (found.size === 0) fallback.forEach((t) => found.add(t));
  return [...found].slice(0, 4);
}

function inferCity(tokens: string[], paramCity?: string): string {
  if (paramCity && paramCity !== "All") return paramCity;
  const blob = tokens.join(" ");
  const map: [RegExp, string][] = [
    [/上海|shanghai/, "Shanghai"],
    [/北京|beijing/, "Beijing"],
    [/广州|guangzhou/, "Guangzhou"],
    [/深圳|shenzhen/, "Shenzhen"],
    [/杭州|hangzhou/, "Hangzhou"],
    [/成都|chengdu/, "Chengdu"],
  ];
  for (const [re, city] of map) if (re.test(blob)) return city;
  return "Shanghai";
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
  const dy =
    inf.platforms.find((p) => p.platform === "douyin") ??
    inf.platforms.find((p) => p.platform === "tiktok") ??
    inf.platforms[0];
  return {
    id: `disc-${inf.id}`,
    name: inf.name,
    handle: dy.handle,
    profileUrl: dy.url,
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
    source: "douyin-demo-connector",
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
  const name = `${last}${first}`;
  const handle = `@dy_${seed.toString(36).slice(0, 8)}`;
  const followers = 12_000 + (seed % 380_000);
  const initials = first.slice(0, 2);
  return {
    id: `disc-synth-${seed.toString(36)}`,
    name,
    handle,
    profileUrl: `https://www.douyin.com/user/${handle.replace(/^@/, "")}`,
    avatarInitials: initials,
    avatarColor: pick(COLORS, seed),
    city,
    country: "CN",
    languages: language === "zh" ? ["zh"] : [language, "zh"],
    topics: topics.length ? topics : ["food", "lifestyle"],
    followers,
    avgViews: Math.round(followers * (0.12 + (seed % 20) / 100)),
    engagementRate: Number((2.5 + (seed % 50) / 10).toFixed(1)),
    bio: `${city} 创作者 · ${topics.slice(0, 2).join(" / ") || "lifestyle"} · 抖音`,
    source: "douyin-demo-connector",
    collectedAt,
  };
}

export const mockDouyinConnector: DouyinDiscoveryConnector = {
  id: "douyin-demo-connector",
  label: "Demo Douyin connector",

  async search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]> {
    await new Promise((r) => setTimeout(r, 420 + (hash(params.query) % 280)));

    const collectedAt = new Date().toISOString();
    const tokens = tokensFromQuery(params.query || "上海 美食");
    const city = inferCity(tokens, params.city);
    const topics = inferTopics(
      tokens,
      params.topic && params.topic !== "All" ? [params.topic] : ["food", "shanghai"],
    );
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
      language && language !== "all" ? language : "zh";

    const synthetic: DiscoveryCandidate[] = [];
    let i = 0;
    while (fromCatalog.length + synthetic.length < limit && i < 20) {
      const c = makeSynthetic(params.query || "美食", city, topics, i, collectedAt, synthLang);
      i += 1;
      if (c.followers < minFollowers) continue;
      if (seen.has(c.handle.toLowerCase())) continue;
      seen.add(c.handle.toLowerCase());
      synthetic.push(c);
    }

    return [...fromCatalog, ...synthetic].slice(0, limit);
  },

  async fetchRecentVideos(candidateId: string): Promise<InfluencerDossier["evidence"]> {
    const seed = hash(candidateId);
    const titles = [
      "上海探店 · 本帮菜软开",
      "深夜食堂打卡",
      "周末美食打卡合集",
      "美妆+生活 Vlog",
    ];
    return [0, 1, 2].map((i) => {
      const s = seed + i * 17;
      return {
        videoId: `${candidateId}-vid-${i}`,
        title: pick(titles, s),
        url: `https://www.douyin.com/video/${s}`,
        publishedAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
        views: 8_000 + (s % 120_000),
        quote: i === 0 ? "…这家本帮菜真的绝…" : undefined,
        timestamp: i === 0 ? "00:18" : undefined,
      };
    });
  },
};
