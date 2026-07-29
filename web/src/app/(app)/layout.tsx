"use client";

import { BrandShell } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BrandShell>{children}</BrandShell>
    </ToastProvider>
  );
}
