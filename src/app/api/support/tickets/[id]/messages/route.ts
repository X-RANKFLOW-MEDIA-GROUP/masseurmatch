export const dynamic = "force-dynamic";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import { replySchema, resolveRequesterInfo, ticketAppUrl } from "@/app/api/_lib/support-tickets";

// POST /api/support/tickets/[id]/messages — provider replies on their ticket.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession(request);
    const { id } = await params;
    const body = await parseJsonBody(request, replySchema);
    const admin = createSupabaseAdminClient();

    const { data: ticket, error } = await admin
      .from("support_tickets")
      .select("id, user_id, subject")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new RouteError(500, error.message);
    if (!ticket || ticket.user_id !== session.userId) {
      throw new RouteError(404, "Ticket not found.");
    }

    const { data: inserted, error: messageError } = await admin
      .from("support_ticket_messages")
      .insert({
        ticket_id: id,
        sender_id: session.userId,
        sender_role: "provider",
        body: body.body,
      })
      .select("id, sender_role, body, created_at")
      .single();

    if (messageError || !inserted) {
      throw new RouteError(500, messageError?.message ?? "Could not post reply.");
    }

    const requester = await resolveRequesterInfo(session.userId);

    await notifyAdmin({
      subject: `New reply on: ${ticket.subject}`,
      heading: "New reply on a support ticket",
      intro: `${requester.name || "A provider"} replied to their support ticket.`,
      fields: [
        { label: "From", value: requester.name },
        { label: "Email", value: requester.email ?? session.email },
        { label: "Ticket", value: ticket.subject },
      ],
      message: body.body,
      action: { label: "Open in admin", url: ticketAppUrl(`/admin/tickets?ticket=${ticket.id}`) },
      replyTo: requester.email ?? session.email ?? null,
    });

    const message = {
      id: inserted.id,
      author_role: inserted.sender_role,
      author_name: null,
      body: inserted.body,
      created_at: inserted.created_at,
    };

    return json({ ok: true, message }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
