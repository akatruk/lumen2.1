/**
 * Fixture: Douyin/TikHub may put followers on author or author_stats.
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
    aweme_id: "712345",
    desc: "上海探店 本帮菜",
    author: {
      unique_id: "shanghai_eats",
      nickname: "沪上探店",
      signature: "上海美食",
      follower_count: 5_000_000,
    },
    statistics: { play_count: 250_000, digg_count: 12_000, comment_count: 400, share_count: 90 },
  };

  const hit = normalizeTikHubItem(sample);
  if (!hit) throw new Error("normalize returned null");
  if (hit.followers !== 5_000_000) {
    throw new Error(`expected followers 5000000, got ${hit.followers}`);
  }
  if (!hit.url.includes("douyin.com")) {
    throw new Error(`expected douyin.com url, got ${hit.url}`);
  }

  const candidates = videosToCandidates([hit], {
    query: "上海 美食",
    city: "Shanghai",
    language: "all",
    topic: "food",
    minFollowers: 0,
    limit: 5,
  });
  if (candidates[0]?.followers !== 5_000_000) {
    throw new Error(`candidate followers ${candidates[0]?.followers}`);
  }
  if (candidates[0]?.country !== "CN" || candidates[0]?.languages?.[0] !== "zh") {
    throw new Error(`expected CN/zh candidate, got ${candidates[0]?.country}/${candidates[0]?.languages}`);
  }
  if (!candidates[0]?.id.startsWith("disc-dy-")) {
    throw new Error(`expected disc-dy- id, got ${candidates[0]?.id}`);
  }

  const zeroAuthorOnly = normalizeTikHubItem({
    aweme_id: "1",
    author: { unique_id: "x", nickname: "x" },
    statistics: { play_count: 1 },
  });
  if (!zeroAuthorOnly || zeroAuthorOnly.followers !== 0) {
    throw new Error("missing follower fields should stay 0");
  }

  const v2 = normalizeTikHubItem({
    aweme_id: "2",
    author: { unique_id: "y", nickname: "y" },
    authorStatsV2: { followerCount: "10100" },
  });
  if (!v2 || v2.followers !== 10100) {
    throw new Error(`authorStatsV2 string parse failed: ${v2?.followers}`);
  }

  console.log("tikhub.followers.fixture PASS", {
    followers: hit.followers,
    avgViews: candidates[0]?.avgViews,
    platformHint: "douyin",
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
