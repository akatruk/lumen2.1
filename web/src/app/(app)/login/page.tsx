"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";
import { marketplace } from "@/services/marketplace";
import { useI18n } from "@/lib/i18n";

type User = { id: string; email: string; name: string; role: string };

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { push } = useToast();
  const { t } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    void fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { user: User | null }) => setUser(d.user))
      .catch(() => setUser(null));
    void fetch("/api/health")
      .then((r) => r.json())
      .then((d: { googleOAuth?: boolean }) => setGoogleEnabled(Boolean(d.googleOAuth)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    const err = search.get("error");
    if (err) {
      push(decodeURIComponent(err.replace(/\+/g, " ")), "err");
    }
    if (search.get("google") === "1") {
      void (async () => {
        const r = await fetch("/api/auth");
        const d = (await r.json()) as { user: User | null };
        if (d.user) {
          setUser(d.user);
          await marketplace.hydrateBrandPersistence();
          push(`${t.login.signedInAs} ${d.user.email}`);
          router.replace("/products/scan");
          return;
        }
        push(t.login.googleSessionMissing, "err");
      })();
    }
  }, [search, push, router, t.login.signedInAs, t.login.googleSessionMissing]);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email,
          password,
          name: name || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; user?: User };
      if (!res.ok || !data.user) throw new Error(data.error || "Auth failed");
      setUser(data.user);
      await marketplace.hydrateBrandPersistence();
      push(`${t.login.signedInAs} ${data.user.email}`);
      router.push("/products/scan");
    } catch (e) {
      push(e instanceof Error ? e.message : "Auth failed", "err");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setUser(null);
    push(t.login.signedOut);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.login.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.login.subtitle}</p>
      </div>

      {search.get("error") ? (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {decodeURIComponent(search.get("error")!.replace(/\+/g, " "))}
        </div>
      ) : null}

      {user ? (
        <Card className="space-y-4 p-5">
          <CardHeader title={t.login.signedIn} monoLabel="01" subtitle={user.email} />
          <p className="text-sm text-muted-foreground">
            {user.name} · role {user.role}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/products/scan")}>{t.dashboard.scanProduct}</Button>
            <Button variant="secondary" onClick={() => void logout()}>
              {t.login.signOut}
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-5">
          <CardHeader
            title={mode === "login" ? t.login.signIn : t.login.createAccount}
            monoLabel="01"
            subtitle={t.login.emailPasswordHint}
          />
          {googleEnabled ? (
            <>
              <a
                href="/api/auth/google/start"
                className="flex w-full items-center justify-center gap-2 rounded border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M6.6 14.3l-.9.7-2.5 1.9C4.9 20 8.2 22 12 22c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-5.9-4.4z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M3.2 7.1C2.4 8.7 2 10.3 2 12s.4 3.3 1.2 4.9l3.4-2.6c-.2-.6-.3-1.2-.3-2.3s.1-1.7.3-2.3L3.2 7.1z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M12 4.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C16.9 1.8 14.7 1 12 1 8.2 1 4.9 3 3.2 7.1l3.4 2.6C7 6.8 9.2 4.9 12 4.9z"
                  />
                </svg>
                {t.login.continueGoogle}
              </a>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                {t.login.or}
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          ) : null}
          {mode === "register" ? (
            <Field label={t.login.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand team" />
            </Field>
          ) : null}
          <Field label={t.login.email}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="brand@company.com"
            />
          </Field>
          <Field label={t.login.password}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void submit()} disabled={loading || !email || password.length < 8}>
              {loading ? "…" : mode === "login" ? t.login.signIn : t.login.register}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? t.login.needAccount : t.login.haveAccount}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
