import type { Influencer, Product, ProductResumeCard } from "@/types";

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
]);

/** Category / phrase → niche topic tokens used for ranking. */
const CATEGORY_TOPIC_MAP: [RegExp, string[]][] = [
  [
    // Avoid false positives like "ai" inside Shanghai's / "app" inside appreciation
    /technolog|software|saas|artificial\s*intelligence|(?<![a-z])tech(?![a-z])|(?<![a-z])ai(?![a-z])|(?<![a-z])gadget(?![a-z])|electronics?|(?<![a-z])startup(?![a-z])|(?<![a-z])cloud(?![a-z])|devops|(?<![a-z])iot(?![a-z])|digital\s*product|b2b\s*saas/i,
    ["tech", "technology", "saas", "software", "ai", "gadget"],
  ],
  [/real\s*estate|property|condo(?:minium)?|apartment|住宅|房产|investors?/i, ["real estate", "investment", "property"]],
  [/restaurant|food|dining|cafe|厨房|美食|探店/i, ["food", "nightlife"]],
  [/skincare|beauty|serum|护肤|美妆/i, ["skincare", "beauty", "wellness"]],
  [/fitness|gym|yoga|健身/i, ["fitness", "wellness"]],
  [/tourism|(?<![a-z])travel(?![a-z])|tour|旅行/i, ["travel"]],
];

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

/** Product niche tokens for matching (structured topics + category; pitch only via regex). */
export function productNicheTokens(product: Product): string[] {
  const card: ProductResumeCard | undefined = product.resumeCard;
  const structured = [
    ...(card?.desired_topics?.length ? card.desired_topics : product.desiredTopics ?? []),
    product.category,
    card?.category ?? "",
  ];
  const blob = [product.name, product.brand, card?.pitch || product.description || ""].join(" ");
  return uniqNorm([
    ...expandMatchTokens(structured),
    ...topicsFromCategory(product.category || card?.category || ""),
    ...extractTopicsFromBlob(blob),
  ]).filter((t) => !isGenericToken(t));
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
  const niche = productNicheTokens(product);
  const generic = productGenericTokens(product);
  const langs = new Set(product.languages ?? []);
  const geos = (
    product.resumeCard?.geography?.length ? product.resumeCard.geography : product.geography ?? []
  ).map(norm);

  return influencers
    .map((inf) => {
      const infTopics = (inf.topics ?? []).map(norm);
      const nicheHits = tokenHits(niche, infTopics);
      const genericHits = tokenHits(generic, infTopics);
      const langHits = (inf.languages ?? []).filter((l) => langs.has(l)).length;
      const cityHit = geos.some((g) => g === norm(inf.city) || g === norm(inf.country));
      const countryOnly = !cityHit && geos.some((g) => g === "china" || g === "thailand");
      const linked = inf.suitableProductIds?.includes(product.id) ? 1 : 0;
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
              nicheHits.length * 18 +
              genericHits.length * 2 +
              langHits * 4 +
              (cityHit ? 10 : 0) +
              (countryOnly ? 2 : 0) +
              linked * 14,
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
