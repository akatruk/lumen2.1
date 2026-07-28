import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { authSecret } from "./env";
import type { TikTokProfile } from "./tiktok-oauth";

const COOKIE = "lumen_session";
const encoder = new TextEncoder();

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  influencerId?: string | null;
};

function secretKey() {
  return encoder.encode(authSecret());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    influencerId: user.influencerId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secretKey());
}

export async function readSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = payload.sub;
    if (!id) return null;
    return {
      id,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "brand"),
      influencerId: payload.influencerId ? String(payload.influencerId) : null,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  const secure = process.env.COOKIE_SECURE === "true";
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export const SESSION_COOKIE = COOKIE;

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function registerBrand(input: {
  email: string;
  password: string;
  name: string;
}): Promise<SessionUser> {
  const email = input.email.trim().toLowerCase();
  if (!email || input.password.length < 8) {
    throw new Error("Email required and password must be at least 8 characters");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name.trim() || email.split("@")[0] || "Brand",
      passwordHash: await hashPassword(input.password),
      role: "brand",
    },
  });
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function loginBrand(email: string, password: string): Promise<SessionUser> {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    influencerId: user.influencerId,
  };
}

/** Catalog-style ids brands use for Discover → invite. */
export function influencerIdCandidatesFromTikTok(profile: TikTokProfile): string[] {
  const out: string[] = [];
  const handle = profile.username?.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9._]/g, "");
  if (handle) {
    out.push(`inf-disc-tt-${handle}`);
    out.push(`disc-tt-${handle}`);
  }
  out.push(`inf-tt-${profile.openId.slice(0, 16)}`);
  return out;
}

export function influencerIdAliases(id: string): Set<string> {
  const out = new Set<string>([id]);
  if (id.startsWith("inf-disc-tt-")) out.add(id.replace(/^inf-disc-tt-/, "disc-tt-"));
  if (id.startsWith("disc-tt-")) out.add(id.replace(/^disc-tt-/, "inf-disc-tt-"));
  return out;
}

async function resolveInfluencerId(profile: TikTokProfile, existing?: string | null): Promise<string> {
  if (existing) return existing;
  const candidates = influencerIdCandidatesFromTikTok(profile);
  for (const cand of candidates) {
    const aliases = [...influencerIdAliases(cand)];
    const hit = await prisma.invitation.findFirst({
      where: { influencerId: { in: aliases } },
      select: { influencerId: true },
    });
    if (hit) return hit.influencerId.startsWith("disc-tt-")
      ? hit.influencerId.replace(/^disc-tt-/, "inf-disc-tt-")
      : hit.influencerId;
  }
  return candidates[0]!;
}

export async function loginOrRegisterCreatorFromTikTok(profile: TikTokProfile): Promise<SessionUser> {
  const existingAccount = await prisma.tikTokAccount.findUnique({
    where: { openId: profile.openId },
    include: { user: true },
  });

  if (existingAccount) {
    const influencerId = await resolveInfluencerId(profile, existingAccount.user.influencerId);
    await prisma.tikTokAccount.update({
      where: { id: existingAccount.id },
      data: {
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        username: profile.username,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        scope: profile.scope,
        expiresAt: profile.expiresAt,
        unionId: profile.unionId,
      },
    });
    const user = await prisma.user.update({
      where: { id: existingAccount.userId },
      data: {
        name: profile.displayName,
        role: "creator",
        influencerId,
      },
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      influencerId: user.influencerId,
    };
  }

  const email = `tt_${profile.openId.slice(0, 24)}@tiktok.oauth.lumen`.toLowerCase();
  const influencerId = await resolveInfluencerId(profile, null);
  const user = await prisma.user.create({
    data: {
      email,
      name: profile.displayName,
      passwordHash: await hashPassword(`tt-oauth-${profile.openId}-${Date.now()}`),
      role: "creator",
      influencerId,
      tiktokAccounts: {
        create: {
          openId: profile.openId,
          unionId: profile.unionId,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          username: profile.username,
          accessToken: profile.accessToken,
          refreshToken: profile.refreshToken,
          scope: profile.scope,
          expiresAt: profile.expiresAt,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    influencerId: user.influencerId,
  };
}
