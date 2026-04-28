import { z } from "zod";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";

const updateTicketSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  adminNote: z.string().trim().max(3000).optional().nullable(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("support_tickets" as any)
      .select("id, user_id, subject, message, status, priority, admin_note, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return json({ ok: true, tickets: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const adminSession = await requireAdminSession(request);
    const body = await parseJsonBody(request, updateTicketSchema);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("support_tickets" as any)
      .update({
        status: body.status,
        admin_note: body.adminNote ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select("id, user_id, subject, message, status, priority, admin_note, created_at, updated_at")
      .single();

    if (error) throw error;

    await admin.from("audit_log").insert({
      admin_user_id: adminSession.userId,
      action: "support.ticket.update",
      target_type: "support_ticket",
      target_id: body.id,
      details: { status: body.status },
    });

    return json({ ok: true, ticket: data });
  } catch (error) {
    return errorResponse(error);
  }
}
