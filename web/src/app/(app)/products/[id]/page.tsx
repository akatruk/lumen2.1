"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, Product, ProductResumeCard } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LANGUAGE_LABELS } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [matches, setMatches] = useState<Influencer[]>([]);

  useEffect(() => {
    const p = marketplace.getProduct(params.id) ?? null;
    setProduct(p);
    if (p) {
      setMatches(marketplace.rankForProduct(p.id).slice(0, 6));
    }
  }, [params.id]);

  if (!product) return <div className="text-sm text-muted-foreground">Product not found.</div>;

  const card: ProductResumeCard | undefined = product.resumeCard;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-3xl">
            {product.imageEmoji}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.brand} · {product.category} · {product.priceLabel}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/products/scan`}>
            <Button size="sm" variant="secondary">
              Re-scan materials
            </Button>
          </Link>
          <Link href={`/discover?productId=${product.id}`}>
            <Button size="sm">Find matches</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={card ? "Resume card" : "Product details"}
            monoLabel="01"
            subtitle={
              card
                ? `confidence ${Math.round(card.confidence * 100)}% · ${card.sourceMode ?? "manual"}`
                : "No scan yet — fields from product record"
            }
          />
          <div className="space-y-4 px-5 py-4 text-sm text-foreground">
            <p>{card?.pitch ?? product.description}</p>
            <div>
              <span className="font-medium">Audience:</span> {card?.audience || product.audience}
            </div>
            <div>
              <span className="font-medium">Geography:</span>{" "}
              {(card?.geography ?? product.geography).join(", ")}
            </div>
            <div>
              <span className="font-medium">Languages:</span>{" "}
              {(card?.languages ?? product.languages).map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")}
            </div>
            <div>
              <span className="font-medium">Benefits:</span>{" "}
              {(card?.benefits ?? product.benefits).join(" · ")}
            </div>
            <div>
              <span className="font-medium">Prohibited claims:</span>{" "}
              {(card?.prohibited_claims ?? product.prohibitedClaims).join(" · ") || "—"}
            </div>
            {card ? (
              <>
                <div>
                  <span className="font-medium">Tone:</span> {card.tone.join(", ") || "—"}
                </div>
                <div>
                  <span className="font-medium">Platforms:</span> {card.platforms.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Budget:</span> {card.budget.type}
                  {card.budget.notes ? ` · ${card.budget.notes}` : ""}
                </div>
                <div>
                  <span className="font-medium">Success metrics:</span>{" "}
                  {card.success_metrics.join(", ") || "—"}
                </div>
              </>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(card?.desired_topics ?? product.desiredTopics).map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Suggested influencers" subtitle="Catalog rank for this product" />
          <div className="divide-y divide-border/40">
            {matches.map((inf) => (
              <Link
                key={inf.id}
                href={`/influencers/${inf.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted"
              >
                <div>
                  <div className="text-sm font-medium text-foreground">{inf.name}</div>
                  <div className="text-xs text-muted-foreground">{inf.city}</div>
                </div>
                <MatchScore score={inf.matchScore} size="sm" />
              </Link>
            ))}
          </div>
          <div className="border-t border-border/40 px-5 py-3">
            <Link href={`/discover?productId=${product.id}`} className="text-xs text-primary hover:underline">
              Run Douyin Discover for this card →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
