"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  Shield,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { Influencer } from "@/types";
import { ToastProvider } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ModeBadge } from "@/components/layout/ModeBadge";

const nav = [
  { href: "/creator", label: "Home", icon: LayoutDashboard },
  { href: "/creator/invitations", label: "Invitations", icon: Inbox },
  { href: "/creator/briefs", label: "Briefs", icon: FileText },
  { href: "/creator/submissions", label: "Submissions", icon: Send },
  { href: "/creator/claim", label: "Claim profile", icon: Shield },
];

function isDiscovered(inf: Influencer): boolean {
  return (
    inf.id.includes("disc") ||
    /discovered/i.test(inf.notes ?? "") ||
    /tikhub/i.test(inf.notes ?? "")
  );
}

function sortActAs(list: Influencer[]): Influencer[] {
  return [...list].sort((a, b) => {
    const ad = isDiscovered(a) ? 0 : 1;
    const bd = isDiscovered(b) ? 0 : 1;
    if (ad !== bd) return ad - bd;
    return b.matchScore - a.matchScore;
  });
}

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);

  useEffect(() => {
    setInfluencers(sortActAs(marketplace.listInfluencers()));
    const existing = collaboration.getCreatorSession()?.influencerId;
    if (existing && marketplace.getInfluencer(existing)) {
      setSessionId(existing);
      return;
    }
    const discovered = sortActAs(marketplace.listInfluencers()).find(isDiscovered);
    const fallback = discovered?.id ?? "inf-1";
    collaboration.setCreatorSession(fallback);
    setSessionId(fallback);
  }, [pathname]);

  const me = useMemo(
    () => (sessionId ? marketplace.getInfluencer(sessionId) : undefined),
    [sessionId, influencers],
  );

  const shell = (
    <div className="flex h-full flex-col">
      <div className="border-b border-border/40 p-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold tracking-tight text-foreground">
            LUMEN <span className="font-sans text-sm font-normal text-primary">2.1</span>
          </span>
          <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">
            Creator
          </span>
        </div>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">Phase 2 collaboration</div>
        <div className="mt-3">
          <Select
            value={sessionId ?? ""}
            onChange={(e) => {
              collaboration.setCreatorSession(e.target.value);
              setSessionId(e.target.value);
            }}
            aria-label="Act as creator"
          >
            {influencers.map((inf) => {
              const handle = inf.platforms?.[0]?.handle;
              const tag = isDiscovered(inf) ? "TikHub" : "Seed";
              return (
                <option key={inf.id} value={inf.id}>
                  [{tag}] {inf.name}
                  {handle ? ` ${handle}` : ""} · {inf.city}
                </option>
              );
            })}
          </Select>
        </div>
        {me ? (
          <div className="mt-2 font-mono text-xs text-muted-foreground">
            Signed in as {me.name} · claim {me.claimStatus}
            {isDiscovered(me) ? " · live catalog" : ""}
          </div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {nav.map((item, index) => {
          const active = item.href === "/creator" ? pathname === "/creator" : pathname.startsWith(item.href);
          const Icon = item.icon;
          const formattedIndex = String(index + 1).padStart(2, "0");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex items-center justify-between overflow-hidden rounded border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "border-primary/25 bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.06)]"
                  : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
              )}
            >
              {active ? <div className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r bg-primary" /> : null}
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </div>
              <span className={cn("font-mono text-[10px]", active ? "text-primary" : "text-muted-foreground/50")}>
                [{formattedIndex}]
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 border-t border-border/40 bg-black/5 p-4 dark:bg-white/[0.01]">
        <Link href="/" className="block font-mono text-xs font-medium text-primary hover:underline">
          ← Brand console
        </Link>
        <div className="flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="justify-start"
            onClick={() => {
              collaboration.setCreatorSession(null);
              setSessionId(null);
              router.push("/creator");
            }}
          >
            <LogOut className="h-4 w-4" /> Clear
          </Button>
          <div className="flex items-center gap-2">
            <ModeBadge />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
          <div className="absolute inset-0 grid-pattern opacity-[0.4] dark:opacity-[0.25]" />
          <div className="absolute inset-0 bg-noise opacity-[0.02]" />
          <div className="ambient-glow -top-40 -left-40 bg-primary/8 dark:bg-primary/12" />
          <div className="ambient-glow -right-40 -bottom-60 bg-blue-500/8 dark:bg-indigo-500/8" />
        </div>

        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-card/50 px-4 py-3 backdrop-blur-md lg:hidden">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">Creator</div>
            <div className="text-sm font-semibold">{me?.name ?? "Portal"}</div>
          </div>
          <button
            type="button"
            className="rounded border border-border p-2"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
            <aside
              className="h-full w-72 border-r border-border/40 bg-card/95 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              {shell}
            </aside>
          </div>
        ) : null}

        <aside className="relative z-20 hidden h-full w-64 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-md lg:flex lg:flex-col">
          {shell}
        </aside>

        <main className="relative z-10 min-w-0 flex-1 overflow-y-auto">
          <div className="relative mx-auto w-full max-w-5xl animate-fade-scale-in p-6 md:p-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
