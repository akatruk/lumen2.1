import { NextResponse } from "next/server";
import {
  buildTikTokAuthorizeUrl,
  signTikTokOAuthState,
  tiktokOAuthConfig,
} from "@/server/tiktok-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = tiktokOAuthConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "TikTok OAuth not configured (set TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET)" },
      { status: 503 },
    );
  }
  const nonce = crypto.randomUUID();
  const state = await signTikTokOAuthState(nonce);
  const url = buildTikTokAuthorizeUrl(cfg, state);
  const res = NextResponse.redirect(url);
  res.cookies.set("lumen_tiktok_oauth", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 600,
  });
  return res;
}
