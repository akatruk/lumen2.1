"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { discovery } from "@/services/discovery/discovery.service";
import { marketplace } from "@/services/marketplace";
import type { DiscoveryCandidate, Influencer, InfluencerDossier } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AddToShortlistButton } from "@/components/AddToShortlistButton";
import { useToast } from "@/components/Toast";
import { fill, useI18n } from "@/lib/i18n";
import { formatDateTime, formatNumber, formatPercent, LANGUAGE_LABELS } from "@/lib/utils";

function analysisStatusLabel(status: string, t: ReturnType<typeof useI18n>["t"]): string {
  const map: Record<string, string> = {
    idle: t.common.statusQueued,
    running: t.common.statusQueued,
    ready: t.common.statusCompleted,
    failed: t.common.statusFailed,
  };
  return map[status] ?? status;
}

export default function DiscoverDossierPage() {
  const { t } = useI18n();
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

  const discoveredAtLine = useMemo(() => {
    if (!dossier) return "";
    const discovered = formatDateTime(dossier.discoveredAt);
    if (dossier.lastAnalyzedAt) {
      return fill(t.discover.discoveredAnalyzed, {
        discovered,
        analyzed: formatDateTime(dossier.lastAnalyzedAt),
      });
    }
    return fill(t.discover.discoveredAnalyzed, { discovered, analyzed: "" }).replace(
      /\s*[·]\s*(Analyzed|分析于)\s*$/,
      "",
    );
  }, [dossier, t]);

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
            topics: existing.topics.map((topic) => topic.name),
            followers: existing.reach.followers,
            avgViews: existing.reach.avgViews,
            engagementRate: existing.reach.engagementRate,
            bio: existing.identity.bio,
            source: existing.source,
            collectedAt: existing.discoveredAt,
          };
        }

        if (!candidate) {
          throw new Error(t.discover.errCandidateNotFound);
        }

        const d = await discovery.openDossier(candidate);
        if (cancelled) return;
        setDossier(d);
        if (d.influencerId) setCatalogInfluencer(marketplace.getInfluencer(d.influencerId));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : t.discover.errOpenDossier);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [candidateId, t]);

  async function onAnalyze() {
    if (!dossier) return;
    setAnalyzing(true);
    try {
      const next = await discovery.analyze(dossier.id);
      setDossier(next);
      push(t.discover.toastDemoAnalysis);
    } catch (e) {
      push(e instanceof Error ? e.message : t.discover.toastAnalyzeFailed, "err");
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
      push(fill(t.discover.toastAdded, { name: inf.name }));
    } catch (e) {
      push(e instanceof Error ? e.message : t.discover.toastSaveFailed, "err");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {t.discover.opening}
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/discover")}>
          <ArrowLeft className="h-4 w-4" /> {t.discover.backToDiscover}
        </Button>
        <Card className="p-5 text-sm text-destructive">{error ?? t.discover.dossierMissing}</Card>
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
              {d.identity.city}, {d.identity.country} · {fill(t.discover.source, { source: d.source })}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone={d.analysisStatus === "ready" ? "Completed" : "Queued"}>
                {fill(t.discover.analysisStatus, {
                  status: analysisStatusLabel(d.analysisStatus, t),
                })}
              </Badge>
              {d.inCatalog ? (
                <Badge tone="Active">{t.discover.inCatalog}</Badge>
              ) : (
                <Badge>{t.discover.notInCatalog}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void onAnalyze()} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t.discover.analyzeVideos}
          </Button>
          <Button size="sm" onClick={() => void onSaveCatalog()} disabled={saving || d.inCatalog}>
            {d.inCatalog ? t.discover.alreadyInCatalog : saving ? t.discover.saving : t.discover.addToCatalog}
          </Button>
        </div>
      </div>

      {catalogInfluencer ? (
        <Card className="p-4">
          <div className="mb-2 text-xs font-mono text-muted-foreground">{t.discover.shortlistFromCatalog}</div>
          <AddToShortlistButton influencer={catalogInfluencer} />
          <div className="mt-2">
            <Link href={`/influencers/${catalogInfluencer.id}`} className="text-xs text-primary hover:underline">
              {t.discover.openFullProfile}
            </Link>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t.discover.identity} monoLabel="01" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <p className="text-muted-foreground">{d.identity.bio}</p>
            <div>
              {t.discover.languages}{" "}
              {d.identity.languages.map((l) => LANGUAGE_LABELS[l] ?? l).join(", ")}
            </div>
            <div className="font-mono text-xs text-muted-foreground">{discoveredAtLine}</div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t.discover.reach} monoLabel="02" />
          <div className="grid grid-cols-2 gap-3 px-5 pb-5 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">{t.common.followers}</div>
              <div className="text-lg font-semibold tabular-nums">{formatNumber(d.reach.followers)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.discover.avgViews}</div>
              <div className="text-lg font-semibold tabular-nums">{formatNumber(d.reach.avgViews)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.common.engagement}</div>
              <div className="text-lg font-semibold tabular-nums">{formatPercent(d.reach.engagementRate)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{t.discover.cadence}</div>
              <div className="text-sm font-medium">{d.reach.postingFrequency}</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t.discover.brandTopics} monoLabel="03" subtitle={t.discover.fromDiscovery} />
          <div className="flex flex-wrap gap-2 px-5 pb-5">
            {d.topics.length ? (
              d.topics.map((topic) => (
                <Badge key={topic.name} tone="Active">
                  {topic.name} · {Math.round(topic.confidence * 100)}%
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{t.discover.runAnalysisTopics}</span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.discover.style} monoLabel="04" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <div>
              {t.discover.formats}{" "}
              {d.style.formats.length ? d.style.formats.join(", ") : t.common.emDash}
            </div>
            <div>
              {t.discover.tone} {d.style.tone.length ? d.style.tone.join(", ") : t.common.emDash}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t.discover.audience} monoLabel="05" />
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
              <span className="text-sm text-muted-foreground">{t.discover.audienceAfterAnalysis}</span>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title={t.discover.brandSafety} monoLabel="06" />
          <div className="space-y-2 px-5 pb-5 text-sm">
            <Badge tone={d.brandSafety.status}>
              {d.brandSafety.status === "unknown"
                ? t.common.statusPendingReview.toUpperCase()
                : d.brandSafety.status}
            </Badge>
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
        <CardHeader
          title={t.discover.evidence}
          monoLabel="07"
          subtitle={d.source === "tikhub" ? t.discover.evidenceLive : t.discover.evidenceDemo}
        />
        <div className="divide-y divide-border/40">
          {d.evidence.length ? (
            d.evidence.map((e) => (
              <div key={e.videoId} className="px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={e.url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                    {e.title}
                  </a>
                  <span className="font-mono text-xs text-muted-foreground">
                    {fill(t.discover.nViews, { n: formatNumber(e.views) })}
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
                    {e.analysis.topics.map((topic) => (
                      <Badge key={topic.name}>{topic.name}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="px-5 py-4 text-sm text-muted-foreground">{t.discover.noEvidence}</div>
          )}
        </div>
      </Card>
    </div>
  );
}
