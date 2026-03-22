/**
 * Lightweight analytics event tracker.
 * All events are dispatched to the dataLayer (GTM-compatible) and stored for later batching.
 */

export type TrackingEvent =
  | "location_allowed"
  | "search_used"
  | "card_clicked"
  | "featured_clicked"
  | "knotty_interaction"
  | "empty_state";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(event: TrackingEvent, payload?: EventPayload): void {
  if (typeof window === "undefined") return;

  const entry = { event, ...payload, timestamp: Date.now() };

  // Push to GTM dataLayer if present
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(entry);
}
