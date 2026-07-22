import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { normalizeSessionRole } from "@/app/api/_lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const role =
    normalizeSessionRole((user.app_metadata as Record<string, unknown> | undefined)?.role) ??
    normalizeSessionRole((user.user_metadata as Record<string, unknown> | undefined)?.role);

  if (role === "provider" || role === "admin") {
    redirect("/pro/dashboard");
  }

  // Clients and not-yet-roled accounts land on the public site.
  redirect("/");
}
