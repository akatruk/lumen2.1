import "server-only";
import type { DiscoveryCandidate, DiscoverySearchParams, LanguageCode } from "@/types";
import { inferCreatorTopicsFromText } from "@/lib/creator-topics";
import { tikhubConfig } from "./env";

type RawAuthor = {
  uniqueId?: string;
  unique_id?: string;
  short_id?: string;
  nickname?: string;
  uid?: string;
  id?: string;
  sec_uid?: string;
  secUid?: string;
  signature?: string;
  followerCount?: number;
  follower_count?: number;
};

/** Douyin/TikHub may put reach on author or item-level author_stats. */
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
  /** Douyin sec_uid — required to enrich followers via profile API. */
  authorSecUid: string;
  followers: number;
  bio: string;
};

const COLORS = ["#0F766E", "#1D4ED8", "#BE185D", "#7C3AED", "#B45309", "#0369A1", "#15803D"];

async function tikhubRequest(
  method: "GET" | "POST",
  path: string,
  payload: Record<string, string | number>,
): Promise<unknown> {
  const { apiKey, baseUrl } = tikhubConfig();
  if (!apiKey) throw new Error("TIKHUB_API_KEY is not configured");

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const url =
        method === "GET"
          ? `${baseUrl}${path}?${new URLSearchParams(
              Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)])),
            ).toString()}`
          : `${baseUrl}${path}`;
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        },
        body: method === "POST" ? JSON.stringify(payload) : undefined,
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      });
      if (res.status >= 400 && res.status < 500) {
        const body = await res.text().catch(() => "");
        if (res.status === 402) {
          throw new Error(
            "TikHub Douyin endpoint returned 402 (insufficient balance for /douyin/*). Same Strom key works for intl TikTok; top up Douyin credits on TikHub or use a key with Douyin access.",
          );
        }
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
  return num(
    v.authorStats?.followerCount,
    v.authorStatsV2?.followerCount,
    v.author_stats?.followerCount,
    v.author_stats?.follower_count,
    author.followerCount,
    author.follower_count,
  );
}

function authorHandle(author: RawAuthor): string {
  return String(author.unique_id ?? author.uniqueId ?? author.short_id ?? "")
    .replace(/^@/, "")
    .trim();
}

function authorSecUid(author: RawAuthor): string {
  return String(author.sec_uid ?? author.secUid ?? "").trim();
}

/** Exported for fixture checks — maps one Douyin/TikHub aweme item → hit or null. */
export function normalizeTikHubItem(v: RawItem): TikHubVideoHit | null {
  const author = v.author ?? {};
  const uniqueId = authorHandle(author);
  const id = String(v.aweme_id ?? v.id ?? "");
  if (!uniqueId || !id) return null;
  return {
    id,
    title: String(v.desc ?? ""),
    url: v.share_url ?? `https://www.douyin.com/video/${id}`,
    coverUrl: coverOf(v),
    views: num(v.statistics?.play_count, v.stats?.playCount),
    likes: num(v.statistics?.digg_count, v.stats?.diggCount),
    comments: num(v.statistics?.comment_count, v.stats?.commentCount),
    shares: num(v.statistics?.share_count, v.stats?.shareCount),
    authorUniqueId: uniqueId,
    authorNickname: String(author.nickname ?? uniqueId),
    authorUid: String(author.uid ?? author.id ?? uniqueId),
    authorSecUid: authorSecUid(author),
    followers: followersOf(v, author),
    bio: String(author.signature ?? ""),
  };
}

/**
 * Douyin search zeroes `author.follower_count`. Profile API returns the real count.
 * Best-effort: failures leave followers as-is (often 0).
 */
export async function fetchDouyinProfileFollowers(secUid: string): Promise<number> {
  if (!secUid) return 0;
  const data = (await tikhubRequest("GET", "/api/v1/douyin/app/v3/handler_user_profile", {
    sec_user_id: secUid,
  })) as {
    data?: {
      user?: {
        follower_count?: number | string;
        mplatform_followers_count?: number | string;
      };
    };
  };
  return num(data?.data?.user?.follower_count, data?.data?.user?.mplatform_followers_count);
}

const PROFILE_ENRICH_CONCURRENCY = 4;

/** Apply a sec_uid → followers map onto hits (exported for fixtures). */
export function applyFollowerMap(
  videos: TikHubVideoHit[],
  bySecUid: Map<string, number>,
): TikHubVideoHit[] {
  return videos.map((v) => {
    const enriched = v.authorSecUid ? bySecUid.get(v.authorSecUid) : undefined;
    if (enriched === undefined || enriched <= v.followers) return v;
    return { ...v, followers: enriched };
  });
}

/**
 * Enrich hits whose search payload had followers=0 via Douyin profile API.
 * Dedupes by sec_uid; runs with limited concurrency.
 */
export async function enrichVideosWithProfileFollowers(
  videos: TikHubVideoHit[],
): Promise<TikHubVideoHit[]> {
  const need = new Map<string, true>();
  for (const v of videos) {
    if (v.followers <= 0 && v.authorSecUid) need.set(v.authorSecUid, true);
  }
  if (!need.size) return videos;

  const bySecUid = new Map<string, number>();
  const secUids = [...need.keys()];
  for (let i = 0; i < secUids.length; i += PROFILE_ENRICH_CONCURRENCY) {
    const batch = secUids.slice(i, i + PROFILE_ENRICH_CONCURRENCY);
    const results = await Promise.allSettled(batch.map((sec) => fetchDouyinProfileFollowers(sec)));
    results.forEach((r, idx) => {
      const sec = batch[idx]!;
      if (r.status === "fulfilled" && r.value > 0) bySecUid.set(sec, r.value);
    });
  }
  return applyFollowerMap(videos, bySecUid);
}

