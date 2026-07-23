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

export default function CampaignDetailPage() {
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Issued briefs" action={<Link href="/invitations" className="text-xs text-teal-700 hover:underline">Manage invites</Link>} />
          <div className="divide-y divide-slate-100">
            {briefs.map((b) => (
              <div key={b.id} className="px-5 py-3 text-sm">
                <div className="font-medium">{b.title}</div>
                <div className="text-xs text-slate-500">
                  {marketplace.getInfluencer(b.influencerId)?.name} · {b.status} · due {formatDate(b.deadline)}
                </div>
              </div>
            ))}
            {!briefs.length ? <div className="px-5 py-4 text-sm text-slate-500">No briefs yet.</div> : null}
          </div>
        </Card>
        <Card>
          <CardHeader title="Submissions" action={<Link href="/reviews" className="text-xs text-teal-700 hover:underline">Open reviews</Link>} />
          <div className="divide-y divide-slate-100">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-medium">{marketplace.getInfluencer(s.influencerId)?.name}</div>
                  <div className="text-xs text-slate-500">{s.publicationUrl || s.draftUrl || "No media yet"}</div>
                </div>
                <Badge tone={s.status === "Published" || s.status === "Approved" ? "Active" : "Reviewing"}>
                  {s.status}
                </Badge>
              </div>
            ))}
            {!subs.length ? <div className="px-5 py-4 text-sm text-slate-500">No submissions yet.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
