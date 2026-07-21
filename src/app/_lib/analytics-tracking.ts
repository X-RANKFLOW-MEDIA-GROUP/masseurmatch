// Analytics and conversion tracking configuration
export const ANALYTICS_EVENTS = {
  engagement: {
    therapist_profile_view: "therapist_profile_view",
    therapist_contact_click: "therapist_contact_click",
    book_appointment_click: "book_appointment_click",
    phone_call_initiated: "phone_call_initiated",
    share_profile: "share_profile",
    filter_applied: "filter_applied",
  },
  search: {
    search_performed: "search_performed",
    search_query: "search_query",
    search_results_viewed: "search_results_viewed",
    result_clicked: "result_clicked",
  },
  signup: {
    signup_started: "signup_started",
    signup_completed: "signup_completed",
    therapist_application: "therapist_application",
    profile_verified: "profile_verified",
  },
  content: {
    blog_post_viewed: "blog_post_viewed",
    blog_time_on_page: "blog_time_on_page",
    guide_started: "guide_started",
    guide_completed: "guide_completed",
  },
};

export const CONVERSION_TRACKING = {
  goals: [
    {
      name: "therapist_contact",
      description: "User initiated contact with therapist",
      value: 1,
    },
    {
      name: "appointment_booking",
      description: "User completed appointment booking",
      value: 25,
    },
    {
      name: "therapist_signup",
      description: "New therapist joined platform",
      value: 100,
    },
    {
      name: "profile_verification",
      description: "Therapist profile verified",
      value: 50,
    },
  ],
};

export const GTM_CONFIGURATION = {
  container_id: process.env.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX",
  events_namespace: "dataLayer",
  track_core_web_vitals: true,
  track_page_views: true,
  track_scroll_depth: [25, 50, 75, 100],
  track_video_engagement: true,
  track_form_interactions: true,
};

export const WEB_VITALS_TRACKING = {
  enable_cwv_monitoring: true,
  send_to_analytics: true,
  thresholds: {
    lcp: 2500, // ms
    inp: 200, // ms
    cls: 0.1, // unitless
  },
};

export interface AnalyticsPayload {
  event: string;
  category: string;
  label?: string;
  value?: number;
  timestamp?: number;
  user_id?: string;
  session_id?: string;
}

export const trackEvent = (payload: AnalyticsPayload) => {
  if (typeof window === "undefined") return;

  // Send to Google Analytics via gtag
  if (typeof (window as any).gtag !== "undefined") {
    (window as any).gtag("event", payload.event, {
      event_category: payload.category,
      event_label: payload.label,
      value: payload.value,
      timestamp: payload.timestamp || Date.now(),
    });
  }

  // Send to data layer for GTM
  if ((window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: payload.event,
      eventCategory: payload.category,
      eventLabel: payload.label,
      eventValue: payload.value,
    });
  }
};

export const trackPageView = (path: string, title: string) => {
  trackEvent({
    event: "page_view",
    category: "engagement",
    label: title,
  });
};

export const trackTherapistProfileView = (therapistSlug: string) => {
  trackEvent({
    event: ANALYTICS_EVENTS.engagement.therapist_profile_view,
    category: "therapist",
    label: therapistSlug,
    value: 1,
  });
};

export const trackTherapistContact = (therapistSlug: string, method: "phone" | "email") => {
  trackEvent({
    event:
      method === "phone"
        ? ANALYTICS_EVENTS.engagement.phone_call_initiated
        : ANALYTICS_EVENTS.engagement.therapist_contact_click,
    category: "conversion",
    label: therapistSlug,
    value: 1,
  });
};
