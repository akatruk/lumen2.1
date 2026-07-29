"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";

/**
 * Act-as Douyin creator identity (localStorage). Brand JWT is separate.
 */
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
