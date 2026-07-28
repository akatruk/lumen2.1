export type Platform = "tiktok" | "instagram" | "youtube";
export type LanguageCode = "th" | "en" | "ru" | "zh";
export type VerificationStatus = "verified" | "unverified" | "pending";
export type CampaignStatus = "Draft" | "Active" | "Reviewing" | "Completed";
export type AnalysisJobStatus = "Queued" | "Processing" | "Completed" | "Failed";
export type BrandSafetyStatus = "safe" | "review" | "risk";
export type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Expired";
export type ClaimStatus = "Unclaimed" | "PendingReview" | "Verified" | "Rejected";
export type BriefStatus = "Draft" | "Sent" | "Acknowledged";
export type SubmissionStatus =
  | "Draft"
  | "Submitted"
  | "ChangesRequested"
  | "Approved"
  | "Published";

export interface SocialAccount {
  platform: Platform;
  handle: string;
  url: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
}

export interface MatchBreakdown {
  topicRelevance: number;
  audienceGeography: number;
  language: number;
  contentStyle: number;
  engagementQuality: number;
  postingConsistency: number;
  brandSafety: number;
  commercialFit: number;
}

export interface MatchExplanation {
  overall: number;
  confidence: number;
  breakdown: MatchBreakdown;
  reasons: string[];
}

export interface BrandSafetySignal {
  status: BrandSafetyStatus;
  flags: string[];
  notes: string;
}

export interface VideoAnalysis {
  language: LanguageCode;
  transcript: string;
  topics: { name: string; confidence: number }[];
  style: { formats: string[]; tone: string[] };
  entities: string[];
  brandSafety: BrandSafetySignal;
}

export interface VideoSnapshot {
  id: string;
  influencerId: string;
  title: string;
  platform: Platform;
  url: string;
  thumbnailUrl?: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  durationSec: number;
  analysis?: VideoAnalysis;
}

