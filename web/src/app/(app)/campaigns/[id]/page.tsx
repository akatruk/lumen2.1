"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Campaign, Product } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LANGUAGE_LABELS, PLATFORM_LABELS, formatDate } from "@/lib/utils";

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const c = marketplace.getCampaign(params.id) ?? null;
    setCampaign(c);
    setProduct(c ? marketplace.getProduct(c.productId) ?? null : null);
  }, [params.id]);

  if (!campaign) return <div className="text-sm text-slate-500">Campaign not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {product?.name} · {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
          </p>
        </div>
        <Badge tone={campaign.status}>{campaign.status}</Badge>
      </div>

      <Card>
        <CardHeader title="Campaign brief" />
        <div className="grid gap-4 px-5 py-4 text-sm text-slate-700 md:grid-cols-2">
          <div className="md:col-span-2"><span className="font-medium">Objective:</span> {campaign.objective}</div>
          <div className="md:col-span-2"><span className="font-medium">Audience:</span> {campaign.audience}</div>
          <div><span className="font-medium">Platforms:</span> {campaign.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}</div>
          <div><span className="font-medium">Languages:</span> {campaign.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
          <div><span className="font-medium">Geography:</span> {campaign.geography.join(", ")}</div>
          <div><span className="font-medium">Budget:</span> {campaign.budgetRange}</div>
          <div><span className="font-medium">Candidates:</span> {campaign.candidateCount}</div>
          <div><span className="font-medium">Shortlist:</span> {campaign.shortlistCount}</div>
          <div className="md:col-span-2"><span className="font-medium">Materials:</span> {campaign.materials.join(" · ")}</div>
        </div>
      </Card>
    </div>
  );
}
