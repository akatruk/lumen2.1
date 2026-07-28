import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  loginOrRegisterCreatorFromTikTok,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/server/auth";
import {
  loadTikTokProfile,
  tiktokOAuthConfig,
  verifyTikTokOAuthState,
} from "@/server/tiktok-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function appBase() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://influencers.lumen.universalgravity.org"
  );
}

function loginRedirect(error?: string) {
  const url = new URL("/creator/login", appBase());
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url.toString());
}

export async function GET(req: NextRequest) {
  const cfg = tiktokOAuthConfig();
  if (!cfg) return loginRedirect("config");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const denied = req.nextUrl.searchParams.get("error");
  if (denied) return loginRedirect("denied");
  if (!code || !state) return loginRedirect("oauth");

  try {
    const parsed = await verifyTikTokOAuthState(state);
    const nonceCookie = req.cookies.get("lumen_tiktok_oauth")?.value;
    if (nonceCookie && nonceCookie !== parsed.nonce) {
      return loginRedirect("state");
    }

    const profile = await loadTikTokProfile(cfg, code);
    const user = await loginOrRegisterCreatorFromTikTok(profile);
    const token = await createSessionToken(user);

    const res = NextResponse.redirect(`${appBase()}/creator`);
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    res.cookies.set("lumen_tiktok_oauth", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    console.error("[tiktok-oauth]", err);
    return loginRedirect("oauth");
  }
}
