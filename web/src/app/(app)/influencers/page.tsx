"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, LanguageCode, Platform } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import {
  LANGUAGE_LABELS,
  PLATFORM_LABELS,
  cn,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

const cities = ["All", "Bangkok", "Phuket", "Chiang Mai", "Pattaya", "Koh Samui"];
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

export default function InfluencersPage() {
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
          <h1 className="text-2xl font-semibold text-slate-900">Influencers</h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} creators · Bangkok, Phuket, Chiang Mai, Pattaya, Samui
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/import"><Button variant="secondary" size="sm">Import</Button></Link>
          <div className="flex rounded-lg border border-slate-300 p-0.5">
            <button
              type="button"
              aria-label="Cards view"
              className={cn("rounded-md p-2", view === "cards" ? "bg-slate-100" : "")}
              onClick={() => setView("cards")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Table view"
              className={cn("rounded-md p-2", view === "table" ? "bg-slate-100" : "")}
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input placeholder="Search name or handle" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={platform} onChange={(e) => setPlatform(e.target.value as "all" | Platform)}>
            <option value="all">All platforms</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </Select>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((c) => <option key={c} value={c}>{c === "All" ? "All cities" : c}</option>)}
          </Select>
          <Select value={language} onChange={(e) => setLanguage(e.target.value as "all" | LanguageCode)}>
            <option value="all">All languages</option>
            {Object.entries(LANGUAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {topics.map((t) => <option key={t} value={t}>{t === "All" ? "All topics" : t}</option>)}
          </Select>
          <Select value={String(minFollowers)} onChange={(e) => setMinFollowers(Number(e.target.value))}>
            <option value="0">Any followers</option>
            <option value="100000">100K+</option>
            <option value="200000">200K+</option>
            <option value="400000">400K+</option>
          </Select>
          <Select value={String(minScore)} onChange={(e) => setMinScore(Number(e.target.value))}>
            <option value="0">Any match score</option>
            <option value="70">70+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </Select>
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="all">Match for: all products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>Match for: {p.name}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="match">Sort: match score</option>
            <option value="followers">Sort: followers</option>
            <option value="engagement">Sort: engagement</option>
            <option value="name">Sort: name</option>
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
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Followers</th>
                <th className="px-4 py-3">Engagement</th>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inf) => (
                <tr key={inf.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/influencers/${inf.id}`} className="font-medium text-teal-800 hover:underline">
                      {inf.name}
                    </Link>
                    <div className="text-xs text-slate-500">{inf.platforms[0]?.handle}</div>
                  </td>
                  <td className="px-4 py-3">{PLATFORM_LABELS[inf.platforms[0]?.platform]}</td>
                  <td className="px-4 py-3">{inf.city}</td>
                  <td className="px-4 py-3 tabular-nums">{formatNumber(inf.followers)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPercent(inf.engagementRate)}</td>
                  <td className="px-4 py-3"><MatchScore score={inf.matchScore} size="sm" /></td>
                  <td className="px-4 py-3"><Badge tone={inf.verificationStatus}>{inf.verificationStatus}</Badge></td>
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
          <Link href={`/influencers/${influencer.id}`} className="text-sm font-semibold text-slate-900 hover:text-teal-800">
            {influencer.name}
          </Link>
          <div className="mt-0.5 text-xs text-slate-500">
            {PLATFORM_LABELS[primary.platform]} · {primary.handle}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {influencer.city}, {influencer.country}
          </div>
        </div>
        <MatchScore score={influencer.matchScore} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {influencer.topics.slice(0, 4).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div>Languages: {influencer.languages.map((l) => LANGUAGE_LABELS[l]).join(", ")}</div>
        <div>Followers: {formatNumber(influencer.followers)}</div>
        <div>Avg views: {formatNumber(influencer.avgViews)}</div>
        <div>Engagement: {formatPercent(influencer.engagementRate)}</div>
        <div>Videos analyzed: {influencer.analyzedVideos}</div>
        <div><Badge tone={influencer.verificationStatus}>{influencer.verificationStatus}</Badge></div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <AddToShortlistButton influencer={influencer} />
      </div>
    </Card>
  );
}
