export const dynamic = "force-dynamic";

import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";
import { TICKET_STATUSES, type TicketStatus } from "@/app/api/_lib/support-tickets";

// GET /api/admin/tickets — every ticket, newest activity first, optional status filter.
export async function GET(request: Request) {
  try {
    await requireAdminSession(request);
    const admin = createSupabaseAdminClient();

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");

    let query = admin
      .from("support_tickets")
      .select("id, user_id, subject, category, priority, status, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (statusParam && TICKET_STATUSES.includes(statusParam as TicketStatus)) {
      query = query.eq("status", statusParam);
    }

    const { data, error } = await query;
    if (error) throw new RouteError(500, error.message);

    const rows = data ?? [];

    // Batch-resolve requester name/email from profiles for display.
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    const requesterMap = new Map<string, { name: string | null; email: string | null }>();

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("user_id, full_name, display_name, email, email_address")
        .in("user_id", userIds);

      for (const p of profiles ?? []) {
        if (!p.user_id) continue;
        requesterMap.set(p.user_id, {
          name: p.full_name || p.display_name || null,
          email: p.email || p.email_address || null,
        });
      }
    }

    const tickets = rows.map((r) => {
      const requester = requesterMap.get(r.user_id);
      return {
        ...r,
        last_message_at: r.updated_at,
        requester_name: requester?.name ?? null,
        requester_email: requester?.email ?? null,
      };
    });

    const openCount = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress",
    ).length;

    return json({ ok: true, tickets, openCount });
  } catch (error) {
    return errorResponse(error);
  }
}
