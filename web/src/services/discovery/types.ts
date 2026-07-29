import type { DiscoveryCandidate, DiscoverySearchParams, InfluencerDossier } from "@/types";

/** Douyin discovery connector (primary). */
export interface DouyinDiscoveryConnector {
  readonly id: string;
  readonly label: string;
  search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]>;
  fetchRecentVideos?(candidateId: string): Promise<InfluencerDossier["evidence"]>;
}
