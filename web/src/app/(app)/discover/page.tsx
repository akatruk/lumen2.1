"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { discovery } from "@/services/discovery/discovery.service";
import { marketplace } from "@/services/marketplace";
import { buildSearchQueryFromCard, rankCandidatesForCard } from "@/services/match.service";
import type {
  DiscoveryCandidate,
  DiscoverySearchParams,
  LanguageCode,
  Product,
  RankedDiscoveryMatch,
} from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatNumber, formatPercent, LANGUAGE_LABELS } from "@/lib/utils";

const CITIES = ["All", "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Hangzhou", "Chengdu"];
const TOPICS = ["All", "food", "nightlife", "travel", "lifestyle", "skincare", "beauty", "fitness"];

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);

  const [productId, setProductId] = useState<string>("");
  const [query, setQuery] = useState("上海 美食");
  const [city, setCity] = useState("Shanghai");
  const [language, setLanguage] = useState<"all" | LanguageCode>("all");
  const [topic, setTopic] = useState("food");
  const [minFollowers, setMinFollowers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [ranked, setRanked] = useState<RankedDiscoveryMatch[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => {
      setProducts(marketplace.listProducts());
    });
  }, []);

  const selectedProduct: Product | undefined = products.find((p) => p.id === productId);

  useEffect(() => {
    const fromQuery = searchParams.get("productId");
    if (fromQuery && products.some((p) => p.id === fromQuery)) {
      setProductId(fromQuery);
      const p = marketplace.getProduct(fromQuery);
      if (p?.resumeCard) {
        const q = buildSearchQueryFromCard(p.resumeCard);
        setQuery(q.query);
        setCity(q.city);
        setTopic(q.topic);
      } else if (p) {
        setQuery(`${p.desiredTopics[0] ?? "lifestyle"} ${p.geography[0] ?? ""}`.trim());
        setCity(p.geography[0] ?? "Shanghai");
        setTopic(p.desiredTopics[0] ?? "All");
      }
      return;
    }
    if (!productId && products[0]) {
      // prefer Shanghai F&B demo product if present
      const demo = products.find((p) => p.id === "prod-2") ?? products[0];
      setProductId(demo.id);
    }
  }, [searchParams, products, productId]);

  useEffect(() => {
    const last = discovery.getLastSearch();
    if (last?.results?.length && !searchParams.get("productId")) {
      setSearched(true);
      if (last.params.query) setQuery(last.params.query);
    }
  }, [searchParams]);

  function applyProductDefaults(id: string) {
    setProductId(id);
    const p = marketplace.getProduct(id);
    if (!p) return;
    if (p.resumeCard) {
      const q = buildSearchQueryFromCard(p.resumeCard);
      setQuery(q.query);
      setCity(q.city);
      setTopic(q.topic);
      if (p.resumeCard.languages[0]) {
        setLanguage(p.resumeCard.languages[0]);
      }
    } else {
      setQuery(`${p.desiredTopics[0] ?? "lifestyle"} ${p.geography[0] ?? ""}`.trim());
      setCity(p.geography.find((g) => g !== "China") ?? p.geography[0] ?? "All");
      setTopic(p.desiredTopics[0] ?? "All");
    }
  }

  async function runSearch() {
    if (!productId) {
      setError("Select a product resume card context first");
      return;
    }
    const product = marketplace.getProduct(productId);
    if (!product) {
      setError("Product not found");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: DiscoverySearchParams = {
        query: query.trim() || "上海 美食",
        city,
        language,
        topic,
        minFollowers,
        limit: 12,
      };
      const list: DiscoveryCandidate[] = await discovery.search(params);
      setRawCount(list.length);
      const matches = rankCandidatesForCard(list, product);
      setRanked(matches);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Discover</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Douyin search ranked against a product resume card (score + reasons).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="Queued">{discovery.connectorLabel()}</Badge>
          <Link href="/products/scan">
            <Button size="sm" variant="secondary">
              Scan product
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <Field label="Match for product (required)">
            <Select value={productId} onChange={(e) => applyProductDefaults(e.target.value)}>
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.brand}
                  {p.resumeCard ? " · card" : ""}
                </option>
              ))}
            </Select>
          </Field>
          {selectedProduct ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                Topics: {(selectedProduct.resumeCard?.desired_topics ?? selectedProduct.desiredTopics).join(", ")}
              </span>
              <span>·</span>
              <span>
                Geo: {(selectedProduct.resumeCard?.geography ?? selectedProduct.geography).join(", ")}
              </span>
              <Link href={`/products/${selectedProduct.id}`} className="text-primary hover:underline">
                Open card
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Field label="Search Douyin">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 上海 美食 探店"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void runSearch();
                }}
              />
            </Field>
          </div>
          <Field label="City">
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Language">
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "all" | LanguageCode)}
            >
              <option value="all">All</option>
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Topic">
            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <Field label="Min followers">
            <Input
              type="number"
              className="w-40"
              value={minFollowers || ""}
              onChange={(e) => setMinFollowers(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </Field>
          <Button onClick={() => void runSearch()} disabled={loading || !productId}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search & rank
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </Card>

      {!searched && !loading ? (
        <Card className="px-5 py-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">
            Select a product card, then search. Results are ranked for that product — not generic Douyin noise.
          </p>
        </Card>
      ) : null}

      {searched && !loading && ranked.length === 0 ? (
        <Card className="px-5 py-8 text-center text-sm text-muted-foreground">
          No creators matched. Try a broader query or another product card.
        </Card>
      ) : null}

      {ranked.length > 0 ? (
        <div className="space-y-3">
          <div className="font-mono text-xs text-muted-foreground">
            {ranked.length} ranked / {rawCount} fetched · vs {selectedProduct?.name ?? "product"}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ranked.map((m) => {
              const c = m.candidate;
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">{c.name}</div>
                          <div className="truncate font-mono text-xs text-primary">{c.handle}</div>
                        </div>
                        <MatchScore score={m.score} size="sm" />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {c.city} · {formatNumber(c.followers)} · {formatPercent(c.engagementRate)} ER · conf{" "}
                        {Math.round(m.confidence * 100)}%
                      </div>
                      <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                        {m.reasons.slice(0, 4).map((r) => (
                          <li key={r}>· {r}</li>
                        ))}
                      </ul>
                      {m.risks[0] ? (
                        <div className="mt-1 text-[11px] text-amber-500">Risk: {m.risks[0]}</div>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.topics.slice(0, 3).map((t) => (
                          <Badge key={t}>{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/discover/${encodeURIComponent(c.id)}`}>
                      <Button size="sm" className="w-full">
                        Open dossier
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
