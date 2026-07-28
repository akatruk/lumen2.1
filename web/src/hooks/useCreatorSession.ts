"use client";

import { useEffect, useState } from "react";
import { collaboration } from "@/services/collaboration";

type AuthUser = {
  id: string;
  role: string;
  influencerId?: string | null;
  name?: string;
};

/**
 * Prefer TikTok/creator JWT influencerId; fall back to Act-as localStorage.
 */
export function useCreatorSessionId(fallback = "inf-1"): string {
  const [id, setId] = useState(() => collaboration.getCreatorSession()?.influencerId ?? fallback);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/auth")
      .then((r) => r.json())
      .then((d: { user: AuthUser | null }) => {
        if (cancelled) return;
        const u = d.user;
        if (u?.role === "creator" && u.influencerId) {
          collaboration.setCreatorSession(u.influencerId);
          setId(u.influencerId);
          return;
        }
        setId(collaboration.getCreatorSession()?.influencerId ?? fallback);
      })
      .catch(() => {
        if (!cancelled) setId(collaboration.getCreatorSession()?.influencerId ?? fallback);
      });

    const unsub = collaboration.subscribeCreatorSession((next) => {
      setId(next ?? fallback);
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [fallback]);

  return id;
}
