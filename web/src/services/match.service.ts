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
      platforms: c.platforms?.length ? c.platforms : product.platforms?.length ? product.platforms : ["tiktok"],
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
    platforms: product.platforms?.length ? product.platforms : ["tiktok"],
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
 * Demo connector is TikTok-only — candidates are skipped when card platforms exclude tiktok.
 */
export function rankCandidatesForCard(
  candidates: DiscoveryCandidate[],
  product: Product,
): RankedDiscoveryMatch[] {
  const card = cardOf(product);
  if (!card) return [];

  const allowed = new Set(
    (card.platforms?.length ? card.platforms : ["tiktok"]).map((p) => String(p).toLowerCase()),
  );
  // Demo candidates are TikTok. If card does not allow tiktok, return no matches.
  if (!allowed.has("tiktok")) return [];

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
    const cityHit = (city && geoSet.has(city)) || geoSet.has("thailand");
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

    const reasons: string[] = [];
    if (topicHits.length) {
      reasons.push(`Topic overlap: ${topicHits.slice(0, 3).join(", ")}`);
    }
    if (cityHit) reasons.push(`Geo fit: ${c.city} matches card geography`);
    if (langHits) reasons.push(`Language overlap: ${langs.filter((l) => langSet.has(l)).join(", ")}`);
    if (Number.isFinite(engagementRate) && engagementRate >= 4) {
      reasons.push(`Solid engagement (${engagementRate}% ER)`);
    }
    if (reasons.length < 2) {
      const reachK = Number.isFinite(followers) ? Math.round(followers / 1000) : 0;
      reasons.push(`Reach ${reachK}k followers on TikTok`);
    }
    if (reasons.length < 2) {
      reasons.push("Limited overlap signals — review dossier before outreach");
    }
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
      reasons: reasons.slice(0, 4),
      risks,
      breakdown,
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
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
