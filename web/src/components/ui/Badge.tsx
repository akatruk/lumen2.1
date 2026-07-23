import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Active: "bg-emerald-50 text-emerald-700",
  Reviewing: "bg-amber-50 text-amber-800",
  Completed: "bg-sky-50 text-sky-800",
  Queued: "bg-slate-100 text-slate-700",
  Processing: "bg-amber-50 text-amber-800",
  Failed: "bg-red-50 text-red-700",
  verified: "bg-emerald-50 text-emerald-700",
  unverified: "bg-slate-100 text-slate-600",
  pending: "bg-amber-50 text-amber-800",
  safe: "bg-emerald-50 text-emerald-700",
  review: "bg-amber-50 text-amber-800",
  risk: "bg-red-50 text-red-700",
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
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        toneMap[tone ?? ""] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MatchScore({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color =
    score >= 85 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    score >= 70 ? "text-teal-700 bg-teal-50 border-teal-200" :
    "text-amber-800 bg-amber-50 border-amber-200";
  const sizeCls = size === "lg" ? "text-2xl px-4 py-2" : size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={cn("inline-flex items-center rounded-lg border font-semibold tabular-nums", color, sizeCls)}>
      {score}
    </span>
  );
}
