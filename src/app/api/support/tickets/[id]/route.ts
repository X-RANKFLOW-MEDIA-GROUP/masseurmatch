export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";

// GET /api/support/tickets/[id] — a provider's own ticket with its full thread.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const admin = createSupabaseAdminClient();

    const { data: ticket, error } = await admin
      .from("support_tickets")
      .select("id, user_id, subject, category, priority, status, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!ticket || ticket.user_id !== session.userId) {
      throw new RouteError(404, "Ticket not found.");
    }

    const { data: rows, error: messagesError } = await admin
      .from("support_ticket_messages")
      .select("id, sender_role, body, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (messagesError) throw new RouteError(500, messagesError.message);

    const messages = (rows ?? []).map((m) => ({
      id: m.id,
      author_role: m.sender_role,
      author_name: m.sender_role === "admin" ? "Support Team" : null,
      body: m.body,
      created_at: m.created_at,
    }));

    return json({ ok: true, ticket, messages });
  } catch (error) {
    return errorResponse(error);
  }
}
