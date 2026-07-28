import { cn } from "@/lib/utils";
import type { PropsWithChildren, ReactNode } from "react";

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg glass-container transition-all duration-300 hover:border-primary/30",
        className,
      )}
    >
      <div className="absolute top-0 left-0 z-10 h-1.5 w-1.5 border-t border-l border-primary/20" />
      <div className="absolute top-0 right-0 z-10 h-1.5 w-1.5 border-t border-r border-primary/20" />
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  monoLabel,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  monoLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 px-5 py-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {monoLabel ? (
            <span className="select-none rounded border border-primary/10 bg-primary/5 px-1 py-0.5 font-mono text-[10px] text-primary">
              [{monoLabel}]
            </span>
          ) : null}
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 font-mono text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
