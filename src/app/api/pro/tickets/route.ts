import { z } from "zod";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(8).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("support_tickets" as any)
      .select("id, subject, message, status, priority, created_at, updated_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return json({ ok: true, tickets: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, createTicketSchema);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("support_tickets" as any)
      .insert({
        user_id: session.userId,
        subject: body.subject,
        message: body.message,
        priority: body.priority,
        status: "open",
      })
      .select("id, subject, message, status, priority, created_at, updated_at")
      .single();

    if (error) throw error;
    return json({ ok: true, ticket: data });
  } catch (error) {
    return errorResponse(error);
  }
}
