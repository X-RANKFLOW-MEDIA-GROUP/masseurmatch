import { json } from "@/app/api/_lib/http";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  // Signs out with the default global scope: revokes the refresh token at
  // Supabase and clears the auth cookies on the response.
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return json({ ok: true });
}
