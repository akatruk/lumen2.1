"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { ToastProvider } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";

const nav = [
  { href: "/creator", label: "Home", icon: LayoutDashboard },
  { href: "/creator/invitations", label: "Invitations", icon: Inbox },
  { href: "/creator/briefs", label: "Briefs", icon: FileText },
  { href: "/creator/submissions", label: "Submissions", icon: Send },
  { href: "/creator/claim", label: "Claim profile", icon: Shield },
];

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const influencers = marketplace.listInfluencers();

  useEffect(() => {
    setSessionId(collaboration.getCreatorSession()?.influencerId ?? "inf-1");
    if (!collaboration.getCreatorSession()) {
      collaboration.setCreatorSession("inf-1");
    }
  }, []);

  const me = sessionId ? marketplace.getInfluencer(sessionId) : undefined;

  const shell = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Creator Portal</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">Phase 2 Collaboration</div>
        <div className="mt-3">
          <Select
            value={sessionId ?? ""}
            onChange={(e) => {
              collaboration.setCreatorSession(e.target.value);
              setSessionId(e.target.value);
              router.refresh();
            }}
            aria-label="Act as creator"
          >
            {influencers.map((inf) => (
              <option key={inf.id} value={inf.id}>
                {inf.name} · {inf.city}
              </option>
            ))}
          </Select>
        </div>
        {me ? (
          <div className="mt-2 text-xs text-slate-500">
            Signed in as {me.name} · claim {me.claimStatus}
          </div>
        ) : null}
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = item.href === "/creator" ? pathname === "/creator" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-sky-50 text-sky-900" : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-slate-200 p-4">
        <Link href="/" className="block text-xs font-medium text-teal-700 hover:underline">
          ← Brand console
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            collaboration.setCreatorSession(null);
            router.push("/creator");
          }}
        >
          <LogOut className="h-4 w-4" /> Clear session
        </Button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen lg:flex">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700">Creator</div>
            <div className="text-sm font-semibold">{me?.name ?? "Portal"}</div>
          </div>
          <button type="button" className="rounded-lg border border-slate-300 p-2" onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="h-full w-72 bg-white" onClick={(e) => e.stopPropagation()}>
              {shell}
            </aside>
          </div>
        ) : null}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 h-screen">{shell}</div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
