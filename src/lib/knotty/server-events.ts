import type { KnottyEventName, KnottyEventPayload, KnottyIntent } from "@/lib/knotty/types";
import { KNOTTY_EVENT_NAMES, KNOTTY_INTENTS } from "@/lib/knotty/types";

const COUNTER_CONTACT_EVENTS = new Set<KnottyEventName>([
  "knotty_contact_clicked",
  "knotty_call_clicked",
  "knotty_text_clicked",
  "knotty_whatsapp_clicked",
]);

const COUNTER_PROFILE_EVENTS = new Set<KnottyEventName>(["profile_viewed"]);

function isKnottyEventName(value: string): value is KnottyEventName {
  return (KNOTTY_EVENT_NAMES as readonly string[]).includes(value);
}

function isKnottyIntent(value: string | null | undefined): value is KnottyIntent {
  return Boolean(value && (KNOTTY_INTENTS as readonly string[]).includes(value));
}

export function normalizePersistedEvent(input: KnottyEventPayload, userId?: string | null) {
  if (!isKnottyEventName(input.event)) {
    return null;
  }

  return {
    session_id: input.session_id,
    user_id: userId ?? null,
    therapist_id: input.therapist_id ?? null,
    event_name: input.event,
    city: input.city ?? null,
    neighborhood: input.neighborhood ?? null,
    intent: isKnottyIntent(input.intent) ? input.intent : "general",
    device_type: input.device_type ?? "unknown",
    position_in_results: typeof input.position_in_results === "number" ? input.position_in_results : null,
    recommendation_source: input.recommendation_source ?? "knotty",
    metadata: input.metadata ?? {},
    created_at: new Date(input.ts || Date.now()).toISOString(),
  };
}

async function updateProfileCounters(adminClient: any, events: KnottyEventPayload[]) {
  const increments = new Map<
    string,
    {
      profileViews: number;
      contactClicks: number;
    }
  >();

  for (const event of events) {
    if (!event.therapist_id || !isKnottyEventName(event.event)) {
      continue;
    }

    const current = increments.get(event.therapist_id) || {
      profileViews: 0,
      contactClicks: 0,
    };

    if (COUNTER_PROFILE_EVENTS.has(event.event)) {
      current.profileViews += 1;
    }

    if (COUNTER_CONTACT_EVENTS.has(event.event)) {
      current.contactClicks += 1;
    }

    increments.set(event.therapist_id, current);
  }

  for (const [therapistId, delta] of increments.entries()) {
    const { data, error } = await adminClient
      .from("profiles")
      .select("id, profile_views, contact_clicks")
      .eq("id", therapistId)
      .maybeSingle();

    if (error || !data) {
      continue;
    }

    await adminClient
      .from("profiles")
      .update({
        profile_views: (Number(data.profile_views) || 0) + delta.profileViews,
        contact_clicks: (Number(data.contact_clicks) || 0) + delta.contactClicks,
      })
      .eq("id", therapistId);
  }
}

export async function persistRankingEvents(
  adminClient: any,
  events: KnottyEventPayload[],
  userId?: string | null,
) {
  const rows = events
    .map((event) => normalizePersistedEvent(event, userId))
    .filter((row): row is NonNullable<ReturnType<typeof normalizePersistedEvent>> => Boolean(row));

  if (!rows.length) {
    return { inserted: 0 };
  }

  await adminClient.from("ranking_events").insert(rows);
  await updateProfileCounters(adminClient, events);

  return {
    inserted: rows.length,
  };
}
