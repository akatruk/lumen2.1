import "server-only";
import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";
import type { SessionUser } from "./auth";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

export const GOOGLE_STATE_COOKIE = "lumen_google_oauth_state";

export function googleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export function googleCallbackUrl(): string {
  const explicit = process.env.GOOGLE_CALLBACK_URL?.trim();
  if (explicit) return explicit;
  const base = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${base}/api/auth/google/callback`;
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export function buildGoogleAuthorizeUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH}?${params.toString()}`;
}

type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("Google OAuth is not configured");

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: googleCallbackUrl(),
      grant_type: "authorization_code",
    }),
  });
  const tokenBody = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!tokenRes.ok || !tokenBody.access_token) {
    throw new Error(tokenBody.error_description || tokenBody.error || "Google token exchange failed");
  }

  const profileRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });
  const profile = (await profileRes.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
    error?: string;
  };
  if (!profileRes.ok || !profile.sub || !profile.email) {
    throw new Error(profile.error || "Google userinfo failed");
  }
  const verified = profile.email_verified === true || profile.email_verified === "true";
  if (!verified) throw new Error("Google email is not verified");

  return {
    googleId: profile.sub,
    email: profile.email.trim().toLowerCase(),
    name: (profile.name || profile.email.split("@")[0] || "Brand").trim(),
  };
}

/** Find by googleId → link existing email → create passwordless brand user. */
export async function loginOrRegisterGoogle(profile: GoogleProfile): Promise<SessionUser> {
  const byGoogle = await prisma.user.findUnique({ where: { googleId: profile.googleId } });
  if (byGoogle) {
    return {
      id: byGoogle.id,
      email: byGoogle.email,
      name: byGoogle.name,
      role: byGoogle.role,
      influencerId: byGoogle.influencerId,
    };
  }

  const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
  if (byEmail) {
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.googleId,
        name: byEmail.name || profile.name,
      },
    });
    return {
      id: linked.id,
      email: linked.email,
      name: linked.name,
      role: linked.role,
      influencerId: linked.influencerId,
    };
  }

  const created = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
      passwordHash: null,
      role: "brand",
    },
  });
  return {
    id: created.id,
    email: created.email,
    name: created.name,
    role: created.role,
    influencerId: created.influencerId,
  };
}

/** Stable fingerprint for debugging (never log raw secrets). */
export function googleClientFingerprint(): string | null {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!id) return null;
  return createHash("sha256").update(id).digest("hex").slice(0, 8);
}
