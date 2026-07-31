/**
 * Live smoke: search zeros → profile enrich → non-zero followers.
 * Run: cd web && npx tsx scripts/tikhub.enrich.smoke.ts
 */
import Module from "node:module";

const mod = Module as unknown as { _load: (...args: unknown[]) => unknown };
const originalLoad = mod._load;
mod._load = (...args: unknown[]) => {
  if (args[0] === "server-only") return {};
  return originalLoad(...args);
};

async function main() {
  const {
    fetchDouyinSearchVideos,
    enrichVideosWithProfileFollowers,
    videosToCandidates,
  } = await import("../src/server/tikhub");

  const raw = await fetchDouyinSearchVideos("AI 工具", 8);
  const before = raw.filter((v) => v.followers === 0).length;
  const enriched = await enrichVideosWithProfileFollowers(raw);
  const after0 = enriched.filter((v) => v.followers === 0).length;
  const cands = videosToCandidates(enriched, {
    query: "AI",
    city: "Shanghai",
    language: "zh",
    minFollowers: 0,
    limit: 5,
  });

  console.log(
    JSON.stringify(
      {
        videos: raw.length,
        zeroFollowersBefore: before,
        zeroFollowersAfter: after0,
        sample: cands.slice(0, 3).map((c) => ({
          name: c.name,
          followers: c.followers,
          avgViews: c.avgViews,
          er: c.engagementRate,
        })),
      },
      null,
      2,
    ),
  );

  if (before > 0 && after0 === before) {
    throw new Error("enrich did not improve any follower counts");
  }
  if (cands.some((c) => c.engagementRate > 100)) {
    throw new Error("ER still absurd");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
