"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { Invitation } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { formatDateTime } from "@/lib/utils";

export default function CreatorInvitationsPage() {
  const { push } = useToast();
  const [invites, setInvites] = useState<Invitation[]>([]);

  const refresh = () => {
    const id = collaboration.getCreatorSession()?.influencerId ?? "inf-1";
    setInvites(marketplace.listInvitations().filter((i) => i.influencerId === id));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invitations</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accept or decline campaign outreach.</p>
      </div>
      <div className="space-y-3">
        {invites.map((inv) => {
          const camp = marketplace.getCampaign(inv.campaignId);
          return (
            <Card key={inv.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">{camp?.name ?? inv.campaignId}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{inv.message}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDateTime(inv.createdAt)}</div>
                </div>
                <Badge tone={inv.status === "Accepted" ? "Active" : inv.status === "Declined" ? "Failed" : "Reviewing"}>
                  {inv.status}
                </Badge>
              </div>
              {inv.status === "Pending" ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      marketplace.respondInvitation(inv.id, "Accepted");
                      const existing = collaboration
                        .listBriefs({ influencerId: inv.influencerId })
                        .find((b) => b.invitationId === inv.id);
                      if (!existing) {
                        collaboration.createBrief({
                          campaignId: inv.campaignId,
                          invitationId: inv.id,
                          influencerId: inv.influencerId,
                          title: `${camp?.name ?? "Campaign"} brief`,
                          deliverables: camp?.materials?.length ? camp.materials : ["1 short video", "Caption with CTA"],
                          messaging: camp?.objective ?? "Follow campaign objective",
                          restrictions: ["Follow brand claim guidelines"],
                          deadline: camp?.endDate ?? "2026-08-31",
                          approvalRules: "Draft must be approved before publishing.",
                        });
                      }
                      push("Invitation accepted — brief available");
                      refresh();
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      marketplace.respondInvitation(inv.id, "Declined");
                      push("Invitation declined");
                      refresh();
                    }}
                  >
                    Decline
                  </Button>
                </div>
              ) : null}
            </Card>
          );
        })}
        {!invites.length ? <p className="text-sm text-muted-foreground">No invitations for this creator.</p> : null}
      </div>
    </div>
  );
}
