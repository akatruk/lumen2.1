"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { PerformanceSnapshot, Submission } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";
import { formatNumber } from "@/lib/utils";

export default function ReviewsPage() {
  const { push } = useToast();
  const [subs, setSubs] = useState<Submission[]>([]);
  const [perf, setPerf] = useState<PerformanceSnapshot[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<Record<string, string>>({});

  const refresh = () => {
    setSubs(collaboration.listSubmissions());
    setPerf(collaboration.listPerformance());
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve drafts, request changes, and track publication performance.
        </p>
      </div>

      <div className="space-y-3">
        {subs.map((s) => {
          const inf = marketplace.getInfluencer(s.influencerId);
          const camp = marketplace.getCampaign(s.campaignId);
          return (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-foreground">
                    {inf?.name} · {camp?.name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Draft: {s.draftUrl || "—"} · Review link: {s.privateReviewLink || "—"}
                  </div>
                </div>
                <Badge
                  tone={
                    s.status === "Approved" || s.status === "Published"
                      ? "Active"
                      : s.status === "ChangesRequested"
                        ? "Failed"
                        : "Reviewing"
                  }
                >
                  {s.status}
                </Badge>
              </div>
              {s.caption ? <p className="mt-2 text-sm text-foreground">{s.caption}</p> : null}
              <div className="mt-3 space-y-2">
                {s.feedback.map((f) => (
                  <div key={f.id} className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium capitalize">{f.authorRole}</span>: {f.message}
                  </div>
                ))}
              </div>
              {(s.status === "Submitted" || s.status === "ChangesRequested") && (
                <div className="mt-4 space-y-3">
                  <Field label="Feedback">
                    <Textarea
                      value={notes[s.id] ?? ""}
                      onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                      placeholder="Optional review note"
                    />
                  </Field>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        collaboration.brandReview(
                          s.id,
                          "approve",
                          notes[s.id] || "Approved — ready to publish.",
                        );
                        push("Submission approved");
                        refresh();
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        collaboration.brandReview(
                          s.id,
                          "request_changes",
                          notes[s.id] || "Please revise messaging and resubmit.",
                        );
                        push("Changes requested");
                        refresh();
                      }}
                    >
                      Request changes
                    </Button>
                  </div>
                </div>
              )}
              {s.publicationUrl ? (
                <div className="mt-3 text-sm text-emerald-500">Published: {s.publicationUrl}</div>
              ) : null}
            </Card>
          );
        })}
        {!subs.length ? <p className="text-sm text-muted-foreground">No submissions yet.</p> : null}
      </div>

      <Card>
        <CardHeader title="Performance snapshots" />
        <div className="divide-y divide-border/40">
          {perf.map((p) => (
            <div key={p.id} className="space-y-3 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">
                    {marketplace.getInfluencer(p.influencerId)?.name} ·{" "}
                    {marketplace.getCampaign(p.campaignId)?.name}
                  </div>
                  <a href={p.publicationUrl} className="text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
                    {p.publicationUrl}
                  </a>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatNumber(p.views)} views · {formatNumber(p.likes)} likes · {formatNumber(p.comments)} comments
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Input
                  className="w-40"
                  placeholder="views,likes,comments"
                  value={metrics[p.id] ?? ""}
                  onChange={(e) => setMetrics({ ...metrics, [p.id]: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const [views, likes, comments] = (metrics[p.id] || "0,0,0")
                      .split(",")
                      .map((n) => Number(n.trim()) || 0);
                    collaboration.updatePerformance(p.id, { views, likes, comments });
                    push("Performance updated");
                    refresh();
                  }}
                >
                  Update metrics
                </Button>
              </div>
            </div>
          ))}
          {!perf.length ? <div className="px-5 py-4 text-sm text-muted-foreground">No publications recorded.</div> : null}
        </div>
      </Card>
    </div>
  );
}
