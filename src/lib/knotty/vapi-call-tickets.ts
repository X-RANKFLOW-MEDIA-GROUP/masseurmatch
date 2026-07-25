import { RouteError } from "@/app/api/_lib/http";
import { createSupabaseWebhookAdminClient, recordAuditLog } from "@/app/api/_lib/supabase-server";

const MAX_TRANSCRIPT_CHARS = 30_000;

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function phoneVariants(input: string): string[] {
  const raw = input.trim();
  const digits = raw.replace(/\D/g, "");
  const lastTen = digits.length >= 10 ? digits.slice(-10) : digits;
  const values = new Set<string>([raw, digits, lastTen]);
  if (lastTen.length === 10) {
    values.add(`+1${lastTen}`);
    values.add(`1${lastTen}`);
    values.add(`(${lastTen.slice(0, 3)}) ${lastTen.slice(3, 6)}-${lastTen.slice(6)}`);
    values.add(`${lastTen.slice(0, 3)}-${lastTen.slice(3, 6)}-${lastTen.slice(6)}`);
  }
  return [...values].filter(Boolean);
}

function recordingUrl(message: Record<string, unknown>, artifact: Record<string, unknown>): string | null {
  const recording = artifact.recording;
  if (typeof recording === "string") return recording;
  if (recording && typeof recording === "object") {
    const row = recording as Record<string, unknown>;
    return text(row.url) ?? text(row.mono) ?? text(row.stereoUrl);
  }
  return text(message.recordingUrl) ?? text(message.stereoRecordingUrl);
}

function summaryText(message: Record<string, unknown>): string | null {
  const analysis = object(message.analysis);
  return text(analysis.summary) ?? text(message.summary);
}

function durationSeconds(message: Record<string, unknown>): number | null {
  const direct = numberValue(message.durationSeconds);
  if (direct != null) return Math.max(0, Math.round(direct));
  const startedAt = text(message.startedAt);
  const endedAt = text(message.endedAt);
  if (!startedAt || !endedAt) return null;
  const duration = (Date.parse(endedAt) - Date.parse(startedAt)) / 1000;
  return Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : null;
}

async function resolveProvider(message: Record<string, unknown>) {
  const call = object(message.call);
  const customer = object(message.customer);
  const callCustomer = object(call.customer);
  const phone = text(customer.number) ?? text(callCustomer.number);
  if (!phone) return null;

  const variants = phoneVariants(phone);
  const quoted = variants.map((value) => `"${value.replaceAll('"', '\\"')}"`);
  const clauses = ["phone", "phone_number", "whatsapp_number"]
    .flatMap((field) => quoted.map((value) => `${field}.eq.${value}`))
    .join(",");

  const admin = createSupabaseWebhookAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id,user_id,display_name,full_name,email_address")
    .or(clauses)
    .limit(2);

  if (error) throw new RouteError(500, error.message);
  if (!data?.length) return null;
  if (data.length > 1) throw new RouteError(409, "Multiple provider accounts match this call number.");
  return data[0];
}

function callReportBody(message: Record<string, unknown>, consentGranted: boolean): string {
  const call = object(message.call);
  const artifact = object(message.artifact);
  const callId = text(call.id) ?? "unknown";
  const summary = summaryText(message);
  const transcript = (text(artifact.transcript) ?? text(message.transcript))?.slice(0, MAX_TRANSCRIPT_CHARS) ?? null;
  const recording = consentGranted ? recordingUrl(message, artifact) : null;
  const duration = durationSeconds(message);

  return [
    "Knotty voice support call completed",
    `Call ID: ${callId}`,
    duration != null ? `Duration: ${duration} seconds` : null,
    text(message.endedReason) ? `Ended reason: ${text(message.endedReason)}` : null,
    summary ? `\nSummary\n${summary}` : null,
    transcript ? `\nTranscript\n${transcript}` : null,
    recording ? `\nRecording (consent verified)\n${recording}` : null,
    !consentGranted ? "\nRecording was not stored because recording consent was not confirmed." : null,
  ].filter(Boolean).join("\n");
}

export function isVapiEndOfCallReport(body: unknown): boolean {
  const envelope = object(body);
  return text(object(envelope.message).type) === "end-of-call-report";
}

export async function logVapiCallToSupportTicket(body: unknown) {
  const envelope = object(body);
  const message = object(envelope.message);
  if (text(message.type) !== "end-of-call-report") {
    throw new RouteError(400, "Expected a Vapi end-of-call-report message.");
  }

  const call = object(message.call);
  const callId = text(call.id);
  if (!callId) throw new RouteError(422, "The Vapi call ID is missing.");

  const profile = await resolveProvider(message);
  if (!profile?.user_id) {
    return { ok: true, logged: false, reason: "No provider matched the caller number." };
  }

  const admin = createSupabaseWebhookAdminClient();
  const subject = `Knotty support call · ${callId}`;
  const { data: existing } = await admin
    .from("support_tickets")
    .select("id")
    .eq("subject", subject)
    .maybeSingle();

  const compliance = object(message.compliance);
  const recordingConsent = object(compliance.recordingConsent);
  const consentGranted = Boolean(text(recordingConsent.grantedAt));
  const bodyText = callReportBody(message, consentGranted);

  let ticketId = existing?.id ?? null;
  if (!ticketId) {
    const { data: ticket, error: ticketError } = await admin
      .from("support_tickets")
      .insert({
        user_id: profile.user_id,
        profile_id: profile.id,
        subject,
        category: "general",
        priority: "normal",
        status: "open",
      })
      .select("id")
      .single();
    if (ticketError || !ticket) throw new RouteError(500, ticketError?.message ?? "Could not create call ticket.");
    ticketId = ticket.id;
  }

  const marker = `[Vapi end-of-call-report:${callId}]`;
  const { data: priorMessage } = await admin
    .from("support_ticket_messages")
    .select("id")
    .eq("ticket_id", ticketId)
    .ilike("body", `${marker}%`)
    .maybeSingle();

  if (!priorMessage) {
    const { error: messageError } = await admin.from("support_ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: profile.user_id,
      sender_role: "system",
      body: `${marker}\n${bodyText}`,
    });
    if (messageError) throw new RouteError(500, messageError.message);
  }

  await recordAuditLog(profile.user_id, "knotty.call.logged", "support_ticket", ticketId, {
    source: "vapi",
    callId,
    recordingConsentGranted: consentGranted,
  });

  return { ok: true, logged: true, ticketId, duplicate: Boolean(existing && priorMessage) };
}
