"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";
import { marketplace } from "@/services/marketplace";
import type { Campaign, CampaignBrief, Product, Submission } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LANGUAGE_LABELS, PLATFORM_LABELS, formatDate } from "@/lib/utils";
import { fill, useI18n } from "@/lib/i18n";

export default function CampaignDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [briefs, setBriefs] = useState<CampaignBrief[]>([]);
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    const c = marketplace.getCampaign(params.id) ?? null;
    setCampaign(c);
    setProduct(c ? marketplace.getProduct(c.productId) ?? null : null);
    setBriefs(collaboration.listBriefs({ campaignId: params.id }));
    setSubs(collaboration.listSubmissions({ campaignId: params.id }));
  }, [params.id]);

  if (!campaign) return <div className="text-sm text-muted-foreground">{t.campaigns.notFound}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{campaign.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {product?.name} · {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </p>
        </div>
        <Badge tone={campaign.status}>{campaign.status}</Badge>
      </div>

      <Card>
        <CardHeader title={t.campaigns.brief} />
        <div className="grid gap-4 px-5 py-4 text-sm text-foreground md:grid-cols-2">
          <div className="md:col-span-2"><span className="font-medium">{t.campaigns.objective}</span> {campaign.objective}</div>
          <div className="md:col-span-2"><span className="font-medium">{t.campaigns.audience}</span> {campaign.audience}</div>
          <div><span className="font-medium">{t.campaigns.platforms}</span> {campaign.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}</div>
          <div><span className="font-medium">{t.campaigns.languages}</span> {campaign.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
          <div><span className="font-medium">{t.campaigns.geography}</span> {campaign.geography.join(", ")}</div>
          <div><span className="font-medium">{t.campaigns.budget}</span> {campaign.budgetRange}</div>
          <div><span className="font-medium">{t.campaigns.candidates}</span> {campaign.candidateCount}</div>
          <div><span className="font-medium">{t.campaigns.shortlist}</span> {campaign.shortlistCount}</div>
          <div className="md:col-span-2"><span className="font-medium">{t.campaigns.materials}</span> {campaign.materials.join(" · ")}</div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title={t.campaigns.issuedBriefs} action={<Link href="/invitations" className="text-xs text-primary hover:underline">{t.campaigns.manageInvites}</Link>} />
          <div className="divide-y divide-border/40">
            {briefs.map((b) => (
              <div key={b.id} className="px-5 py-3 text-sm">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-muted-foreground">
                  {marketplace.getInfluencer(b.influencerId)?.name} · {b.status} · {fill(t.campaigns.due, { date: formatDate(b.deadline) })}
                </div>
              </div>
            ))}
            {!briefs.length ? <div className="px-5 py-4 text-sm text-muted-foreground">{t.campaigns.noBriefs}</div> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title={t.campaigns.submissions} action={<Link href="/reviews" className="text-xs text-primary hover:underline">{t.campaigns.openReviews}</Link>} />
          <div className="divide-y divide-border/40">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-medium">{marketplace.getInfluencer(s.influencerId)?.name}</div>
                  <div className="text-xs text-muted-foreground">{s.publicationUrl || s.draftUrl || t.campaigns.noMedia}</div>
                </div>
                <Badge tone={s.status === "Published" || s.status === "Approved" ? "Active" : "Reviewing"}>
                  {s.status}
                </Badge>
              </div>
            ))}
            {!subs.length ? <div className="px-5 py-4 text-sm text-muted-foreground">{t.campaigns.noSubmissions}</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
