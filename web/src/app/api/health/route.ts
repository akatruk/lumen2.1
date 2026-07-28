import { NextResponse } from "next/server";
import { tiktokOAuthConfig } from "@/server/tiktok-oauth";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "lumen-marketplace-web",
    version: "0.4.9",
    mode:
      process.env.DISCOVERY_MODE === "live" || process.env.PRODUCT_SCAN_MODE === "live"
        ? "live-capable"
        : "demo",
    tiktokOAuth: Boolean(tiktokOAuthConfig()),
    timestamp: new Date().toISOString(),
  });
}
