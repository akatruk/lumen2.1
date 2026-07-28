"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import { useCreatorSessionId } from "@/hooks/useCreatorSession";
import type { CampaignBrief, Submission } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";

export default function CreatorSubmissionsPage() {
  const { push } = useToast();
  const influencerId = useCreatorSessionId();
  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);
  const [briefId, setBriefId] = useState("");
  const [draftUrl, setDraftUrl] = useState("https://example.com/demo-drafts/v2.mp4");
  const [reviewLink, setReviewLink] = useState("https://example.com/reviews/private-v2");
  const [caption, setCaption] = useState("");
  const [pubUrl, setPubUrl] = useState("");

  const refresh = () => {
    const b = collaboration.listBriefs({ influencerId });
    setBriefs(b);
    setBriefId((prev) => (b.some((x) => x.id === prev) ? prev : b[0]?.id || ""));
    setSubs(collaboration.listSubmissions({ influencerId }));
  };

  useEffect(() => {
    refresh();
  }, [influencerId]);

  const selected = briefs.find((b) => b.id === briefId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Upload draft / private review link, then publish after approval.</p>
      </div>

      <Card>
        <CardHeader title="Submit or update draft" />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <Field label="Brief">
            <Select value={briefId} onChange={(e) => setBriefId(e.target.value)}>
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Caption"><Input value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
          <Field label="Draft URL"><Input value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} /></Field>
          <Field label="Private review link"><Input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} /></Field>
        </div>
        <div className="border-t border-border/40 px-5 py-4">
          <Button
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              collaboration.upsertSubmission({
                campaignId: selected.campaignId,
                invitationId: selected.invitationId,
                influencerId: selected.influencerId,
                briefId: selected.id,
                draftUrl,
                privateReviewLink: reviewLink,
                caption,
              });
              push("Draft submitted for brand review");
              refresh();
            }}
          >
            Submit draft
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {subs.map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">{marketplace.getCampaign(s.campaignId)?.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Draft: {s.draftUrl || "—"} · Review: {s.privateReviewLink || "—"}
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
            {s.status === "Approved" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Input
                  className="max-w-md"
                  placeholder="Publication URL"
                  value={pubUrl}
                  onChange={(e) => setPubUrl(e.target.value)}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    try {
                      collaboration.publishSubmission(
                        s.id,
                        pubUrl || "https://tiktok.com/@demo/video/published",
                      );
                      push("Publication recorded");
                      setPubUrl("");
                      refresh();
                    } catch (e) {
                      push(e instanceof Error ? e.message : "Publish failed", "err");
                    }
                  }}
                >
                  Record publication
                </Button>
              </div>
            ) : null}
            {s.publicationUrl ? (
              <div className="mt-3 text-sm text-emerald-500">Published: {s.publicationUrl}</div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
