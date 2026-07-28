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

function cardOf(product: Product): ProductResumeCard | null {
  if (product.resumeCard) return product.resumeCard;
  // Fallback synthesize from product fields
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    pitch: product.description.slice(0, 240),
    geography: product.geography,
    audience: product.audience,
    languages: product.languages,
    benefits: product.benefits,
    prohibited_claims: product.prohibitedClaims,
    desired_topics: product.desiredTopics,
    tone: [],
    platforms: product.platforms ?? ["tiktok"],
    budget: { type: "unknown", notes: product.priceLabel },
    success_metrics: [],
    confidence: 0.7,
    missing_fields: [],
    evidence_notes: ["Synthesized from product fields (no scan card yet)"],
  };
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Rank discovery candidates against a Product Resume Card.
 */
export function rankCandidatesForCard(
  candidates: DiscoveryCandidate[],
  product: Product,
): RankedDiscoveryMatch[] {
  const card = cardOf(product);
  if (!card) return [];

  const allowed = new Set((card.platforms?.length ? card.platforms : ["tiktok"]).map((p) => p));
  const topicSet = new Set(card.desired_topics.map((t) => t.toLowerCase()));
  const geoSet = new Set(card.geography.map((g) => g.toLowerCase()));
  const langSet = new Set(card.languages);

  const ranked: RankedDiscoveryMatch[] = [];

  for (const c of candidates) {
    // Platform hard filter: demo candidates are TikTok
    if (!allowed.has("tiktok") && ![...allowed].length) continue;

    const cTopics = c.topics.map((t) => t.toLowerCase());
    const topicHits = cTopics.filter((t) => topicSet.has(t) || [...topicSet].some((x) => t.includes(x) || x.includes(t)));
    const topicScore = clamp((topicHits.length / Math.max(1, Math.min(3, topicSet.size))) * 100);

    const cityHit = geoSet.has(c.city.toLowerCase()) || geoSet.has("thailand");
    const audienceGeo = clamp((cityHit ? 75 : 35) + (c.followers > 50_000 ? 10 : 0));

    const engagement = clamp(c.engagementRate * 12);

    const langHits = c.languages.filter((l) => langSet.has(l)).length;
    const language = clamp((langHits / Math.max(1, langSet.size)) * 100);

    // Style proxy: food/nightlife creators get style credit for F&B cards
    const style =
      card.category === "Restaurant" && (cTopics.includes("food") || cTopics.includes("nightlife"))
        ? 80
        : cTopics.some((t) => topicSet.has(t))
          ? 65
          : 40;

    // Safety: if candidate topics clash with prohibited soft signals — risk only (demo has no claim text)
    const risks: string[] = [];
    let safety = 90;
    if (card.prohibited_claims.some((p) => /whitening|medical|roi/i.test(p)) && cTopics.includes("skincare")) {
      // not automatic fail
      safety = 75;
    }
    if (card.category === "Restaurant" && cTopics.includes("real estate") && !topicHits.length) {
      risks.push("Low topical overlap with restaurant brief");
      safety = Math.min(safety, 70);
    }

    const posting = clamp(55 + (c.avgViews > 20_000 ? 20 : 0));
    const commercial = clamp(50 + topicHits.length * 15 + (cityHit ? 10 : 0));

    // Hard-ish fail: zero topic overlap AND wrong city for tight geo card
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
    if (langHits) reasons.push(`Language overlap: ${c.languages.filter((l) => langSet.has(l)).join(", ")}`);
    if (c.engagementRate >= 4) reasons.push(`Solid engagement (${c.engagementRate}% ER)`);
    if (reasons.length < 2) {
      reasons.push(`Reach ${Math.round(c.followers / 1000)}k followers on TikTok`);
    }
    if (hardFail) {
      risks.push("Weak fit — low topic/geo alignment");
    }

    const missingPenalty = (card.missing_fields?.length ?? 0) * 0.03;
    const confidence = Math.max(
      0.35,
      Math.min(0.95, (card.confidence || 0.7) * 0.5 + score / 200 - missingPenalty + topicHits.length * 0.05),
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
  const city =
    card.geography.find((g) => !/^thailand$/i.test(g)) ?? card.geography[0] ?? "Bangkok";
  const topic = card.desired_topics[0] ?? "lifestyle";
  const query = [topic, city, ...card.desired_topics.slice(1, 2), card.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return { query, city, topic };
}
