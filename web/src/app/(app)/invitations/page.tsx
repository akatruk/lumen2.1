"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { Invitation, InvitationStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { formatDateTime } from "@/lib/utils";
import { fill, useI18n } from "@/lib/i18n";

function statusLabel(status: InvitationStatus, t: ReturnType<typeof useI18n>["t"]): string {
  const map: Record<InvitationStatus, string> = {
    Pending: t.invitations.statusPending,
    Accepted: t.invitations.statusAccepted,
    Declined: t.invitations.statusDeclined,
    Expired: t.invitations.statusExpired,
  };
  return map[status] ?? status;
}

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
          <Button size="sm" variant="secondary">
            {t.invitations.openPortal}
          </Button>
        </Link>
      </div>

      {!invites.length ? (
        <Card className="px-5 py-8 text-center text-sm text-muted-foreground">{t.invitations.empty}</Card>
      ) : null}

      <div className="space-y-4">
        {invites.map((inv) => {
          const inf = marketplace.getInfluencer(inv.influencerId);
          const camp = marketplace.getCampaign(inv.campaignId);
          const hasBrief = collaboration
            .listBriefs({ influencerId: inv.influencerId })
            .some((b) => b.invitationId === inv.id);
          return (
            <Card key={inv.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/influencers/${inv.influencerId}`}
                    className="text-base font-semibold text-primary hover:underline"
                  >
                    {inf?.name ?? inv.influencerId}
                  </Link>
                  <div className="mt-1 text-sm text-muted-foreground">
                    <Link href={`/campaigns/${inv.campaignId}`} className="hover:underline">
                      {camp?.name ?? inv.campaignId}
                    </Link>
                  </div>
                </div>
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
                  {statusLabel(inv.status, t)}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                  {t.invitations.thread}
                </div>

                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-primary">{t.invitations.youBrand}</span>
                    <span>
                      {t.invitations.sent} · {formatDateTime(inv.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{inv.message}</p>
                </div>

                <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {t.invitations.creator}
                      {inf?.name ? ` · ${inf.name}` : ""}
                    </span>
                    <span>
                      {inv.respondedAt
                        ? `${t.invitations.received} · ${formatDateTime(inv.respondedAt)}`
                        : t.invitations.awaiting}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {inv.responseMessage ?? t.invitations.awaiting}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
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
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
