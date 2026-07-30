"use client";

import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { AnalysisJob, Influencer } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function AnalysisJobsPage() {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [influencerId, setInfluencerId] = useState("");
  const [videoCount, setVideoCount] = useState(5);

  const refresh = () => setJobs(marketplace.listJobs());

  useEffect(() => {
    const list = marketplace.listInfluencers();
    setInfluencers(list);
    setInfluencerId(list[0]?.id ?? "");
    refresh();

    const onUpdate = () => refresh();
    window.addEventListener("lumen:jobs-updated", onUpdate);
    const timer = setInterval(refresh, 1000);
    return () => {
      window.removeEventListener("lumen:jobs-updated", onUpdate);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.analysisJobs.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.analysisJobs.subtitle}</p>
      </div>

      <Card>
        <CardHeader title={t.analysisJobs.startDemo} subtitle={t.analysisJobs.usesMock} />
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-auto sm:min-w-56">
            <Field label={t.analysisJobs.influencer}>
              <Select className="w-full" value={influencerId} onChange={(e) => setInfluencerId(e.target.value)}>
                {influencers.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label={t.analysisJobs.videos}>
            <Select className="w-full sm:w-28" value={String(videoCount)} onChange={(e) => setVideoCount(Number(e.target.value))}>
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Button
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            onClick={async () => {
              if (!influencerId) return;
              await marketplace.startAnalysis(influencerId, videoCount);
              refresh();
            }}
          >
            {t.analysisJobs.start}
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">{t.analysisJobs.colInfluencer}</th>
              <th className="px-5 py-3">{t.analysisJobs.colVideos}</th>
              <th className="px-5 py-3">{t.analysisJobs.colSource}</th>
              <th className="px-5 py-3">{t.analysisJobs.colStatus}</th>
              <th className="px-5 py-3">{t.analysisJobs.colProgress}</th>
              <th className="px-5 py-3">{t.analysisJobs.colStarted}</th>
              <th className="px-5 py-3">{t.analysisJobs.colResult}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {jobs.map((job) => {
              const inf = marketplace.getInfluencer(job.influencerId);
              return (
                <tr key={job.id}>
                  <td className="px-5 py-3 font-medium text-foreground">{inf?.name ?? job.influencerId}</td>
                  <td className="px-5 py-3">{job.videoCount}</td>
                  <td className="px-5 py-3 text-muted-foreground">{job.source}</td>
                  <td className="px-5 py-3"><Badge tone={job.status}>{job.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary" style={{ width: `${job.progress}%` }} />
                      </div>
                      <span className="tabular-nums text-xs text-muted-foreground">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDateTime(job.startedAt)}</td>
                  <td className="max-w-xs px-5 py-3 text-xs text-muted-foreground">
                    {job.error ? <span className="text-red-600">{job.error}</span> : job.resultSummary ?? t.common.emDash}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
