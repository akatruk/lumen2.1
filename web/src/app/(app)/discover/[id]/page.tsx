"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { discovery } from "@/services/discovery/discovery.service";
import { marketplace } from "@/services/marketplace";
import type { DiscoveryCandidate, Influencer, InfluencerDossier } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import { useToast } from "@/components/Toast";
import { formatDateTime, formatNumber, formatPercent, LANGUAGE_LABELS } from "@/lib/utils";

export default function DiscoverDossierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();
  const candidateId = decodeURIComponent(params.id ?? "");

  const [dossier, setDossier] = useState<InfluencerDossier | null>(null);
  const [catalogInfluencer, setCatalogInfluencer] = useState<Influencer | undefined>();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let candidate: DiscoveryCandidate | undefined;
        const last = discovery.getLastSearch();
        candidate = last?.results.find((c) => c.id === candidateId);

        const existing = discovery.getDossierByCandidateId(candidateId);
        if (existing && !candidate) {
          if (!cancelled) {
            setDossier(existing);
            if (existing.influencerId) {
              setCatalogInfluencer(marketplace.getInfluencer(existing.influencerId));
            }
          }
          return;
        }

        if (!candidate && existing) {
          candidate = {
            id: existing.candidateId,
            name: existing.identity.name,
            handle: existing.identity.handle,
            profileUrl: existing.identity.profileUrl,
            avatarInitials: existing.identity.avatarInitials,
            avatarColor: existing.identity.avatarColor,
            city: existing.identity.city,
            country: existing.identity.country,
            languages: existing.identity.languages,
            topics: existing.topics.map((t) => t.name),
            followers: existing.reach.followers,
            avgViews: existing.reach.avgViews,
            engagementRate: existing.reach.engagementRate,
            bio: existing.identity.bio,
            source: existing.source,
            collectedAt: existing.discoveredAt,
          };
        }

        if (!candidate) {
          throw new Error("Candidate not found. Run a search from Discover first.");
        }

        const d = await discovery.openDossier(candidate);
        if (cancelled) return;
        setDossier(d);
        if (d.influencerId) setCatalogInfluencer(marketplace.getInfluencer(d.influencerId));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to open dossier");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  async function onAnalyze() {
    if (!dossier) return;
    setAnalyzing(true);
    try {
      const next = await discovery.analyze(dossier.id);
      setDossier(next);
      push("Demo analysis complete — dossier updated");
    } catch (e) {
      push(e instanceof Error ? e.message : "Analyze failed", "err");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onSaveCatalog() {
    if (!dossier) return;
    setSaving(true);
    try {
      const inf = discovery.saveToCatalog(dossier.id);
      setCatalogInfluencer(inf);
      setDossier(discovery.getDossier(dossier.id) ?? dossier);
      push(`Added ${inf.name} to catalog`);
    } catch (e) {
      push(e instanceof Error ? e.message : "Save failed", "err");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Opening dossier…
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/discover")}>
          <ArrowLeft className="h-4 w-4" /> Back to Discover
        </Button>
        <Card className="p-5 text-sm text-destructive">{error ?? "Dossier missing"}</Card>
      </div>
    );
  }

  const d = dossier;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/discover")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ backgroundColor: d.identity.avatarColor }}
          >
            {d.identity.avatarInitials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{d.identity.name}</h1>
            <a
              href={d.identity.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-primary hover:underline"
            >
              {d.identity.handle}
            </a>
            <div className="mt-1 text-xs text-muted-foreground">
              {d.identity.city}, {d.identity.country} · source {d.source}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={d.analysisStatus === "ready" ? "Completed" : "Queued"}>
                analysis {d.analysisStatus}
              </Badge>
              {d.inCatalog ? <Badge tone="Active">In catalog</Badge> : <Badge>Not in catalog</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void onAnalyze()} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Analyze recent videos
          </Button>
          <Button size="sm" onClick={() => void onSaveCatalog()} disabled={saving || d.inCatalog}>
            {d.inCatalog ? "Already in catalog" : saving ? "Saving…" : "Add to catalog"}
          </Button>
        </div>
      </div>

      {catalogInfluencer ? (
        <Card className="p-4">
          <div className="mb-2 text-xs font-mono text-muted-foreground">Shortlist from catalog entry</div>
          <AddToShortlistButton influencer={catalogInfluencer} />
          <div className="mt-2">
            <Link href={`/influencers/${catalogInfluencer.id}`} className="text-xs text-primary hover:underline">
              Open full catalog profile →
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Identity" monoLabel="01" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <p className="text-muted-foreground">{d.identity.bio}</p>
            <div>
              Languages:{" "}
              {d.identity.languages.map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Discovered {formatDateTime(d.discoveredAt)}
              {d.lastAnalyzedAt ? ` · Analyzed ${formatDateTime(d.lastAnalyzedAt)}` : ""}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Reach" monoLabel="02" />
          <div className="grid grid-cols-2 gap-3 px-5 pb-5 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Followers</div>
              <div className="text-lg font-semibold tabular-nums">{formatNumber(d.reach.followers)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg views</div>
              <div className="text-lg font-semibold tabular-nums">{formatNumber(d.reach.avgViews)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Engagement</div>
              <div className="text-lg font-semibold tabular-nums">{formatPercent(d.reach.engagementRate)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Cadence</div>
              <div className="text-sm font-medium">{d.reach.postingFrequency}</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Brand / topics" monoLabel="03" subtitle="From discovery + analysis" />
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            {d.topics.length ? (
              d.topics.map((t) => (
                <Badge key={t.name} tone="Active">
                  {t.name} · {Math.round(t.confidence * 100)}%
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Run analysis to enrich topics.</span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Style" monoLabel="04" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <div>
              Formats:{" "}
              {d.style.formats.length ? d.style.formats.join(", ") : "—"}
            </div>
            <div>
              Tone: {d.style.tone.length ? d.style.tone.join(", ") : "—"}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Audience" monoLabel="05" />
          <div className="space-y-3 px-5 pb-5">
            {d.audience.length ? (
              d.audience.map((a) => (
                <div key={a.label} className="text-sm">
                  <div className="font-medium text-foreground">
                    {a.label}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      {Math.round(a.confidence * 100)}%
                    </span>
                  </div>
                  {a.evidence ? <div className="text-xs text-muted-foreground">{a.evidence}</div> : null}
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">Audience signals appear after analysis.</span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Brand safety" monoLabel="06" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <Badge tone={d.brandSafety.status}>{d.brandSafety.status}</Badge>
            <p className="text-muted-foreground">{d.brandSafety.notes}</p>
            {d.brandSafety.flags.length ? (
              <div className="flex flex-wrap gap-1">
                {d.brandSafety.flags.map((f) => (
                  <Badge key={f} tone="review">
                    {f}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Evidence" monoLabel="07" subtitle="Recent TikTok stubs (demo connector)" />
        <div className="divide-y divide-border/40">
          {d.evidence.length ? (
            d.evidence.map((e) => (
              <div key={e.videoId} className="px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={e.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                    {e.title}
                  </a>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatNumber(e.views)} views
                  </span>
                </div>
                {e.quote ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.timestamp ? `[${e.timestamp}] ` : ""}
                    {e.quote}
                  </p>
                ) : null}
                {e.analysis ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {e.analysis.topics.map((t) => (
                      <Badge key={t.name}>{t.name}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-muted-foreground">No evidence yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
