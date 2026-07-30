"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Mode = "live" | "demo" | "loading";

function detectPublicLive(): boolean {
  return (
    (process.env.NEXT_PUBLIC_DISCOVERY_MODE ?? "").toLowerCase() === "live" ||
    (process.env.NEXT_PUBLIC_PRODUCT_SCAN_MODE ?? "").toLowerCase() === "live"
  );
}

/** Sidebar honesty badge — must not say Demo when stack is live-capable. */
export function ModeBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<Mode>(() => (detectPublicLive() ? "live" : "loading"));

  useEffect(() => {
    if (detectPublicLive()) {
      setMode("live");
      return;
    }
    let cancelled = false;
    fetch("/api/health")
      .then((r) => r.json())
      .then((h: { mode?: string }) => {
        if (cancelled) return;
        setMode(h.mode === "live-capable" ? "live" : "demo");
      })
      .catch(() => {
        if (!cancelled) setMode("demo");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === "loading") {
    return <span className={cn("font-mono text-[10px] text-muted-foreground/60", className)}>…</span>;
  }

  if (mode === "live") {
    return (
      <span className={cn("font-mono text-[10px] text-emerald-500", className)} title={t.mode.liveTitle}>
        {t.mode.live}
      </span>
    );
  }

  return (
    <span className={cn("font-mono text-[10px] text-muted-foreground", className)}>{t.mode.demo}</span>
  );
}
