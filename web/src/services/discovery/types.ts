import type { DiscoveryCandidate, DiscoverySearchParams, InfluencerDossier } from "@/types";

/** Douyin discovery connector (primary). Name kept TikTok* in some call sites as alias. */
export interface DouyinDiscoveryConnector {
  readonly id: string;
  readonly label: string;
  search(params: DiscoverySearchParams): Promise<DiscoveryCandidate[]>;
  /** Optional hydrate of recent video stubs for dossier evidence */
  fetchRecentVideos?(candidateId: string): Promise<InfluencerDossier["evidence"]>;
}

/** @deprecated use DouyinDiscoveryConnector */
export type TikTokDiscoveryConnector = DouyinDiscoveryConnector;
