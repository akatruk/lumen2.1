import type {
  LanguageCode,
  Platform,
  ProductResumeCard,
  ProductScanMaterials,
} from "@/types";

const OVERCLAIM_PATTERNS: { re: RegExp; claim: string }[] = [
  { re: /guaranteed\s+roi|risk[-\s]?free\s+invest/i, claim: "Guaranteed ROI / risk-free investment" },
  { re: /michelin\s+guaranteed|guaranteed\s+michelin/i, claim: "Michelin guaranteed" },
  { re: /healthiest|cures?|medical\s+treatment|whitening/i, claim: "Medical / whitening / healthiest claims" },
  { re: /visa\s+guarantee/i, claim: "Visa guarantee" },
];

function uniq(arr: string[]): string[] {
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
}

function clipPitch(s: string, max = 240): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function detectLangs(text: string): LanguageCode[] {
  const t = text.toLowerCase();
  const langs: LanguageCode[] = [];
  if (/\bth(ai)?\b|ภาษาไทย|bangkok|phuket|soi\s*11/.test(t)) langs.push("th");
  if (/\ben(g(lish)?)?\b|expat|english/.test(t)) langs.push("en");
  if (/\bru(ssian)?\b|русский/.test(t)) langs.push("ru");
  if (/\bzh|chinese|中文/.test(t)) langs.push("zh");
  if (!langs.length) return ["en", "th"];
  // th/en first
  const ordered: LanguageCode[] = [];
  for (const l of ["th", "en", "ru", "zh"] as LanguageCode[]) {
    if (langs.includes(l)) ordered.push(l);
  }
  return ordered;
}

function detectGeo(text: string): string[] {
  const t = text.toLowerCase();
  const geo: string[] = [];
  if (/bangkok|sukhumvit|soi\s*11|ari|thonglor/.test(t)) geo.push("Bangkok");
  if (/phuket|kata|patong/.test(t)) geo.push("Phuket");
  if (/chiang\s*mai/.test(t)) geo.push("Chiang Mai");
  if (/pattaya/.test(t)) geo.push("Pattaya");
  if (/samui/.test(t)) geo.push("Koh Samui");
  if (/thailand|thai\b/.test(t) && !geo.includes("Thailand")) geo.push("Thailand");
  if (!geo.length) geo.push("Thailand");
  return uniq(geo);
}

function detectTopics(text: string, photos: string[]): string[] {
  const blob = `${text} ${photos.join(" ")}`.toLowerCase();
  const topics: string[] = [];
  const map: [RegExp, string][] = [
    [/food|restaurant|kitchen|menu|pad\s*kra|eats|dining|cuisine/, "food"],
    [/nightlife|cocktail|bar|late[\s-]?night|club/, "nightlife"],
    [/bangkok|sukhumvit|soi/, "bangkok"],
    [/travel|tour|island|beach/, "travel"],
    [/skincare|serum|beauty|glow/, "skincare"],
    [/beauty|makeup|grwm/, "beauty"],
    [/fitness|gym|yoga|hiit/, "fitness"],
    [/real\s*estate|condo|property|invest/, "real estate"],
    [/lifestyle/, "lifestyle"],
    [/wellness/, "wellness"],
  ];
  for (const [re, topic] of map) {
    if (re.test(blob)) topics.push(topic);
  }
  if (!topics.length) topics.push("lifestyle");
  return uniq(topics).slice(0, 6);
}

function detectOverclaims(text: string): string[] {
  return OVERCLAIM_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.claim);
}

function looksLikeSoi11(text: string): boolean {
  return /soi\s*11|bangkok\s*bites|pad\s*kra\s*pao|sukhumvit\s*soi\s*11/i.test(text);
}

function soi11Card(extraNotes: string[]): ProductResumeCard {
  return {
    name: "Soi 11 Thai Kitchen",
    brand: "Bangkok Bites Co.",
    category: "Restaurant",
    pitch:
      "Modern Thai shareable plates and craft cocktails on Sukhumvit Soi 11 — walk-in friendly late-night dining for locals, expats, and tourists.",
    geography: ["Bangkok"],
    audience: "Foodies, expats, young professionals, tourists 22–40",
    languages: ["th", "en"],
    benefits: ["Signature pad kra pao", "Open kitchen", "Walk-in friendly", "Late hours", "Shareable plates"],
    prohibited_claims: ["Healthiest Thai food", "Michelin guaranteed"],
    desired_topics: ["food", "nightlife", "bangkok", "lifestyle"],
    tone: ["authentic", "energetic", "local"],
    platforms: ["tiktok"],
    budget: { type: "barter", notes: "Soft-opening hospitality / TBD fee" },
    success_metrics: ["views", "likes", "comments", "foot traffic", "promo redemptions"],
    confidence: 0.92,
    missing_fields: [],
    evidence_notes: ["Matched known Soi 11 / Bangkok Bites pilot materials", ...extraNotes],
    scannedAt: new Date().toISOString(),
    sourceMode: "demo-scan",
  };
}

function emptyMissing(card: Partial<ProductResumeCard>): string[] {
  const missing: string[] = [];
  if (!card.name) missing.push("name");
  if (!card.brand) missing.push("brand");
  if (!card.category) missing.push("category");
  if (!card.pitch) missing.push("pitch");
  if (!card.audience) missing.push("audience");
  if (!card.budget || card.budget.type === "unknown") missing.push("budget");
  return missing;
}

