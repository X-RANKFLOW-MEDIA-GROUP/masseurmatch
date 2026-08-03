import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, requireAdminSession } from "@/app/api/_lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession(request);
    const supabase = createSupabaseAdminClient();

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id,user_id,display_name,full_name,city,status,updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);

    const users: Array<{ id: string; email: string | null }> = [];
    let page = 1;
    while (page > 0) {
      const { data, error: usersError } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      if (usersError) throw new Error(usersError.message);
      for (const user of data.users || []) users.push({ id: user.id, email: user.email || null });
      page = data.nextPage || 0;
    }

    const emailMap = new Map(users.map((user) => [user.id, user.email]));
    const recipients = (profiles || [])
      .map((profile) => ({
        profileId: profile.id,
        userId: profile.user_id,
        name: profile.display_name || profile.full_name || "Provider",
        email: emailMap.get(profile.user_id) || null,
        city: profile.city || null,
        status: profile.status || null,
      }))
      .filter((recipient): recipient is typeof recipient & { email: string } => Boolean(recipient.email));

    return NextResponse.json({ recipients });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load recipients";
    const status = message.includes("Authentication") ? 401 : message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
