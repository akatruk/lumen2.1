"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  CheckSquare,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Menu,
  Package,
  Presentation,
  Search,
  Settings,
  Shield,
  Users,
  X,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const nav = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/discover", key: "discover" as const, icon: Search },
  { href: "/presentation", key: "presentation" as const, icon: Presentation },
  { href: "/influencers", key: "influencers" as const, icon: Users },
  { href: "/products", key: "products" as const, icon: Package },
  { href: "/login", key: "login" as const, icon: LogIn },
  { href: "/campaigns", key: "campaigns" as const, icon: Briefcase },
  { href: "/shortlists", key: "shortlists" as const, icon: ClipboardList },
  { href: "/invitations", key: "invitations" as const, icon: Mail },
  { href: "/reviews", key: "reviews" as const, icon: CheckSquare },
  { href: "/claims", key: "claims" as const, icon: Shield },
  { href: "/analysis-jobs", key: "analysisJobs" as const, icon: BarChart3 },
  { href: "/settings", key: "settings" as const, icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/40 p-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-foreground">
              LUMEN <span className="font-sans text-sm font-normal text-primary">2.1</span>
            </span>
            <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">
              Marketplace
            </span>
          </div>
          <span className="mt-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">
            Influencer console
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1.5">
          {nav.map((item, index) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            const formattedIndex = String(index + 1).padStart(2, "0");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center justify-between overflow-hidden rounded border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active
                      ? "border-primary/25 bg-primary/10 text-primary shadow-[0_0_15px_rgba(59,130,246,0.06)]"
                      : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                  )}
                >
                  {active ? <div className="absolute top-2.5 bottom-2.5 left-0 w-[3px] rounded-r bg-primary" /> : null}
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate tracking-tight">{t.nav[item.key]}</span>
                  </div>
                  <span
                    className={cn(
                      "select-none font-mono text-[10px] tracking-widest transition-colors",
                      active ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground",
                    )}
                  >
                    [{formattedIndex}]
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-border/40 bg-black/5 p-4 dark:bg-white/[0.01]">
        <Link
          href="/creator"
          onClick={onNavigate}
          className="block font-mono text-xs font-medium text-primary hover:underline"
        >
          Open creator portal →
        </Link>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">Demo · mock data</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border/40 bg-card/50 px-4 py-3 backdrop-blur-md lg:hidden">
        <div>
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">Lumen</div>
          <div className="text-sm font-semibold text-foreground">Marketplace</div>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded border border-border p-2 text-foreground"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-72 border-r border-border/40 bg-card/95 backdrop-blur-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <aside className="relative z-20 hidden h-full w-64 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-md lg:flex lg:flex-col">
        <NavContent />
      </aside>
    </>
  );
}
