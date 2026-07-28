import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createSessionToken,
  loginBrand,
  registerBrand,
  setSessionCookie,
  clearSessionCookie,
  readSession,
} from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CredSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export async function GET() {
  const user = await readSession();
  return NextResponse.json({ user });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body.action ?? "login");
    if (action === "logout") {
      await clearSessionCookie();
      return NextResponse.json({ ok: true });
    }
    const parsed = CredSchema.parse(body);
    const user =
      action === "register"
        ? await registerBrand({
            email: parsed.email,
            password: parsed.password,
            name: parsed.name ?? "",
          })
        : await loginBrand(parsed.email, parsed.password);
    const token = await createSessionToken(user);
    await setSessionCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Auth failed";
    const status = message.includes("Invalid") || message.includes("already") ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
