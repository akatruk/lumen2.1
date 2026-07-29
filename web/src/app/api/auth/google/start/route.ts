import { NextResponse } from "next/server";
import {
  buildGoogleAuthorizeUrl,
  createOAuthState,
  googleOAuthConfigured,
  GOOGLE_STATE_COOKIE,
} from "@/server/google-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!googleOAuthConfigured()) {
    return NextResponse.json({ error: "Google OAuth is not configured" }, { status: 503 });
  }

  const state = createOAuthState();
  const url = buildGoogleAuthorizeUrl(state);
  const secure = process.env.COOKIE_SECURE === "true";
  const res = NextResponse.redirect(url);
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 10,
  });
  // Keep request URL available for logs only (no secrets)
  void req;
  return res;
}
