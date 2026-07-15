export const dynamic = "force-dynamic";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import {
  createSupabaseAdminClient,
  recordAuditLog,
  requireAdminSession,
} from "@/app/api/_lib/supabase-server";
import {
  notifyProviderOfReply,
  replySchema,
  resolveRequesterInfo,
} from "@/app/api/_lib/support-tickets";

// POST /api/admin/tickets/[id]/messages — an admin replies on a ticket.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession(request);
    const { id } = await params;
    const body = await parseJsonBody(request, replySchema);
    const admin = createSupabaseAdminClient();

    const { data: ticket, error } = await admin
      .from("support_tickets")
      .select("id, user_id, subject, status")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!ticket) throw new RouteError(404, "Ticket not found.");

    const { data: inserted, error: messageError } = await admin
      .from("support_ticket_messages")
      .insert({
        ticket_id: id,
        sender_id: session.userId,
        sender_role: "admin",
        body: body.body,
      })
      .select("id, sender_role, body, created_at")
      .single();

    if (messageError || !inserted) {
      throw new RouteError(500, messageError?.message ?? "Could not post reply.");
    }

    // An admin reply moves an untouched ticket into "waiting on user".
    if (ticket.status === "open") {
      await admin
        .from("support_tickets")
        .update({ status: "waiting_on_user", updated_at: new Date().toISOString() })
        .eq("id", id);
    }

    await recordAuditLog(session.userId, "reply_support_ticket", "support_ticket", id);

    // Email the provider that support responded.
    const requester = await resolveRequesterInfo(ticket.user_id);
    await notifyProviderOfReply({
      to: requester.email,
      providerName: requester.name,
      subject: ticket.subject,
      body: body.body,
      ticketId: id,
    });

    const message = {
      id: inserted.id,
      author_role: inserted.sender_role,
      author_name: "Support Team",
      body: inserted.body,
      created_at: inserted.created_at,
    };

    return json({ ok: true, message }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
