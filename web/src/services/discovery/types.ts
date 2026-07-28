import type { DiscoveryCandidate, DiscoverySearchParams, InfluencerDossier } from "@/types";

export interface TikTokDiscoveryConnector {
  readonly id: string;
  readonly label: string;
  search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]>;
  /** Optional hydrate of recent video stubs for dossier evidence */
  fetchRecentVideos?(candidateId: string): Promise<InfluencerDossier["evidence"]>;
}
