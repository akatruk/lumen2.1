import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth";
import {
  exchangeGoogleCode,
  GOOGLE_STATE_COOKIE,
  googleOAuthConfigured,
  loginOrRegisterGoogle,
} from "@/server/google-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function redirectError(message: string) {
  const dest = new URL("/login", appOrigin());
  dest.searchParams.set("error", message);
  const res = NextResponse.redirect(dest);
  res.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: Request) {
  if (!googleOAuthConfigured()) {
    return redirectError("Google OAuth is not configured");
  }

  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  if (err) return redirectError(err);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return redirectError("Missing OAuth code");

  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${GOOGLE_STATE_COOKIE}=([^;]+)`));
  const expected = match?.[1] ? decodeURIComponent(match[1]) : null;
  if (!expected || expected !== state) {
    return redirectError("Invalid OAuth state");
  }

  try {
    const profile = await exchangeGoogleCode(code);
    const user = await loginOrRegisterGoogle(profile);
    const token = await createSessionToken(user);
    const dest = new URL("/login", appOrigin());
    dest.searchParams.set("google", "1");
    const res = NextResponse.redirect(dest);
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    res.cookies.set(GOOGLE_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google sign-in failed";
    return redirectError(message);
  }
}
