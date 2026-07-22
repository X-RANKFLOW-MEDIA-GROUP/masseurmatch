import { json } from "@/app/api/_lib/http";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return json({ ok: true });
}
