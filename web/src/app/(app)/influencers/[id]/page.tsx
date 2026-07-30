"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, Platform, Product, VerificationStatus, VideoSnapshot } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea, Select } from "@/components/ui/Field";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import { useToast } from "@/components/Toast";
import { fill, useI18n } from "@/lib/i18n";
import {
  LANGUAGE_LABELS,
  formatDate,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

function verificationLabel(status: VerificationStatus, t: ReturnType<typeof useI18n>["t"]): string {
  const map: Partial<Record<VerificationStatus, string>> = {
    verified: t.common.statusVerified,
    pending: t.common.statusPendingReview,
  };
  return map[status] ?? status;
}

function platformLabel(platform: Platform, t: ReturnType<typeof useI18n>["t"]): string {
  const map: Record<Platform, string> = {
    douyin: t.common.douyin,
    tiktok: t.common.tiktok,
    instagram: t.common.instagram,
    youtube: t.common.youtube,
  };
  return map[platform] ?? platform;
}

export default function InfluencerDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const { push } = useToast();
  const [inf, setInf] = useState<Influencer | null>(null);
  const [videos, setVideos] = useState<VideoSnapshot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notes, setNotes] = useState("");
  const [campaignId, setCampaignId] = useState("");

  const matchLabels = useMemo(
    () => ({
      topicRelevance: t.influencers.topicRelevance,
      audienceGeography: t.influencers.audienceGeography,
      language: t.influencers.language,
      contentStyle: t.influencers.contentStyle,
      engagementQuality: t.influencers.engagementQuality,
      postingConsistency: t.influencers.postingConsistency,
      brandSafety: t.influencers.brandSafety,
      commercialFit: t.influencers.commercialFit,
    }),
    [t],
  );

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
    return <div className="text-sm text-muted-foreground">{t.influencers.notFound}</div>;
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
            <h1 className="text-2xl font-semibold text-foreground">{inf.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {inf.city}, {inf.country} · {inf.bio}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={inf.verificationStatus}>
                {verificationLabel(inf.verificationStatus, t)}
              </Badge>
              <Badge tone={inf.brandSafety.status}>
                {fill(t.influencers.safety, { status: inf.brandSafety.status })}
              </Badge>
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
                void marketplace
                  .createInvitationAsync({
                    influencerId: inf.id,
                    campaignId,
                    message: fill(t.influencers.inviteMessage, {
                      campaign: marketplace.getCampaign(campaignId)?.name ?? "campaign",
                    }),
                  })
                  .then(() => push(fill(t.influencers.toastInviteSent, { name: inf.name })))
                  .catch((e) => push(e instanceof Error ? e.message : t.influencers.toastInviteFailed, "err"));
              }}
            >
              {t.influencers.invite}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t.influencers.overview} />
          <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.languagesLabel}</div>
              <div className="mt-1">{inf.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.topicsLabel}</div>
              <div className="mt-1 capitalize">{inf.topics.join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.contentStyle}</div>
              <div className="mt-1">{inf.contentStyle.join(", ")}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.postingFrequency}</div>
              <div className="mt-1">{inf.postingFrequency}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.followersLabel}</div>
              <div className="mt-1 tabular-nums">{formatNumber(inf.followers)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.influencers.avgViewsEngagement}</div>
              <div className="mt-1 tabular-nums">
                {formatNumber(inf.avgViews)} · {formatPercent(inf.engagementRate)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t.influencers.socialAccounts} />
          <div className="space-y-3 px-5 py-4">
            {inf.platforms.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-border px-3 py-2 hover:bg-muted"
              >
                <div className="text-sm font-medium text-foreground">
                  {platformLabel(p.platform, t)} · {p.handle}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {fill(t.influencers.accountStats, {
                    followers: formatNumber(p.followers),
                    views: formatNumber(p.avgViews),
                    er: formatPercent(p.engagementRate),
                  })}
                </div>
              </a>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title={t.influencers.matchExplanation}
          subtitle={fill(t.influencers.overallConfidence, {
            score: inf.match?.overall ?? inf.matchScore,
            n: Math.round((inf.match?.confidence ?? 0.8) * 100),
          })}
        />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          {inf.match
            ? Object.entries(inf.match.breakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-foreground">
                      {matchLabels[key as keyof typeof matchLabels] ?? key}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">{value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))
            : null}
        </div>
        <ul className="space-y-2 border-t border-border/40 px-5 py-4 text-sm text-foreground">
          {(inf.match?.reasons ?? []).map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title={t.influencers.brandSafetySignals} />
          <div className="space-y-3 px-5 py-4 text-sm">
            <Badge tone={inf.brandSafety.status}>{inf.brandSafety.status}</Badge>
            <p className="text-foreground">{inf.brandSafety.notes}</p>
            {inf.brandSafety.flags.length ? (
              <div className="flex flex-wrap gap-2">
                {inf.brandSafety.flags.map((f) => (
                  <Badge key={f} tone="review">{f}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">{t.influencers.noFlags}</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.influencers.suitableProducts} />
          <div className="divide-y divide-border/40">
            {suitable.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted">
                <span className="text-xl">{p.imageEmoji}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.brand} · {p.category}</div>
                </div>
              </Link>
            ))}
            {!suitable.length ? (
              <div className="px-5 py-4 text-sm text-muted-foreground">{t.influencers.noLinkedProducts}</div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title={t.influencers.recentVideos} />
        <div className="divide-y divide-border/40">
          {videos.map((v) => (
            <div key={v.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{v.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {platformLabel(v.platform, t)} · {formatDate(v.publishedAt)} ·{" "}
                    {fill(t.influencers.nViews, { n: formatNumber(v.views) })}
                  </div>
                </div>
                {v.analysis ? <Badge tone={v.analysis.brandSafety.status}>{v.analysis.language.toUpperCase()}</Badge> : null}
              </div>
              {v.analysis ? (
                <div className="mt-3 space-y-2 text-sm text-foreground">
                  <p><span className="font-medium">{t.influencers.transcript}</span> {v.analysis.transcript}</p>
                  <p>
                    <span className="font-medium">{t.influencers.topics}</span>{" "}
                    {v.analysis.topics.map((topic) => `${topic.name} (${Math.round(topic.confidence * 100)}%)`).join(", ")}
                  </p>
                  <p>
                    <span className="font-medium">{t.influencers.style}</span>{" "}
                    {v.analysis.style.formats.join(", ")} · {v.analysis.style.tone.join(", ")}
                  </p>
                  <p>
                    <span className="font-medium">{t.influencers.entities}</span> {v.analysis.entities.join(", ")}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
          {!videos.length ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">{t.influencers.noVideos}</div>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader title={t.influencers.teamNotes} />
        <div className="space-y-3 px-5 py-4">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Button
            size="sm"
            onClick={() => {
              marketplace.updateInfluencerNotes(inf.id, notes);
            }}
          >
            {t.influencers.saveNotes}
          </Button>
        </div>
      </Card>
    </div>
  );
}
