"use client";

import { useEffect } from "react";
import { trackPageView, trackAnalyticsEvent } from "@/lib/seo-tracking-config";
import type { ProfileViewModel } from "@/components/profile/profile-utils";

interface ProfilePageTrackerProps {
  profile: ProfileViewModel;
}

export function ProfilePageTracker({ profile }: ProfilePageTrackerProps) {
  useEffect(() => {
    const profilePath = `/therapists/${profile.slug}`;
    trackPageView(profilePath, {
      profile_id: profile.id,
      city: profile.city,
      state: profile.state,
      is_verified: profile.isVerified ? "true" : "false",
    });

    trackAnalyticsEvent("profile_view", {
      profile_id: profile.id,
      profile_name: profile.name,
      city: profile.city,
      source: "direct",
    });
  }, [profile.id, profile.slug, profile.name, profile.city, profile.state, profile.isVerified]);

  return null;
}
