"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/lib/i18n";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <div className="min-h-screen lg:flex">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </I18nProvider>
  );
}
