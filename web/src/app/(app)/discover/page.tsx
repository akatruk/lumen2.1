"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { discovery } from "@/services/discovery/discovery.service";
import type { DiscoveryCandidate, DiscoverySearchParams, LanguageCode } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatNumber, formatPercent, LANGUAGE_LABELS } from "@/lib/utils";

const CITIES = ["All", "Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Koh Samui"];
const TOPICS = ["All", "food", "nightlife", "travel", "lifestyle", "skincare", "beauty", "fitness"];

export default function DiscoverPage() {
  const [query, setQuery] = useState("food bangkok");
  const [city, setCity] = useState("Bangkok");
  const [language, setLanguage] = useState<"all" | LanguageCode>("all");
  const [topic, setTopic] = useState("food");
  const [minFollowers, setMinFollowers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<DiscoveryCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const last = discovery.getLastSearch();
    if (last?.results?.length) {
      setResults(last.results);
      setSearched(true);
      if (last.params.query) setQuery(last.params.query);
      if (last.params.city) setCity(last.params.city);
      if (last.params.topic) setTopic(last.params.topic);
    }
  }, []);

  async function runSearch() {
    setLoading(true);
    setError(null);
    try {
      const params: DiscoverySearchParams = {
        query: query.trim() || "food bangkok",
        city,
        language,
        topic,
        minFollowers,
        limit: 12,
      };
      const list = await discovery.search(params);
      setResults(list);
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
            In-app TikTok search → creator candidates → dossier for collab.
          </p>
        </div>
        <Badge tone="Queued">{discovery.connectorLabel()}</Badge>
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <Field label="Search TikTok">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. pad kra pao bangkok nightlife"
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
          <Button onClick={() => void runSearch()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search TikTok
          </Button>
          <div className="flex flex-wrap gap-2 pb-1">
            {["food bangkok", "nightlife soi 11", "street food chiang mai"].map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded border border-border/60 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary/40 hover:text-primary"
                onClick={() => {
                  setQuery(chip);
                  if (chip.includes("bangkok") || chip.includes("soi")) setCity("Bangkok");
                  if (chip.includes("chiang")) setCity("Chiang Mai");
                  if (chip.includes("nightlife")) setTopic("nightlife");
                  else setTopic("food");
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </Card>

      {!searched && !loading ? (
        <Card className="px-5 py-10 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">
            Run a search to find TikTok creators. Results are creator-deduped (not raw videos).
          </p>
        </Card>
      ) : null}

      {searched && !loading && results.length === 0 ? (
        <Card className="px-5 py-8 text-center text-sm text-muted-foreground">
          No creators matched. Try a broader query or lower min followers.
        </Card>
      ) : null}

      {results.length > 0 ? (
        <div className="space-y-3">
          <div className="font-mono text-xs text-muted-foreground">
            {results.length} creators · source {discovery.connectorLabel()}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: c.avatarColor }}
                  >
                    {c.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{c.name}</div>
                    <div className="truncate font-mono text-xs text-primary">{c.handle}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {c.city} · {formatNumber(c.followers)} · {formatPercent(c.engagementRate)} ER
                    </div>
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
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
