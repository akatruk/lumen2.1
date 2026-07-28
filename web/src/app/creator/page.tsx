"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { CampaignBrief, Invitation, Submission } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function CreatorHomePage() {
  const [influencerId, setInfluencerId] = useState("inf-1");
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    const id = collaboration.getCreatorSession()?.influencerId ?? "inf-1";
    setInfluencerId(id);
    setInvites(marketplace.listInvitations().filter((i) => i.influencerId === id));
    setBriefs(collaboration.listBriefs({ influencerId: id }));
    setSubs(collaboration.listSubmissions({ influencerId: id }));
  }, []);

  const me = marketplace.getInfluencer(influencerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Creator home</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {me?.name} · manage invitations, briefs, drafts, and publication.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="px-5 py-4">
          <div className="text-xs uppercase text-muted-foreground">Invitations</div>
          <div className="mt-2 text-3xl font-semibold">{invites.length}</div>
        </Card>
        <Card className="px-5 py-4">
          <div className="text-xs uppercase text-muted-foreground">Briefs</div>
          <div className="mt-2 text-3xl font-semibold">{briefs.length}</div>
        </Card>
        <Card className="px-5 py-4">
          <div className="text-xs uppercase text-muted-foreground">Submissions</div>
          <div className="mt-2 text-3xl font-semibold">{subs.length}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Next actions" />
        <div className="flex flex-wrap gap-2 px-5 py-4">
          <Link href="/creator/invitations"><Button size="sm">Review invitations</Button></Link>
          <Link href="/creator/briefs"><Button size="sm" variant="secondary">Open briefs</Button></Link>
          <Link href="/creator/submissions"><Button size="sm" variant="secondary">Submit draft</Button></Link>
          <Link href="/creator/claim"><Button size="sm" variant="ghost">Claim profile</Button></Link>
        </div>
      </Card>

      <Card>
        <CardHeader title="Your open work" />
        <div className="divide-y divide-border/40">
          {invites.filter((i) => i.status === "Pending").map((i) => (
            <div key={i.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>Pending invite · {marketplace.getCampaign(i.campaignId)?.name}</span>
              <Badge tone="Reviewing">Pending</Badge>
            </div>
          ))}
          {subs.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span>Submission · {marketplace.getCampaign(s.campaignId)?.name}</span>
              <Badge tone={s.status === "Approved" ? "Active" : s.status === "Published" ? "Completed" : "Reviewing"}>
                {s.status}
              </Badge>
            </div>
          ))}
          {!invites.some((i) => i.status === "Pending") && !subs.length ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">No open items.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
