import type { Influencer, LanguageCode, Product, ProductResumeCard } from "@/types";

/** Soft tokens that must not alone justify a catalog match. */
export const GENERIC_MATCH_TOKENS = new Set([
  "lifestyle",
  "family",
  "shopping",
  "shanghai",
  "beijing",
  "guangzhou",
  "shenzhen",
  "hangzhou",
  "chengdu",
  "china",
  "thailand",
  "bangkok",
  "phuket",
  "travel",
  "business",
  "platform",
  "social",
  "media",
  "video", // alone too broad; paired niches handled below
  "general",
  "product",
  "other",
]);

/**
 * Category / phrase → niche topic tokens.
 * Includes creator-tech / viral-script / MarTech language used by Lumen-like products.
 */
const CATEGORY_TOPIC_MAP: [RegExp, string[]][] = [
  // Content / viral-script AI first — so Lumen-like copy doesn't inherit gadget/SaaS bags.
  [
    /viral|script\s*analy|analyze\s*the\s*script|short[\s-]?video|douyin\s*tool|content\s*creat|creator\s*tool|video\s*edit|auto[\s-]?edit|ugc\s*tool|caption\s*ai|hook\s*analy|content\s*ai|script\s*ai|viral\s*video|ai\s*social|social\s*media\s*video/i,
    ["tech", "ai", "content", "viral", "script", "creator tools", "short video"],
  ],
  [
    /technolog|software|saas|artificial\s*intelligence|(?<![a-z])tech(?![a-z])|b2b\s*saas|martech|growth\s*ops|(?<![a-z])cloud(?![a-z])|devops|digital\s*product|(?<![a-z])startup(?![a-z])/i,
    ["tech", "technology", "saas", "software", "ai"],
  ],
  // Bare "AI" without viral/script context — still tech, not gadget.
  [/(?<![a-z])ai(?![a-z])/i, ["tech", "ai"]],
  [/(?<![a-z])gadget(?![a-z])|electronics?|(?<![a-z])iot(?![a-z])|数码|hardware/i, ["tech", "gadget"]],
  [/real\s*estate|property|condo(?:minium)?|apartment|住宅|房产|investors?/i, ["real estate", "investment", "property"]],
  [/restaurant|food|dining|cafe|厨房|美食|探店/i, ["food", "nightlife"]],
  [/skincare|beauty|serum|护肤|美妆/i, ["skincare", "beauty", "wellness"]],
  [/fitness|gym|yoga|健身/i, ["fitness", "wellness"]],
  [/tourism|(?<![a-z])tour(?![a-z])|旅行/i, ["travel"]],
];

const LANG_ALIASES: Record<string, LanguageCode> = {
  zh: "zh",
  chinese: "zh",
  "中文": "zh",
  en: "en",
  english: "en",
  th: "th",
  thai: "th",
  ru: "ru",
  russian: "ru",
};

