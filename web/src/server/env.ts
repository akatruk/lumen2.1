/**
 * Server-only env helpers. Never import from client components.
 */

export function discoveryMode(): "demo" | "live" {
  const m = (process.env.DISCOVERY_MODE ?? "demo").toLowerCase();
  return m === "live" ? "live" : "demo";
}

export function productScanMode(): "demo" | "live" {
  const m = (process.env.PRODUCT_SCAN_MODE ?? "demo").toLowerCase();
  return m === "live" ? "live" : "demo";
}

export function tikhubConfig() {
  return {
    apiKey: process.env.TIKHUB_API_KEY?.trim() ?? "",
    baseUrl: (process.env.TIKHUB_BASE_URL?.trim() || "https://api.tikhub.io").replace(/\/$/, ""),
  };
}

export function openrouterConfig() {
  return {
    apiKey: process.env.OPENROUTER_API_KEY?.trim() ?? "",
    baseUrl: (process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(
      /\/$/,
      "",
    ),
    model: process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini",
  };
}

export function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "dev-only-change-me-lumen-marketplace";
}

export function publicDiscoveryMode(): "demo" | "live" {
  // Client-visible hint; server still enforces real mode + keys
  const m = (process.env.NEXT_PUBLIC_DISCOVERY_MODE ?? process.env.DISCOVERY_MODE ?? "demo").toLowerCase();
  return m === "live" ? "live" : "demo";
}

export function publicProductScanMode(): "demo" | "live" {
  const m = (
    process.env.NEXT_PUBLIC_PRODUCT_SCAN_MODE ??
    process.env.PRODUCT_SCAN_MODE ??
    "demo"
  ).toLowerCase();
  return m === "live" ? "live" : "demo";
}
