// Pure, runtime-agnostic email builders for the auth-email-hook Edge Function.
// Kept free of any Deno.* API so it can be unit-tested under Node/vitest and
// imported by the Deno function (index.ts) alike. URL config is passed in
// rather than read from the environment here.

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
}

export interface EmailUrlConfig {
  /** Supabase project URL, e.g. https://<ref>.supabase.co */
  supabaseUrl: string;
  /** Public site URL, used as the redirect fallback. */
  siteUrl: string;
}

function shell(title: string, content: string, badge = "Account"): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F7F7F7;font-family:Arial,sans-serif;color:#111111">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F7F7F7;padding:28px 12px">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#FFFFFF;border:1px solid #E8E8E8;border-radius:14px;overflow:hidden">
        <tr><td style="background:#111111;padding:22px 28px 24px">
          <span style="display:inline-block;background:#8B1E2D;color:#FFFFFF;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;padding:7px 10px;border-radius:999px;margin-bottom:10px">${badge}</span>
          <h1 style="margin:8px 0;font-size:26px;line-height:1.2;color:#FFFFFF">${title}</h1>
        </td></tr>
        <tr><td style="padding:28px 28px 24px">${content}</td></tr>
        <tr><td style="padding:0 28px"><hr style="border:none;border-top:1px solid #E8E8E8;margin:0" /></td></tr>
        <tr><td style="padding:14px 28px 20px;font-size:12px;line-height:1.6;color:#8E8E8E">
          This email was sent by MasseurMatch. If you didn't request this, you can safely ignore it.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#8B1E2D;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:700;padding:12px 24px;border-radius:8px;margin-top:8px">${text}</a>`;
}

// Server routes that verify the token_hash themselves via verifyOtp(). When a
// redirect targets one of these, we hand it the raw token_hash directly instead
// of routing through GoTrue's /auth/v1/verify.
const APP_CALLBACK_PATHS = new Set(["/api/auth/callback", "/auth/callback"]);

