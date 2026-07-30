/**
 * Infer creator niche topics from THEIR text (bio / nick / video titles).
 * Never stamp the search query onto every candidate — that causes travel
 * creators to fake-match tech products.
 */
const TOPIC_MAP: [RegExp, string[]][] = [
  [/(?<![a-z])food(?![a-z])|(?<![a-z])eat(?![a-z])|restaurant|美食|吃饭|探店|餐厅|料理/i, ["food", "nightlife"]],
  [/nightlife|(?<![a-z])bar(?![a-z])|cocktail|夜店|酒吧/i, ["nightlife"]],
  [/travel|hotel|酒店|旅行|旅游|vlog|度假|景点|机票/i, ["travel"]],
  [
    /technolog|software|saas|artificial\s*intelligence|(?<![a-z])tech(?![a-z])|(?<![a-z])ai(?![a-z])|科技|数码|软件|脚本|短视频工具|内容工具|creator\s*tool|viral\s*script|martech|growth\s*ops/i,
    ["tech", "ai", "technology", "software", "saas"],
  ],
  [/viral|script|短视频|抖音运营|钩子|爆款/i, ["viral", "script", "content", "short video", "creator tools"]],
  [/beauty|makeup|美妆|化妆/i, ["beauty"]],
  [/skincare|serum|护肤/i, ["skincare", "beauty"]],
  [/fitness|gym|健身/i, ["fitness"]],
  [/condo|property|real\s*estate|房产|楼盘|住宅/i, ["real estate", "investment", "property"]],
  [/跨境|出海|电商|commerce/i, ["commerce"]],
  [/lifestyle|生活/i, ["lifestyle"]],
];

export function inferCreatorTopicsFromText(...parts: Array<string | undefined | null>): string[] {
  const blob = parts.filter(Boolean).join(" ");
  if (!blob.trim()) return [];
  const out: string[] = [];
  for (const [re, topics] of TOPIC_MAP) {
    if (re.test(blob)) out.push(...topics);
  }
  return [...new Set(out.map((t) => t.toLowerCase()))].slice(0, 8);
}

/** Conflicting niche pairs: if product has A and creator clearly B with no A → hard fail signal. */
export const CONFLICTING_NICHES: [string[], string[]][] = [
  [
    ["tech", "ai", "saas", "software", "script", "viral", "creator tools", "short video", "technology"],
    ["travel", "hotel"],
  ],
  [
    ["tech", "ai", "saas", "software", "script", "viral", "creator tools"],
    ["real estate", "property", "investment"],
  ],
  [["food", "nightlife", "restaurant"], ["real estate", "property"]],
  [["real estate", "property"], ["food", "nightlife"]],
];

export function hasNicheConflict(productNiche: string[], creatorTopics: string[]): boolean {
  const p = new Set(productNiche.map((t) => t.toLowerCase()));
  const c = new Set(creatorTopics.map((t) => t.toLowerCase()));
  for (const [need, bad] of CONFLICTING_NICHES) {
    const wants = need.some((t) => p.has(t));
    const hasBad = bad.some((t) => c.has(t));
    const hasNeed = need.some((t) => c.has(t));
    if (wants && hasBad && !hasNeed) return true;
  }
  return false;
}
