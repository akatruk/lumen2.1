import { NextResponse } from "next/server";
import { z } from "zod";
import { discoveryMode, tikhubConfig } from "@/server/env";
import { fetchTikTokSearchVideos, videosToCandidates, videosToEvidence } from "@/server/tikhub";
import type { DiscoverySearchParams, LanguageCode } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  query: z.string().min(1),
  city: z.string().optional(),
  language: z.union([z.literal("all"), z.enum(["th", "en", "ru", "zh"])]).optional(),
  topic: z.string().optional(),
  minFollowers: z.number().optional(),
  limit: z.number().min(1).max(30).optional(),
  candidateId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (discoveryMode() !== "live") {
      return NextResponse.json(
        {
          error: "DISCOVERY_MODE is not live",
          mode: "demo",
          hint: "Set DISCOVERY_MODE=live and TIKHUB_API_KEY on the server",
        },
        { status: 400 },
      );
    }
    if (!tikhubConfig().apiKey) {
      return NextResponse.json(
        { error: "TIKHUB_API_KEY is not configured", mode: "live" },
        { status: 503 },
      );
    }

    const json = await req.json();
    const body = BodySchema.parse(json);
    const params: DiscoverySearchParams = {
      query: body.query,
      city: body.city,
      language: (body.language ?? "all") as LanguageCode | "all",
      topic: body.topic,
      minFollowers: body.minFollowers ?? 0,
      limit: body.limit ?? 12,
    };

    const keyword = [params.query, params.topic && params.topic !== "All" ? params.topic : ""]
      .filter(Boolean)
      .join(" ")
      .trim();

    const videos = await fetchTikTokSearchVideos(keyword, Math.max(params.limit ?? 12, 20));
    const candidates = videosToCandidates(videos, params);

    if (body.candidateId) {
      const uniqueId = body.candidateId.replace(/^disc-tt-/, "");
      return NextResponse.json({
        mode: "live",
        source: "tikhub",
        evidence: videosToEvidence(videos, uniqueId),
      });
    }

    return NextResponse.json({
      mode: "live",
      source: "tikhub",
      count: candidates.length,
      candidates,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TikHub search failed";
    return NextResponse.json({ error: message, mode: "live" }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    mode: discoveryMode(),
    configured: Boolean(tikhubConfig().apiKey),
    endpoint: "/api/discovery/tiktok",
  });
}
