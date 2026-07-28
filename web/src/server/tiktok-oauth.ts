import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { authSecret } from "./env";

export type TikTokOAuthConfig = {
  clientKey: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string;
};

export function tiktokOAuthConfig(): TikTokOAuthConfig | null {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim() ?? "";
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim() ?? "";
  if (!clientKey || !clientSecret) return null;
  const redirectUri =
    process.env.TIKTOK_REDIRECT_URI?.trim() ||
    "https://influencers.lumen.universalgravity.org/api/auth/tiktok/callback";
  const scopes = process.env.TIKTOK_SCOPES?.trim() || "user.info.basic";
  return { clientKey, clientSecret, redirectUri, scopes };
}

export function creatorAuthRequired(): boolean {
  return process.env.CREATOR_AUTH_REQUIRED === "true";
}

const encoder = new TextEncoder();

type OAuthState = { purpose: "tiktok-creator-oauth"; nonce: string };

export async function signTikTokOAuthState(nonce: string): Promise<string> {
  return new SignJWT({ purpose: "tiktok-creator-oauth", nonce })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(encoder.encode(authSecret()));
}

export async function verifyTikTokOAuthState(state: string): Promise<OAuthState> {
  const { payload } = await jwtVerify(state, encoder.encode(authSecret()));
  if (payload.purpose !== "tiktok-creator-oauth" || typeof payload.nonce !== "string") {
    throw new Error("Invalid OAuth state");
  }
  return { purpose: "tiktok-creator-oauth", nonce: payload.nonce };
}

export function buildTikTokAuthorizeUrl(cfg: TikTokOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_key: cfg.clientKey,
    scope: cfg.scopes,
    response_type: "code",
    redirect_uri: cfg.redirectUri,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  scope?: string;
  open_id?: string;
  token_type?: string;
};

export type TikTokProfile = {
  openId: string;
  unionId?: string;
  displayName: string;
  avatarUrl: string;
  username?: string;
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiresAt: Date | null;
};

export async function exchangeTikTokCode(
  cfg: TikTokOAuthConfig,
  code: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_key: cfg.clientKey,
    client_secret: cfg.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: cfg.redirectUri,
  });
  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as { access_token?: string; error?: string; error_description?: string } & TokenResponse;
  if (!res.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || "TikTok token exchange failed");
  }
  return json;
}

export async function fetchTikTokUserInfo(accessToken: string): Promise<{
  open_id: string;
  union_id?: string;
  display_name?: string;
  avatar_url?: string;
  username?: string;
}> {
  const fields = "open_id,union_id,avatar_url,display_name,username";
  const res = await fetch(
    `https://open.tiktokapis.com/v2/user/info/?fields=${encodeURIComponent(fields)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const json = (await res.json()) as {
    data?: { user?: Record<string, string> };
    error?: { message?: string };
  };
  const user = json.data?.user;
  if (!res.ok || !user?.open_id) {
    throw new Error(json.error?.message || "TikTok user.info failed");
  }
  return {
    open_id: user.open_id,
    union_id: user.union_id,
    display_name: user.display_name,
    avatar_url: user.avatar_url,
    username: user.username,
  };
}

export async function loadTikTokProfile(cfg: TikTokOAuthConfig, code: string): Promise<TikTokProfile> {
  const tokens = await exchangeTikTokCode(cfg, code);
  const info = await fetchTikTokUserInfo(tokens.access_token);
  const expiresAt =
    typeof tokens.expires_in === "number"
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;
  return {
    openId: info.open_id,
    unionId: info.union_id,
    displayName: info.display_name?.trim() || "TikTok Creator",
    avatarUrl: info.avatar_url ?? "",
    username: info.username?.replace(/^@/, "") || undefined,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? "",
    scope: tokens.scope ?? cfg.scopes,
    expiresAt,
  };
}
