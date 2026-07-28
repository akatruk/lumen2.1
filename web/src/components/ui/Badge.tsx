import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Reviewing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Queued: "bg-muted text-muted-foreground border-border",
  Processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  unverified: "bg-muted text-muted-foreground border-border",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  safe: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  review: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  risk: "bg-destructive/10 text-destructive border-destructive/20",
};

export function Badge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        toneMap[tone ?? ""] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color =
    score >= 85
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : score >= 70
        ? "text-primary bg-primary/10 border-primary/20"
        : "text-amber-500 bg-amber-500/10 border-amber-500/20";
  const sizeCls =
    size === "lg" ? "text-2xl px-4 py-2" : size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-mono font-semibold tabular-nums",
        color,
        sizeCls,
      )}
    >
      {score}
    </span>
  );
}
