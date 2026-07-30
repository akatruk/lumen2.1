"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, LanguageCode, Platform, VerificationStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import { fill, useI18n } from "@/lib/i18n";
import {
  LANGUAGE_LABELS,
  cn,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

const cities = ["All", "Shanghai", "Beijing", "Guangzhou", "Shenzhen", "Hangzhou", "Chengdu"];
const topics = [
  "All",
  "food",
  "travel",
  "skincare",
  "beauty",
  "fitness",
  "real estate",
  "nightlife",
  "island",
  "wellness",
];

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

export default function InfluencersPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | Platform>("all");
  const [city, setCity] = useState("All");
  const [language, setLanguage] = useState<"all" | LanguageCode>("all");
  const [topic, setTopic] = useState("All");
  const [minFollowers, setMinFollowers] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [sort, setSort] = useState("match");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [productId, setProductId] = useState("all");

  const products = useMemo(() => marketplace.listProducts(), []);
  const influencers = useMemo(() => {
    if (productId === "all") return marketplace.listInfluencers();
    return marketplace.rankForProduct(productId);
  }, [productId]);

  const filtered = useMemo(() => {
    let list = influencers.filter((inf) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        inf.name.toLowerCase().includes(q) ||
        inf.platforms.some((p) => p.handle.toLowerCase().includes(q));
      const matchesPlatform =
        platform === "all" || inf.platforms.some((p) => p.platform === platform);
      const matchesCity = city === "All" || inf.city === city;
      const matchesLang = language === "all" || inf.languages.includes(language);
      const matchesTopic = topic === "All" || inf.topics.includes(topic);
      return (
        matchesQuery &&
        matchesPlatform &&
        matchesCity &&
        matchesLang &&
        matchesTopic &&
        inf.followers >= minFollowers &&
        inf.matchScore >= minScore
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === "followers") return b.followers - a.followers;
      if (sort === "engagement") return b.engagementRate - a.engagementRate;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.matchScore - a.matchScore;
    });
    return list;
  }, [influencers, query, platform, city, language, topic, minFollowers, minScore, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.influencers.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fill(t.influencers.subtitle, { n: filtered.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/import"><Button variant="secondary" size="sm">{t.common.import}</Button></Link>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              aria-label={t.influencers.cardsView}
              className={cn("rounded-md p-2", view === "cards" ? "bg-muted" : "")}
              onClick={() => setView("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={t.influencers.tableView}
              className={cn("rounded-md p-2", view === "table" ? "bg-muted" : "")}
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder={t.influencers.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={platform} onChange={(e) => setPlatform(e.target.value as "all" | Platform)}>
            <option value="all">{t.common.allPlatforms}</option>
            <option value="douyin">{t.common.douyin}</option>
            <option value="tiktok">{t.common.tiktok}</option>
            <option value="instagram">{t.common.instagram}</option>
            <option value="youtube">{t.common.youtube}</option>
          </Select>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((c) => (
              <option key={c} value={c}>{c === "All" ? t.common.allCities : c}</option>
            ))}
          </Select>
          <Select value={language} onChange={(e) => setLanguage(e.target.value as "all" | LanguageCode)}>
            <option value="all">{t.common.allLanguages}</option>
            {Object.entries(LANGUAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((topicOption) => (
              <option key={topicOption} value={topicOption}>
                {topicOption === "All" ? t.common.allTopics : topicOption}
              </option>
            ))}
          </Select>
          <Select value={String(minFollowers)} onChange={(e) => setMinFollowers(Number(e.target.value))}>
            <option value="0">{t.common.anyFollowers}</option>
            <option value="100000">100K+</option>
            <option value="200000">200K+</option>
            <option value="400000">400K+</option>
          </Select>
          <Select value={String(minScore)} onChange={(e) => setMinScore(Number(e.target.value))}>
            <option value="0">{t.common.anyMatchScore}</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </Select>
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="all">{t.influencers.matchAll}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{fill(t.influencers.matchFor, { name: p.name })}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="match">{t.influencers.sortMatch}</option>
            <option value="followers">{t.influencers.sortFollowers}</option>
            <option value="engagement">{t.influencers.sortEngagement}</option>
            <option value="name">{t.influencers.sortName}</option>
          </Select>
        </div>
      </Card>

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inf) => (
            <InfluencerCard key={inf.id} influencer={inf} />
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">{t.influencers.colCreator}</th>
                <th className="px-4 py-3">{t.influencers.colPlatform}</th>
                <th className="px-4 py-3">{t.influencers.colCity}</th>
                <th className="px-4 py-3">{t.influencers.colFollowers}</th>
                <th className="px-4 py-3">{t.influencers.colEngagement}</th>
                <th className="px-4 py-3">{t.influencers.colMatch}</th>
                <th className="px-4 py-3">{t.influencers.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((inf) => (
                <tr key={inf.id} className="hover:bg-muted">
                  <td className="px-4 py-3">
                    <Link href={`/influencers/${inf.id}`} className="font-medium text-primary hover:underline">
                      {inf.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{inf.platforms[0]?.handle}</div>
                  </td>
                  <td className="px-4 py-3">
                    {inf.platforms[0] ? platformLabel(inf.platforms[0].platform, t) : t.common.emDash}
                  </td>
                  <td className="px-4 py-3">{inf.city}</td>
                  <td className="px-4 py-3 tabular-nums">{formatNumber(inf.followers)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPercent(inf.engagementRate)}</td>
                  <td className="px-4 py-3"><MatchScore score={inf.matchScore} size="sm" /></td>
                  <td className="px-4 py-3">
                    <Badge tone={inf.verificationStatus}>
                      {verificationLabel(inf.verificationStatus, t)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  const { t } = useI18n();
  const primary = influencer.platforms[0];
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: influencer.avatarColor }}
        >
          {influencer.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/influencers/${influencer.id}`} className="text-sm font-semibold text-foreground hover:text-primary">
            {influencer.name}
          </Link>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {primary ? platformLabel(primary.platform, t) : t.common.emDash} · {primary?.handle}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {influencer.city}, {influencer.country}
          </div>
        </div>
        <MatchScore score={influencer.matchScore} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {influencer.topics.slice(0, 4).map((topicTag) => (
          <Badge key={topicTag}>{topicTag}</Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>
          {t.influencers.languages}{" "}
          {influencer.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}
        </div>
        <div>
          {t.influencers.followers} {formatNumber(influencer.followers)}
        </div>
        <div>
          {t.influencers.avgViews} {formatNumber(influencer.avgViews)}
        </div>
        <div>
          {t.influencers.engagement} {formatPercent(influencer.engagementRate)}
        </div>
        <div>
          {t.influencers.videosAnalyzed} {influencer.analyzedVideos}
        </div>
        <div>
          <Badge tone={influencer.verificationStatus}>
            {verificationLabel(influencer.verificationStatus, t)}
          </Badge>
        </div>
      </div>

      <div className="mt-5 border-t border-border/40 pt-4">
        <AddToShortlistButton influencer={influencer} />
      </div>
    </Card>
  );
}