function confirmUrl(
  config: EmailUrlConfig,
  type: string,
  tokenHash: string,
  redirectTo: string,
): string {
  // When the redirect targets one of our own server callback routes, deliver
  // the raw token_hash straight to it (as ?token_hash & ?type) so the route can
  // establish the session with verifyOtp(). That path needs NO PKCE
  // code_verifier, so it works for server-initiated signups and across devices
  // — unlike routing through GoTrue's /auth/v1/verify, which consumes the token
  // and hands back only a ?code the server has no verifier to exchange (the
  // cause of the "Sign-in failed" bounce to /login after confirming an account).
  try {
    const target = new URL(redirectTo);
    if (APP_CALLBACK_PATHS.has(target.pathname)) {
      target.searchParams.set("token_hash", tokenHash);
      target.searchParams.set("type", type);
      return target.toString();
    }
  } catch {
    // Unparseable redirectTo — fall through to the standard verify link.
  }

  // Standard flow (e.g. recovery → the client /reset-password page): route
  // through GoTrue's verify endpoint. redirectTo is a query-parameter value
  // here, so it must be percent-encoded exactly once — matching what Supabase's
  // official token_hash template does (Go's html/template urlquery-escapes
  // {{ .RedirectTo }} in this position). Leaving it raw would let any '&' in the
  // redirect leak into GoTrue's own query string.
  return `${config.supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
}

// Returns the list of emails to send for a given auth action. Most actions
// produce a single message to the user's current address; email_change is the
// exception — see below.
export function buildMessages(
  actionType: string,
  emailData: Record<string, string>,
  user: Record<string, string>,
  config: EmailUrlConfig,
): OutgoingEmail[] {
  const redirectTo = emailData.redirect_to || config.siteUrl;
  const userEmail = user.email ?? "";
  const newEmail = user.new_email ?? emailData.new_email ?? "";

  switch (actionType) {
    case "signup":
      return [{
        to: userEmail,
        subject: "Confirm your MasseurMatch email",
        html: shell("Confirm Your Email", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Thanks for signing up! Click below to confirm your email address and activate your account.</p>
          ${btn("Confirm Email", confirmUrl(config, "signup", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 24 hours.</p>
        `),
      }];

    case "recovery":
      return [{
        to: userEmail,
        subject: "Reset your MasseurMatch password",
        html: shell("Reset Your Password", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">We received a request to reset the password for <strong>${userEmail}</strong>. Click below to choose a new password.</p>
          ${btn("Reset Password", confirmUrl(config, "recovery", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        `, "Security"),
      }];

    case "magiclink":
      return [{
        to: userEmail,
        subject: "Your MasseurMatch login link",
        html: shell("Your Login Link", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Click below to sign in to your MasseurMatch account. This link can only be used once.</p>
          ${btn("Sign In", confirmUrl(config, "magiclink", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 1 hour.</p>
        `),
      }];

    case "invite":
      return [{
        to: userEmail,
        subject: "You've been invited to MasseurMatch",
        html: shell("You've Been Invited", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">You've been invited to join MasseurMatch. Click below to accept your invitation and set up your account.</p>
          ${btn("Accept Invitation", confirmUrl(config, "invite", emailData.token_hash, redirectTo))}
          <p style="font-size:13px;color:#8E8E8E;margin-top:20px">This link expires in 24 hours.</p>
        `, "Invitation"),
      }];

    case "email_change": {
      // The confirmation that proves control of the NEW inbox must be delivered
      // to new_email using token_hash_new. With Secure Email Change enabled,
      // GoTrue also issues token_hash for the CURRENT address, which must be
      // confirmed from that inbox — so up to two distinct messages are sent.
      const messages: OutgoingEmail[] = [];
      const newTokenHash = emailData.token_hash_new || emailData.token_hash;
      const newRecipient = newEmail || userEmail;

      if (newRecipient && newTokenHash) {
        messages.push({
          to: newRecipient,
          subject: "Confirm your new MasseurMatch email",
          html: shell("Confirm Your New Email", `
            <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Click below to confirm this as the new email address for your MasseurMatch account.</p>
            ${btn("Confirm New Email", confirmUrl(config, "email_change", newTokenHash, redirectTo))}
            <p style="font-size:13px;color:#8E8E8E;margin-top:20px">If you didn't request an email change, contact support immediately.</p>
          `, "Security"),
        });
      }

      // Secure Email Change: a second, distinct token for the current address.
      if (
        userEmail &&
        emailData.token_hash &&
        emailData.token_hash_new &&
        emailData.token_hash !== emailData.token_hash_new
      ) {
        messages.push({
          to: userEmail,
          subject: "Confirm the email change on your MasseurMatch account",
          html: shell("Confirm This Change", `
            <p style="font-size:16px;line-height:1.6;margin:0 0 20px">A request was made to change the email on your account${newEmail ? ` to <strong>${newEmail}</strong>` : ""}. Click below to confirm from your current address.</p>
            ${btn("Confirm Change", confirmUrl(config, "email_change", emailData.token_hash, redirectTo))}
            <p style="font-size:13px;color:#8E8E8E;margin-top:20px">If you didn't request an email change, contact support immediately.</p>
          `, "Security"),
        });
      }

      return messages;
    }

    case "reauthentication":
      return [{
        to: userEmail,
        subject: "Your MasseurMatch verification code",
        html: shell("Your Verification Code", `
          <p style="font-size:16px;line-height:1.6;margin:0 0 20px">Enter this code to verify your identity:</p>
          <div style="background:#F7F7F7;border:1px solid #E8E8E8;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px">
            <span style="font-size:36px;font-weight:700;letter-spacing:0.15em;color:#111111">${emailData.token}</span>
          </div>
          <p style="font-size:13px;color:#8E8E8E">This code expires in 10 minutes. Do not share it with anyone.</p>
        `, "Security"),
      }];

    default:
      return [];
  }
}
