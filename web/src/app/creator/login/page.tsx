"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  influencerId?: string | null;
};

const ERRORS: Record<string, string> = {
  denied: "International TikTok authorization was denied (not Douyin).",
  state: "OAuth state mismatch — try again.",
  oauth: "Intl TikTok login failed — try again (this is not Douyin OAuth).",
  config: "Intl TikTok OAuth is not configured (Douyin login not available yet).",
};

function CreatorLoginInner() {
  const params = useSearchParams();
  const err = params.get("error");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { user: SessionUser | null }) => setUser(d.user))
      .catch(() => setUser(null));
    void fetch("/api/auth/tiktok/start", { method: "HEAD" }).catch(() => null);
    // Probe via GET would redirect — use a lightweight config check endpoint instead
    void fetch("/api/health")
      .then((r) => r.json())
      .then((h: { tiktokOAuth?: boolean }) => setConfigured(h.tiktokOAuth ?? null))
      .catch(() => setConfigured(null));
  }, []);

  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Creator login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional international TikTok Login (not Douyin). Prefer Act-as for Douyin creators until Douyin Open Platform OAuth is wired.
        </p>
      </div>

      {err ? (
        <div className="rounded border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {ERRORS[err] ?? `Login error: ${err}`}
        </div>
      ) : null}

      {user?.role === "creator" ? (
        <Card className="space-y-4 p-5">
          <CardHeader title="Signed in (intl TikTok Login)" monoLabel="01" subtitle={user.name} />
          <p className="text-sm text-muted-foreground">
            Influencer id: <span className="font-mono text-xs">{user.influencerId ?? "—"}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/creator">
              <Button size="sm">Open creator home</Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={() => void logout()}>
              Log out
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-5">
          <CardHeader
            title="Intl TikTok Login (not Douyin)"
            monoLabel="01"
            subtitle="Leftover intl OAuth · reuses Strom TikTok app · not 抖音登录"
          />
          {configured === false ? (
            <Badge tone="review">OAuth keys not set on server</Badge>
          ) : null}
          <a href="/api/auth/tiktok/start">
            <Button className="w-full">Continue with intl TikTok</Button>
          </a>
          <p className="text-xs text-muted-foreground">
            Ops fallback: open{" "}
            <Link href="/creator" className="text-primary hover:underline">
              Creator portal
            </Link>{" "}
            and use Act-as until OAuth is configured.
          </p>
        </Card>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Brand accounts use{" "}
        <Link href="/login" className="text-primary hover:underline">
          Brand login
        </Link>
        .
      </p>
    </div>
  );
}

export default function CreatorLoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
      <CreatorLoginInner />
    </Suspense>
  );
}
