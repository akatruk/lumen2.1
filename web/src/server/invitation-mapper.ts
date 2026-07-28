import type { Invitation, InvitationStatus } from "@/types";

export function dbInvitationToInvitation(row: {
  id: string;
  influencerId: string;
  campaignId: string;
  status: string;
  message: string;
  respondedAt: Date | null;
  createdAt: Date;
}): Invitation {
  return {
    id: row.id,
    influencerId: row.influencerId,
    campaignId: row.campaignId,
    status: row.status as InvitationStatus,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    respondedAt: row.respondedAt?.toISOString(),
  };
}
