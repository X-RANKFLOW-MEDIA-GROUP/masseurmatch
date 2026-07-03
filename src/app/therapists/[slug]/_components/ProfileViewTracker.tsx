"use client";

import { useEffect } from "react";
import { trackProfileView } from "@/app/_lib/analytics-events";

interface ProfileViewTrackerProps {
  profileId: string;
  source?: "search" | "explore" | "direct" | "recommendation";
}

export function ProfileViewTracker({ profileId, source = "direct" }: ProfileViewTrackerProps) {
  useEffect(() => {
    // Track profile view
    trackProfileView({
      profile_id: profileId,
      source,
      session_id: typeof window !== "undefined" ? sessionStorage.getItem("session_id") || undefined : undefined,
    });
  }, [profileId, source]);

  // This component doesn't render anything
  return null;
}
