/**
 * Fixture: TikHub web search puts followers on item.authorStats, not author.
 * Kept outside `src/` so Next.js production typecheck ignores it.
 * Run: cd web && npx --yes tsx scripts/tikhub.followers.fixture.ts
 */
import Module from "node:module";

const mod = Module as unknown as {
  _load: (...args: unknown[]) => unknown;
};
const originalLoad = mod._load;
mod._load = (...args: unknown[]) => {
  if (args[0] === "server-only") return {};
  return originalLoad(...args);
};

async function main() {
  const { normalizeTikHubItem, videosToCandidates } = await import("../src/server/tikhub");

  const sample = {
    id: "712345",
    desc: "pad thai bangkok",
    author: {
      uniqueId: "karissaeats",
      nickname: "Karissa",
      signature: "food in bkk",
    },
    authorStats: {
      followerCount: 5_000_000,
      heartCount: 422_900_000,
      videoCount: 1655,
    },
    stats: { playCount: 250_000, diggCount: 12_000, commentCount: 400, shareCount: 90 },
  };

  const hit = normalizeTikHubItem(sample);
  if (!hit) throw new Error("normalize returned null");
  if (hit.followers !== 5_000_000) {
    throw new Error(`expected followers 5000000, got ${hit.followers}`);
  }

  const candidates = videosToCandidates([hit], {
    query: "bangkok food",
    city: "Bangkok",
    language: "all",
    topic: "food",
    minFollowers: 0,
    limit: 5,
  });
  if (candidates[0]?.followers !== 5_000_000) {
    throw new Error(`candidate followers ${candidates[0]?.followers}`);
  }

  const zeroAuthorOnly = normalizeTikHubItem({
    id: "1",
    author: { uniqueId: "x", nickname: "x" },
    stats: { playCount: 1 },
  });
  if (!zeroAuthorOnly || zeroAuthorOnly.followers !== 0) {
    throw new Error("missing authorStats should stay 0");
  }

  const v2 = normalizeTikHubItem({
    id: "2",
    author: { uniqueId: "y", nickname: "y" },
    authorStatsV2: { followerCount: "10100" },
  });
  if (!v2 || v2.followers !== 10100) {
    throw new Error(`authorStatsV2 string parse failed: ${v2?.followers}`);
  }

  console.log("tikhub.followers.fixture PASS", {
    followers: hit.followers,
    avgViews: candidates[0]?.avgViews,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
