import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { influencerIdAliases, readSession } from "@/server/auth";
import { dbInvitationToInvitation } from "@/server/invitation-mapper";
import { dbBriefToBrief, serializeBriefFields } from "@/server/brief-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateBody = z.object({
  influencerId: z.string().min(1),
  campaignId: z.string().min(1),
  message: z.string().optional(),
});

const PatchBody = z.object({
  id: z.string().min(1),
  status: z.enum(["Accepted", "Declined"]),
  autoBrief: z
    .object({
      title: z.string(),
      deliverables: z.array(z.string()).optional(),
      messaging: z.string(),
      restrictions: z.array(z.string()).optional(),
      deadline: z.string(),
      approvalRules: z.string(),
    })
    .optional(),
});

function creatorInfluencerFilter(influencerId: string) {
  return { influencerId: { in: [...influencerIdAliases(influencerId)] } };
}

export async function GET() {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "creator") {
    if (!user.influencerId) {
      return NextResponse.json({ invitations: [] });
    }
    const rows = await prisma.invitation.findMany({
      where: creatorInfluencerFilter(user.influencerId),
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ invitations: rows.map(dbInvitationToInvitation) });
  }

  const rows = await prisma.invitation.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invitations: rows.map(dbInvitationToInvitation) });
}

export async function POST(req: Request) {
  const user = await readSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "creator") {
    return NextResponse.json({ error: "Creators cannot create invitations" }, { status: 403 });
  }
  try {
    const body = CreateBody.parse(await req.json());
    const row = await prisma.invitation.create({
      data: {
        userId: user.id,
        influencerId: body.influencerId,
        campaignId: body.campaignId,
        message: body.message ?? "Campaign collaboration invitation",
        status: "Pending",
      },
    });
    return NextResponse.json({ invitation: dbInvitationToInvitation(row) }, { status: 201 });
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

    let existing =
      user.role === "creator" && user.influencerId
        ? await prisma.invitation.findFirst({
            where: { id: body.id, ...creatorInfluencerFilter(user.influencerId) },
          })
        : await prisma.invitation.findFirst({
            where: { id: body.id, userId: user.id },
          });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const row = await prisma.invitation.update({
      where: { id: body.id },
      data: {
        status: body.status,
        respondedAt: new Date(),
      },
    });

    let brief = null;
    if (body.status === "Accepted") {
      const brandUserId = existing.userId;
      const existingBrief = await prisma.campaignBrief.findFirst({
        where: { invitationId: body.id, userId: brandUserId },
      });
      if (!existingBrief && body.autoBrief) {
        const created = await prisma.campaignBrief.create({
          data: {
            userId: brandUserId,
            ...serializeBriefFields({
              campaignId: row.campaignId,
              invitationId: row.id,
              influencerId: row.influencerId,
              title: body.autoBrief.title,
              deliverables: body.autoBrief.deliverables,
              messaging: body.autoBrief.messaging,
              restrictions: body.autoBrief.restrictions,
              deadline: body.autoBrief.deadline,
              approvalRules: body.autoBrief.approvalRules,
              status: "Sent",
            }),
          },
        });
        brief = dbBriefToBrief(created);
      } else if (existingBrief) {
        brief = dbBriefToBrief(existingBrief);
      }
    }

    return NextResponse.json({
      invitation: dbInvitationToInvitation(row),
      brief,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
