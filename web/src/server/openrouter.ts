import "server-only";
import type { ProductResumeCard, ProductScanMaterials, LanguageCode, Platform } from "@/types";
import { openrouterConfig } from "./env";
import {
  calibrateResumeConfidence,
  extractProhibitionsFromBrief,
  uniqStrings,
} from "@/lib/product-claims";

const SYSTEM = `You extract a Product Resume Card for an influencer marketplace (Thailand pilot).
Return ONLY valid JSON matching this schema:
{
  "name": string,
  "brand": string,
  "category": string,
  "pitch": string (max 240 chars),
  "geography": string[],
  "audience": string,
  "languages": ("th"|"en"|"ru"|"zh")[],
  "benefits": string[] (max 5),
  "prohibited_claims": string[],
  "desired_topics": string[],
  "tone": string[],
  "platforms": ("tiktok"|"instagram"|"youtube")[],
  "budget": { "type": "unknown"|"barter"|"fixed"|"range", "notes": string },
  "success_metrics": string[],
  "confidence": number (0-1),
  "missing_fields": string[],
  "evidence_notes": string[]
}
Rules: extract, do not invent prices/ROI/medical/Michelin guarantees. Prefer th+en languages. Default platform tiktok.
Always copy explicit prohibitions from the brief (e.g. "Prohibitions:", "no medical claims", "no competitor…") into prohibited_claims — never drop them.
Unknown → missing_fields + lower confidence. Confidence must reflect completeness (rich brief with name/brand/geo/topics/prohibitions → typically 0.75–0.9).`;

function clipPitch(s: string, max = 240): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean)
    : [];
}

function normalizeCard(raw: Record<string, unknown>, materials: ProductScanMaterials): ProductResumeCard {
  const langs = asStringArray(raw.languages).filter((l): l is LanguageCode =>
    ["th", "en", "ru", "zh"].includes(l),
  );
  const platforms = asStringArray(raw.platforms).filter((p): p is Platform =>
    ["tiktok", "instagram", "youtube"].includes(p),
  );
  const budgetRaw = (raw.budget ?? {}) as Record<string, unknown>;
  const budgetType = String(budgetRaw.type ?? "unknown");
  const briefBlob = [materials.briefText, materials.notes, materials.url].filter(Boolean).join("\n");
  const prohibited = uniqStrings([
    ...asStringArray(raw.prohibited_claims),
    ...extractProhibitionsFromBrief(briefBlob),
  ]);

  const card: ProductResumeCard = {
    name: String(raw.name ?? "").trim() || "Untitled product",
    brand: String(raw.brand ?? "").trim() || "Unknown brand",
    category: String(raw.category ?? "").trim() || "Product",
    pitch: clipPitch(String(raw.pitch ?? materials.briefText ?? "")),
    geography: asStringArray(raw.geography).length ? asStringArray(raw.geography) : ["Thailand"],
    audience: String(raw.audience ?? "").trim(),
    languages: langs.length ? langs : ["en", "th"],
    benefits: asStringArray(raw.benefits).slice(0, 5),
    prohibited_claims: prohibited,
    desired_topics: asStringArray(raw.desired_topics).length
      ? asStringArray(raw.desired_topics)
      : ["lifestyle"],
    tone: asStringArray(raw.tone),
    platforms: platforms.length ? platforms : ["tiktok"],
    budget: {
      type: ["unknown", "barter", "fixed", "range"].includes(budgetType)
        ? (budgetType as ProductResumeCard["budget"]["type"])
        : "unknown",
      notes: String(budgetRaw.notes ?? ""),
    },
    success_metrics: asStringArray(raw.success_metrics).length
      ? asStringArray(raw.success_metrics)
      : ["views", "likes", "comments"],
    confidence: 0.55,
    missing_fields: asStringArray(raw.missing_fields),
    evidence_notes: asStringArray(raw.evidence_notes),
    scannedAt: new Date().toISOString(),
    sourceMode: "live-scan",
  };
  if (!card.audience) card.missing_fields = [...new Set([...card.missing_fields, "audience"])];
  if (card.budget.type === "unknown") {
    card.missing_fields = [...new Set([...card.missing_fields, "budget"])];
  }
  // Drop LLM "missing" noise for fields we already filled from materials.
  card.missing_fields = card.missing_fields.filter((f) => {
    if (f === "briefText" || f === "photoNames" || f === "notes") return false;
    return true;
  });

  const core = [
    card.name && card.name !== "Untitled product",
    card.brand && card.brand !== "Unknown brand",
    card.category && card.category !== "Product",
    Boolean(card.pitch),
    card.geography.length > 0,
    Boolean(card.audience),
    card.desired_topics.length > 0,
    card.languages.length > 0,
    card.benefits.length > 0,
    card.prohibited_claims.length > 0,
  ];
  card.confidence = calibrateResumeConfidence({
    llmConfidence: Number(raw.confidence),
    filledCoreFields: core.filter(Boolean).length,
    coreFieldCount: core.length,
    briefLength: (materials.briefText ?? "").length,
    prohibitedCount: card.prohibited_claims.length,
    photoCount: materials.photoNames?.length ?? 0,
    missingCount: card.missing_fields.length,
  });
  return card;
}

export async function scanProductWithLlm(materials: ProductScanMaterials): Promise<ProductResumeCard> {
  const { apiKey, baseUrl, model } = openrouterConfig();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not configured");

  const userPayload = {
    url: materials.url ?? null,
    briefText: materials.briefText ?? null,
    photoNames: materials.photoNames ?? [],
    notes: materials.notes ?? null,
  };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://lumen.marketplace.local",
      "X-Title": "Lumen Influencer Marketplace",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Extract Product Resume Card from these brand materials:\n${JSON.stringify(userPayload, null, 2)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 240) || res.statusText}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    throw new Error("OpenRouter returned non-JSON product card");
  }
  return normalizeCard(parsed, materials);
}
