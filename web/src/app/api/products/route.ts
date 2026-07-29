import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { readSession } from "@/server/auth";
import { dbProductToProduct, serializeProductFields } from "@/server/product-mapper";
import type { LanguageCode, Platform, ProductResumeCard } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProductBody = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.string().min(1),
  description: z.string(),
  imageEmoji: z.string().optional(),
  priceLabel: z.string().optional(),
  geography: z.array(z.string()).default([]),
  audience: z.string().default(""),
  languages: z.array(z.enum(["th", "en", "ru", "zh"])).default(["en"]),
  benefits: z.array(z.string()).default([]),
  prohibitedClaims: z.array(z.string()).default([]),
  desiredTopics: z.array(z.string()).default([]),
  platforms: z.array(z.enum(["douyin", "tiktok", "instagram", "youtube"])).optional(),
  resumeCard: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products: rows.map(dbProductToProduct) });
}

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = ProductBody.parse(await req.json());
    const data = serializeProductFields({
      ...body,
      languages: body.languages as LanguageCode[],
      platforms: body.platforms as Platform[] | undefined,
      resumeCard: body.resumeCard as unknown as ProductResumeCard | undefined,
    });
    const row = await prisma.product.create({
      data: { ...data, userId: user.id },
    });
    return NextResponse.json({ product: dbProductToProduct(row) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const json = await req.json();
    const id = String(json.id ?? "");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const existing = await prisma.product.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const body = ProductBody.partial().parse(json);
    const merged = {
      name: body.name ?? existing.name,
      brand: body.brand ?? existing.brand,
      category: body.category ?? existing.category,
      description: body.description ?? existing.description,
      imageEmoji: body.imageEmoji,
      priceLabel: body.priceLabel,
      geography: body.geography ?? (JSON.parse(existing.geographyJson) as string[]),
      audience: body.audience ?? existing.audience,
      languages: (body.languages as LanguageCode[]) ?? (JSON.parse(existing.languagesJson) as LanguageCode[]),
      benefits: body.benefits ?? (JSON.parse(existing.benefitsJson) as string[]),
      prohibitedClaims: body.prohibitedClaims ?? (JSON.parse(existing.prohibitedJson) as string[]),
      desiredTopics: body.desiredTopics ?? (JSON.parse(existing.desiredTopicsJson) as string[]),
      platforms: (body.platforms as Platform[]) ?? (JSON.parse(existing.platformsJson) as Platform[]),
      resumeCard: (body.resumeCard as unknown as ProductResumeCard | undefined) ??
        (existing.resumeCardJson ? (JSON.parse(existing.resumeCardJson) as ProductResumeCard) : undefined),
    };
    const row = await prisma.product.update({
      where: { id },
      data: serializeProductFields(merged),
    });
    return NextResponse.json({ product: dbProductToProduct(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
