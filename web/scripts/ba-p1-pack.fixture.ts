import { calibrateResumeConfidence, extractProhibitionsFromBrief } from "../src/lib/product-claims";
import { rankCandidatesForCard } from "../src/services/match.service";
import type { Product } from "../src/types";

const p = extractProhibitionsFromBrief(
  "Prohibitions: no medical claims, no competitor restaurants. Soft open.",
);
console.log("prohibitions", p);
if (!p.some((x) => /medical/i.test(x))) throw new Error("missing medical");

const c = calibrateResumeConfidence({
  llmConfidence: 0.4,
  filledCoreFields: 9,
  coreFieldCount: 10,
  briefLength: 200,
  prohibitedCount: 2,
  photoCount: 3,
  missingCount: 1,
});
console.log("confidence", c);
if (c < 0.7) throw new Error(`expected higher conf than raw 0.4, got ${c}`);

const product = {
  id: "p1",
  name: "Soi 11",
  brand: "BBC",
  category: "Restaurant",
  description: "x",
  imageEmoji: "🍜",
  priceLabel: "barter",
  geography: ["Bangkok"],
  audience: "foodies",
  languages: ["th", "en"],
  benefits: ["plates"],
  prohibitedClaims: ["no medical claims"],
  desiredTopics: ["food", "bangkok"],
  platforms: ["tiktok"],
  createdAt: new Date().toISOString(),
  resumeCard: {
    name: "Soi 11",
    brand: "BBC",
    category: "Restaurant",
    pitch: "x",
    geography: ["Bangkok"],
    audience: "foodies",
    languages: ["th", "en"],
    benefits: ["plates"],
    prohibited_claims: ["no medical claims"],
    desired_topics: ["food", "bangkok"],
    tone: ["casual"],
    platforms: ["tiktok"],
    budget: { type: "barter", notes: "" },
    success_metrics: ["views"],
    confidence: 0.85,
    missing_fields: [],
    evidence_notes: [],
  },
} as Product;

const ranked = rankCandidatesForCard(
  [
    {
      id: "disc-tt-a",
      name: "A",
      handle: "@a",
      profileUrl: "",
      avatarInitials: "A",
      avatarColor: "#000",
      city: "Bangkok",
      country: "TH",
      languages: ["th", "en"],
      topics: ["food", "bangkok"],
      followers: 3_400_000,
      avgViews: 11_000_000,
      engagementRate: 11.2,
      bio: "food in bkk",
      source: "tikhub",
      collectedAt: new Date().toISOString(),
    },
    {
      id: "disc-tt-b",
      name: "B",
      handle: "@b",
      profileUrl: "",
      avatarInitials: "B",
      avatarColor: "#000",
      city: "Bangkok",
      country: "TH",
      languages: ["th", "en"],
      topics: ["food", "bangkok"],
      followers: 2200,
      avgViews: 50_000,
      engagementRate: 2.1,
      bio: "eats",
      source: "tikhub",
      collectedAt: new Date().toISOString(),
    },
  ],
  product,
);

console.log("A reasons", ranked[0]?.reasons);
console.log("B reasons", ranked[1]?.reasons);
if (!ranked[0] || ranked[0].reasons.length < 3) throw new Error("need >=3 reasons");
if (!ranked[0].reasons.some((r) => /Reach|followers/i.test(r))) throw new Error("missing reach");
if (!ranked[0].reasons.some((r) => /ER/i.test(r))) throw new Error("missing ER");
console.log("ba-p1-pack.fixture PASS");
