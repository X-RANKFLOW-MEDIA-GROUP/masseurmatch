import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient, type User } from "npm:@supabase/supabase-js@2.57.2";

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://masseurmatch.com";
const INACTIVITY_MS = 24 * 60 * 60 * 1000;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char] ?? char);
}

function renderHtml(name: string) {
  const safeName = escapeHtml(name);
  const loginUrl = `${SITE_URL}/login`;
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F7F7F7"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F7F7"><tr><td align="center" style="padding:36px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FFFFFF;border:1px solid #E8E8E8;border-radius:24px;overflow:hidden"><tr><td style="padding:46px 48px 20px"><span style="background:#F8EDEE;border:1px solid #EDD1D5;border-radius:999px;color:#8B1E2D;display:inline-block;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.2px;line-height:16px;padding:7px 12px;text-transform:uppercase">Account Reminder</span><h1 style="color:#111111;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:38px;line-height:41px;margin:20px 0 18px">Keep your profile active</h1><p style="color:#7D7D7D;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:17px;line-height:28px;margin:0 0 24px">Hi ${safeName}, it has been more than 24 hours since your last MasseurMatch sign-in. Log in to review your profile and keep your account information current.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;border:1px solid #E8E8E8;border-radius:18px"><tr><td style="padding:24px;color:#7D7D7D;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:14px;line-height:23px"><strong style="color:#111111">Quick check-in</strong><br/>Review your profile details, availability, photos, and other information that you choose to publish.</td></tr></table><p style="margin:26px 0 32px"><a href="${loginUrl}" style="background:#8B1E2D;border-radius:12px;color:#FFFFFF;display:inline-block;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;padding:14px 22px;text-decoration:none">Log in to MasseurMatch</a></p><p style="border-top:1px solid #E8E8E8;color:#7D7D7D;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:13px;line-height:21px;padding-top:22px">This reminder is based only on your recorded sign-in activity. Logging in does not guarantee views, inquiries, clients, bookings, or income.</p></td></tr><tr><td style="background:#111111;color:#AFAFAF;font-family:'Satoshi','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:19px;padding:30px 48px">MasseurMatch<br/>A directory connecting visitors with independent massage professionals.<br/><br/><a href="{{unsubscribe_url}}" style="color:#D5D5D5">Unsubscribe</a></td></tr></table></td></tr></table></body></html>`;
}

function renderText(name: string) {
  return `Hi ${name},\n\nIt has been more than 24 hours since your last MasseurMatch sign-in. Log in to review your profile and keep your account information current.\n\nLog in: ${SITE_URL}/login\n\nThis reminder is based only on recorded sign-in activity. Logging in does not guarantee views, inquiries, clients, bookings, or income.`;
}

async function listAllUsers(supabase: ReturnType<typeof createClient>) {
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET") ?? "";
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return new Response(JSON.stringify({ error: "configuration_error" }), { status: 503 });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const now = Date.now();
  const users = await listAllUsers(supabase);
  const candidates = users.filter((user) => {
    if (!user.email || !user.email_confirmed_at || !user.last_sign_in_at) return false;
    return now - new Date(user.last_sign_in_at).getTime() >= INACTIVITY_MS;
  });

  let queued = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of candidates) {
    try {
      const { data: roleRows, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id).limit(1);
      if (roleError) throw roleError;
      const role = roleRows?.[0]?.role;
      if (!['provider', 'therapist', 'masseur'].includes(String(role))) { skipped++; continue; }

      const { data: profile, error: profileError } = await supabase.from("profiles").select("display_name,full_name,status,is_active").eq("user_id", user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile || profile.is_active === false || profile.status === "banned") { skipped++; continue; }

      const name = profile.display_name || profile.full_name || user.user_metadata?.full_name || "there";
      const lastSignIn = user.last_sign_in_at as string;
      const idempotencyKey = `provider-inactive-24h:${user.id}:${lastSignIn}`;

      const { data, error } = await supabase.rpc("queue_lifecycle_email", {
        p_user_id: user.id,
        p_recipient_email: user.email,
        p_recipient_name: name,
        p_segment: "provider_inactive_24h",
        p_campaign_key: "provider_inactive_24h",
        p_flow_key: "provider_account_activity",
        p_template_key: "provider_inactive_24h_v1",
        p_send_category: "marketing",
        p_subject: "A quick reminder to check your MasseurMatch profile",
        p_body_html: renderHtml(name),
        p_body_text: renderText(name),
        p_from_address: "MasseurMatch Updates <updates@masseurmatch.com>",
        p_reply_to: "support@masseurmatch.com",
        p_payload: { last_sign_in_at: lastSignIn, trigger_hours: 24 },
        p_scheduled_for: new Date().toISOString(),
        p_idempotency_key: idempotencyKey,
      });
      if (error) throw error;
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.status === "queued") queued++; else skipped++;
    } catch (error) {
      console.error("[INACTIVITY-REMINDER] provider failed", { user_id: user.id, error: error instanceof Error ? error.message : String(error) });
      failed++;
    }
  }

  return new Response(JSON.stringify({ success: true, scanned: users.length, candidates: candidates.length, queued, skipped, failed }), { headers: { "content-type": "application/json" } });
});
