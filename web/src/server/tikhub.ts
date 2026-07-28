import "server-only";
import type { DiscoveryCandidate, DiscoverySearchParams, LanguageCode } from "@/types";
import { tikhubConfig } from "./env";

type RawAuthor = {
  uniqueId?: string;
  unique_id?: string;
  nickname?: string;
  uid?: string;
  id?: string;
  signature?: string;
  followerCount?: number;
  follower_count?: number;
};

/** TikTok web search puts reach on the item, not on `author`. */
type RawAuthorStats = {
  followerCount?: number | string;
  follower_count?: number | string;
  followingCount?: number | string;
  heartCount?: number | string;
  videoCount?: number | string;
  diggCount?: number | string;
  heart?: number | string;
};

type RawItem = {
  id?: string;
  aweme_id?: string;
  desc?: string;
  share_url?: string;
  author?: RawAuthor;
  authorStats?: RawAuthorStats;
  authorStatsV2?: RawAuthorStats;
  author_stats?: RawAuthorStats;
  stats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number };
  statistics?: {
    play_count?: number;
    digg_count?: number;
    comment_count?: number;
    share_count?: number;
  };
  video?: { cover?: string | { url_list?: string[] } };
};

export type TikHubVideoHit = {
  id: string;
  title: string;
  url: string;
  coverUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  authorUniqueId: string;
  authorNickname: string;
  authorUid: string;
  followers: number;
  bio: string;
};

const COLORS = ["#0F766E", "#1D4ED8", "#BE185D", "#7C3AED", "#B45309", "#0369A1", "#15803D"];

async function tikhubGet(path: string, params: Record<string, string | number>): Promise<unknown> {
  const { apiKey, baseUrl } = tikhubConfig();
  if (!apiKey) throw new Error("TIKHUB_API_KEY is not configured");

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  const url = `${baseUrl}${path}?${qs.toString()}`;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      });
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text().catch(() => "");
        throw new Error(`TikHub ${res.status}: ${body.slice(0, 200) || res.statusText}`);
      }
      if (!res.ok) throw new Error(`TikHub ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (err instanceof Error && err.message.startsWith("TikHub 4")) throw err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("TikHub request failed");
}

function num(...vals: unknown[]): number {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function coverOf(v: RawItem): string {
  const c = v.video?.cover;
  if (typeof c === "string") return c;
  return c?.url_list?.[0] ?? "";
}

function followersOf(v: RawItem, author: RawAuthor): number {
  // Live TikHub `fetch_general_search` / web search: authorStats.followerCount
  // (author itself has no follower fields — that was why Discover showed 0).
  return num(
    v.authorStats?.followerCount,
    v.authorStatsV2?.followerCount,
    v.author_stats?.followerCount,
    v.author_stats?.follower_count,
    author.followerCount,
    author.follower_count,
  );
}

/** Exported for fixture checks — maps one TikHub video item → hit or null. */
export function normalizeTikHubItem(v: RawItem): TikHubVideoHit | null {
  const author = v.author ?? {};
  const uniqueId = String(author.uniqueId ?? author.unique_id ?? "").replace(/^@/, "");
  const id = String(v.id ?? v.aweme_id ?? "");
  if (!uniqueId || !id) return null;
  return {
    id,
    title: String(v.desc ?? ""),
    url:
      v.share_url ??
      `https://www.tiktok.com/@${uniqueId}/video/${id}`,
    coverUrl: coverOf(v),
    views: num(v.stats?.playCount, v.statistics?.play_count),
    likes: num(v.stats?.diggCount, v.statistics?.digg_count),
    comments: num(v.stats?.commentCount, v.statistics?.comment_count),
    shares: num(v.stats?.shareCount, v.statistics?.share_count),
    authorUniqueId: uniqueId,
    authorNickname: String(author.nickname ?? uniqueId),
    authorUid: String(author.uid ?? author.id ?? uniqueId),
    followers: followersOf(v, author),
    bio: String(author.signature ?? ""),
  };
}

function normalizeItem(v: RawItem): TikHubVideoHit | null {
  return normalizeTikHubItem(v);
}

export async function fetchTikTokSearchVideos(keyword: string, count = 20): Promise<TikHubVideoHit[]> {
  let rawItems: RawItem[] = [];
  try {
    const data = (await tikhubGet("/api/v1/tiktok/web/fetch_general_search", {
      keyword,
      search_type: 1,
      count: Math.max(count, 20),
      offset: 0,
    })) as { data?: { data?: Array<{ type?: number; item?: RawItem }> } };
    const entries = data?.data?.data ?? [];
    rawItems = entries.filter((r) => r?.type === 1 && r?.item).map((r) => r.item!);
  } catch (err) {
    const data = (await tikhubGet("/api/v1/tiktok/web/fetch_search_video", {
      keyword,
      count: Math.max(count, 20),
      offset: 0,
    })) as { data?: { item_list?: RawItem[] }; item_list?: RawItem[] };
    rawItems = data?.data?.item_list ?? data?.item_list ?? [];
  }
  return rawItems.map(normalizeItem).filter((x): x is TikHubVideoHit => Boolean(x));
}

