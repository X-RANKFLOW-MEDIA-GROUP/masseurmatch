export const dynamic = "force-dynamic";

import { errorResponse, json, parseJsonBody, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireSession } from "@/app/api/_lib/supabase-server";
import { notifyAdmin } from "@/app/api/_lib/admin-notify";
import {
  CATEGORY_LABELS,
  createTicketSchema,
  resolveRequesterInfo,
  ticketAppUrl,
  type TicketCategory,
} from "@/app/api/_lib/support-tickets";

// GET /api/support/tickets — list the signed-in provider's own tickets.
export async function GET(request: Request) {
  try {
    const session = await requireSession(request);
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("support_tickets")
      .select("id, subject, category, priority, status, created_at, updated_at")
      .eq("user_id", session.userId)
      .order("updated_at", { ascending: false })
      .limit(200);

    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, tickets: data ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/support/tickets — open a new support ticket (provider → admin).
export async function POST(request: Request) {
  try {
    const session = await requireSession(request);
    const body = await parseJsonBody(request, createTicketSchema);
    const admin = createSupabaseAdminClient();

    const requester = await resolveRequesterInfo(session.userId);

    // Link the ticket to the provider's profile row when one exists.
    const { data: profileRow } = await admin
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    const { data: ticket, error: ticketError } = await admin
      .from("support_tickets")
      .insert({
        user_id: session.userId,
        profile_id: profileRow?.id ?? null,
        subject: body.subject,
        category: body.category,
        priority: body.priority,
        status: "open",
      })
      .select("id, subject, category, priority, status, created_at")
      .single();

    if (ticketError || !ticket) {
      throw new RouteError(500, ticketError?.message ?? "Could not create ticket.");
    }

    const { error: messageError } = await admin.from("support_ticket_messages").insert({
      ticket_id: ticket.id,
      sender_id: session.userId,
      sender_role: "provider",
      body: body.message,
    });

    if (messageError) {
      // Roll back the orphaned ticket so we don't leave an empty thread.
      await admin.from("support_tickets").delete().eq("id", ticket.id);
      throw new RouteError(500, messageError.message);
    }

    // Notify the admin team that a new ticket was submitted.
    await notifyAdmin({
      subject: `New support ticket: ${ticket.subject}`,
      heading: "New support ticket",
      intro: `${requester.name || "A provider"} opened a new support ticket.`,
      fields: [
        { label: "From", value: requester.name },
        { label: "Email", value: requester.email ?? session.email },
        { label: "Category", value: CATEGORY_LABELS[ticket.category as TicketCategory] ?? ticket.category },
        { label: "Priority", value: ticket.priority },
        { label: "Subject", value: ticket.subject },
      ],
      message: body.message,
      action: { label: "Open in admin", url: ticketAppUrl(`/admin/tickets?ticket=${ticket.id}`) },
      replyTo: requester.email ?? session.email ?? null,
    });

    return json({ ok: true, ticket }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
