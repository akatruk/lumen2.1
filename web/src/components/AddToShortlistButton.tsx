"use client";

import { marketplace } from "@/services/marketplace";
import type { Influencer, Shortlist } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/Toast";
import { fill, useI18n } from "@/lib/i18n";

export function AddToShortlistButton({ influencer }: { influencer: Influencer }) {
  const { t } = useI18n();
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
        aria-label={t.shortlistBtn.selectAria}
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
            push(
              fill(t.shortlistBtn.added, {
                name: influencer.name,
                list: list?.name ?? t.common.shortlist,
              }),
            );
            setLists(marketplace.listShortlists());
          });
        }}
      >
        {t.shortlistBtn.add}
      </Button>
    </div>
  );
}
