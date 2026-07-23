import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumen Influencer Marketplace",
  description: "Thailand-focused influencer discovery and campaign shortlisting MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sourceSans.variable} h-full`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900 antialiased">
        <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
