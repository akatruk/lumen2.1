"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <button
        disabled
        className="relative flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full border border-border bg-transparent text-muted-foreground opacity-50"
      >
        <Sun className="h-4 w-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      className={cn(
        "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border transition-all duration-300",
        "hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary",
        isDark
          ? "border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:border-slate-600/50"
          : "border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 hover:border-blue-300/50",
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      type="button"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark
            ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20 opacity-100"
            : "bg-gradient-to-br from-blue-400/20 to-cyan-400/20 opacity-100",
        )}
      />
      <div className="relative z-10 flex items-center justify-center">
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-blue-600",
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            isDark ? "rotate-0 scale-100 opacity-100 text-blue-300" : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </div>
    </button>
  );
}
