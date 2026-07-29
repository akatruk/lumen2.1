"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Creator entry for Douyin marketplace.
 * Intl TikTok OAuth removed — Act-as is the creator identity path until Douyin Open Platform exists.
 */
export default function CreatorLoginPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Creator portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Douyin creators use <span className="text-foreground">Act-as</span> in the portal —
          pick a discovered Douyin profile, then open invitations and briefs.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <CardHeader
          title="Act-as Douyin creator"
          monoLabel="01"
          subtitle="No intl TikTok login · Douyin Open Platform OAuth not wired yet"
        />
        <Link href="/creator">
          <Button className="w-full">Open creator portal</Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          Prefer TikHub-discovered Douyin creators in the Act-as list (tagged TikHub). Seed profiles
          remain for demo fallback.
        </p>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Brand accounts use{" "}
        <Link href="/login" className="text-primary hover:underline">
          Brand login
        </Link>
        .
      </p>
    </div>
  );
}
