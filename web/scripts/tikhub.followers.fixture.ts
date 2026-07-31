/**
 * Fixture: Douyin/TikHub may put followers on author or author_stats.
 * Douyin search often zeroes follower_count + play_count — profile enrich + ER guard.
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
  const {
    normalizeTikHubItem,
    videosToCandidates,
    applyFollowerMap,
    computeEngagementRate,
  } = await import("../src/server/tikhub");

  const sample = {
    aweme_id: "712345",
    desc: "上海探店 本帮菜",
    author: {
      unique_id: "shanghai_eats",
      nickname: "沪上探店",
      signature: "上海美食",
      follower_count: 5_000_000,
      sec_uid: "MS4wLjABAAAAtest",
    },
    statistics: { play_count: 250_000, digg_count: 12_000, comment_count: 400, share_count: 90 },
  };

  const hit = normalizeTikHubItem(sample);
  if (!hit) throw new Error("normalize returned null");
  if (hit.followers !== 5_000_000) {
    throw new Error(`expected followers 5000000, got ${hit.followers}`);
  }
  if (hit.authorSecUid !== "MS4wLjABAAAAtest") {
    throw new Error(`expected sec_uid, got ${hit.authorSecUid}`);
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

  // Douyin search shape: follower_count=0, play_count=0, huge diggs → ER must not explode.
  const searchZeroed = normalizeTikHubItem({
    aweme_id: "3",
    author: {
      unique_id: "82678166699",
      nickname: "小狮妹玩AI",
      sec_uid: "MS4wLjABAAAAlion",
      follower_count: 0,
      signature: "AI是一个工具",
    },
    statistics: { play_count: 0, digg_count: 32_000, comment_count: 400, share_count: 50 },
  });
  if (!searchZeroed) throw new Error("searchZeroed null");
  if (searchZeroed.followers !== 0 || searchZeroed.views !== 0) {
    throw new Error("expected search-zeroed followers/views");
  }

  const beforeEnrich = videosToCandidates([searchZeroed], {
    query: "AI",
    city: "Shanghai",
    language: "zh",
    minFollowers: 0,
    limit: 5,
  });
  if (beforeEnrich[0]?.engagementRate !== 0) {
    throw new Error(`expected ER 0 when views=0, got ${beforeEnrich[0]?.engagementRate}`);
  }
  if (beforeEnrich[0]?.avgViews !== 32_000) {
    throw new Error(`expected avgViews=avg diggs proxy, got ${beforeEnrich[0]?.avgViews}`);
  }

  const enriched = applyFollowerMap([searchZeroed], new Map([["MS4wLjABAAAAlion", 128_000]]));
  if (enriched[0]?.followers !== 128_000) {
    throw new Error(`applyFollowerMap failed: ${enriched[0]?.followers}`);
  }
  const after = videosToCandidates(enriched, {
    query: "AI",
    city: "Shanghai",
    language: "zh",
    minFollowers: 10_000,
    limit: 5,
  });
  if (after[0]?.followers !== 128_000) {
    throw new Error(`enriched candidate followers ${after[0]?.followers}`);
  }

  if (computeEngagementRate(100, 10, 5, 0) !== 0) {
    throw new Error("computeEngagementRate must return 0 when views=0");
  }
  if (computeEngagementRate(100, 0, 0, 1000) !== 10) {
    throw new Error(`expected 10% ER, got ${computeEngagementRate(100, 0, 0, 1000)}`);
  }

  console.log("tikhub.followers.fixture PASS", {
    followers: hit.followers,
    avgViews: candidates[0]?.avgViews,
    enrichedFollowers: after[0]?.followers,
    zeroViewEr: beforeEnrich[0]?.engagementRate,
    platformHint: "douyin",
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
