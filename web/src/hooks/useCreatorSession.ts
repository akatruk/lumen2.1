"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";

/** Act-as influencer id; stays in sync when sidebar Select changes. */
export function useCreatorSessionId(fallback = "inf-1"): string {
  const [id, setId] = useState(() => collaboration.getCreatorSession()?.influencerId ?? fallback);

  useEffect(() => {
    setId(collaboration.getCreatorSession()?.influencerId ?? fallback);
    return collaboration.subscribeCreatorSession((next) => {
      setId(next ?? fallback);
    });
  }, [fallback]);

  return id;
}
