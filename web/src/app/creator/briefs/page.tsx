"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { CampaignBrief } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { formatDate } from "@/lib/utils";

export default function CreatorBriefsPage() {
  const { push } = useToast();
  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);

  const refresh = () => {
    const id = collaboration.getCreatorSession()?.influencerId ?? "inf-1";
    setBriefs(collaboration.listBriefs({ influencerId: id }));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <p className="mt-1 text-sm text-slate-500">Campaign deliverables, messaging, and deadlines.</p>
      </div>
      <div className="space-y-3">
        {briefs.map((b) => (
          <Card key={b.id} className="space-y-3 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">{b.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {marketplace.getCampaign(b.campaignId)?.name} · deadline {formatDate(b.deadline)}
                </div>
              </div>
              <Badge tone={b.status === "Acknowledged" ? "Active" : "Reviewing"}>{b.status}</Badge>
            </div>
            <p className="text-sm text-slate-700">{b.messaging}</p>
            <div className="text-sm">
              <div className="font-medium text-slate-800">Deliverables</div>
              <ul className="mt-1 list-disc pl-5 text-slate-600">
                {b.deliverables.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">Restrictions:</span> {b.restrictions.join(" · ")}
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">Approval:</span> {b.approvalRules}
            </div>
            {b.status !== "Acknowledged" ? (
              <Button
                size="sm"
                onClick={() => {
                  collaboration.acknowledgeBrief(b.id);
                  push("Brief acknowledged");
                  refresh();
                }}
              >
                Acknowledge brief
              </Button>
            ) : null}
          </Card>
        ))}
        {!briefs.length ? <p className="text-sm text-slate-500">No briefs yet. Accept an invitation first.</p> : null}
      </div>
    </div>
  );
}