/** Reach ER from aggregates. When play_count is missing (Douyin search), return 0 — never /1. */
export function computeEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  totalViews: number,
): number {
  if (!(totalViews > 0)) return 0;
  const rate = ((likes + comments + shares) / totalViews) * 100;
  if (!Number.isFinite(rate) || rate < 0) return 0;
  // Cap absurd ratios if TikHub returns tiny/non-zero plays with huge diggs.
  return Number(Math.min(rate, 100).toFixed(2));
}

function normalizeItem(v: RawItem): TikHubVideoHit | null {
  return normalizeTikHubItem(v);
}

/**
 * Primary discovery: Douyin via TikHub (same path as Strom lumen fetchDouyin).
 * @deprecated name kept as alias — use fetchDouyinSearchVideos.
 */
export async function fetchTikTokSearchVideos(
  keyword: string,
  count = 20,
): Promise<TikHubVideoHit[]> {
  return fetchDouyinSearchVideos(keyword, count);
}

export async function fetchDouyinSearchVideos(
  keyword: string,
  count = 20,
): Promise<TikHubVideoHit[]> {
  const data = (await tikhubRequest("POST", "/api/v1/douyin/search/fetch_general_search_v1", {
    keyword,
    cursor: 0,
    sort_type: "0",
    publish_time: "0",
    filter_duration: "0",
    content_type: "1",
    search_id: "",
    backtrace: "",
  })) as { data?: { data?: unknown[] } | unknown[] };

  const rawItems: unknown[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data?.data as { data?: unknown[] })?.data)
      ? ((data.data as { data: unknown[] }).data)
      : [];

  const awemes = rawItems
    .map((item) => {
      const row = item as { type?: number; aweme_info?: RawItem } & RawItem;
      if (row?.type !== undefined && row.type !== 1) return null;
      return (row.aweme_info ?? row) as RawItem;
    })
    .filter((aweme): aweme is RawItem => {
      if (!aweme) return false;
      const t = (aweme as { aweme_type?: number }).aweme_type;
      return t === undefined || t === 0;
    });

  return awemes
    .slice(0, Math.max(count, 20))
    .map(normalizeItem)
    .filter((x): x is TikHubVideoHit => Boolean(x));
}

function inferLangs(params: DiscoverySearchParams): LanguageCode[] {
  if (params.language && params.language !== "all") return [params.language];
  return ["zh"];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "DY";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function inferCity(params: DiscoverySearchParams): string {
  if (params.city && params.city !== "All") return params.city;
  const q = params.query;
  if (/北京|beijing/i.test(q)) return "Beijing";
  if (/广州|guangzhou/i.test(q)) return "Guangzhou";
  if (/深圳|shenzhen/i.test(q)) return "Shenzhen";
  if (/杭州|hangzhou/i.test(q)) return "Hangzhou";
  if (/成都|chengdu/i.test(q)) return "Chengdu";
  return "Shanghai";
}

/** Dedupe videos → unique creators as DiscoveryCandidate */
export function videosToCandidates(
  videos: TikHubVideoHit[],
  params: DiscoverySearchParams,
): DiscoveryCandidate[] {
  const collectedAt = new Date().toISOString();
  const languages = inferLangs(params);
  const city = inferCity(params);

  type Agg = {
    hit: TikHubVideoHit;
    views: number[];
    likes: number;
    comments: number;
    shares: number;
    titles: string[];
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
        titles: [v.title].filter(Boolean),
      });
    } else {
      cur.views.push(v.views);
      cur.likes += v.likes;
      cur.comments += v.comments;
      cur.shares += v.shares;
      if (v.title) cur.titles.push(v.title);
      if (v.followers > cur.hit.followers) cur.hit.followers = v.followers;
      if (v.bio && !cur.hit.bio) cur.hit.bio = v.bio;
    }
  }

  const minFollowers = params.minFollowers ?? 0;
  const limit = params.limit ?? 12;
  const candidates: DiscoveryCandidate[] = [];

  for (const [uniqueId, agg] of byAuthor) {
    const viewSum = agg.views.reduce((a, b) => a + b, 0);
    const avgPlayViews = Math.round(viewSum / Math.max(1, agg.views.length));
    // Douyin search zeroes play_count; use avg diggs as reach proxy for ranking/UI.
    const avgLikes = Math.round(agg.likes / Math.max(1, agg.views.length));
    const avgViews = avgPlayViews > 0 ? avgPlayViews : avgLikes;
    const engagementRate = computeEngagementRate(agg.likes, agg.comments, agg.shares, viewSum);
    const followers = agg.hit.followers;
    if (minFollowers > 0 && (followers <= 0 || followers < minFollowers)) continue;

    const bio = agg.hit.bio || `${agg.hit.authorNickname} on Douyin`;
    // Topics from creator evidence only — never stamp search query keywords.
    const topics = inferCreatorTopicsFromText(
      agg.hit.authorNickname,
      bio,
      ...agg.titles.slice(0, 8),
    );

    const color = COLORS[Math.abs(hash(uniqueId)) % COLORS.length]!;
    candidates.push({
      id: `disc-dy-${uniqueId}`,
      name: agg.hit.authorNickname,
      handle: `@${uniqueId}`,
      profileUrl: `https://www.douyin.com/user/${uniqueId}`,
      avatarInitials: initials(agg.hit.authorNickname),
      avatarColor: color,
      city,
      country: "CN",
      languages,
      topics: topics.length ? topics : ["lifestyle"],
      followers,
      avgViews,
      engagementRate,
      bio,
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
      title: v.title || `Douyin video ${v.id}`,
      url: v.url,
      publishedAt: new Date().toISOString(),
      views: v.views,
      quote: v.title ? `…${v.title.slice(0, 80)}…` : undefined,
    }));
}
