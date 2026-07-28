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
import { ModeBadge } from "@/components/layout/ModeBadge";

type NavKey =
  | "dashboard"
  | "discover"
  | "presentation"
  | "influencers"
  | "products"
  | "login"
  | "campaigns"
  | "shortlists"
  | "invitations"
  | "reviews"
  | "claims"
  | "analysisJobs"
  | "settings";

type NavItem = { href: string; key: NavKey; icon: typeof LayoutDashboard };

const coreNav: NavItem[] = [
  { href: "/", key: "dashboard", icon: LayoutDashboard },
  { href: "/discover", key: "discover", icon: Search },
  { href: "/products", key: "products", icon: Package },
  { href: "/campaigns", key: "campaigns", icon: Briefcase },
  { href: "/influencers", key: "influencers", icon: Users },
];

const moreNav: NavItem[] = [
  { href: "/presentation", key: "presentation", icon: Presentation },
  { href: "/shortlists", key: "shortlists", icon: ClipboardList },
  { href: "/invitations", key: "invitations", icon: Mail },
  { href: "/reviews", key: "reviews", icon: CheckSquare },
  { href: "/claims", key: "claims", icon: Shield },
  { href: "/analysis-jobs", key: "analysisJobs", icon: BarChart3 },
  { href: "/settings", key: "settings", icon: Settings },
];

function NavLink({
  item,
  index,
  onNavigate,
}: {
  item: NavItem;
  index: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  const Icon = item.icon;
  const formattedIndex = String(index).padStart(2, "0");

  return (
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
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const loginActive = pathname.startsWith("/login");

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
        <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Core
        </div>
        <ul className="space-y-1.5">
          {coreNav.map((item, i) => (
            <li key={item.href}>
              <NavLink item={item} index={i + 1} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>

        <div className="mb-2 mt-5 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          More
        </div>
        <ul className="space-y-1.5">
          {moreNav.map((item, i) => (
            <li key={item.href}>
              <NavLink item={item} index={coreNav.length + i + 1} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3 border-t border-border/40 bg-black/5 p-4 dark:bg-white/[0.01]">
        <Link
          href="/login"
          onClick={onNavigate}
          className={cn(
            "flex items-center justify-between rounded border px-3 py-2 text-sm font-medium transition-colors",
            loginActive
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-accent/30 hover:text-foreground",
          )}
        >
          <span className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            {t.nav.login}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/60">auth</span>
        </Link>
        <Link
          href="/creator"
          onClick={onNavigate}
          className="block font-mono text-xs font-medium text-primary hover:underline"
        >
          Open creator portal →
        </Link>
        <div className="flex items-center justify-between gap-2">
          <ModeBadge />
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
