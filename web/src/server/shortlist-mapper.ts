import type { Shortlist, ShortlistItem } from "@/types";

export function dbShortlistToShortlist(row: {
  id: string;
  name: string;
  productId: string | null;
  campaignId: string | null;
  notes: string;
  itemsJson: string;
  createdAt: Date;
}): Shortlist {
  let items: ShortlistItem[] = [];
  try {
    items = JSON.parse(row.itemsJson) as ShortlistItem[];
  } catch {
    items = [];
  }
  return {
    id: row.id,
    name: row.name,
    productId: row.productId ?? undefined,
    campaignId: row.campaignId ?? undefined,
    notes: row.notes,
    items,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeShortlistFields(input: {
  name: string;
  productId?: string | null;
  campaignId?: string | null;
  notes?: string;
  items?: ShortlistItem[];
}) {
  return {
    name: input.name,
    productId: input.productId ?? null,
    campaignId: input.campaignId ?? null,
    notes: input.notes ?? "",
    itemsJson: JSON.stringify(input.items ?? []),
  };
}
