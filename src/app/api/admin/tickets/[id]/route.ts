export const dynamic = "force-dynamic";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import { resolveRequesterInfo, updateTicketSchema } from "@/app/api/_lib/support-tickets";
import type { TablesUpdate } from "@/integrations/supabase/types";

// GET /api/admin/tickets/[id] — full ticket + thread for admins.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminSession(request);
    const { id } = await params;
    const admin = createSupabaseAdminClient();

    const { data: row, error } = await admin
      .from("support_tickets")
      .select("id, user_id, subject, category, priority, status, created_at, updated_at, resolved_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!row) throw new RouteError(404, "Ticket not found.");

    const requester = await resolveRequesterInfo(row.user_id);

    const { data: rows, error: messagesError } = await admin
      .from("support_ticket_messages")
      .select("id, sender_role, body, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) throw new RouteError(500, messagesError.message);

    const messages = (rows ?? []).map((m) => ({
      id: m.id,
      author_role: m.sender_role,
      author_name: m.sender_role === "admin" ? "Support Team" : requester.name,
      body: m.body,
      created_at: m.created_at,
    }));

    const ticket = {
      ...row,
      last_message_at: row.updated_at,
      requester_name: requester.name,
      requester_email: requester.email,
    };

    return json({ ok: true, ticket, messages });
  } catch (error) {
    return errorResponse(error);
  }
}

// PATCH /api/admin/tickets/[id] — update status and/or priority.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession(request);
    const { id } = await params;
    const body = await parseJsonBody(request, updateTicketSchema);
    const admin = createSupabaseAdminClient();

    if (body.status === undefined && body.priority === undefined) {
      throw new RouteError(400, "Nothing to update.");
    }

    const now = new Date().toISOString();
    const update: TablesUpdate<"support_tickets"> = { updated_at: now };
    if (body.status !== undefined) {
      update.status = body.status;
      update.resolved_at = body.status === "resolved" || body.status === "closed" ? now : null;
    }
    if (body.priority !== undefined) {
      update.priority = body.priority;
    }

    const { data: ticket, error } = await admin
      .from("support_tickets")
      .update(update)
      .eq("id", id)
      .select("id, subject, status, priority")
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!ticket) throw new RouteError(404, "Ticket not found.");

    await recordAuditLog(session.userId, "update_support_ticket", "support_ticket", id, {
      status: body.status,
      priority: body.priority,
    });

    return json({ ok: true, ticket });
  } catch (error) {
    return errorResponse(error);
  }
}
