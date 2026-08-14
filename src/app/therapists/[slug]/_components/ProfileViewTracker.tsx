"use client";

import { useEffect } from "react";
import { trackProfileView } from "@/app/_lib/analytics-events";

interface ProfileViewTrackerProps {
  profileId: string;
  source?: "search" | "explore" | "direct" | "recommendation";
}

const ANALYTICS_SESSION_KEY = "mm:analytics:session_id";

function getAnalyticsSessionId() {
  try {
    const existing = sessionStorage.getItem(ANALYTICS_SESSION_KEY);
    if (existing) return existing;

    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(ANALYTICS_SESSION_KEY, sessionId);
    return sessionId;
  } catch {
    return undefined;
  }
}

export function ProfileViewTracker({ profileId, source = "direct" }: ProfileViewTrackerProps) {
  useEffect(() => {
    trackProfileView({
      profile_id: profileId,
      source,
      session_id: getAnalyticsSessionId(),
    });
  }, [profileId, source]);

  return null;
}
