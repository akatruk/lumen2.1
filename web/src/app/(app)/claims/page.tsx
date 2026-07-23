"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { ProfileClaim } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { formatDateTime } from "@/lib/utils";

export default function ClaimsPage() {
  const { push } = useToast();
  const [claims, setClaims] = useState<ProfileClaim[]>([]);

  const refresh = () => setClaims(collaboration.listClaims());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile claims</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify creator ownership requests before collaboration expands.
        </p>
      </div>
      <div className="space-y-3">
        {claims.map((c) => {
          const inf = marketplace.getInfluencer(c.influencerId);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-900">
                    {inf?.name ?? c.influencerId} · {c.claimantName}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{c.claimantEmail}</div>
                  <div className="mt-2 text-sm text-slate-700">{c.proofNote}</div>
                  <div className="mt-2 text-xs text-slate-500">{formatDateTime(c.createdAt)}</div>
                </div>
                <Badge tone={c.status === "Verified" ? "Active" : c.status === "Rejected" ? "Failed" : "Reviewing"}>
                  {c.status}
                </Badge>
              </div>
              {c.status === "PendingReview" ? (
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      collaboration.reviewClaim(c.id, "Verified", "Identity accepted for demo.");
                      push("Claim verified");
                      refresh();
                    }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      collaboration.reviewClaim(c.id, "Rejected", "Insufficient proof.");
                      push("Claim rejected");
                      refresh();
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
