"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Invitation } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

export default function InvitationsPage() {
  const [invites, setInvites] = useState<Invitation[]>([]);

  useEffect(() => {
    setInvites(marketplace.listInvitations());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invitations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Demo outreach records. Creator portal responses come in a later phase.
        </p>
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invites.map((inv) => {
              const inf = marketplace.getInfluencer(inv.influencerId);
              const camp = marketplace.getCampaign(inv.campaignId);
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
