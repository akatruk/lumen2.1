"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";

type User = { id: string; email: string; name: string; role: string };

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { user: User | null }) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

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
      push(`Signed in as ${data.user.email}`);
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
    push("Signed out");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Brand login</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server-backed account for product persistence. Demo localStorage still works when logged out.
        </p>
      </div>

      {user ? (
        <Card className="space-y-4 p-5">
          <CardHeader title="Signed in" monoLabel="01" subtitle={user.email} />
          <p className="text-sm text-muted-foreground">
            {user.name} · role {user.role}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/products/scan")}>Scan product</Button>
            <Button variant="secondary" onClick={() => void logout()}>
              Sign out
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="space-y-4 p-5">
          <CardHeader
            title={mode === "login" ? "Sign in" : "Create brand account"}
            monoLabel="01"
            subtitle="Email + password (min 8)"
          />
          {mode === "register" ? (
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand team" />
            </Field>
          ) : null}
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="brand@company.com"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void submit()} disabled={loading || !email || password.length < 8}>
              {loading ? "…" : mode === "login" ? "Sign in" : "Register"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Need an account?" : "Have an account?"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
