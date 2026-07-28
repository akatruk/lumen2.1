"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { influencerIdsMatch, marketplace } from "@/services/marketplace";
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
    setInvites(marketplace.listInvitations().filter((i) => influencerIdsMatch(i.influencerId, id)));
  };

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => refresh());
  }, []);

  function briefPayload(inv: Invitation) {
    const camp = marketplace.getCampaign(inv.campaignId);
    return {
      title: `${camp?.name ?? "Campaign"} brief`,
      deliverables: camp?.materials?.length ? camp.materials : ["1 short video", "Caption with CTA"],
      messaging: camp?.objective ?? "Follow campaign objective",
      restrictions: ["Follow brand claim guidelines"],
      deadline: camp?.endDate ?? "2026-08-31",
      approvalRules: "Draft must be approved before publishing.",
    };
  }

  async function accept(inv: Invitation) {
    const existing = collaboration
      .listBriefs({ influencerId: inv.influencerId })
      .find((b) => b.invitationId === inv.id);
    const payload = existing ? undefined : briefPayload(inv);
    try {
      await marketplace.respondInvitationAsync(inv.id, "Accepted", payload);
      // If no brand session, async fell back to local respond only — ensure brief exists
      if (!existing && !collaboration.listBriefs({ influencerId: inv.influencerId }).some((b) => b.invitationId === inv.id)) {
        collaboration.createBrief({
          campaignId: inv.campaignId,
          invitationId: inv.id,
          influencerId: inv.influencerId,
          ...briefPayload(inv),
        });
      }
      push("Invitation accepted — brief available");
      refresh();
    } catch (e) {
      push(e instanceof Error ? e.message : "Accept failed", "err");
    }
  }

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
                  <Button size="sm" onClick={() => void accept(inv)}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void marketplace
                        .respondInvitationAsync(inv.id, "Declined")
                        .then(() => {
                          push("Invitation declined");
                          refresh();
                        })
                        .catch((e) => push(e instanceof Error ? e.message : "Decline failed", "err"));
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
