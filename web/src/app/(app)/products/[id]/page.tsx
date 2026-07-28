"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, Product } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { LANGUAGE_LABELS } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [matches, setMatches] = useState<Influencer[]>([]);

  useEffect(() => {
    const p = marketplace.getProduct(params.id) ?? null;
    setProduct(p);
    if (p) {
      setMatches(
        marketplace
          .listInfluencers()
          .filter((i) => i.suitableProductIds.includes(p.id) || i.topics.some((t) => p.desiredTopics.includes(t)))
          .slice(0, 6),
      );
    }
  }, [params.id]);

  if (!product) return <div className="text-sm text-muted-foreground">Product not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">{product.imageEmoji}</div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.brand} · {product.category} · {product.priceLabel}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Product details" />
          <div className="space-y-4 px-5 py-4 text-sm text-foreground">
            <p>{product.description}</p>
            <div><span className="font-medium">Audience:</span> {product.audience}</div>
            <div><span className="font-medium">Geography:</span> {product.geography.join(", ")}</div>
            <div><span className="font-medium">Languages:</span> {product.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
            <div><span className="font-medium">Benefits:</span> {product.benefits.join(" · ")}</div>
            <div><span className="font-medium">Prohibited claims:</span> {product.prohibitedClaims.join(" · ")}</div>
            <div className="flex flex-wrap gap-2">
              {product.desiredTopics.map((t) => <Badge key={t}>{t}</Badge>)}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Suggested influencers" />
          <div className="divide-y divide-border/40">
            {matches.map((inf) => (
              <Link key={inf.id} href={`/influencers/${inf.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted">
                <div>
                  <div className="text-sm font-medium text-foreground">{inf.name}</div>
                  <div className="text-xs text-muted-foreground">{inf.city}</div>
                </div>
                <MatchScore score={inf.matchScore} size="sm" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
