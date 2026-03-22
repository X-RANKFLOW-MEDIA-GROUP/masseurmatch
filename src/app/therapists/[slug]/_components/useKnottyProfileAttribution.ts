"use client";

import { useCallback } from "react";
import { readKnottyAttribution } from "@/lib/knotty/attribution";
import { getKnottyDeviceType, sendKnottyEvent } from "@/lib/knotty/client";

export function useKnottyProfileAttribution(input: {
  therapistId: string;
  city: string | null;
  neighborhood: string | null;
}) {
  const trackContact = useCallback(
    (event: "knotty_call_clicked" | "knotty_text_clicked" | "knotty_whatsapp_clicked") => {
      const attribution = readKnottyAttribution(
        typeof window === "undefined" ? null : new URLSearchParams(window.location.search),
      );

      if (!attribution) {
        return;
      }

      sendKnottyEvent({
        event,
        session_id: attribution.sessionId,
        therapist_id: input.therapistId,
        city: input.city,
        neighborhood: input.neighborhood,
        intent: attribution.intent,
        device_type: getKnottyDeviceType(),
        position_in_results: attribution.position,
        recommendation_source: attribution.source,
        metadata: {
          page_path: window.location.pathname,
        },
      });
    },
    [input.city, input.neighborhood, input.therapistId],
  );

  return {
    trackContact,
  };
}
