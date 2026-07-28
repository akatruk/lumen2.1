"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <div className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
            <div className="absolute inset-0 grid-pattern opacity-[0.4] dark:opacity-[0.25]" />
            <div className="absolute inset-0 bg-noise opacity-[0.02]" />
            <div className="ambient-glow -top-40 -left-40 bg-primary/8 dark:bg-primary/12" />
            <div className="ambient-glow -right-40 -bottom-60 bg-blue-500/8 dark:bg-indigo-500/8" />
          </div>
          <Sidebar />
          <main className="relative z-10 min-w-0 flex-1 overflow-y-auto">
            <div className="relative mx-auto w-full max-w-7xl animate-fade-scale-in p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}