function norm(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function uniqNorm(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const n = norm(v);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

export function isGenericToken(token: string): boolean {
  return GENERIC_MATCH_TOKENS.has(norm(token));
}

export function normalizeLanguageCodes(raw: string[]): LanguageCode[] {
  const out: LanguageCode[] = [];
  for (const r of raw) {
    const key = norm(r);
    const mapped = LANG_ALIASES[key] ?? LANG_ALIASES[key.split(/\s+/)[0] ?? ""];
    if (mapped && !out.includes(mapped)) out.push(mapped);
  }
  return out.length ? out : ["zh"];
}

export function topicsFromCategory(category: string): string[] {
  const c = category ?? "";
  for (const [re, topics] of CATEGORY_TOPIC_MAP) {
    if (re.test(c)) return [...topics];
  }
  return uniqNorm(c.split(/[\s/_-]+/).filter((w) => w.length > 2 && !isGenericToken(w)));
}

export function expandMatchTokens(raw: string[]): string[] {
  const out: string[] = [];
  for (const t of raw) {
    out.push(t);
    for (const [re, topics] of CATEGORY_TOPIC_MAP) {
      if (re.test(t)) out.push(...topics);
    }
  }
  return uniqNorm(out);
}

function extractTopicsFromBlob(blob: string): string[] {
  const out: string[] = [];
  for (const [re, topics] of CATEGORY_TOPIC_MAP) {
    if (re.test(blob)) out.push(...topics);
  }
  return uniqNorm(out);
}

function inferTechnologyCategory(niche: string[], category: string): string {
  const c = category.trim();
  const weak = !c || /^(general|product|other|未知|通用)$/i.test(c);
  const techish = niche.some((t) =>
    ["tech", "technology", "saas", "software", "ai", "gadget", "content", "viral", "script", "creator tools", "short video"].includes(
      t,
    ),
  );
  if (techish && weak) return "Technology";
  return c || (techish ? "Technology" : "General");
}

/** Product niche tokens for matching (structured topics + category; pitch via regex). */
export function productNicheTokens(product: Product): string[] {
  const card: ProductResumeCard | undefined = product.resumeCard;
  const structured = [
    ...(card?.desired_topics?.length ? card.desired_topics : product.desiredTopics ?? []),
    product.category,
    card?.category ?? "",
    ...(product.benefits ?? []),
  ];
  const blob = [
    product.name,
    product.brand,
    card?.pitch || product.description || "",
    product.audience || "",
    ...(product.benefits ?? []),
  ].join(" ");
  return uniqNorm([
    ...expandMatchTokens(structured),
    ...topicsFromCategory(product.category || card?.category || ""),
    ...extractTopicsFromBlob(blob),
  ]).filter((t) => !isGenericToken(t));
}

/**
 * Ensure manual / sparse product records still rank as Technology when copy is clearly tech/AI/viral-script.
 * Pure function — does not mutate storage.
 */
export function enrichProductForMatch(product: Product): Product {
  const niche = productNicheTokens(product);
  const category = inferTechnologyCategory(niche, product.category || product.resumeCard?.category || "");
  const desiredTopics = uniqNorm([...(product.desiredTopics ?? []), ...niche]).slice(0, 10);
  const languages = normalizeLanguageCodes(
    (product.resumeCard?.languages?.length ? product.resumeCard.languages : product.languages)?.map(String) ??
      [],
  );
  return {
    ...product,
    category,
    desiredTopics,
    languages,
    resumeCard: product.resumeCard
      ? {
          ...product.resumeCard,
          category: product.resumeCard.category || category,
          desired_topics: uniqNorm([
            ...(product.resumeCard.desired_topics ?? []),
            ...desiredTopics,
          ]).slice(0, 10),
          languages,
        }
      : product.resumeCard,
  };
}

export function productGenericTokens(product: Product): string[] {
  const card = product.resumeCard;
  const raw = [
    ...(card?.desired_topics?.length ? card.desired_topics : product.desiredTopics ?? []),
    ...(card?.geography?.length ? card.geography : product.geography ?? []),
  ];
  return uniqNorm(raw).filter((t) => isGenericToken(t));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Short tokens (ai) must be whole words — never substring of shanghai. */
export function tokenHits(needles: string[], haystack: string[]): string[] {
  const hay = haystack.map(norm);
  return needles.filter((n) => {
    const needle = norm(n);
    if (!needle) return false;
    if (needle.length <= 3) {
      const re = new RegExp(`(^|[^a-z0-9])${escapeRe(needle)}([^a-z0-9]|$)`, "i");
      return hay.some((h) => h === needle || re.test(h));
    }
    return hay.some((h) => h === needle || h.includes(needle) || (needle.includes(h) && h.length > 3));
  });
}

export type CatalogRankResult = {
  influencer: Influencer;
  score: number;
  nicheHits: string[];
  weakFit: boolean;
};

/**
 * Catalog rank for a product. Niche topic/category overlap dominates;
 * global demo matchScore is a weak prior. Zero niche overlap → hard demote / drop.
 */
export function rankInfluencersForProduct(
  influencers: Influencer[],
  product: Product,
): CatalogRankResult[] {
  const enriched = enrichProductForMatch(product);
  const niche = productNicheTokens(enriched);
  const generic = productGenericTokens(enriched);
  const langs = new Set(enriched.languages ?? []);
  const geos = (
    enriched.resumeCard?.geography?.length ? enriched.resumeCard.geography : enriched.geography ?? []
  ).map(norm);

  return influencers
    .map((inf) => {
      const infTopics = (inf.topics ?? []).map(norm);
      const nicheHits = tokenHits(niche, infTopics);
      const genericHits = tokenHits(generic, infTopics);
      const langHits = (inf.languages ?? []).filter((l) => langs.has(l)).length;
      const cityHit = geos.some((g) => g === norm(inf.city) || g === norm(inf.country));
      const countryOnly = !cityHit && geos.some((g) => g === "china" || g === "thailand");
      // Soft link only — never imply influencer "belongs" to another product id.
      const linked = inf.suitableProductIds?.includes(enriched.id) ? 1 : 0;
      const base = Number(inf.matchScore);
      const prior = Number.isFinite(base) ? base : 50;

      const hasNicheRequirement = niche.length > 0;
      const weakFit = hasNicheRequirement && nicheHits.length === 0;

      let score: number;
      if (weakFit) {
        score = Math.min(
          42,
          Math.round(
            prior * 0.15 +
              genericHits.length * 2 +
              langHits * 2 +
              (cityHit ? 4 : 0) +
              (countryOnly ? 1 : 0),
          ),
        );
      } else {
        score = Math.min(
          99,
          Math.round(
            prior * 0.2 +
              nicheHits.length * 16 +
              genericHits.length * 2 +
              langHits * 4 +
              (cityHit ? 10 : 0) +
              (countryOnly ? 2 : 0) +
              linked * 6,
          ),
        );
      }

      return {
        influencer: { ...inf, matchScore: score },
        score,
        nicheHits,
        weakFit,
      };
    })
    .sort((a, b) => b.score - a.score);
}
