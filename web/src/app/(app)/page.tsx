"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { AnalysisJob, ActivityEvent, DashboardStats, Influencer } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge, MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [recommended, setRecommended] = useState<Influencer[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setStats(marketplace.getDashboard());
    setJobs(marketplace.listJobs().slice(0, 5));
    setRecommended(marketplace.listInfluencers().slice(0, 4));
    setActivity(marketplace.listActivity().slice(0, 6));
  }, []);

  if (!stats) {
    return <div className="text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  const tiles = [
    { label: "Influencers", value: stats.influencers },
    { label: "Analyzed videos", value: stats.analyzedVideos },
    { label: "Active campaigns", value: stats.activeCampaigns },
    { label: "In shortlists", value: stats.shortlistedInfluencers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Thailand discovery workspace for brands and agencies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/discover"><Button size="sm">Discover TikTok</Button></Link>
          <Link href="/products/scan"><Button size="sm" variant="secondary">Scan product</Button></Link>
          <Link href="/products?new=1"><Button size="sm" variant="secondary">Add Product</Button></Link>
          <Link href="/campaigns?new=1"><Button size="sm" variant="secondary">Create Campaign</Button></Link>
          <Link href="/import"><Button size="sm" variant="secondary">Import Influencers</Button></Link>
          <Link href="/analysis-jobs"><Button size="sm" variant="secondary">Start Analysis</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="px-5 py-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.label}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{t.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Recommended influencers" subtitle="Highest match scores in the demo set" />
          <div className="divide-y divide-border/40">
            {recommended.map((inf) => (
              <Link
                key={inf.id}
                href={`/influencers/${inf.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: inf.avatarColor }}
                >
                  {inf.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{inf.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {inf.city} · {inf.topics.slice(0, 3).join(", ")} · {formatNumber(inf.followers)} followers
                  </div>
                </div>
                <MatchScore score={inf.matchScore} />
              </Link>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Topics" subtitle="Across catalog" />
          <div className="space-y-3 px-5 py-4">
            {stats.topicStats.map((t) => (
              <div key={t.topic} className="flex items-center justify-between gap-3 text-sm">
                <span className="capitalize text-foreground">{t.topic}</span>
                <span className="tabular-nums text-muted-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent analysis jobs"
          action={
            <Link href="/analysis-jobs" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          }
        />
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Influencer</th>
                <th className="px-5 py-3 font-medium">Videos</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {jobs.map((job) => {
                const inf = marketplace.getInfluencer(job.influencerId);
                return (
                  <tr key={job.id}>
                    <td className="px-5 py-3 text-foreground">{inf?.name ?? job.influencerId}</td>
                    <td className="px-5 py-3 text-muted-foreground">{job.videoCount}</td>
                    <td className="px-5 py-3"><Badge tone={job.status}>{job.status}</Badge></td>
                    <td className="px-5 py-3 text-muted-foreground">{formatDateTime(job.startedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Activity" subtitle="Local demo audit trail" />
        <div className="divide-y divide-border/40">
          {activity.map((event) => (
            <div key={event.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
              <div>
                <div className="capitalize text-xs font-medium text-primary">{event.type}</div>
                <div className="mt-0.5 text-foreground">{event.message}</div>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
