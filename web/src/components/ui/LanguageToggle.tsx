"use client";

import { cn } from "@/lib/utils";
import { useI18n, type UiLocale } from "@/lib/i18n";

const OPTIONS: { value: UiLocale; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "EN" },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.lang.switch}
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-transparent p-0.5",
        className,
      )}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setLocale(opt.value)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide transition-all duration-200",
              "focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
              active
                ? "bg-primary/15 text-primary shadow-[0_0_10px_rgba(59,130,246,0.08)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
