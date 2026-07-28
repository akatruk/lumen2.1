import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { readSession } from "@/server/auth";
import { dbBriefToBrief, serializeBriefFields } from "@/server/brief-mapper";
import type { BriefStatus } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  campaignId: z.string().min(1),
  invitationId: z.string().min(1),
  influencerId: z.string().min(1),
  title: z.string().min(1),
  deliverables: z.array(z.string()).optional(),
  messaging: z.string(),
  restrictions: z.array(z.string()).optional(),
  deadline: z.string(),
  approvalRules: z.string(),
  status: z.enum(["Draft", "Sent", "Acknowledged"]).optional(),
});

const PatchBody = z.object({
  id: z.string().min(1),
  status: z.enum(["Draft", "Sent", "Acknowledged"]).optional(),
  title: z.string().optional(),
  messaging: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  approvalRules: z.string().optional(),
});

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await prisma.campaignBrief.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ briefs: rows.map(dbBriefToBrief) });
}

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = CreateBody.parse(await req.json());
    const invite = await prisma.invitation.findFirst({
      where: { id: body.invitationId, userId: user.id },
    });
    if (!invite) return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    const row = await prisma.campaignBrief.create({
      data: {
        userId: user.id,
        ...serializeBriefFields({
          ...body,
          status: (body.status as BriefStatus | undefined) ?? "Sent",
        }),
      },
    });
    return NextResponse.json({ brief: dbBriefToBrief(row) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = PatchBody.parse(await req.json());
    const existing = await prisma.campaignBrief.findFirst({
      where: { id: body.id, userId: user.id },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const current = dbBriefToBrief(existing);
    const row = await prisma.campaignBrief.update({
      where: { id: body.id },
      data: serializeBriefFields({
        campaignId: current.campaignId,
        invitationId: current.invitationId,
        influencerId: current.influencerId,
        title: body.title ?? current.title,
        deliverables: body.deliverables ?? current.deliverables,
        messaging: body.messaging ?? current.messaging,
        restrictions: body.restrictions ?? current.restrictions,
        deadline: body.deadline ?? current.deadline,
        approvalRules: body.approvalRules ?? current.approvalRules,
        status: (body.status as BriefStatus | undefined) ?? current.status,
      }),
    });
    return NextResponse.json({ brief: dbBriefToBrief(row) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
