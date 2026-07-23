export type Platform = "tiktok" | "instagram" | "youtube";
export type LanguageCode = "th" | "en" | "ru" | "zh";
export type VerificationStatus = "verified" | "unverified" | "pending";
export type CampaignStatus = "Draft" | "Active" | "Reviewing" | "Completed";
export type AnalysisJobStatus = "Queued" | "Processing" | "Completed" | "Failed";
export type BrandSafetyStatus = "safe" | "review" | "risk";
export type InvitationStatus = "Pending" | "Accepted" | "Declined" | "Expired";

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
}

export interface ActivityEvent {
  id: string;
  type: "invite" | "shortlist" | "product" | "campaign" | "analysis" | "import";
  message: string;
  createdAt: string;
}

export interface AppSettings {
  locale: LanguageCode;
  defaultVideosToAnalyze: number;
  matchWeights: MatchBreakdown;
}
