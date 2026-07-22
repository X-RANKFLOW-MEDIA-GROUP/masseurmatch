import { errorResponse, json, RouteError } from "@/app/api/_lib/http";
import { requireRequestSession } from "@/app/_lib/session";
import { createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function GET(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const supabase = createSupabaseAdminClient();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const unreadOnly = searchParams.get("unread_only") === "true";

    let query = supabase
      .from("notifications")
      .select("id, type, title, body, metadata, read_at, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) query = query.is("read_at", null);

    const { data: notifications, error } = await query;
    if (error) throw new RouteError(500, error.message);

    return json({ ok: true, notifications: notifications ?? [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireRequestSession(request);
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return json({ ok: false, error: "Notification ID required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("user_id")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification || notification.user_id !== session.userId) {
      return json({ ok: false, error: "Notification not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) throw new RouteError(500, error.message);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
