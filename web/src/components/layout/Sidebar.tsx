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
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const nav = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/influencers", key: "influencers" as const, icon: Users },
  { href: "/products", key: "products" as const, icon: Package },
  { href: "/campaigns", key: "campaigns" as const, icon: Briefcase },
  { href: "/shortlists", key: "shortlists" as const, icon: ClipboardList },
  { href: "/invitations", key: "invitations" as const, icon: Mail },
  { href: "/reviews", key: "reviews" as const, icon: CheckSquare },
  { href: "/claims", key: "claims" as const, icon: Shield },
  { href: "/analysis-jobs", key: "analysisJobs" as const, icon: BarChart3 },
  { href: "/settings", key: "settings" as const, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  const content = (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">Lumen</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">Influencer Marketplace</div>
        <div className="mt-1 text-xs text-slate-500">Brand console · Phase 2</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-teal-50 text-teal-900"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-slate-200 p-4 text-xs text-slate-500">
        <Link href="/creator" className="block font-medium text-sky-700 hover:underline">
          Open creator portal →
        </Link>
        Demo mode · mock data
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">Lumen</div>
          <div className="text-sm font-semibold text-slate-900">Marketplace</div>
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-lg border border-slate-300 p-2 text-slate-700"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            {content}
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>
    </>
  );
}
