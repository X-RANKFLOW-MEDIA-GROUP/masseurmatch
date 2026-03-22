"use client";

import { useEffect, useRef } from "react";
import { readKnottyAttribution } from "@/lib/knotty/attribution";
import { getKnottyDeviceType, sendKnottyEvent } from "@/lib/knotty/client";

export function KnottyProfileTracker({
  therapistId,
  city,
  neighborhood,
}: {
  therapistId: string;
  city: string | null;
  neighborhood: string | null;
}) {
  const trackedRef = useRef(false);

  useEffect(() => {
    const attribution = readKnottyAttribution(
      typeof window === "undefined" ? null : new URLSearchParams(window.location.search),
    );

    if (!attribution || trackedRef.current) {
      return;
    }

    trackedRef.current = true;

    sendKnottyEvent({
      event: "profile_viewed",
      session_id: attribution.sessionId,
      therapist_id: therapistId,
      city,
      neighborhood,
      intent: attribution.intent,
      device_type: getKnottyDeviceType(),
      position_in_results: attribution.position,
      recommendation_source: attribution.source,
      metadata: {
        page_path: window.location.pathname,
      },
    });
  }, [city, neighborhood, therapistId]);

  return null;
}
