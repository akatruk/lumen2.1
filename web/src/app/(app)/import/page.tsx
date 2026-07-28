"use client";

import { useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { ImportPreviewRow, Platform } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { PLATFORM_LABELS } from "@/lib/utils";

export default function ImportPage() {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [urls, setUrls] = useState("https://tiktok.com/@demo.bangkok\nhttps://tiktok.com/@demo.phuket");
  const [csv, setCsv] = useState("url\nhttps://instagram.com/demo.chiangmai\nhttps://instagram.com/demo.samui");
  const [videoCount, setVideoCount] = useState(5);
  const [preview, setPreview] = useState<ImportPreviewRow[]>([]);
  const [imported, setImported] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Import Influencers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo import only. No scraping — prepared for official APIs / approved providers.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Profile URLs" />
          <div className="space-y-4 px-5 py-4">
            <Field label="Platform">
              <Select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
              </Select>
            </Field>
            <Field label="Videos to analyze">
              <Select value={String(videoCount)} onChange={(e) => setVideoCount(Number(e.target.value))}>
                {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="One or more profile URLs">
              <Textarea value={urls} onChange={(e) => setUrls(e.target.value)} rows={6} />
            </Field>
            <Button
              onClick={() => {
                setPreview(marketplace.previewImport(urls.split("\n"), platform, videoCount));
                setImported(false);
              }}
            >
              Preview URLs
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="CSV upload (paste)" />
          <div className="space-y-4 px-5 py-4">
            <Field label="CSV with url column">
              <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setPreview(marketplace.parseCsv(csv, platform, videoCount));
                  setImported(false);
                }}
              >
                Preview CSV
              </Button>
              <label className="inline-flex">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    setCsv(text);
                    setPreview(marketplace.parseCsv(text, platform, videoCount));
                    setImported(false);
                  }}
                />
                <span className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                  Choose CSV file
                </span>
              </label>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Import preview"
          subtitle={preview.length ? `${preview.length} rows ready` : "Run a preview first"}
          action={
            <Button
              size="sm"
              disabled={!preview.length}
              onClick={async () => {
                for (const row of preview.slice(0, 3)) {
                  const match = marketplace
                    .listInfluencers()
                    .find((i) => i.platforms.some((p) => p.handle.toLowerCase().includes(row.handle.replace("@", "").toLowerCase())));
                  await marketplace.startAnalysis(match?.id ?? "inf-1", row.videosToAnalyze, "Import preview");
                }
                setImported(true);
              }}
            >
              Confirm demo import
            </Button>
          }
        />
        {imported ? (
          <div className="border-b border-emerald-100 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-800">
            Demo import accepted. Analysis jobs queued for up to 3 rows.
          </div>
        ) : null}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Platform</th>
                <th className="px-5 py-3">Handle</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3">Videos</th>
                <th className="px-5 py-3">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {preview.map((row) => (
                <tr key={row.url}>
                  <td className="px-5 py-3">{PLATFORM_LABELS[row.platform]}</td>
                  <td className="px-5 py-3">{row.handle}</td>
                  <td className="px-5 py-3 capitalize">{row.name}</td>
                  <td className="px-5 py-3">{row.city}</td>
                  <td className="px-5 py-3">{row.videosToAnalyze}</td>
                  <td className="max-w-xs truncate px-5 py-3 text-xs text-muted-foreground">{row.url}</td>
                </tr>
              ))}
              {!preview.length ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-muted-foreground">No preview rows yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
