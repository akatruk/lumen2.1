import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { authSecret } from "./env";

const COOKIE = "lumen_session";
const encoder = new TextEncoder();

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
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
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  // Demo droplet is HTTP :3000 — Secure cookies would be dropped by browsers/curl.
  // Set COOKIE_SECURE=true when serving over HTTPS.
  const secure = process.env.COOKIE_SECURE === "true";
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

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
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
