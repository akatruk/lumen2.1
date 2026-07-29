import type { BrandSafetySignal, LanguageCode } from "@/types";

export type AnalysisRequestType =
  | "transcript"
  | "topics"
  | "style"
  | "entities"
  | "brand_safety";

export interface SubmitAnalysisRequest {
  externalId: string;
  sourceUrl: string;
  languageHints?: LanguageCode[];
  requestedAnalyses: AnalysisRequestType[];
  callbackUrl?: string;
  idempotencyKey?: string;
}

export interface SubmitAnalysisResponse {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export interface AnalysisTopic {
  name: string;
  confidence: number;
}

export interface AnalysisStyle {
  formats: string[];
  tone: string[];
}

export interface NormalizedAnalysisResult {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  language?: LanguageCode;
  transcript?: string;
  topics?: AnalysisTopic[];
  style?: AnalysisStyle;
  entities?: string[];
  brandSafety?: BrandSafetySignal;
  modelVersion: string;
  summary: string;
  error?: string;
}

/** Abstraction for future Lumen Analysis API. UI must use this, never mock data directly. */
export interface LumenAnalysisClient {
  submitAnalysis(req: SubmitAnalysisRequest): Promise<SubmitAnalysisResponse>;
  getJobStatus(jobId: string): Promise<Pick<NormalizedAnalysisResult, "jobId" | "status" | "error">>;
  getJobResult(jobId: string): Promise<NormalizedAnalysisResult>;
  getTranscript(jobId: string): Promise<string>;
  getTopics(jobId: string): Promise<AnalysisTopic[]>;
  getLanguage(jobId: string): Promise<LanguageCode>;
  getStyle(jobId: string): Promise<AnalysisStyle>;
  getEntities(jobId: string): Promise<string[]>;
  getBrandSafety(jobId: string): Promise<BrandSafetySignal>;
}

class MockLumenAnalysisClient implements LumenAnalysisClient {
  private jobs = new Map<string, NormalizedAnalysisResult>();

  async submitAnalysis(req: SubmitAnalysisRequest): Promise<SubmitAnalysisResponse> {
    const jobId = `mock-${req.externalId}-${Date.now()}`;
    this.jobs.set(jobId, {
      jobId,
      status: "queued",
      modelVersion: "lumen-mock-1.0",
      summary: "Queued for mock analysis",
    });
    // Also store under stable key for demo job simulation
    this.jobs.set(`mock-${req.externalId}`, {
      jobId: `mock-${req.externalId}`,
      status: "completed",
      language: req.languageHints?.[0] ?? "en",
      transcript: `Mock transcript for ${req.sourceUrl}`,
      topics: [
        { name: "lifestyle", confidence: 0.88 },
        { name: "travel", confidence: 0.76 },
      ],
      style: { formats: ["short_review"], tone: ["informal"] },
      entities: ["China", "Shanghai"],
      brandSafety: { status: "safe", flags: [], notes: "Mock brand-safety clear." },
      modelVersion: "lumen-mock-1.0",
      summary: `Mock analysis completed for ${req.externalId}. Topics: lifestyle, travel.`,
    });
    return { jobId, status: "queued" };
  }

  async getJobStatus(jobId: string) {
    const job = this.jobs.get(jobId) ?? {
      jobId,
      status: "completed" as const,
      error: undefined,
    };
    return { jobId, status: job.status, error: job.error };
  }

  async getJobResult(jobId: string): Promise<NormalizedAnalysisResult> {
    const existing = this.jobs.get(jobId);
    if (existing) return existing;
    return {
      jobId,
      status: "completed",
      language: "en",
      transcript: "Mock transcript",
      topics: [{ name: "lifestyle", confidence: 0.8 }],
      style: { formats: ["short_review"], tone: ["informal"] },
      entities: ["China"],
      brandSafety: { status: "safe", flags: [], notes: "Clear" },
      modelVersion: "lumen-mock-1.0",
      summary: "Mock analysis completed.",
    };
  }

  async getTranscript(jobId: string) {
    return (await this.getJobResult(jobId)).transcript ?? "";
  }

  async getTopics(jobId: string) {
    return (await this.getJobResult(jobId)).topics ?? [];
  }

  async getLanguage(jobId: string) {
    return (await this.getJobResult(jobId)).language ?? "en";
  }

  async getStyle(jobId: string) {
    return (await this.getJobResult(jobId)).style ?? { formats: [], tone: [] };
  }

  async getEntities(jobId: string) {
    return (await this.getJobResult(jobId)).entities ?? [];
  }

  async getBrandSafety(jobId: string) {
    return (
      (await this.getJobResult(jobId)).brandSafety ?? {
        status: "safe",
        flags: [],
        notes: "Clear",
      }
    );
  }
}

export const lumenAnalysis: LumenAnalysisClient = new MockLumenAnalysisClient();
