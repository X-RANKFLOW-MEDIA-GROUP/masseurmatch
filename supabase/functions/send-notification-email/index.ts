import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = {
  name: "MasseurMatch",
  color: "#6366f1",
  url: "https://masseurmatch.com",
  logo: "https://masseurmatch.com/favicon.ico",
};

// ── HTML wrapper ──
function htmlEmail(title: string, body: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
body{margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.wrap{max-width:560px;margin:0 auto;padding:32px 16px}
.card{background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.logo{text-align:center;margin-bottom:24px}
.logo span{font-size:22px;font-weight:700;color:${BRAND.color}}
h1{font-size:20px;font-weight:700;color:#18181b;margin:0 0 16px}
p{font-size:15px;line-height:1.6;color:#3f3f46;margin:0 0 16px}
.btn{display:inline-block;background:${BRAND.color};color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;margin:8px 0 16px}
.muted{font-size:13px;color:#71717a}
.footer{text-align:center;padding:24px 0 0;font-size:12px;color:#a1a1aa}
.footer a{color:#71717a}
.divider{border:none;border-top:1px solid #e4e4e7;margin:24px 0}
.alert-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0}
.alert-box p{color:#991b1b;margin:0;font-size:14px}
.info-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0}
.info-box p{color:#1e40af;margin:0;font-size:14px}
.checklist{list-style:none;padding:0;margin:16px 0}
.checklist li{padding:6px 0;font-size:14px;color:#3f3f46}
.checklist li::before{content:"☐ ";color:#a1a1aa}
.checklist li.done::before{content:"✓ ";color:#22c55e}
</style>
</head>
<body>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>` : ""}
<div class="wrap">
<div class="card">
<div class="logo"><span>${BRAND.name}</span></div>
${body}
</div>
<div class="footer">
<p>&copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
<p><a href="${BRAND.url}/privacy">Privacy</a> · <a href="${BRAND.url}/terms">Terms</a> · <a href="${BRAND.url}">Website</a></p>
</div>
</div>
</body>
</html>`;
}

// ── Templates ──
interface TemplateData {
  name?: string;
  link?: string;
  changes?: string;
  date?: string;
  ip?: string;
  plan?: string;
  amount?: string;
  trial_end?: string;
  report_id?: string;
  result?: string;
  [key: string]: string | undefined;
}

function getTemplate(template: string, data: TemplateData): { subject: string; html: string; from: string } {
  const n = data.name || "there";
  const dashboardLink = `${BRAND.url}/dashboard`;

  switch (template) {
    // ═══════════════════════════════════════
    // 1. ACCOUNT & VERIFICATION
    // ═══════════════════════════════════════
    case "confirm_email":
      return {
        from: `${BRAND.name} <noreply@masseurmatch.com>`,
        subject: "Confirm your email address",
        html: htmlEmail("Confirm Email", `
          <h1>Verify your email</h1>
          <p>Hi ${n},</p>
          <p>Thanks for signing up for ${BRAND.name}. Click the button below to verify your email address. This link expires in 30 minutes.</p>
          <p style="text-align:center"><a href="${data.link}" class="btn">Verify Email</a></p>
          <p class="muted">If you didn't create an account, you can safely ignore this email.</p>
        `, "Verify your email to get started"),
      };

    case "email_verified":
      return {
        from: `${BRAND.name} <notifications@masseurmatch.com>`,
        subject: "Email verified — complete your profile ✓",
        html: htmlEmail("Email Verified", `
          <h1>Email verified!</h1>
          <p>Hi ${n},</p>
          <p>Your email has been successfully verified. You're one step closer to going live on ${BRAND.name}.</p>
          <p style="text-align:center"><a href="${dashboardLink}/profile" class="btn">Complete Your Profile</a></p>
        `, "Your email has been verified"),
      };

    // ═══════════════════════════════════════
    // 2. ACCESS & SECURITY
    // ═══════════════════════════════════════
    case "welcome":
      return {
        from: `${BRAND.name} <onboarding@masseurmatch.com>`,
        subject: `Welcome to ${BRAND.name} — let's get you set up`,
        html: htmlEmail("Welcome", `
          <h1>Welcome to ${BRAND.name}! 🎉</h1>
          <p>Hi ${n},</p>
          <p>We're thrilled to have you here. Here's your quick activation checklist:</p>
          <ul class="checklist">
            <li class="done">Create account</li>
            <li class="done">Verify email</li>
            <li>Complete your profile</li>
            <li>Upload professional photos</li>
            <li>Verify your identity</li>
          </ul>
          <p style="text-align:center"><a href="${dashboardLink}" class="btn">Go to Dashboard</a></p>
          <p class="muted">Once your profile is reviewed and approved, you'll be live in the directory.</p>
        `, "Your activation checklist"),
      };

    case "password_reset":
      return {
        from: `${BRAND.name} <noreply@masseurmatch.com>`,
        subject: "Reset your password",
        html: htmlEmail("Password Reset", `
          <h1>Password reset request</h1>
          <p>Hi ${n},</p>
          <p>We received a request to reset your password. Click below to set a new one. This link expires in 15 minutes.</p>
          <p style="text-align:center"><a href="${data.link}" class="btn">Reset Password</a></p>
          <p class="muted">If you didn't request this, no action is needed — your password remains unchanged.</p>
        `, "Reset your password"),
      };

    case "password_changed":
      return {
        from: `${BRAND.name} <security@masseurmatch.com>`,
        subject: "Your password was changed",
        html: htmlEmail("Password Changed", `
          <h1>Password updated</h1>
          <p>Hi ${n},</p>
          <p>Your password was successfully changed on ${data.date || new Date().toLocaleString()}.</p>
          <div class="alert-box">
            <p><strong>Wasn't you?</strong> Secure your account immediately by resetting your password and contacting support.</p>
          </div>
          <p style="text-align:center"><a href="${BRAND.url}/auth?mode=reset" class="btn">Secure My Account</a></p>
        `, "Your password was changed"),
      };

    case "new_login_alert":
      return {
        from: `${BRAND.name} <security@masseurmatch.com>`,
        subject: "New login detected on your account",
        html: htmlEmail("New Login", `
          <h1>New login detected</h1>
          <p>Hi ${n},</p>
          <p>We noticed a new sign-in to your ${BRAND.name} account:</p>
          <div class="info-box">
            <p><strong>Date:</strong> ${data.date || new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${data.ip || "Unknown"}</p>
          </div>
          <p>If this was you, no action is needed.</p>
          <div class="alert-box">
            <p><strong>Not you?</strong> Change your password immediately.</p>
          </div>
          <p style="text-align:center"><a href="${BRAND.url}/auth?mode=reset" class="btn">Protect My Account</a></p>
        `, "New login to your account"),
      };

    // ═══════════════════════════════════════
    // 3. THERAPIST ONBOARDING
    // ═══════════════════════════════════════
    case "complete_profile_reminder":
      return {
        from: `${BRAND.name} <onboarding@masseurmatch.com>`,
        subject: "Your profile is almost ready — finish setting up",
        html: htmlEmail("Complete Profile", `
          <h1>Don't leave your profile incomplete!</h1>
          <p>Hi ${n},</p>
          <p>You're close to going live on ${BRAND.name}. Complete these remaining steps to start appearing in the directory:</p>
          <ul class="checklist">
            ${data.changes || "<li>Complete your profile details</li><li>Upload professional photos</li><li>Verify your identity</li>"}
          </ul>
          <p style="text-align:center"><a href="${dashboardLink}/profile" class="btn">Finish Profile</a></p>
          <p class="muted">Profiles that are complete and verified get significantly more visibility.</p>
        `, "Complete your profile to go live"),
      };

    case "profile_approved":
      return {
        from: `${BRAND.name} <notifications@masseurmatch.com>`,
        subject: "Your profile is now live! 🎉",
        html: htmlEmail("Profile Live", `
          <h1>You're live! 🎉</h1>
          <p>Hi ${n},</p>
          <p>Great news — your profile has been reviewed and approved. It's now visible in the ${BRAND.name} directory.</p>
          <p style="text-align:center"><a href="${data.link || dashboardLink}" class="btn">View My Profile</a></p>
          <hr class="divider">
          <p><strong>Tips to get more inquiries:</strong></p>
          <ul style="font-size:14px;color:#3f3f46">
            <li>Keep your availability up to date</li>
            <li>Add multiple professional photos</li>
            <li>Write a detailed bio highlighting your specialties</li>
            <li>Set competitive pricing</li>
          </ul>
        `, "Your profile is now live in the directory"),
      };

    case "profile_rejected":
      return {
        from: `${BRAND.name} <notifications@masseurmatch.com>`,
        subject: "Profile review update — action needed",
        html: htmlEmail("Profile Review", `
          <h1>Profile review update</h1>
          <p>Hi ${n},</p>
          <p>Your profile has been reviewed and requires some changes before it can go live. Please review the feedback and update accordingly.</p>
          ${data.changes ? `<div class="info-box"><p>${data.changes}</p></div>` : ""}
          <p style="text-align:center"><a href="${dashboardLink}/profile" class="btn">Update Profile</a></p>
          <p class="muted">If you have questions, contact our support team.</p>
        `, "Your profile needs updates"),
      };

    case "profile_update_confirmation":
      return {
        from: `${BRAND.name} <notifications@masseurmatch.com>`,
        subject: "Profile changes saved",
        html: htmlEmail("Profile Updated", `
          <h1>Profile updated</h1>
          <p>Hi ${n},</p>
          <p>Your profile has been updated. Here's a summary of changes:</p>
          <div class="info-box"><p>${data.changes || "Profile fields were modified"}</p></div>
          <p class="muted">Critical changes (contact, city, pricing) may trigger a re-review before your profile goes live again.</p>
          <p style="text-align:center"><a href="${dashboardLink}/profile" class="btn">View Dashboard</a></p>
        `, "Your profile changes have been saved"),
      };

    // ═══════════════════════════════════════
    // 4. BILLING & SUBSCRIPTIONS
    // ═══════════════════════════════════════
    case "trial_started":
      return {
        from: `${BRAND.name} <billing@masseurmatch.com>`,
        subject: "Your 14-day free trial has started",
        html: htmlEmail("Trial Started", `
          <h1>Your trial is active! 🚀</h1>
          <p>Hi ${n},</p>
          <p>Your <strong>${data.plan || "Premium"}</strong> free trial is now active. Here's what you get:</p>
          <ul style="font-size:14px;color:#3f3f46">
            <li>Full access to all ${data.plan || "Premium"} features</li>
            <li>Priority listing in search results</li>
            <li>Featured profile placement</li>
          </ul>
          <div class="info-box"><p><strong>Trial ends:</strong> ${data.trial_end || "in 14 days"}</p></div>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">Manage Subscription</a></p>
        `, "Your free trial is now active"),
      };

    case "trial_ending_soon":
      return {
        from: `${BRAND.name} <billing@masseurmatch.com>`,
        subject: "Your trial ends soon — don't lose your features",
        html: htmlEmail("Trial Ending", `
          <h1>Your trial is ending soon</h1>
          <p>Hi ${n},</p>
          <p>Your <strong>${data.plan || "Premium"}</strong> trial ends on <strong>${data.trial_end || "soon"}</strong>. To keep your premium features and listing visibility, add a payment method before it expires.</p>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">Add Payment Method</a></p>
          <p class="muted">If you don't upgrade, your account will revert to the Free plan.</p>
        `, "Don't lose your premium features"),
      };

    case "payment_failed":
      return {
        from: `${BRAND.name} <billing@masseurmatch.com>`,
        subject: "⚠️ Payment failed — update your card",
        html: htmlEmail("Payment Failed", `
          <h1>Payment failed</h1>
          <p>Hi ${n},</p>
          <p>We couldn't process your payment for the <strong>${data.plan || ""}</strong> plan. Please update your payment method within 3 days to avoid a downgrade.</p>
          <div class="alert-box"><p><strong>Action required:</strong> Update your card to keep your premium features.</p></div>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">Update Payment Method</a></p>
        `, "Action needed: update your payment method"),
      };

    case "subscription_activated":
      return {
        from: `${BRAND.name} <receipts@masseurmatch.com>`,
        subject: "Payment confirmed — subscription active ✓",
        html: htmlEmail("Subscription Active", `
          <h1>Subscription active ✓</h1>
          <p>Hi ${n},</p>
          <p>Your <strong>${data.plan || ""}</strong> plan is now active.</p>
          <div class="info-box">
            <p><strong>Plan:</strong> ${data.plan || "N/A"}</p>
            <p><strong>Amount:</strong> ${data.amount || "N/A"}</p>
            <p><strong>Next billing:</strong> ${data.date || "N/A"}</p>
          </div>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">View Subscription</a></p>
        `, "Your subscription is confirmed"),
      };

    case "plan_changed":
      return {
        from: `${BRAND.name} <billing@masseurmatch.com>`,
        subject: "Your plan has been updated",
        html: htmlEmail("Plan Changed", `
          <h1>Plan updated</h1>
          <p>Hi ${n},</p>
          <p>Your subscription has been changed:</p>
          <div class="info-box">
            <p>${data.changes || "Your plan has been updated."}</p>
            <p><strong>Next billing:</strong> ${data.date || "N/A"}</p>
          </div>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">View Details</a></p>
        `, "Your plan has been updated"),
      };

    case "cancellation_confirmation":
      return {
        from: `${BRAND.name} <billing@masseurmatch.com>`,
        subject: "Subscription cancelled — you'll be missed",
        html: htmlEmail("Cancelled", `
          <h1>Subscription cancelled</h1>
          <p>Hi ${n},</p>
          <p>Your subscription has been cancelled. You'll keep access to premium features until <strong>${data.date || "the end of your billing period"}</strong>.</p>
          <p>After that, your account will revert to the Free plan. You can reactivate anytime.</p>
          <p style="text-align:center"><a href="${dashboardLink}/subscription" class="btn">Reactivate Plan</a></p>
          <p class="muted">We'd love to hear your feedback — reply to this email to let us know how we can improve.</p>
        `, "Your subscription has been cancelled"),
      };

    // ═══════════════════════════════════════
    // 5. TRUST & SAFETY
    // ═══════════════════════════════════════
    case "report_received":
      return {
        from: `${BRAND.name} <safety@masseurmatch.com>`,
        subject: "We received your report",
        html: htmlEmail("Report Received", `
          <h1>Report received</h1>
          <p>Hi ${n},</p>
          <p>Thank you for reporting this content. Our trust & safety team will review it within 24–48 hours.</p>
          ${data.report_id ? `<p class="muted">Reference: #${data.report_id}</p>` : ""}
          <p>We take every report seriously. You'll receive an update once a decision has been made.</p>
          <p class="muted">No further action is needed from you at this time.</p>
        `, "Your report is being reviewed"),
      };

    case "report_action_taken":
      return {
        from: `${BRAND.name} <safety@masseurmatch.com>`,
        subject: "Update on your report",
        html: htmlEmail("Report Update", `
          <h1>Report update</h1>
          <p>Hi ${n},</p>
          <p>We've reviewed the content you reported and have taken the following action:</p>
          <div class="info-box"><p>${data.result || "Appropriate action has been taken."}</p></div>
          ${data.link ? `<p>If you believe this decision was made in error, you can <a href="${data.link}">submit an appeal</a>.</p>` : ""}
          <p class="muted">Thank you for helping keep ${BRAND.name} safe.</p>
        `, "We've reviewed your report"),
      };

    // ═══════════════════════════════════════
    // 6. ADMIN NOTIFICATIONS
    // ═══════════════════════════════════════
    case "admin_new_signup":
      return {
        from: `${BRAND.name} <system@masseurmatch.com>`,
        subject: `[Admin] New therapist signup: ${data.name}`,
        html: htmlEmail("Admin Alert", `
          <h1>New Therapist Signup</h1>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.link || "N/A"}</p>
          <p><strong>Date:</strong> ${data.date || new Date().toISOString()}</p>
          <p style="text-align:center"><a href="${BRAND.url}/admin/users" class="btn">Review in Admin</a></p>
        `),
      };

    case "admin_trial_started":
      return {
        from: `${BRAND.name} <system@masseurmatch.com>`,
        subject: `[Admin] New trial: ${data.name} — ${data.plan}`,
        html: htmlEmail("Admin Alert", `
          <h1>New Trial Started</h1>
          <p><strong>User:</strong> ${data.name}</p>
          <p><strong>Plan:</strong> ${data.plan || "N/A"}</p>
          <p><strong>Ends:</strong> ${data.trial_end || "N/A"}</p>
        `),
      };

    case "admin_payment_failed":
      return {
        from: `${BRAND.name} <system@masseurmatch.com>`,
        subject: `[Admin] Payment failed: ${data.name}`,
        html: htmlEmail("Admin Alert", `
          <h1>Payment Failed</h1>
          <p><strong>User:</strong> ${data.name}</p>
          <p><strong>Plan:</strong> ${data.plan || "N/A"}</p>
          <p><strong>Amount:</strong> ${data.amount || "N/A"}</p>
        `),
      };

    case "admin_urgent_report":
      return {
        from: `${BRAND.name} <system@masseurmatch.com>`,
        subject: `[URGENT] Report flagged: #${data.report_id}`,
        html: htmlEmail("Admin Alert", `
          <h1>⚠️ Urgent Report Flagged</h1>
          <p><strong>Report ID:</strong> #${data.report_id || "N/A"}</p>
          <p><strong>Reason:</strong> ${data.changes || "N/A"}</p>
          <p style="text-align:center"><a href="${BRAND.url}/admin/flags" class="btn">Review Now</a></p>
        `),
      };

    // ═══════════════════════════════════════
    // 7. SUPPORT TICKETS
    // ═══════════════════════════════════════
    case "ticket_created":
      return {
        from: `${BRAND.name} <support@masseurmatch.com>`,
        subject: `Ticket received: ${data.ticket_subject || "Support Request"} — we're on it`,
        html: htmlEmail("Ticket Created", `
          <h1>We received your ticket</h1>
          <p>Hi ${n},</p>
          <p>Your support ticket <strong>"${data.ticket_subject || "Support Request"}"</strong> has been submitted successfully.</p>
          <div class="info-box">
            <p><strong>Subject:</strong> ${data.ticket_subject || "N/A"}</p>
            <p><strong>Message:</strong> ${data.ticket_message ? data.ticket_message.substring(0, 300) + (data.ticket_message.length > 300 ? "..." : "") : "N/A"}</p>
          </div>
          <p>Our team will review it and respond within <strong>24–48 hours</strong>. You'll receive an email when we reply.</p>
          <p style="text-align:center"><a href="${dashboardLink}/support" class="btn">View Ticket</a></p>
          <p class="muted">You can track and reply to your ticket from your dashboard.</p>
        `, "We received your support ticket"),
      };

    case "ticket_reply":
      return {
        from: `${BRAND.name} <support@masseurmatch.com>`,
        subject: `New reply on your ticket: ${data.ticket_subject || "Support Request"}`,
        html: htmlEmail("Ticket Reply", `
          <h1>New reply on your ticket</h1>
          <p>Hi ${n},</p>
          <p>Our support team has replied to your ticket <strong>"${data.ticket_subject || "Support Request"}"</strong>:</p>
          <div class="info-box"><p>${data.reply_message || "Please check your dashboard for the full response."}</p></div>
          <p style="text-align:center"><a href="${dashboardLink}/support" class="btn">View Conversation</a></p>
          <p class="muted">You can reply directly from your dashboard.</p>
        `, "You have a new reply on your support ticket"),
      };

    // ═══════════════════════════════════════
    // 8. NEWSLETTER
    // ═══════════════════════════════════════
    case "newsletter_welcome":
      return {
        from: `${BRAND.name} <newsletter@masseurmatch.com>`,
        subject: `Welcome to the ${BRAND.name} Newsletter! 💆`,
        html: htmlEmail("Newsletter Welcome", `
          <h1>You're in! 🎉</h1>
          <p>Hi there,</p>
          <p>Thanks for subscribing to the <strong>${BRAND.name}</strong> newsletter. Here's what you can expect:</p>
          <ul style="font-size:14px;color:#3f3f46;line-height:2">
            <li>🌟 New therapist spotlights</li>
            <li>💡 Wellness tips & self-care guides</li>
            <li>🏙️ City-specific recommendations</li>
            <li>🎁 Exclusive offers & promotions</li>
          </ul>
          <p>We keep it short, useful, and spam-free — just the good stuff.</p>
          <p style="text-align:center"><a href="${BRAND.url}/explore" class="btn">Explore Therapists</a></p>
          <hr class="divider">
          <p class="muted">You can unsubscribe at any time. We respect your privacy.</p>
        `, "Welcome to the MasseurMatch newsletter"),
      };

    default:
      throw new Error(`Unknown template: ${template}`);
  }
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email: directEmail, template, data: templateData } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY not configured");

    // Guard: only newsletter_welcome can use direct email (no user_id)
    const DIRECT_EMAIL_TEMPLATES = ["newsletter_welcome"];
    if (directEmail && !user_id && !DIRECT_EMAIL_TEMPLATES.includes(template)) {
      throw new Error("Direct email sending is not allowed for this template");
    }

    let recipientEmail = directEmail;
    let recipientName = templateData?.name;

    // If user_id provided, look up email & name
    if (user_id && !recipientEmail) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, serviceRoleKey);

      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
      if (userError || !userData?.user?.email) throw new Error("User not found or no email");
      recipientEmail = userData.user.email;

      if (!recipientName) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, full_name")
          .eq("user_id", user_id)
          .single();
        recipientName = profile?.display_name || profile?.full_name || "there";
      }
    }

    if (!recipientEmail) throw new Error("No recipient email provided");

    const emailData = { ...templateData, name: recipientName || "there" };
    const { subject, html, from } = getTemplate(template, emailData);

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const resendResult = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[EMAIL FAILED]", resendResult);
      throw new Error(resendResult.message || "Resend API error");
    }

    console.log(`[EMAIL SENT] Template: ${template}, To: ${recipientEmail}, ID: ${resendResult.id}`);

    return new Response(
      JSON.stringify({ success: true, email_id: resendResult.id, to: recipientEmail, subject }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Notification email error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