/**
 * Demo Product Scan — heuristic extract (no live LLM / no scraping).
 * Swap later for real LLM behind PRODUCT_SCAN_MODE=live.
 */
export const productScan = {
  async scan(materials: ProductScanMaterials): Promise<ProductResumeCard> {
    await new Promise((r) => setTimeout(r, 500 + Math.floor(Math.random() * 400)));

    const url = materials.url?.trim() ?? "";
    const brief = materials.briefText?.trim() ?? "";
    const notes = materials.notes?.trim() ?? "";
    const photos = materials.photoNames ?? [];
    const blob = [url, brief, notes, ...photos].join("\n");

    const evidence: string[] = [];
    if (url) evidence.push(`URL provided: ${url}`);
    if (brief) evidence.push(`Brief length: ${brief.length} chars`);
    if (photos.length) evidence.push(`Photos: ${photos.slice(0, 5).join(", ")}`);

    if (looksLikeSoi11(blob)) {
      return soi11Card(evidence);
    }

    const geography = detectGeo(blob);
    const desired_topics = detectTopics(blob, photos);
    const languages = detectLangs(blob);
    const prohibited = detectOverclaims(blob);

    // Name/brand heuristics
    let name = "";
    let brand = "";
    let category = "Product";

    const nameFromBrief = brief.split(/[.\n]/)[0]?.trim() ?? "";
    if (nameFromBrief && nameFromBrief.length < 80) name = nameFromBrief;

    try {
      if (url) {
        const u = new URL(url.startsWith("http") ? url : `https://${url}`);
        brand = u.hostname.replace(/^www\./, "").split(".")[0] ?? "";
        if (brand) brand = brand.charAt(0).toUpperCase() + brand.slice(1);
      }
    } catch {
      /* ignore */
    }

    if (/restaurant|kitchen|cafe|food|menu/i.test(blob)) category = "Restaurant";
    else if (/serum|skincare|beauty/i.test(blob)) category = "Skincare";
    else if (/condo|property|real estate/i.test(blob)) category = "Real Estate";
    else if (/tour|island|day tour/i.test(blob)) category = "Tourism";
    else if (/gym|fitness|pass/i.test(blob)) category = "Fitness";

    if (!name) {
      name =
        desired_topics.includes("food") && geography.includes("Bangkok")
          ? "Bangkok food offer"
          : brand
            ? `${brand} offer`
            : "Untitled product";
    }
    if (!brand) brand = "Unknown brand";

    const benefits = uniq(
      [
        ...desired_topics.slice(0, 2).map((t) => `Strong ${t} angle`),
        geography[0] ? `Local to ${geography[0]}` : "",
        photos.length ? "Visual assets provided" : "",
      ].filter(Boolean),
    ).slice(0, 5);

    const pitch = clipPitch(
      brief ||
        `${name} by ${brand} — ${category.toLowerCase()} focused on ${desired_topics.slice(0, 2).join(" & ") || "lifestyle"} in ${geography.join(", ")}.`,
    );

    const platforms: Platform[] = ["tiktok"];
    if (/instagram/i.test(blob)) platforms.push("instagram");
    if (/youtube/i.test(blob)) platforms.push("youtube");

    const card: ProductResumeCard = {
      name,
      brand,
      category,
      pitch,
      geography,
      audience: /expat|tourist|foodie/i.test(blob)
        ? "Inferred from brief: foodies / travelers / locals (refine manually)"
        : "",
      languages,
      benefits,
      prohibited_claims: prohibited,
      desired_topics,
      tone: desired_topics.includes("nightlife") ? ["energetic", "social"] : ["authentic"],
      platforms: uniq(platforms) as Platform[],
      budget: { type: "unknown", notes: "" },
      success_metrics: ["views", "likes", "comments"],
      confidence: 0,
      missing_fields: [],
      evidence_notes: evidence.length ? evidence : ["Sparse materials — card is low confidence"],
      scannedAt: new Date().toISOString(),
      sourceMode: "demo-scan",
    };

    card.missing_fields = emptyMissing(card);
    const filled = 12 - card.missing_fields.length;
    card.confidence = Math.max(0.35, Math.min(0.88, filled / 12 + (brief.length > 80 ? 0.1 : 0)));

    return card;
  },

  /** Map card → product fields for create/update */
  toProductFields(card: ProductResumeCard) {
    return {
      name: card.name,
      brand: card.brand,
      category: card.category,
      description: card.pitch,
      imageEmoji:
        card.category === "Restaurant"
          ? "🍜"
          : card.category === "Skincare"
            ? "✨"
            : card.category === "Real Estate"
              ? "🏢"
              : "📦",
      priceLabel: card.budget.type === "unknown" ? "TBD" : card.budget.notes || card.budget.type,
      geography: card.geography,
      audience: card.audience || "TBD",
      languages: card.languages,
      benefits: card.benefits,
      prohibitedClaims: card.prohibited_claims,
      desiredTopics: card.desired_topics,
      platforms: card.platforms,
      resumeCard: card,
    };
  },
};
