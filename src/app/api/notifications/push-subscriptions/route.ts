import { NextRequest, NextResponse } from "next/server";
import { requireSession, createSupabaseAdminClient } from "@/app/api/_lib/supabase-server";

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession(request as unknown as Request);
  } catch {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endpoint, keys } = body as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid push subscription payload" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: session.userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          user_agent: request.headers.get("user-agent"),
          is_active: true,
        },
        { onConflict: "user_id,endpoint" },
      )
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
