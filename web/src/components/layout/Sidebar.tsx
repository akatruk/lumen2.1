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
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useMobileNav } from "@/hooks/useMobileNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
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
        "group relative flex min-h-11 items-center justify-between overflow-hidden rounded border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
              {t.app.badge}
            </span>
          </div>
          <span className="mt-0.5 font-mono text-[11px] tracking-wide text-muted-foreground">
            {t.app.console}
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {t.nav.core}
        </div>
        <ul className="space-y-1.5">
          {coreNav.map((item, i) => (
            <li key={item.href}>
              <NavLink item={item} index={i + 1} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>

        <div className="mb-2 mt-5 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          {t.nav.more}
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
            "flex min-h-11 items-center justify-between rounded border px-3 py-2 text-sm font-medium transition-colors",
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
          {t.app.creatorPortal}
        </Link>
        <div className="flex items-center justify-between gap-2">
          <ModeBadge />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Brand console chrome: mobile top bar + drawer; desktop fixed sidebar. */
export function BrandShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { open, toggle, close } = useMobileNav();

  return (
    <div className="relative flex h-dvh w-full max-w-full flex-col overflow-x-hidden overflow-y-hidden bg-background text-foreground transition-colors duration-300 lg:flex-row">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <div className="absolute inset-0 grid-pattern opacity-[0.4] dark:opacity-[0.25]" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
        <div className="ambient-glow -top-40 -left-40 bg-primary/8 dark:bg-primary/12" />
        <div className="ambient-glow -right-40 -bottom-60 bg-blue-500/8 dark:bg-indigo-500/8" />
      </div>

      <header
        className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-card/50 px-4 py-3 backdrop-blur-md lg:hidden"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="min-w-0">
          <div className="font-mono text-xs font-semibold uppercase tracking-wider text-primary">Lumen</div>
          <div className="truncate text-sm font-semibold text-foreground">Marketplace</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-border text-foreground"
            onClick={toggle}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {open ? (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={close}
            role="presentation"
          >
            <aside
              role="dialog"
              aria-modal="true"
              aria-label={t.nav.openMenu}
              className="flex h-full w-[min(18rem,85vw)] flex-col border-r border-border/40 bg-card/95 shadow-xl backdrop-blur-md"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <NavContent onNavigate={close} />
            </aside>
          </div>
        ) : null}

        <aside className="relative z-20 hidden h-full w-64 shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-md lg:flex lg:flex-col">
          <NavContent />
        </aside>

        <main className="relative z-10 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div
            className="relative mx-auto w-full max-w-7xl animate-fade-scale-in p-4 md:p-8"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
