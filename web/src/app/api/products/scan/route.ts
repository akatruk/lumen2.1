import { NextResponse } from "next/server";
import { z } from "zod";
import { productScanMode, openrouterConfig } from "@/server/env";
import { scanProductWithLlm } from "@/server/openrouter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  url: z.string().optional(),
  briefText: z.string().optional(),
  photoNames: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    if (productScanMode() !== "live") {
      return NextResponse.json(
        {
          error: "PRODUCT_SCAN_MODE is not live",
          mode: "demo",
          hint: "Set PRODUCT_SCAN_MODE=live and OPENROUTER_API_KEY",
        },
        { status: 400 },
      );
    }
    if (!openrouterConfig().apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured", mode: "live" },
        { status: 503 },
      );
    }

    const body = BodySchema.parse(await req.json());
    if (!body.url && !body.briefText && !(body.photoNames?.length)) {
      return NextResponse.json({ error: "Provide url, briefText, or photoNames" }, { status: 400 });
    }

    const card = await scanProductWithLlm({
      url: body.url,
      briefText: body.briefText,
      photoNames: body.photoNames,
      notes: body.notes,
    });

    return NextResponse.json({ mode: "live", source: "openrouter", card });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Product scan failed";
    return NextResponse.json({ error: message, mode: "live" }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    mode: productScanMode(),
    configured: Boolean(openrouterConfig().apiKey),
    endpoint: "/api/products/scan",
  });
}
