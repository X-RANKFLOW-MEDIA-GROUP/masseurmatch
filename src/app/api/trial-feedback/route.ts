import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  first_name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  overall_rating: z.enum(["Excellent", "Good", "Average", "Poor", "Very poor"]),
  profile_experience: z.enum(["Very easy", "Easy", "Neutral", "Difficult", "Very difficult"]),
  most_useful: z.string().trim().min(1).max(3000),
  problems_or_missing: z.string().trim().max(3000).optional().default(""),
  seo_understanding: z.enum(["Yes, clearly", "Somewhat", "No"]),
  continue_likelihood: z.enum(["Very likely", "Likely", "Not sure", "Unlikely", "Very unlikely"]),
  improvement_request: z.string().trim().max(3000).optional().default(""),
  contact_requested: z.literal("yes").optional(),
  preferred_contact_method: z.enum(["Text message", "Chat", "Phone call"]).optional(),
  phone: z.string().trim().max(40).optional().default(""),
  best_contact_time: z.string().trim().max(160).optional().default(""),
  additional_comments: z.string().trim().max(3000).optional().default(""),
  confidentiality_acknowledged: z.literal("yes"),
  website: z.string().max(0).optional().default(""),
});

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please review the required fields and try again." },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const contactRequested = data.contact_requested === "yes";
    if (
      contactRequested &&
      (!data.preferred_contact_method || !data.phone || !data.best_contact_time)
    ) {
      return NextResponse.json(
        { error: "Please provide your preferred contact method, phone number, and best time." },
        { status: 400 },
      );
    }

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256")
      .update(`${forwarded}:${process.env.TRIAL_FEEDBACK_HASH_SALT || "masseurmatch"}`)
      .digest("hex");
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase server credentials are not configured");
    }

    const saveResponse = await fetch(
      `${supabaseUrl}/rest/v1/trial_feedback_responses?select=id`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          first_name: data.first_name,
          email: data.email.toLowerCase(),
          overall_rating: data.overall_rating,
          profile_experience: data.profile_experience,
          most_useful: data.most_useful,
          problems_or_missing: data.problems_or_missing || null,
          seo_understanding: data.seo_understanding,
          continue_likelihood: data.continue_likelihood,
          improvement_request: data.improvement_request || null,
          contact_requested: contactRequested,
          preferred_contact_method: contactRequested ? data.preferred_contact_method : null,
          phone: contactRequested ? data.phone : null,
          best_contact_time: contactRequested ? data.best_contact_time : null,
          additional_comments: data.additional_comments || null,
          confidentiality_acknowledged: true,
          ip_hash: ipHash,
          user_agent: userAgent,
          email_notification_status: "pending",
        }),
      },
    );
    const savedRows = (await saveResponse.json().catch(() => [])) as Array<{ id: string }>;
    const saved = savedRows[0];

    if (!saveResponse.ok || !saved?.id) {
      console.error("trial_feedback_save_failed", savedRows);
      return NextResponse.json(
        { error: "We could not securely save your feedback. Please try again." },
        { status: 500 },
      );
    }

    const rows = [
      ["First name", data.first_name],
      ["Email", data.email],
      ["Overall rating", data.overall_rating],
      ["Profile experience", data.profile_experience],
      ["Most useful", data.most_useful],
      ["Problems or missing", data.problems_or_missing],
      ["SEO/city understanding", data.seo_understanding],
      ["Likelihood to continue", data.continue_likelihood],
      ["Requested improvements", data.improvement_request],
      ["Requested private follow-up", contactRequested ? "Yes" : "No"],
      [
        "Preferred contact method",
        contactRequested ? data.preferred_contact_method : "Not requested",
      ],
      ["Phone", contactRequested ? data.phone : "Not provided"],
      ["Best contact time", contactRequested ? data.best_contact_time : "Not provided"],
      ["Additional comments", data.additional_comments],
      ["Response ID", saved.id],
    ];
    const htmlRows = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:700;vertical-align:top;width:220px">${escapeHtml(label)}</td><td style="padding:10px;border-bottom:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(value || "Not provided")}</td></tr>`,
      )
      .join("");

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
    const result = await new Resend(resendKey).emails.send({
      from:
        process.env.TRIAL_FEEDBACK_FROM_EMAIL ||
        "MasseurMatch Feedback <notifications@masseurmatch.com>",
      to: [process.env.TRIAL_FEEDBACK_TO_EMAIL || "admin@xrankflow.com"],
      replyTo: data.email,
      subject: `${contactRequested ? "FOLLOW-UP REQUESTED — " : ""}Confidential trial feedback — ${data.first_name}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;max-width:760px;margin:auto"><h1>Confidential MasseurMatch Trial Feedback</h1><p><strong>Private internal response.</strong> Do not publish or share without permission.</p>${contactRequested ? '<p style="background:#fff7ed;padding:12px;border-left:4px solid #b56b43"><strong>Follow-up requested.</strong> Review the contact details below.</p>' : ""}<table style="width:100%;border-collapse:collapse">${htmlRows}</table></div>`,
    });

    if (result.error) throw new Error(result.error.message);
    await fetch(
      `${supabaseUrl}/rest/v1/trial_feedback_responses?id=eq.${encodeURIComponent(saved.id)}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_notification_status: "sent",
          email_notification_id: result.data?.id || null,
          email_notified_at: new Date().toISOString(),
        }),
      },
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("trial_feedback_error", error);
    return NextResponse.json(
      { error: "Your response could not be sent right now. Please try again." },
      { status: 500 },
    );
  }
}
