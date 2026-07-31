"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { discovery } from "@/services/discovery/discovery.service";
import { marketplace } from "@/services/marketplace";
import { enrichProductForMatch } from "@/lib/product-match";
import { buildSearchQueryFromCard, rankCandidatesForCard } from "@/services/match.service";
import type {
  DiscoveryCandidate,
  DiscoverySearchParams,
  LanguageCode,
  Product,
  RankedDiscoveryMatch,
  Shortlist,
} from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";
import { fill, useI18n } from "@/lib/i18n";
import { formatNumber, formatPercent, LANGUAGE_LABELS } from "@/lib/utils";

const CITIES = ["All", "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Hangzhou", "Chengdu"];
const TOPICS = [
  "All",
  "tech",
  "ai",
  "food",
  "nightlife",
  "travel",
  "lifestyle",
  "skincare",
  "beauty",
  "fitness",
  "real estate",
];

export default function DiscoverPage() {
  const { t } = useI18n();
  const { push } = useToast();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [shortlistId, setShortlistId] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const [productId, setProductId] = useState<string>("");
  const [query, setQuery] = useState("科技 AI 短视频");
  const [city, setCity] = useState("Shanghai");
  const [language, setLanguage] = useState<"all" | LanguageCode>("all");
  const [topic, setTopic] = useState("tech");
  const [minFollowers, setMinFollowers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [ranked, setRanked] = useState<RankedDiscoveryMatch[]>([]);
  const [rawCount, setRawCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => {
      setProducts(marketplace.listProducts());
      const lists = marketplace.listShortlists();
      setShortlists(lists);
      setShortlistId((prev) => prev || lists[0]?.id || "");
    });
  }, []);

  const selectedProduct: Product | undefined = products.find((p) => p.id === productId);

  useEffect(() => {
    if (hydratedRef.current || !products.length) return;

    const last = discovery.getLastSearch();
    const fromUrl = searchParams.get("productId");

    const pid =
      fromUrl && products.some((p) => p.id === fromUrl)
        ? fromUrl
        : last?.productId && products.some((p) => p.id === last.productId)
          ? last.productId
          : !productId
            ? (products.find((p) => p.id === "prod-7") ??
                products.find((p) => /lumen|technolog|ai|script/i.test(`${p.name} ${p.category}`)) ??
                products.find((p) => p.id === "prod-2") ??
                products[0])?.id ?? ""
            : productId;

    if (pid) applyProductDefaults(pid);

    if (last?.results?.length) {
      const rankProduct = pid ? marketplace.getProduct(pid) : undefined;
      if (last.params.query) setQuery(last.params.query);
      if (last.params.city) setCity(last.params.city);
      if (last.params.topic) setTopic(last.params.topic);
      if (last.params.language) setLanguage(last.params.language);
      if (typeof last.params.minFollowers === "number") setMinFollowers(last.params.minFollowers);

      if (rankProduct) {
        const matches = rankCandidatesForCard(last.results, enrichProductForMatch(rankProduct));
        setRawCount(last.results.length);
        setRanked(matches);
        setSearched(true);
      } else {
        setSearched(true);
      }
    }

    hydratedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot hydrate after products load
  }, [products, searchParams]);

  function applyProductDefaults(id: string) {
    setProductId(id);
    const raw = marketplace.getProduct(id);
    if (!raw) return;
    const p = enrichProductForMatch(raw);
    const card = p.resumeCard ?? {
      name: p.name,
      brand: p.brand,
      category: p.category,
      pitch: p.description,
      geography: p.geography,
      audience: p.audience,
      languages: p.languages,
      benefits: p.benefits,
      prohibited_claims: p.prohibitedClaims,
      desired_topics: p.desiredTopics,
      tone: [],
      platforms: p.platforms ?? ["douyin"],
      budget: { type: "unknown" as const, notes: p.priceLabel },
      success_metrics: [],
      confidence: 0.7,
      missing_fields: [],
      evidence_notes: [],
    };
    const q = buildSearchQueryFromCard(card);
    setQuery(q.query);
    setCity(q.city);
    setTopic(q.topic);
    if (card.languages[0]) setLanguage(card.languages[0]);
  }

  async function runSearch() {
    if (!productId) {
      setError(t.discover.errSelectProduct);
      return;
    }
    const product = marketplace.getProduct(productId);
    if (!product) {
      setError(t.discover.errProductNotFound);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const enriched = enrichProductForMatch(product);
      const defaults = enriched.resumeCard
        ? buildSearchQueryFromCard(enriched.resumeCard)
        : buildSearchQueryFromCard({
            name: enriched.name,
            brand: enriched.brand,
            category: enriched.category,
            pitch: enriched.description,
            geography: enriched.geography,
            audience: enriched.audience,
            languages: enriched.languages,
            benefits: enriched.benefits,
            prohibited_claims: enriched.prohibitedClaims,
            desired_topics: enriched.desiredTopics,
            tone: [],
            platforms: enriched.platforms ?? ["douyin"],
            budget: { type: "unknown", notes: enriched.priceLabel },
            success_metrics: [],
            confidence: 0.7,
            missing_fields: [],
            evidence_notes: [],
          });
      const params: DiscoverySearchParams = {
        query: query.trim() || defaults.query || "科技 AI",
        city: city === "All" ? defaults.city : city,
        language,
        topic: topic === "All" ? defaults.topic : topic,
        minFollowers,
        limit: 12,
      };
      const list: DiscoveryCandidate[] = await discovery.search(params, { productId });
      setRawCount(list.length);
      // hard-drops travel/etc. vs tech inside rankCandidatesForCard
      const matches = rankCandidatesForCard(list, enriched);
      setRanked(matches);
      setSearched(true);
      if (!matches.length && list.length) {
        setError(t.discover.errNoNicheMatches);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.discover.errSearchFailed);
    } finally {
      setLoading(false);
    }
  }

  async function onAddToShortlist(candidate: DiscoveryCandidate) {
    if (!shortlistId) {
      push(t.discover.errSelectShortlist, "err");
      return;
    }
    setSavingId(candidate.id);
    try {
      const inf = discovery.saveCandidateToCatalog(candidate);
      await marketplace.addToShortlistAsync(shortlistId, inf.id);
      push(fill(t.discover.addedToShortlist, { name: inf.name }));
      setShortlists(marketplace.listShortlists());
    } catch (e) {
      push(e instanceof Error ? e.message : t.discover.toastSaveFailed, "err");
    } finally {
      setSavingId(null);
    }
  }

  const cityLabel = useMemo(
    () => (c: string) => (c === "All" ? t.common.all : c),
    [t],
  );

  const topicLabel = useMemo(
    () => (value: string) => (value === "All" ? t.common.allTopics : value),
    [t],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.discover.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.discover.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="Queued">{discovery.connectorLabel()}</Badge>
          <Link href="/products/scan">
            <Button size="sm" variant="secondary">
              {t.products.scanProduct}
            </Button>
          </Link>
        </div>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <Field label={t.discover.matchForProduct}>
            <Select value={productId} onChange={(e) => applyProductDefaults(e.target.value)}>
              <option value="">{t.discover.selectProduct}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.brand}
                  {p.resumeCard ? t.discover.cardSuffix : ""}
                </option>
              ))}
            </Select>
          </Field>
          {selectedProduct ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>
                {t.discover.topics}{" "}
                {(selectedProduct.resumeCard?.desired_topics ?? selectedProduct.desiredTopics).join(", ")}
              </span>
              <span>·</span>
              <span>
                {t.discover.geo}{" "}
                {(selectedProduct.resumeCard?.geography ?? selectedProduct.geography).join(", ")}
              </span>
              <Link href={`/products/${selectedProduct.id}`} className="text-primary hover:underline">
                {t.discover.openCard}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Field label={t.discover.searchDouyin}>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.discover.searchPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void runSearch();
                }}
              />
            </Field>
          </div>
          <Field label={t.discover.city}>
            <Select value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {cityLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.discover.language}>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "all" | LanguageCode)}
            >
              <option value="all">{t.common.all}</option>
              {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.discover.topic}>
            <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((topicOption) => (
                <option key={topicOption} value={topicOption}>
                  {topicLabel(topicOption)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Field label={t.discover.minFollowers}>
            <Input
              type="number"
              className="w-full sm:w-40"
              value={minFollowers || ""}
              onChange={(e) => setMinFollowers(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </Field>
          <Button
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            onClick={() => void runSearch()}
            disabled={loading || !productId}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {t.discover.searchRank}
          </Button>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </Card>

      {!searched && !loading ? (
        <Card className="px-5 py-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">{t.discover.emptyHint}</p>
        </Card>
      ) : null}

      {searched && !loading && ranked.length === 0 ? (
        <Card className="px-5 py-8 text-center text-sm text-muted-foreground">
          {t.discover.emptyResults}
        </Card>
      ) : null}

      {ranked.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-xs text-muted-foreground">
              {fill(t.discover.rankedHeader, {
                ranked: ranked.length,
                raw: rawCount,
                product: selectedProduct?.name ?? t.discover.productFallback,
              })}
            </div>
            {shortlists.length ? (
              <Field label={t.discover.saveToShortlist}>
                <Select
                  className="w-48"
                  value={shortlistId}
                  onChange={(e) => setShortlistId(e.target.value)}
                >
                  {shortlists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
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
                        {c.city} · {formatNumber(c.followers)} · {formatPercent(c.engagementRate)} {t.common.er}{" "}
                        {fill(t.common.confidence, { n: Math.round(m.confidence * 100) })}
                      </div>
                      <ul className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                        {m.reasons.slice(0, 4).map((r) => (
                          <li key={r}>· {r}</li>
                        ))}
                      </ul>
                      {m.risks[0] ? (
                        <div className="mt-1 text-[11px] text-amber-500">
                          {fill(t.common.risk, { reason: m.risks[0] })}
                        </div>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.topics.slice(0, 3).map((topicTag) => (
                          <Badge key={topicTag}>{topicTag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href={`/discover/${encodeURIComponent(c.id)}`}>
                      <Button size="sm" className="w-full">
                        {t.discover.openDossier}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      disabled={!shortlistId || savingId === c.id}
                      onClick={() => void onAddToShortlist(c)}
                    >
                      {savingId === c.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {t.discover.addToShortlist}
                    </Button>
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
