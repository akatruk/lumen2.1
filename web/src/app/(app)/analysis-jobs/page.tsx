"use client";

import { useEffect, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { AnalysisJob, Influencer } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";

export default function AnalysisJobsPage() {
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
        <h1 className="text-2xl font-semibold text-slate-900">Analysis Jobs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Demo queue for Lumen video analysis. No real social scraping.
        </p>
      </div>

      <Card>
        <CardHeader title="Start demo analysis" subtitle="Uses mock Lumen Analysis client" />
        <div className="flex flex-wrap items-end gap-3 px-5 py-4">
          <Field label="Influencer">
            <Select className="min-w-56" value={influencerId} onChange={(e) => setInfluencerId(e.target.value)}>
              {influencers.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Videos">
            <Select className="w-28" value={String(videoCount)} onChange={(e) => setVideoCount(Number(e.target.value))}>
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </Field>
          <Button
            onClick={async () => {
              if (!influencerId) return;
              await marketplace.startAnalysis(influencerId, videoCount);
              refresh();
            }}
          >
            Start Analysis
          </Button>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Influencer</th>
              <th className="px-5 py-3">Videos</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3">Started</th>
              <th className="px-5 py-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((job) => {
              const inf = marketplace.getInfluencer(job.influencerId);
              return (
                <tr key={job.id}>
                  <td className="px-5 py-3 font-medium text-slate-900">{inf?.name ?? job.influencerId}</td>
                  <td className="px-5 py-3">{job.videoCount}</td>
                  <td className="px-5 py-3 text-slate-600">{job.source}</td>
                  <td className="px-5 py-3"><Badge tone={job.status}>{job.status}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-teal-600" style={{ width: `${job.progress}%` }} />
                      </div>
                      <span className="tabular-nums text-xs text-slate-500">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDateTime(job.startedAt)}</td>
                  <td className="max-w-xs px-5 py-3 text-xs text-slate-600">
                    {job.error ? <span className="text-red-600">{job.error}</span> : job.resultSummary ?? "—"}
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
