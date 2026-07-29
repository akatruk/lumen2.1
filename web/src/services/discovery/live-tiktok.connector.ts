import type { DiscoveryCandidate, DiscoverySearchParams, InfluencerDossier } from "@/types";
import type { DouyinDiscoveryConnector } from "./types";

async function postDouyin(body: Record<string, unknown>) {
  const res = await fetch("/api/discovery/douyin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    error?: string;
    candidates?: DiscoveryCandidate[];
    evidence?: InfluencerDossier["evidence"];
  };
  if (!res.ok) throw new Error(data.error || `Discovery API ${res.status}`);
  return data;
}

export const liveDouyinConnector: DouyinDiscoveryConnector = {
  id: "douyin-tikhub-live",
  label: "TikHub Douyin live",

  async search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]> {
    const data = await postDouyin({
      query: params.query,
      city: params.city,
      language: params.language,
      topic: params.topic,
      minFollowers: params.minFollowers,
      limit: params.limit,
    });
    return data.candidates ?? [];
  },

  async fetchRecentVideos(candidateId: string): Promise<InfluencerDossier["evidence"]> {
    const uniqueId = candidateId.replace(/^disc-(dy|tt)-/, "");
    const data = await postDouyin({
      query: uniqueId,
      limit: 8,
      candidateId,
    });
    return data.evidence ?? [];
  },
};

/** @deprecated use liveDouyinConnector */
export const liveTikTokConnector = liveDouyinConnector;
