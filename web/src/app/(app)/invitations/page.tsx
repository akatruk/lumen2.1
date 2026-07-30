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
import { fill, useI18n } from "@/lib/i18n";

export default function InvitationsPage() {
  const { t } = useI18n();
  const { push } = useToast();
  const [invites, setInvites] = useState<Invitation[]>([]);

  const refresh = () => setInvites(marketplace.listInvitations());

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => refresh());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.invitations.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.invitations.subtitle}</p>
        </div>
        <Link href="/creator/invitations">
          <Button size="sm" variant="secondary">{t.invitations.openPortal}</Button>
        </Link>
      </div>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">{t.invitations.colInfluencer}</th>
              <th className="px-5 py-3">{t.invitations.colCampaign}</th>
              <th className="px-5 py-3">{t.invitations.colStatus}</th>
              <th className="px-5 py-3">{t.invitations.colMessage}</th>
              <th className="px-5 py-3">{t.invitations.colSent}</th>
              <th className="px-5 py-3">{t.invitations.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {invites.map((inv) => {
              const inf = marketplace.getInfluencer(inv.influencerId);
              const camp = marketplace.getCampaign(inv.campaignId);
              const hasBrief = collaboration
                .listBriefs({ influencerId: inv.influencerId })
                .some((b) => b.invitationId === inv.id);
              return (
                <tr key={inv.id}>
                  <td className="px-5 py-3">
                    <Link href={`/influencers/${inv.influencerId}`} className="font-medium text-primary hover:underline">
                      {inf?.name ?? inv.influencerId}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/campaigns/${inv.campaignId}`} className="text-foreground hover:underline">
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
                  <td className="max-w-sm px-5 py-3 text-muted-foreground">{inv.message}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDateTime(inv.createdAt)}</td>
                  <td className="px-5 py-3">
                    {inv.status === "Accepted" && !hasBrief ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          void collaboration
                            .createBriefAsync({
                              campaignId: inv.campaignId,
                              invitationId: inv.id,
                              influencerId: inv.influencerId,
                              title: fill(t.invitations.briefTitle, {
                                campaign: camp?.name ?? t.nav.campaigns,
                              }),
                              deliverables: camp?.materials?.length
                                ? camp.materials
                                : [t.invitations.deliverable, t.invitations.captionCta],
                              messaging: camp?.objective ?? t.invitations.followObjective,
                              restrictions: [t.invitations.followClaims],
                              deadline: camp?.endDate ?? "2026-08-31",
                              approvalRules: t.invitations.draftApproval,
                            })
                            .then(() => {
                              push(t.invitations.toastBriefIssued);
                              refresh();
                            });
                        }}
                      >
                        {t.invitations.issueBrief}
                      </Button>
                    ) : hasBrief ? (
                      <span className="text-xs text-emerald-500">{t.invitations.briefIssued}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t.common.emDash}</span>
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
