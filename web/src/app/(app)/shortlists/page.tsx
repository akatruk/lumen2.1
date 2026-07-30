"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { marketplace } from "@/services/marketplace";
import type { Influencer, Shortlist } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { MatchScore } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { formatNumber, formatPercent } from "@/lib/utils";
import { fill, useI18n } from "@/lib/i18n";

export default function ShortlistsPage() {
  const { t } = useI18n();
  const [lists, setLists] = useState<Shortlist[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const refresh = () => {
    const data = marketplace.listShortlists();
    setLists(data);
    setSelectedId((prev) => prev || data[0]?.id || "");
  };

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => refresh());
  }, []);

  const selected = useMemo(() => lists.find((l) => l.id === selectedId), [lists, selectedId]);
  const influencers = useMemo(() => {
    if (!selected) return [] as Influencer[];
    return selected.items
      .map((item) => marketplace.getInfluencer(item.influencerId))
      .filter(Boolean) as Influencer[];
  }, [selected]);

  const compareSet = influencers.filter((i) => compareIds.includes(i.id)).slice(0, 4);

  useEffect(() => {
    if (selected) setNotes(selected.notes);
  }, [selected]);

  const compareRows = [
    { label: t.shortlists.matchScore, fn: (i: Influencer) => String(i.matchScore) },
    { label: t.shortlists.city, fn: (i: Influencer) => i.city },
    { label: t.shortlists.followers, fn: (i: Influencer) => formatNumber(i.followers) },
    { label: t.shortlists.engagement, fn: (i: Influencer) => formatPercent(i.engagementRate) },
    { label: t.shortlists.languages, fn: (i: Influencer) => i.languages.join(", ").toUpperCase() },
    { label: t.shortlists.topics, fn: (i: Influencer) => i.topics.slice(0, 3).join(", ") },
    { label: t.shortlists.safety, fn: (i: Influencer) => i.brandSafety.status },
    { label: t.shortlists.style, fn: (i: Influencer) => i.contentStyle.join(", ") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t.shortlists.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.shortlists.subtitle}</p>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap gap-3">
          <Input className="w-full max-w-xs" placeholder={t.shortlists.newNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} />
          <Button
            size="sm"
            onClick={() => {
              if (!name.trim()) return;
              void marketplace.createShortlistAsync({ name: name.trim() }).then((created) => {
                setName("");
                refresh();
                setSelectedId(created.id);
              });
            }}
          >
            {t.shortlists.create}
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title={t.shortlists.yourLists} />
          <div className="divide-y divide-border/40">
            {lists.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setSelectedId(l.id);
                  setCompareIds([]);
                }}
                className={`block w-full px-5 py-3 text-left hover:bg-muted ${selectedId === l.id ? "bg-primary/10" : ""}`}
              >
                <div className="text-sm font-medium text-foreground">{l.name}</div>
                <div className="text-xs text-muted-foreground">
                  {fill(t.shortlists.nCreators, { n: l.items.length })}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title={selected?.name ?? t.shortlists.select}
            subtitle={
              selected
                ? fill(t.shortlists.linkedMeta, {
                    product: selected.productId ?? t.common.emDash,
                    campaign: selected.campaignId ?? t.common.emDash,
                  })
                : undefined
            }
          />
          {!selected ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">{t.shortlists.noneSelected}</div>
          ) : (
            <div className="space-y-4 px-5 py-4">
              <div className="space-y-2">
                {selected.items.map((item) => {
                  const inf = marketplace.getInfluencer(item.influencerId);
                  if (!inf) return null;
                  const checked = compareIds.includes(inf.id);
                  return (
                    <div key={item.influencerId} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setCompareIds((prev) => {
                                if (e.target.checked) return [...prev, inf.id].slice(0, 4);
                                return prev.filter((id) => id !== inf.id);
                              });
                            }}
                            aria-label={fill(t.shortlists.compareAria, { name: inf.name })}
                          />
                          <Link href={`/influencers/${inf.id}`} className="text-sm font-medium text-primary hover:underline">
                            {inf.name}
                          </Link>
                          <MatchScore score={inf.matchScore} size="sm" />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            void marketplace.removeFromShortlistAsync(selected.id, inf.id).then(() => refresh());
                          }}
                        >
                          {t.common.remove}
                        </Button>
                      </div>
                      <Input
                        className="mt-2"
                        value={item.note}
                        placeholder={t.shortlists.internalNote}
                        onChange={(e) => {
                          marketplace.updateShortlistItemNote(selected.id, inf.id, e.target.value);
                          refresh();
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <Field label={t.shortlists.notes}>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => {
                    void marketplace.updateShortlistAsync(selected.id, { notes }).then(() => refresh());
                  }}
                />
              </Field>
            </div>
          )}
        </Card>
      </div>

      {compareSet.length >= 2 ? (
        <Card>
          <CardHeader
            title={t.shortlists.compare}
            subtitle={fill(t.shortlists.nSelected, { n: compareSet.length })}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">{t.shortlists.signal}</th>
                  {compareSet.map((inf) => (
                    <th key={inf.id} className="px-4 py-3">{inf.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {compareRows.map(({ label, fn }) => (
                  <tr key={label}>
                    <td className="px-4 py-3 font-medium text-foreground">{label}</td>
                    {compareSet.map((inf) => (
                      <td key={inf.id} className="px-4 py-3 text-muted-foreground">
                        {fn(inf)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">{t.shortlists.compareHint}</p>
      )}
    </div>
  );
}
