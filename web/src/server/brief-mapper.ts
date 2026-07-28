import type { BriefStatus, CampaignBrief } from "@/types";

export function dbBriefToBrief(row: {
  id: string;
  campaignId: string;
  invitationId: string;
  influencerId: string;
  title: string;
  deliverablesJson: string;
  messaging: string;
  restrictionsJson: string;
  deadline: string;
  approvalRules: string;
  status: string;
  createdAt: Date;
}): CampaignBrief {
  const parse = <T,>(raw: string, fallback: T): T => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  };
  return {
    id: row.id,
    campaignId: row.campaignId,
    invitationId: row.invitationId,
    influencerId: row.influencerId,
    title: row.title,
    deliverables: parse(row.deliverablesJson, [] as string[]),
    messaging: row.messaging,
    restrictions: parse(row.restrictionsJson, [] as string[]),
    deadline: row.deadline,
    approvalRules: row.approvalRules,
    status: row.status as BriefStatus,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeBriefFields(input: {
  campaignId: string;
  invitationId: string;
  influencerId: string;
  title: string;
  deliverables?: string[];
  messaging: string;
  restrictions?: string[];
  deadline: string;
  approvalRules: string;
  status?: BriefStatus;
}) {
  return {
    campaignId: input.campaignId,
    invitationId: input.invitationId,
    influencerId: input.influencerId,
    title: input.title,
    deliverablesJson: JSON.stringify(input.deliverables ?? []),
    messaging: input.messaging,
    restrictionsJson: JSON.stringify(input.restrictions ?? []),
    deadline: input.deadline,
    approvalRules: input.approvalRules,
    status: input.status ?? "Sent",
  };
}
