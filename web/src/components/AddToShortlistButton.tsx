"use client";

import { marketplace } from "@/services/marketplace";
import type { Influencer, Shortlist } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";

export function AddToShortlistButton({ influencer }: { influencer: Influencer }) {
  const [lists, setLists] = useState<Shortlist[]>([]);
  const [selected, setSelected] = useState("");
  const { push } = useToast();

  useEffect(() => {
    void marketplace.hydrateBrandPersistence().then(() => {
      const data = marketplace.listShortlists();
      setLists(data);
      setSelected(data[0]?.id ?? "");
    });
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        className="w-48"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="Select shortlist"
      >
        {lists.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        disabled={!selected}
        onClick={() => {
          if (!selected) return;
          void marketplace.addToShortlistAsync(selected, influencer.id).then((list) => {
            push(`Added ${influencer.name} to ${list?.name ?? "shortlist"}`);
            setLists(marketplace.listShortlists());
          });
        }}
      >
        Add to shortlist
      </Button>
    </div>
  );
}
