import { readGeoCache } from "@/lib/geo";
import type {
  KnottyContext,
  KnottyDeviceType,
  KnottyEventPayload,
} from "@/lib/knotty/types";

const KNOTTY_SESSION_STORAGE_KEY = "mm:knotty:session";

function readStoredSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(KNOTTY_SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function persistSessionId(sessionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(KNOTTY_SESSION_STORAGE_KEY, sessionId);
  } catch {
    // Ignore storage failures so the chat still works.
  }
}

export function getOrCreateKnottySessionId() {
  const existing = readStoredSessionId();
  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `knotty-${Date.now()}`;

  persistSessionId(next);
  return next;
}

export function getKnottyDeviceType(): KnottyDeviceType {
  if (typeof window === "undefined") {
    return "unknown";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1100) {
    return "tablet";
  }

  return "desktop";
}

export function getKnottyClientContext(): KnottyContext {
  if (typeof window === "undefined") {
    return {
      deviceType: "unknown",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const geo = readGeoCache();
  const radius = Number(params.get("radius") || "");

  return {
    pagePath: window.location.pathname,
    pageQuery: window.location.search,
    city: params.get("city") || geo?.city || null,
    neighborhood: geo?.neighborhood || null,
    lat: typeof geo?.lat === "number" ? geo.lat : null,
    lng: typeof geo?.lng === "number" ? geo.lng : null,
    radiusMiles: Number.isFinite(radius) && radius > 0 ? radius : null,
    deviceType: getKnottyDeviceType(),
    filters: {
      available: params.get("available") === "1",
      verified: params.get("verified") === "1",
      incall: params.get("incall") === "1",
      outcall: params.get("outcall") === "1",
      session: params.get("session"),
      goal: params.get("goal"),
      sort: params.get("sort"),
    },
  };
}

export function sendKnottyEvent(event: KnottyEventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify({
    ...event,
    ts: event.ts || Date.now(),
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/events", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
