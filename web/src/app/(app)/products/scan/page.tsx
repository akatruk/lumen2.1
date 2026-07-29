"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { productScan } from "@/services/product-scan.service";
import { marketplace } from "@/services/marketplace";
import type { LanguageCode, Platform, ProductResumeCard } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";

const SHANGHAI_SAMPLE = {
  url: "https://maps.example.com/shanghai-east-bund-kitchen",
  briefText:
    "Shanghai Bistro by East Bund Kitchen. Modern Shanghainese restaurant near Lujiazui. Shareable plates, craft cocktails, late-night dining. Signature xiaolongbao. Targeting foodies and young professionals 22–40. Chinese. Soft opening barter OK. Want Douyin food creators in Shanghai.",
  photoNames: ["xiaolongbao.jpg", "open-kitchen.jpg", "lujiazui-storefront.jpg"],
};

export default function ProductScanPage() {
  const router = useRouter();
  const { push } = useToast();
  const [url, setUrl] = useState("");
  const [briefText, setBriefText] = useState("");
  const [photoNames, setPhotoNames] = useState("");
  const [notes, setNotes] = useState("");
  const [scanning, setScanning] = useState(false);
  const [card, setCard] = useState<ProductResumeCard | null>(null);

  const photoList = useMemo(
    () =>
      photoNames
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [photoNames],
  );

  async function runScan() {
    setScanning(true);
    try {
      const next = await productScan.scan({
        url: url.trim() || undefined,
        briefText: briefText.trim() || undefined,
        photoNames: photoList,
        notes: notes.trim() || undefined,
      });
      setCard(next);
      push("Resume card ready — review and save");
    } catch (e) {
      push(e instanceof Error ? e.message : "Scan failed", "err");
    } finally {
      setScanning(false);
    }
  }

  function loadShanghaiSample() {
    setUrl(SHANGHAI_SAMPLE.url);
    setBriefText(SHANGHAI_SAMPLE.briefText);
    setPhotoNames(SHANGHAI_SAMPLE.photoNames.join(", "));
    setNotes("China F&B pilot sample");
  }

  function updateCard<K extends keyof ProductResumeCard>(key: K, value: ProductResumeCard[K]) {
    if (!card) return;
    setCard({ ...card, [key]: value, sourceMode: "manual" });
  }

  async function saveNew() {
    if (!card) return;
    const product = await marketplace.createProductFromCardAsync(card);
    push(`Saved ${product.name}`);
    router.push(`/products/${product.id}`);
  }

  async function saveAndDiscover() {
    if (!card) return;
    const product = await marketplace.createProductFromCardAsync(card);
    push(`Saved ${product.name} — opening Discover`);
    router.push(`/discover?productId=${product.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Product scan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drop URL / brief / photo names → AI resume card for Discover match.
          </p>
        </div>
        <Badge tone="Queued">
          {(process.env.NEXT_PUBLIC_PRODUCT_SCAN_MODE ?? "demo") === "live" ? "Live LLM scan" : "Demo scan"}
        </Badge>
      </div>

      <Card>
        <CardHeader title="Materials" monoLabel="01" subtitle="Extract-only · no live scraping" />
        <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Product / page URL">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://… or Google Maps link"
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Brief text">
              <Textarea
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                placeholder="Describe the product, audience, geo, tone, prohibitions…"
                rows={6}
              />
            </Field>
          </div>
          <Field label="Photo file names (comma-separated)">
            <Input
              value={photoNames}
              onChange={(e) => setPhotoNames(e.target.value)}
              placeholder="menu.jpg, storefront.png"
            />
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" />
          </Field>
        </div>
        <div className="flex flex-col gap-2 border-t border-border/40 px-5 py-4 sm:flex-row sm:flex-wrap">
          <Button
            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
            onClick={() => void runScan()}
            disabled={scanning || (!url && !briefText && !photoList.length)}
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Scan → resume card
          </Button>
          <Button variant="secondary" className="min-h-11 w-full sm:min-h-0 sm:w-auto" onClick={loadShanghaiSample}>
            Load Shanghai sample
          </Button>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="ghost" className="min-h-11 w-full sm:min-h-0">Back to products</Button>
          </Link>
        </div>
      </Card>

      {card ? (
        <Card>
          <CardHeader
            title="Resume card"
            monoLabel="02"
            subtitle={`${card.sourceMode ?? "demo-scan"}`}
            action={
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button size="sm" variant="secondary" className="min-h-11 w-full sm:min-h-0 sm:w-auto" onClick={() => void saveNew()}>
                  Save product
                </Button>
                <Button size="sm" className="min-h-11 w-full sm:min-h-0 sm:w-auto" onClick={() => void saveAndDiscover()}>
                  Save & Discover matches
                </Button>
              </div>
            }
          />

          <div className="space-y-5 px-5 py-4">
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-primary">Decision</h3>
                <Badge tone={card.confidence >= 0.75 ? "Active" : card.confidence >= 0.5 ? "Reviewing" : "Queued"}>
                  conf {Math.round(card.confidence * 100)}%
                </Badge>
              </div>
              <div className="md:col-span-2">
                <Field label="Pitch (≤240)">
                  <Textarea
                    value={card.pitch}
                    onChange={(e) => updateCard("pitch", e.target.value.slice(0, 240))}
                    rows={3}
                  />
                </Field>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">{card.pitch.length}/240</div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Desired topics">
                  <Input
                    value={card.desired_topics.join(", ")}
                    onChange={(e) =>
                      updateCard(
                        "desired_topics",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </Field>
                <Field label="Geography (comma)">
                  <Input
                    value={card.geography.join(", ")}
                    onChange={(e) =>
                      updateCard(
                        "geography",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Prohibited claims">
                    <Textarea
                      value={card.prohibited_claims.join("\n")}
                      onChange={(e) =>
                        updateCard(
                          "prohibited_claims",
                          e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                        )
                      }
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
              {(card.missing_fields.length > 0 || card.evidence_notes.length > 0) && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  {card.missing_fields.length ? (
                    <div>
                      Missing:{" "}
                      {card.missing_fields.map((m) => (
                        <Badge key={m} className="mr-1">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <ul className="list-disc pl-4">
                    {card.evidence_notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <details className="group rounded border border-border/50 open:bg-muted/20">
              <summary className="cursor-pointer list-none px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <span className="text-primary group-open:rotate-90 transition-transform">▸</span>
                  Details — name, budget, tone, metrics
                </span>
              </summary>
              <div className="grid gap-4 border-t border-border/40 px-4 py-4 md:grid-cols-2">
                <Field label="Name">
                  <Input value={card.name} onChange={(e) => updateCard("name", e.target.value)} />
                </Field>
                <Field label="Brand">
                  <Input value={card.brand} onChange={(e) => updateCard("brand", e.target.value)} />
                </Field>
                <Field label="Category">
                  <Input value={card.category} onChange={(e) => updateCard("category", e.target.value)} />
                </Field>
                <Field label="Audience">
                  <Input value={card.audience} onChange={(e) => updateCard("audience", e.target.value)} />
                </Field>
                <Field label="Languages (th,en,…)">
                  <Input
                    value={card.languages.join(",")}
                    onChange={(e) =>
                      updateCard(
                        "languages",
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean) as LanguageCode[],
                      )
                    }
                  />
                </Field>
                <Field label="Tone">
                  <Input
                    value={card.tone.join(", ")}
                    onChange={(e) =>
                      updateCard(
                        "tone",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </Field>
                <Field label="Benefits">
                  <Textarea
                    value={card.benefits.join("\n")}
                    onChange={(e) =>
                      updateCard(
                        "benefits",
                        e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 5),
                      )
                    }
                    rows={4}
                  />
                </Field>
                <Field label="Platforms">
                  <Select
                    value={card.platforms[0] ?? "douyin"}
                    onChange={(e) => updateCard("platforms", [e.target.value as Platform])}
                  >
                    <option value="douyin">Douyin</option>
                    <option value="tiktok">TikTok (intl)</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                  </Select>
                </Field>
                <Field label="Budget type">
                  <Select
                    value={card.budget.type}
                    onChange={(e) =>
                      updateCard("budget", {
                        ...card.budget,
                        type: e.target.value as ProductResumeCard["budget"]["type"],
                      })
                    }
                  >
                    <option value="unknown">unknown</option>
                    <option value="barter">barter</option>
                    <option value="fixed">fixed</option>
                    <option value="range">range</option>
                  </Select>
                </Field>
                <Field label="Budget notes">
                  <Input
                    value={card.budget.notes}
                    onChange={(e) => updateCard("budget", { ...card.budget, notes: e.target.value })}
                  />
                </Field>
                <Field label="Success metrics">
                  <Input
                    value={card.success_metrics.join(", ")}
                    onChange={(e) =>
                      updateCard(
                        "success_metrics",
                        e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      )
                    }
                  />
                </Field>
              </div>
            </details>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
