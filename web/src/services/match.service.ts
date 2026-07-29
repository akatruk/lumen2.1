import type {
  DiscoveryCandidate,
  Product,
  ProductResumeCard,
  RankedDiscoveryMatch,
} from "@/types";

const WEIGHTS = {
  topic: 25,
  audienceGeo: 20,
  engagement: 15,
  language: 10,
  style: 10,
  safety: 10,
  posting: 5,
  commercial: 5,
} as const;

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function cardOf(product: Product): ProductResumeCard | null {
  if (!product || typeof product !== "object") return null;
  if (product.resumeCard) {
    const c = product.resumeCard;
    return {
      ...c,
      name: c.name || product.name || "Untitled",
      brand: c.brand || product.brand || "",
      category: c.category || product.category || "Product",
      pitch: (c.pitch || product.description || "").slice(0, 240),
      geography: asStringArray(c.geography).length ? asStringArray(c.geography) : asStringArray(product.geography),
      audience: c.audience || product.audience || "",
      languages: (c.languages?.length ? c.languages : product.languages) ?? ["en"],
      benefits: asStringArray(c.benefits).length ? asStringArray(c.benefits) : asStringArray(product.benefits),
      prohibited_claims: asStringArray(c.prohibited_claims).length
        ? asStringArray(c.prohibited_claims)
        : asStringArray(product.prohibitedClaims),
      desired_topics: asStringArray(c.desired_topics).length
        ? asStringArray(c.desired_topics)
        : asStringArray(product.desiredTopics),
      tone: asStringArray(c.tone),
      platforms: c.platforms?.length ? c.platforms : product.platforms?.length ? product.platforms : ["douyin"],
      budget: c.budget ?? { type: "unknown", notes: product.priceLabel ?? "" },
      success_metrics: asStringArray(c.success_metrics),
      confidence: Number.isFinite(c.confidence) ? c.confidence : 0.7,
      missing_fields: asStringArray(c.missing_fields),
      evidence_notes: asStringArray(c.evidence_notes),
    };
  }
  // Fallback synthesize from product fields
  return {
    name: product.name || "Untitled",
    brand: product.brand || "",
    category: product.category || "Product",
    pitch: String(product.description ?? "").slice(0, 240),
    geography: asStringArray(product.geography),
    audience: product.audience || "",
    languages: product.languages?.length ? product.languages : ["en"],
    benefits: asStringArray(product.benefits),
    prohibited_claims: asStringArray(product.prohibitedClaims),
    desired_topics: asStringArray(product.desiredTopics),
    tone: [],
    platforms: product.platforms?.length ? product.platforms : ["douyin"],
    budget: { type: "unknown", notes: product.priceLabel ?? "" },
    success_metrics: [],
    confidence: 0.7,
    missing_fields: [],
    evidence_notes: ["Synthesized from product fields (no scan card yet)"],
  };
}