export interface Influencer {
  id: string;
  name: string;
  avatarInitials: string;
  avatarColor: string;
  country: string;
  city: string;
  languages: LanguageCode[];
  topics: string[];
  platforms: SocialAccount[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  analyzedVideos: number;
  matchScore: number;
  match?: MatchExplanation;
  verificationStatus: VerificationStatus;
  claimStatus: ClaimStatus;
  contactEmail?: string;
  contentStyle: string[];
  postingFrequency: string;
  brandSafety: BrandSafetySignal;
  suitableProductIds: string[];
  notes: string;
  bio: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageEmoji: string;
  priceLabel: string;
  geography: string[];
  audience: string;
  languages: LanguageCode[];
  benefits: string[];
  prohibitedClaims: string[];
  desiredTopics: string[];
  createdAt: string;
  /** Preferred discovery platforms (default tiktok) */
  platforms?: Platform[];
  /** AI/manual Product Resume Card used for Discover match */
  resumeCard?: ProductResumeCard;
}

export type BudgetType = "unknown" | "barter" | "fixed" | "range";

export interface ProductBudget {
  type: BudgetType;
  notes: string;
}

/** Canonical Product Resume Card (docs/prompts/BUSINESS_FLOW_PROMPT.md step 2) */
export interface ProductResumeCard {
  name: string;
  brand: string;
  category: string;
  pitch: string;
  geography: string[];
  audience: string;
  languages: LanguageCode[];
  benefits: string[];
  prohibited_claims: string[];
  desired_topics: string[];
  tone: string[];
  platforms: Platform[];
  budget: ProductBudget;
  success_metrics: string[];
  confidence: number;
  missing_fields: string[];
  evidence_notes: string[];
  scannedAt?: string;
  sourceMode?: "demo-scan" | "live-scan" | "manual";
}

export interface ProductScanMaterials {
  url?: string;
  briefText?: string;
  photoNames?: string[];
  /** optional freeform notes */
  notes?: string;
}

export interface RankedDiscoveryMatch {
  candidate: DiscoveryCandidate;
  score: number;
  confidence: number;
  reasons: string[];
  risks: string[];
  breakdown: {
    topic: number;
    audienceGeo: number;
    engagement: number;
    language: number;
    style: number;
    safety: number;
    posting: number;
    commercial: number;
  };
}


export interface Campaign {
  id: string;
  name: string;
  productId: string;
  objective: string;
  audience: string;
  platforms: Platform[];
  geography: string[];
  languages: LanguageCode[];
  budgetRange: string;
  startDate: string;
  endDate: string;
  materials: string[];
  status: CampaignStatus;
  candidateCount: number;
  shortlistCount: number;
  createdAt: string;
}

export interface ShortlistItem {
  influencerId: string;
  addedAt: string;
  note: string;
}

export interface Shortlist {
  id: string;
  name: string;
  productId?: string;
  campaignId?: string;
  items: ShortlistItem[];
  notes: string;
  createdAt: string;
}

export interface AnalysisJob {
  id: string;
  influencerId: string;
  videoCount: number;
  source: string;
  status: AnalysisJobStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  resultSummary?: string;
  error?: string;
}

export interface ImportPreviewRow {
  platform: Platform;
  url: string;
  handle: string;
  name: string;
  city: string;
  videosToAnalyze: number;
}

export interface DashboardStats {
  influencers: number;
  analyzedVideos: number;
  activeCampaigns: number;
  shortlistedInfluencers: number;
  topicStats: { topic: string; count: number }[];
}

export interface Invitation {
  id: string;
  influencerId: string;
  campaignId: string;
  status: InvitationStatus;
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export interface ProfileClaim {
  id: string;
  influencerId: string;
  claimantName: string;
  claimantEmail: string;
  proofNote: string;
  status: "PendingReview" | "Verified" | "Rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface CampaignBrief {
  id: string;
  campaignId: string;
  invitationId: string;
  influencerId: string;
  title: string;
  deliverables: string[];
  messaging: string;
  restrictions: string[];
  deadline: string;
  approvalRules: string;
  status: BriefStatus;
  createdAt: string;
}

export interface SubmissionFeedback {
  id: string;
  authorRole: "brand" | "creator";
  message: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  campaignId: string;
  invitationId: string;
  influencerId: string;
  briefId: string;
  status: SubmissionStatus;
  draftUrl?: string;
  privateReviewLink?: string;
  caption?: string;
  publicationUrl?: string;
  feedback: SubmissionFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceSnapshot {
  id: string;
  campaignId: string;
  influencerId: string;
  submissionId: string;
  publicationUrl: string;
  recordedAt: string;
  views: number;
  likes: number;
  comments: number;
  clicks?: number;
  notes?: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | "invite"
    | "shortlist"
    | "product"
    | "campaign"
    | "analysis"
    | "import"
    | "claim"
    | "brief"
    | "submission"
    | "review"
    | "publish";
  message: string;
  createdAt: string;
}

export interface CreatorSession {
  influencerId: string;
}

export interface AppSettings {
  locale: LanguageCode;
  defaultVideosToAnalyze: number;
  matchWeights: MatchBreakdown;
}

/** In-app TikTok discovery (see docs/DISCOVERY_AND_DOSSIER.md) */
export interface DiscoverySearchParams {
  query: string;
  city?: string;
  language?: LanguageCode | "all";
  topic?: string;
  minFollowers?: number;
  limit?: number;
}

export interface DiscoveryCandidate {
  id: string;
  name: string;
  handle: string;
  profileUrl: string;
  avatarInitials: string;
  avatarColor: string;
  city: string;
  country: string;
  languages: LanguageCode[];
  topics: string[];
  followers: number;
  avgViews: number;
  engagementRate: number;
  bio: string;
  source: string;
  collectedAt: string;
}

export interface DossierAudienceSignal {
  label: string;
  confidence: number;
  evidence?: string;
}

export interface DossierEvidenceItem {
  videoId: string;
  title: string;
  url: string;
  publishedAt: string;
  views: number;
  quote?: string;
  timestamp?: string;
  analysis?: VideoAnalysis;
}

export interface InfluencerDossier {
  id: string;
  candidateId: string;
  influencerId?: string;
  identity: {
    name: string;
    handle: string;
    profileUrl: string;
    avatarInitials: string;
    avatarColor: string;
    city: string;
    country: string;
    languages: LanguageCode[];
    bio: string;
  };
  reach: {
    followers: number;
    avgViews: number;
    engagementRate: number;
    postingFrequency: string;
  };
  topics: { name: string; confidence: number }[];
  style: { formats: string[]; tone: string[] };
  audience: DossierAudienceSignal[];
  brandSafety: BrandSafetySignal;
  evidence: DossierEvidenceItem[];
  source: string;
  discoveredAt: string;
  lastAnalyzedAt?: string;
  analysisStatus: "idle" | "running" | "ready" | "failed";
  inCatalog: boolean;
}