function inferTopics(params: DiscoverySearchParams): string[] {
  const blob = `${params.query} ${params.topic ?? ""}`.toLowerCase();
  const topics: string[] = [];
  const map: [RegExp, string][] = [
    [/food|eat|restaurant|pad|thai/, "food"],
    [/nightlife|bar|cocktail/, "nightlife"],
    [/bangkok|sukhumvit|soi/, "bangkok"],
    [/travel|beach|island/, "travel"],
    [/beauty|makeup/, "beauty"],
    [/skincare|serum/, "skincare"],
    [/fitness|gym/, "fitness"],
    [/condo|property|real.?estate/, "real estate"],
    [/lifestyle/, "lifestyle"],
  ];
  for (const [re, t] of map) if (re.test(blob)) topics.push(t);
  if (params.topic && params.topic !== "All") topics.unshift(params.topic.toLowerCase());
  return [...new Set(topics)].slice(0, 4);
}

function inferLangs(params: DiscoverySearchParams): LanguageCode[] {
  if (params.language && params.language !== "all") return [params.language];
  return ["th", "en"];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TK";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/** Dedupe videos → unique creators as DiscoveryCandidate */
export function videosToCandidates(
  videos: TikHubVideoHit[],
  params: DiscoverySearchParams,
): DiscoveryCandidate[] {
  const collectedAt = new Date().toISOString();
  const topics = inferTopics(params);
  const languages = inferLangs(params);
  const city =
    params.city && params.city !== "All"
      ? params.city
      : /phuket/i.test(params.query)
        ? "Phuket"
        : /chiang/i.test(params.query)
          ? "Chiang Mai"
          : "Bangkok";

  type Agg = {
    hit: TikHubVideoHit;
    views: number[];
    likes: number;
    comments: number;
    shares: number;
  };
  const byAuthor = new Map<string, Agg>();
  for (const v of videos) {
    const cur = byAuthor.get(v.authorUniqueId);
    if (!cur) {
      byAuthor.set(v.authorUniqueId, {
        hit: v,
        views: [v.views],
        likes: v.likes,
        comments: v.comments,
        shares: v.shares,
      });
    } else {
      cur.views.push(v.views);
      cur.likes += v.likes;
      cur.comments += v.comments;
      cur.shares += v.shares;
      if (v.followers > cur.hit.followers) cur.hit.followers = v.followers;
      if (v.bio && !cur.hit.bio) cur.hit.bio = v.bio;
    }
  }

  const minFollowers = params.minFollowers ?? 0;
  const limit = params.limit ?? 12;
  const candidates: DiscoveryCandidate[] = [];

  for (const [uniqueId, agg] of byAuthor) {
    const avgViews = Math.round(agg.views.reduce((a, b) => a + b, 0) / Math.max(1, agg.views.length));
    const totalViews = Math.max(1, agg.views.reduce((a, b) => a + b, 0));
    const engagementRate = Number(
      (((agg.likes + agg.comments + agg.shares) / totalViews) * 100).toFixed(2),
    );
    const followers = agg.hit.followers;
    // Prefer real counts: skip when known-below threshold; keep unknown (0) only if min=0.
    if (minFollowers > 0 && (followers <= 0 || followers < minFollowers)) continue;

    const color = COLORS[Math.abs(hash(uniqueId)) % COLORS.length]!;
    candidates.push({
      id: `disc-tt-${uniqueId}`,
      name: agg.hit.authorNickname,
      handle: `@${uniqueId}`,
      profileUrl: `https://www.tiktok.com/@${uniqueId}`,
      avatarInitials: initials(agg.hit.authorNickname),
      avatarColor: color,
      city,
      country: "TH",
      languages,
      topics: topics.length ? topics : ["lifestyle"],
      followers,
      avgViews,
      engagementRate: Number.isFinite(engagementRate) ? engagementRate : 0,
      bio: agg.hit.bio || `${agg.hit.authorNickname} on TikTok`,
      source: "tikhub",
      collectedAt,
    });
  }

  return candidates
    .sort((a, b) => b.avgViews - a.avgViews || b.followers - a.followers)
    .slice(0, limit);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function videosToEvidence(videos: TikHubVideoHit[], authorUniqueId: string) {
  return videos
    .filter((v) => v.authorUniqueId === authorUniqueId)
    .slice(0, 5)
    .map((v) => ({
      videoId: v.id,
      title: v.title || `TikTok video ${v.id}`,
      url: v.url,
      publishedAt: new Date().toISOString(),
      views: v.views,
      quote: v.title ? `…${v.title.slice(0, 80)}…` : undefined,
    }));
}
