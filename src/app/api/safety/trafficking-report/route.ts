import { z } from "zod";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";
import { assertRateLimit, sanitizeOptionalText, sanitizeText } from "@/app/_lib/security";

const reportSchema = z.object({
  therapistId: z.string().uuid(),
  therapistName: z.string().min(1).max(120).optional(),
  reporterName: z.string().min(1).max(120),
  reporterEmail: z.string().email().max(180),
  reporterPhone: z.string().max(40).optional().nullable(),
  details: z.string().min(20).max(2500),
});

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "trafficking-report", { limit: 6, windowMs: 60_000 });

    const body = await parseJsonBody(request, reportSchema);
    const adminClient = createSupabaseAdminClient();

    const { data: therapist, error: therapistError } = await adminClient
      .from("therapists")
      .select("id")
      .eq("id", body.therapistId)
      .maybeSingle();

    if (therapistError) {
      throw new RouteError(500, therapistError.message);
    }

    if (!therapist) {
      throw new RouteError(404, "Profile not found.");
    }

    const message = [
      "🚨 Suspected trafficking report submitted from therapist profile.",
      `Profile: ${sanitizeText(body.therapistName || "Unknown profile")} (${body.therapistId})`,
      `Reporter: ${sanitizeText(body.reporterName)} (${sanitizeText(body.reporterEmail)})`,
      body.reporterPhone ? `Reporter phone: ${sanitizeText(body.reporterPhone)}` : null,
      "",
      "Details:",
      sanitizeText(body.details),
      "",
      "Hotlines shown to reporter:",
      "National Human Trafficking Hotline: 1-888-373-7888",
      "ICE HSI Tip Line: 1-866-347-2423",
    ]
      .filter(Boolean)
      .join("\n");

    const { data: inquiry, error: insertError } = await adminClient
      .from("contact_inquiries")
      .insert({
        therapist_id: body.therapistId,
        client_name: "Safety Team Intake",
        client_email: "safety@masseurmatch.com",
        client_phone: null,
        message,
        preferred_contact: "email",
        status: "new",
        notes: `TRAFFICKING_REPORT::${sanitizeText(body.reporterEmail)}::${sanitizeText(body.reporterName)}`,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new RouteError(500, insertError.message);
    }

    return json({
      ok: true,
      reportId: inquiry.id,
      hotline: {
        nationalHumanTraffickingHotline: "1-888-373-7888",
        iceHsiTipLine: "1-866-347-2423",
      },
      message:
        "Report received. If someone is in immediate danger, call 911. You can also contact the National Human Trafficking Hotline or ICE HSI Tip Line now.",
      reporter: {
        name: sanitizeText(body.reporterName),
        email: sanitizeText(body.reporterEmail),
        phone: sanitizeOptionalText(body.reporterPhone ?? null),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
