import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "lumen-marketplace-web",
    version: "0.2.0",
    mode: "demo",
    timestamp: new Date().toISOString(),
  });
}
