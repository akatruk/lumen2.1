import { NextResponse } from "next/server";
import { googleOAuthConfigured } from "@/server/google-oauth";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "lumen-marketplace-web",
    version: "0.5.4",
    mode:
      process.env.DISCOVERY_MODE === "live" || process.env.PRODUCT_SCAN_MODE === "live"
        ? "live-capable"
        : "demo",
    /** Creator identity = Act-as (Douyin). Intl TikTok OAuth removed. */
    creatorAuth: "act-as",
    googleOAuth: googleOAuthConfigured(),
    timestamp: new Date().toISOString(),
  });
}
