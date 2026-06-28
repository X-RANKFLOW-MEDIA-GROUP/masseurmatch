export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "explore_view",
  "city_page_view",
  "profile_view",
  "search_performed",
  "filter_used",
  "ai_chat_opened",
  "ai_chat_question",
  "contact_click",
  "phone_call_click",
  "sms_click",
  "email_click",
  "profile_share_click",
  "favorite_added",
  "directions_click",
  "signup_started",
  "signup_completed",
  "checkout_started",
  "checkout_completed",
  "checkout_failed",
  "subscription_started",
  "subscription_upgraded",
  "boost_purchased",
  "available_now_started",
  "featured_profile_clicked",
  "masseur_of_day_viewed",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number] | (string & {});

export type AnalyticsPayload = {
  eventName: AnalyticsEventName;
  profileId?: string | null;
  sessionId?: string | null;
  city?: string | null;
  state?: string | null;
  sourcePage?: string | null;
  metadata?: Record<string, unknown>;
};

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: Record<string, unknown>) => void;
  }
}

function compactRecord(record: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null));
}

function toGtagParams(payload: AnalyticsPayload) {
  return compactRecord({
    profile_id: payload.profileId,
    session_id: payload.sessionId,
    city: payload.city,
    state: payload.state,
    source_page: payload.sourcePage,
    ...(payload.metadata ?? {}),
  });
}

export async function trackEvent(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;

  const normalizedPayload = compactRecord({
    eventName: payload.eventName,
    profileId: payload.profileId,
    sessionId: payload.sessionId,
    city: payload.city,
    state: payload.state,
    sourcePage: payload.sourcePage,
    metadata: payload.metadata ?? {},
  }) as AnalyticsPayload;

  try {
    window.gtag?.("event", payload.eventName, toGtagParams(payload));
  } catch {
    // GA4 should never block product flows.
  }

  try {
    const body = JSON.stringify(normalizedPayload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon("/api/analytics/track", blob);
      if (queued) return;
    }

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    // Analytics failure must not affect the user experience.
  }
}

export function trackProfileView(params: Omit<AnalyticsPayload, "eventName">) {
  return trackEvent({ ...params, eventName: "profile_view", sourcePage: params.sourcePage ?? "profile" });
}

export function trackContactClick(params: Omit<AnalyticsPayload, "eventName"> & { contactType: "phone" | "sms" | "email" }) {
  const eventNameByType = {
    phone: "phone_call_click",
    sms: "sms_click",
    email: "email_click",
  } as const;

  return trackEvent({
    ...params,
    eventName: eventNameByType[params.contactType],
    metadata: {
      ...(params.metadata ?? {}),
      contact_type: params.contactType,
    },
  });
}

export function trackSearchPerformed(params: Omit<AnalyticsPayload, "eventName"> & { searchTerm?: string; filters?: Record<string, unknown> }) {
  const { searchTerm, filters, metadata, ...rest } = params;

  return trackEvent({
    ...rest,
    eventName: "search_performed",
    sourcePage: rest.sourcePage ?? "explore",
    metadata: {
      ...(metadata ?? {}),
      search_term: searchTerm,
      filters,
    },
  });
}
