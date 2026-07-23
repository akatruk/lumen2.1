"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, Product, VideoSnapshot } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Field";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import { useToast } from "@/components/Toast";
import {
  LANGUAGE_LABELS,
  PLATFORM_LABELS,
  formatDate,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

const MATCH_LABELS: Record<string, string> = {
  topicRelevance: "Topic relevance",
  audienceGeography: "Audience and geography",
  language: "Language",
  contentStyle: "Content style",
  engagementQuality: "Engagement quality",
  postingConsistency: "Posting consistency",
  brandSafety: "Brand safety",
  commercialFit: "Commercial fit",
};

export default function InfluencerDetailPage() {
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [inf, setInf] = useState<Influencer | null>(null);
  const [videos, setVideos] = useState<VideoSnapshot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");
  const [campaignId, setCampaignId] = useState("");

  useEffect(() => {
    const found = marketplace.getInfluencer(params.id);
    setInf(found ?? null);
    setNotes(found?.notes ?? "");
    setVideos(marketplace.getVideosForInfluencer(params.id));
    setProducts(marketplace.listProducts());
    const camps = marketplace.listCampaigns();
    setCampaignId(camps[0]?.id ?? "");
  }, [params.id]);

  if (!inf) {
    return <div className="text-sm text-slate-500">Influencer not found.</div>;
  }

  const suitable = products.filter((p) => inf.suitableProductIds.includes(p.id));
  const campaigns = marketplace.listCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: inf.avatarColor }}
          >
            {inf.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{inf.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {inf.city}, {inf.country} · {inf.bio}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={inf.verificationStatus}>{inf.verificationStatus}</Badge>
              <Badge tone={inf.brandSafety.status}>Safety: {inf.brandSafety.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <MatchScore score={inf.matchScore} size="lg" />
          <AddToShortlistButton influencer={inf} />
          <div className="flex flex-wrap items-center gap-2">
            <Select className="w-48" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (!campaignId) return;
                marketplace.createInvitation({
                  influencerId: inf.id,
                  campaignId,
                  message: `Collaboration invite for ${marketplace.getCampaign(campaignId)?.name ?? "campaign"}`,
                });
                push(`Invitation sent to ${inf.name}`);
              }}
            >
              Invite to campaign
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Profile overview" />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 text-sm">
            <div>
              <div className="text-xs text-slate-500">Languages</div>
              <div className="mt-1">{inf.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Topics</div>
              <div className="mt-1 capitalize">{inf.topics.join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Content style</div>
              <div className="mt-1">{inf.contentStyle.join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Posting frequency</div>
              <div className="mt-1">{inf.postingFrequency}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Followers</div>
              <div className="mt-1 tabular-nums">{formatNumber(inf.followers)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Avg views / engagement</div>
              <div className="mt-1 tabular-nums">
                {formatNumber(inf.avgViews)} · {formatPercent(inf.engagementRate)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Social accounts" />
          <div className="space-y-3 px-5 py-4">
            {inf.platforms.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
              >
                <div className="text-sm font-medium text-slate-900">
                  {PLATFORM_LABELS[p.platform]} · {p.handle}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {formatNumber(p.followers)} followers · {formatNumber(p.avgViews)} avg views ·{" "}
                  {formatPercent(p.engagementRate)} ER
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Match score explanation"
          subtitle={`Overall ${inf.match?.overall ?? inf.matchScore} · confidence ${Math.round((inf.match?.confidence ?? 0.8) * 100)}%`}
        />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {inf.match
            ? Object.entries(inf.match.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{MATCH_LABELS[key] ?? key}</span>
                    <span className="font-medium tabular-nums text-slate-900">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))
            : null}
        </div>
        <ul className="space-y-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-700">
          {(inf.match?.reasons ?? []).map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-teal-700">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Brand-safety signals" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <Badge tone={inf.brandSafety.status}>{inf.brandSafety.status}</Badge>
            <p className="text-slate-700">{inf.brandSafety.notes}</p>
            {inf.brandSafety.flags.length ? (
              <div className="flex flex-wrap gap-2">
                {inf.brandSafety.flags.map((f) => (
                  <Badge key={f} tone="review">{f}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No flags.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Suitable products" />
          <div className="divide-y divide-slate-100">
            {suitable.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                <span className="text-xl">{p.imageEmoji}</span>
                <div>
                  <div className="text-sm font-medium text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.brand} · {p.category}</div>
                </div>
              </Link>
            ))}
            {!suitable.length ? <div className="px-5 py-4 text-sm text-slate-500">No linked products.</div> : null}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent videos & analysis" />
        <div className="divide-y divide-slate-100">
          {videos.map((v) => (
            <div key={v.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900">{v.title}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {PLATFORM_LABELS[v.platform]} · {formatDate(v.publishedAt)} · {formatNumber(v.views)} views
                  </div>
                </div>
                {v.analysis ? <Badge tone={v.analysis.brandSafety.status}>{v.analysis.language.toUpperCase()}</Badge> : null}
              </div>
              {v.analysis ? (
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p><span className="font-medium">Transcript:</span> {v.analysis.transcript}</p>
                  <p>
                    <span className="font-medium">Topics:</span>{" "}
                    {v.analysis.topics.map((t) => `${t.name} (${Math.round(t.confidence * 100)}%)`).join(", ")}
                  </p>
                  <p>
                    <span className="font-medium">Style:</span>{" "}
                    {v.analysis.style.formats.join(", ")} · {v.analysis.style.tone.join(", ")}
                  </p>
                  <p><span className="font-medium">Entities:</span> {v.analysis.entities.join(", ")}</p>
                </div>
              ) : null}
            </div>
          ))}
          {!videos.length ? <div className="px-5 py-4 text-sm text-slate-500">No videos in demo set for this creator.</div> : null}
        </div>
      </Card>

      <Card>
        <CardHeader title="Team notes" />
        <div className="space-y-3 px-5 py-4">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button
            size="sm"
            onClick={() => {
              marketplace.updateInfluencerNotes(inf.id, notes);
            }}
          >
            Save notes
          </Button>
        </div>
      </Card>
    </div>
  );
}
