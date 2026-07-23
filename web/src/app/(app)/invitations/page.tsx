"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { Invitation } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { formatDateTime } from "@/lib/utils";

export default function InvitationsPage() {
  const { push } = useToast();
  const [invites, setInvites] = useState<Invitation[]>([]);

  const refresh = () => setInvites(marketplace.listInvitations());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invitations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Brand outreach records. Creators respond in the creator portal.
          </p>
        </div>
        <Link href="/creator/invitations">
          <Button size="sm" variant="secondary">Open creator portal</Button>
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Influencer</th>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Sent</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invites.map((inv) => {
              const inf = marketplace.getInfluencer(inv.influencerId);
              const camp = marketplace.getCampaign(inv.campaignId);
              const hasBrief = collaboration
                .listBriefs({ influencerId: inv.influencerId })
                .some((b) => b.invitationId === inv.id);
              return (
                <tr key={inv.id}>
                  <td className="px-5 py-3">
                    <Link href={`/influencers/${inv.influencerId}`} className="font-medium text-teal-800 hover:underline">
                      {inf?.name ?? inv.influencerId}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/campaigns/${inv.campaignId}`} className="text-slate-700 hover:underline">
                      {camp?.name ?? inv.campaignId}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      tone={
                        inv.status === "Accepted"
                          ? "Active"
                          : inv.status === "Declined"
                            ? "Failed"
                            : inv.status === "Expired"
                              ? "Draft"
                              : "Reviewing"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="max-w-sm px-5 py-3 text-slate-600">{inv.message}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(inv.createdAt)}</td>
                  <td className="px-5 py-3">
                    {inv.status === "Accepted" && !hasBrief ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          collaboration.createBrief({
                            campaignId: inv.campaignId,
                            invitationId: inv.id,
                            influencerId: inv.influencerId,
                            title: `${camp?.name ?? "Campaign"} brief`,
                            deliverables: camp?.materials?.length
                              ? camp.materials
                              : ["1 short video", "Caption with CTA"],
                            messaging: camp?.objective ?? "Follow campaign objective",
                            restrictions: ["Follow brand claim guidelines"],
                            deadline: camp?.endDate ?? "2026-08-31",
                            approvalRules: "Draft must be approved before publishing.",
                          });
                          push("Brief issued to creator");
                          refresh();
                        }}
                      >
                        Issue brief
                      </Button>
                    ) : hasBrief ? (
                      <span className="text-xs text-emerald-700">Brief issued</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
