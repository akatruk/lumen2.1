/** Shared claim / prohibition helpers (client + server safe). */

export function uniqStrings(arr: string[]): string[] {
  return [...new Set(arr.map((s) => s.trim()).filter(Boolean))];
}

const OVERCLAIM_PATTERNS: { re: RegExp; claim: string }[] = [
  { re: /guaranteed\s+roi|risk[-\s]?free\s+invest/i, claim: "Guaranteed ROI / risk-free investment" },
  { re: /michelin\s+guaranteed|guaranteed\s+michelin/i, claim: "Michelin guaranteed" },
  { re: /healthiest|cures?|medical\s+treatment|whitening/i, claim: "Medical / whitening / healthiest claims" },
  { re: /visa\s+guarantee/i, claim: "Visa guarantee" },
];

/** Explicit "no X" / Prohibitions: lines from brand brief. */
export function extractProhibitionsFromBrief(text: string): string[] {
  const out: string[] = [];
  const blob = text ?? "";
  if (!blob.trim()) return out;

  const labeled = blob.match(
    /prohibit(?:ed\s+claims?|ions?)[:\s]+([^\n.;]+)/i,
  );
  if (labeled?.[1]) {
    out.push(
      ...labeled[1]
        .split(/,|;|\band\b/i)
        .map((s) => s.trim())
        .filter((s) => s.length > 2),
    );
  }

  const noClaims = blob.match(/\bno\s+([a-z][a-z\s/-]{2,40})\b/gi) ?? [];
  for (const m of noClaims) {
    const cleaned = m.replace(/^no\s+/i, "no ").trim();
    if (/no\s+(medical|competitor|roi|guarantee|whitening|health)/i.test(cleaned)) {
      out.push(cleaned);
    }
  }

  for (const p of OVERCLAIM_PATTERNS) {
    if (p.re.test(blob)) out.push(p.claim);
  }

  return uniqStrings(out);
}

export function calibrateResumeConfidence(input: {
  llmConfidence?: number;
  filledCoreFields: number;
  coreFieldCount: number;
  briefLength: number;
  prohibitedCount: number;
  photoCount: number;
  missingCount: number;
}): number {
  const coverage = input.filledCoreFields / Math.max(1, input.coreFieldCount);
  let structural = coverage;
  if (input.briefLength > 160) structural += 0.1;
  else if (input.briefLength > 80) structural += 0.05;
  if (input.prohibitedCount > 0) structural += 0.06;
  if (input.photoCount > 0) structural += 0.04;
  structural -= Math.min(0.25, input.missingCount * 0.04);

  const llm = Number.isFinite(input.llmConfidence)
    ? Math.max(0.15, Math.min(0.95, input.llmConfidence as number))
    : 0.55;

  // Prefer structural truth over LLM self-score (often stuck ~0.4).
  const blended = structural * 0.7 + llm * 0.3;
  return Math.round(Math.max(0.25, Math.min(0.92, blended)) * 100) / 100;
}
