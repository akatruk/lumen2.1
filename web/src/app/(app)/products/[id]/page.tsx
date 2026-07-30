"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Product, ProductResumeCard } from "@/types";
import type { CatalogRankResult } from "@/lib/product-match";
import { enrichProductForMatch, productNicheTokens } from "@/lib/product-match";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LANGUAGE_LABELS } from "@/lib/utils";
import { fill, useI18n } from "@/lib/i18n";

export default function ProductDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [matches, setMatches] = useState<CatalogRankResult[]>([]);
  const [matchTopics, setMatchTopics] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void marketplace.hydrateBrandPersistence().then(() => {
      if (cancelled) return;
      const raw = marketplace.getProduct(params.id) ?? null;
      if (!raw) {
        setProduct(null);
        setMatches([]);
        setMatchTopics([]);
        return;
      }
      const enriched = enrichProductForMatch(raw);
      setProduct(enriched);
      setMatchTopics(productNicheTokens(enriched));
      setMatches(marketplace.rankForProductDetailed(raw.id).slice(0, 8));
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (!product) return <div className="text-sm text-muted-foreground">{t.products.notFound}</div>;

  const card: ProductResumeCard | undefined = product.resumeCard;
  const topics = card?.desired_topics?.length ? card.desired_topics : product.desiredTopics;

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
              {t.products.rescan}
            </Button>
          </Link>
          <Link href={`/discover?productId=${product.id}`}>
            <Button size="sm">{t.products.findMatches}</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={card ? t.products.resumeCard : t.products.productDetails}
            monoLabel="01"
            subtitle={
              card
                ? fill(t.products.confidenceSource, {
                    n: Math.round(card.confidence * 100),
                    source: card.sourceMode ?? t.products.manual,
                  })
                : t.products.noScanYet
            }
          />
          <div className="space-y-4 px-5 py-4 text-sm text-foreground">
            <p>{card?.pitch ?? product.description}</p>
            <div>
              <span className="font-medium">{t.products.audience}</span> {card?.audience || product.audience}
            </div>
            <div>
              <span className="font-medium">{t.products.geography}</span>{" "}
              {(card?.geography ?? product.geography).join(", ")}
            </div>
            <div>
              <span className="font-medium">{t.products.languages}</span>{" "}
              {(card?.languages ?? product.languages).map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")}
            </div>
            <div>
              <span className="font-medium">{t.products.benefitsLabel}</span>{" "}
              {(card?.benefits ?? product.benefits).join(" · ")}
            </div>
            <div>
              <span className="font-medium">{t.products.prohibitedLabel}</span>{" "}
              {(card?.prohibited_claims ?? product.prohibitedClaims).join(" · ") || t.common.emDash}
            </div>
            {card ? (
              <>
                <div>
                  <span className="font-medium">{t.products.tone}</span> {card.tone.join(", ") || t.common.emDash}
                </div>
                <div>
                  <span className="font-medium">{t.products.platforms}</span> {card.platforms.join(", ")}
                </div>
                <div>
                  <span className="font-medium">{t.products.budget}</span> {card.budget.type}
                  {card.budget.notes ? ` · ${card.budget.notes}` : ""}
                </div>
                <div>
                  <span className="font-medium">{t.products.successMetrics}</span>{" "}
                  {card.success_metrics.join(", ") || t.common.emDash}
                </div>
              </>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(topics.length ? topics : matchTopics).map((topic) => (
                <Badge key={topic}>{topic}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title={t.products.suggested}
            subtitle={
              matchTopics.length
                ? fill(t.products.catalogRankTopics, { topics: matchTopics.slice(0, 4).join(", ") })
                : t.products.catalogRank
            }
          />
          <div className="divide-y divide-border/40">
            {matches.length ? (
              matches.map((row) => (
                <Link
                  key={row.influencer.id}
                  href={`/influencers/${row.influencer.id}`}
                  className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{row.influencer.name}</div>
                    <div className="text-xs text-muted-foreground">{row.influencer.city}</div>
                    {row.nicheHits.length ? (
                      <div className="mt-1 text-[11px] text-primary/90">
                        {fill(t.products.matchReasons, { hits: row.nicheHits.slice(0, 4).join(", ") })}
                      </div>
                    ) : null}
                  </div>
                  <MatchScore score={row.score} size="sm" />
                </Link>
              ))
            ) : (
              <div className="space-y-3 px-5 py-6 text-sm text-muted-foreground">
                <p>{t.products.noSuggested}</p>
                <Link href={`/discover?productId=${product.id}`}>
                  <Button size="sm">{t.products.findMatches}</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="border-t border-border/40 px-5 py-3">
            <Link href={`/discover?productId=${product.id}`} className="text-xs text-primary hover:underline">
              {t.products.runDiscover}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
