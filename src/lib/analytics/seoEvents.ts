export const SEO_EVENTS = {
  profileView: "seo_profile_view",
  contactClick: "seo_contact_click",
  cityPageView: "seo_city_page_view",
  keywordPageView: "seo_keyword_page_view",
  modalityPageView: "seo_modality_page_view",
  nearMeClick: "seo_near_me_click",
  blogView: "seo_blog_view",
  blogInternalLinkClick: "seo_blog_internal_link_click",
  searchFilterUsed: "seo_search_filter_used",
  signupFromCityPage: "seo_signup_from_city_page",
  signupFromProfilePage: "seo_signup_from_profile_page",
} as const;

export type SeoEventName = (typeof SEO_EVENTS)[keyof typeof SEO_EVENTS];

export function trackSeoEvent(event: SeoEventName, payload: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as typeof window & {
    dataLayer?: Array<Record<string, unknown>>;
    posthog?: { capture: (eventName: string, props?: Record<string, unknown>) => void };
    va?: { track: (eventName: string, props?: Record<string, unknown>) => void };
  };

  w.dataLayer?.push({ event, ...payload });
  w.posthog?.capture?.(event, payload);
  w.va?.track?.(event, payload);
}