function clamp(n: number, lo = 0, hi = 100) {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Rank discovery candidates against a Product Resume Card.
 * Primary connector is Douyin — candidates are skipped when card platforms exclude douyin (and tiktok alias).
 */
export function rankCandidatesForCard(
  candidates: DiscoveryCandidate[],
  product: Product,
): RankedDiscoveryMatch[] {
  const card = cardOf(product);
  if (!card) return [];

  const allowed = new Set(
    (card.platforms?.length ? card.platforms : ["douyin"]).map((p) => String(p).toLowerCase()),
  );
  // Primary candidates are Douyin. Accept legacy "tiktok" on card as alias for CN short-video.
  if (!allowed.has("douyin") && !allowed.has("tiktok")) return [];

  const topicSet = new Set(card.desired_topics.map((t) => t.toLowerCase()));
  const geoSet = new Set(card.geography.map((g) => g.toLowerCase()));
  const langSet = new Set(card.languages);

  const ranked: RankedDiscoveryMatch[] = [];

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;

    const cTopics = asStringArray(c.topics).map((t) => t.toLowerCase());
    const topicHits = cTopics.filter(
      (t) => topicSet.has(t) || [...topicSet].some((x) => t.includes(x) || x.includes(t)),
    );
    const topicScore = clamp((topicHits.length / Math.max(1, Math.min(3, Math.max(topicSet.size, 1)))) * 100);

    const city = String(c.city ?? "").toLowerCase();
    const cityHit = (city && geoSet.has(city)) || geoSet.has("china") || geoSet.has("thailand");
    const followers = Number(c.followers);
    const engagementRate = Number(c.engagementRate);
    const avgViews = Number(c.avgViews);

    const audienceGeo = clamp((cityHit ? 75 : 35) + (followers > 50_000 ? 10 : 0));
    const engagement = clamp(engagementRate * 12);
    const langs = Array.isArray(c.languages) ? c.languages : [];
    const langHits = langs.filter((l) => langSet.has(l)).length;
    const language = clamp((langHits / Math.max(1, langSet.size)) * 100);

    const style =
      card.category === "Restaurant" && (cTopics.includes("food") || cTopics.includes("nightlife"))
        ? 80
        : cTopics.some((t) => topicSet.has(t))
          ? 65
          : 40;

    const risks: string[] = [];
    let safety = 90;
    if (card.prohibited_claims.some((p) => /whitening|medical|roi/i.test(p)) && cTopics.includes("skincare")) {
      safety = 75;
    }
    if (card.category === "Restaurant" && cTopics.includes("real estate") && !topicHits.length) {
      risks.push("Low topical overlap with restaurant brief");
      safety = Math.min(safety, 70);
    }

    const posting = clamp(55 + (avgViews > 20_000 ? 20 : 0));
    const commercial = clamp(50 + topicHits.length * 15 + (cityHit ? 10 : 0));

    const hardFail =
      topicHits.length === 0 &&
      card.geography.length === 1 &&
      !cityHit &&
      !cTopics.some((t) => t === "lifestyle");

    const breakdown = {
      topic: topicScore,
      audienceGeo,
      engagement,
      language,
      style,
      safety,
      posting,
      commercial,
    };

    const score = clamp(
      Math.round(
        (breakdown.topic * WEIGHTS.topic +
          breakdown.audienceGeo * WEIGHTS.audienceGeo +
          breakdown.engagement * WEIGHTS.engagement +
          breakdown.language * WEIGHTS.language +
          breakdown.style * WEIGHTS.style +
          breakdown.safety * WEIGHTS.safety +
          breakdown.posting * WEIGHTS.posting +
          breakdown.commercial * WEIGHTS.commercial) /
          100,
      ),
    );

    const reasons = buildMatchReasons({
      topicHits,
      city: String(c.city ?? ""),
      cityHit,
      langs,
      langHits,
      langSet,
      followers,
      avgViews,
      engagementRate,
      bio: String(c.bio ?? ""),
      nicheTopics: cTopics.filter((t) => !topicHits.includes(t)),
    });
    if (hardFail) {
      risks.push("Weak fit — low topic/geo alignment");
    }

    const missingPenalty = (card.missing_fields?.length ?? 0) * 0.03;
    const confidence = Math.max(
      0.35,
      Math.min(
        0.95,
        (card.confidence || 0.7) * 0.5 + score / 200 - missingPenalty + topicHits.length * 0.05,
      ),
    );

    ranked.push({
      candidate: c,
      score: hardFail ? Math.min(score, 48) : score,
      confidence: Number(confidence.toFixed(2)),
      reasons,
      risks,
      breakdown,
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

/** Prefer differentiating signals (reach/ER/views/lang/niche), not only topic+geo. */
function buildMatchReasons(input: {
  topicHits: string[];
  city: string;
  cityHit: boolean;
  langs: string[];
  langHits: number;
  langSet: Set<string>;
  followers: number;
  avgViews: number;
  engagementRate: number;
  bio: string;
  nicheTopics: string[];
}): string[] {
  const pool: { priority: number; text: string }[] = [];

  if (input.topicHits.length) {
    pool.push({
      priority: 100,
      text: `Topic overlap: ${input.topicHits.slice(0, 3).join(", ")}`,
    });
  }
  // Differentiating metrics before shared geo — otherwise every card looks identical.
  if (Number.isFinite(input.followers) && input.followers > 0) {
    pool.push({
      priority: 92,
      text: `Reach ${formatCompact(input.followers)} followers on Douyin`,
    });
  }
  if (Number.isFinite(input.engagementRate) && input.engagementRate > 0) {
    const tone =
      input.engagementRate >= 6 ? "Strong" : input.engagementRate >= 3 ? "Solid" : "Modest";
    pool.push({
      priority: 90,
      text: `${tone} engagement (${input.engagementRate}% ER)`,
    });
  }
  if (Number.isFinite(input.avgViews) && input.avgViews > 0) {
    pool.push({
      priority: 88,
      text: `Avg views ${formatCompact(input.avgViews)} on recent posts`,
    });
  }
  if (input.cityHit && input.city) {
    pool.push({ priority: 86, text: `Geo fit: ${input.city} matches card geography` });
  }
  if (input.langHits > 0) {
    const hit = input.langs.filter((l) => input.langSet.has(l));
    pool.push({ priority: 70, text: `Language overlap: ${hit.join(", ")}` });
  }
  if (input.nicheTopics.length) {
    pool.push({
      priority: 60,
      text: `Niche signals: ${input.nicheTopics.slice(0, 2).join(", ")}`,
    });
  } else {
    const bio = input.bio.toLowerCase();
    const niches: string[] = [];
    if (/food|eat|restaurant|cafe|กิน/.test(bio)) niches.push("food content");
    if (/travel|เที่ยว|bkk|bangkok/.test(bio)) niches.push("travel/local");
    if (/nightlife|bar|cocktail/.test(bio)) niches.push("nightlife");
    if (niches.length) {
      pool.push({ priority: 55, text: `Bio niche: ${niches.slice(0, 2).join(", ")}` });
    }
  }

  pool.sort((a, b) => b.priority - a.priority);
  const out: string[] = [];
  for (const p of pool) {
    if (out.includes(p.text)) continue;
    out.push(p.text);
    if (out.length >= 4) break;
  }
  if (out.length < 2) {
    out.push("Limited overlap signals — review dossier before outreach");
  }
  return out;
}

export function buildSearchQueryFromCard(card: ProductResumeCard): {
  query: string;
  city: string;
  topic: string;
} {
  const geography = asStringArray(card?.geography);
  const topics = asStringArray(card?.desired_topics);
  const city = geography.find((g) => !/^thailand$/i.test(g)) ?? geography[0] ?? "Bangkok";
  const topic = topics[0] ?? "lifestyle";
  const query = [topic, city, ...topics.slice(1, 2), card?.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return { query, city, topic };
}
