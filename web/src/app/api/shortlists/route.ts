import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { readSession } from "@/server/auth";
import { dbShortlistToShortlist, serializeShortlistFields } from "@/server/shortlist-mapper";
import type { ShortlistItem } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ItemSchema = z.object({
  influencerId: z.string().min(1),
  addedAt: z.string().optional(),
  note: z.string().optional(),
});

const CreateBody = z.object({
  name: z.string().min(1),
  productId: z.string().optional().nullable(),
  campaignId: z.string().optional().nullable(),
  notes: z.string().optional(),
  items: z.array(ItemSchema).optional(),
});

const UpdateBody = CreateBody.partial().extend({
  id: z.string().min(1),
});

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.shortlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ shortlists: rows.map(dbShortlistToShortlist) });
}

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = CreateBody.parse(await req.json());
    const items: ShortlistItem[] = (body.items ?? []).map((i) => ({
      influencerId: i.influencerId,
      addedAt: i.addedAt ?? new Date().toISOString(),
      note: i.note ?? "",
    }));
    const row = await prisma.shortlist.create({
      data: {
        userId: user.id,
        ...serializeShortlistFields({
          name: body.name,
          productId: body.productId,
          campaignId: body.campaignId,
          notes: body.notes,
          items,
        }),
      },
    });
    return NextResponse.json({ shortlist: dbShortlistToShortlist(row) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = UpdateBody.parse(await req.json());
    const existing = await prisma.shortlist.findFirst({
      where: { id: body.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const current = dbShortlistToShortlist(existing);
    const items: ShortlistItem[] | undefined = body.items
      ? body.items.map((i) => ({
          influencerId: i.influencerId,
          addedAt: i.addedAt ?? new Date().toISOString(),
          note: i.note ?? "",
        }))
      : undefined;
    const row = await prisma.shortlist.update({
      where: { id: body.id },
      data: serializeShortlistFields({
        name: body.name ?? current.name,
        productId: body.productId !== undefined ? body.productId : current.productId,
        campaignId: body.campaignId !== undefined ? body.campaignId : current.campaignId,
        notes: body.notes ?? current.notes,
        items: items ?? current.items,
      }),
    });
    return NextResponse.json({ shortlist: dbShortlistToShortlist(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
