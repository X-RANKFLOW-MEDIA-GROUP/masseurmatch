export type AdminEmailTemplateKey = "login-access-restored";
export type AdminEmailCategory = "marketing" | "transactional";

export type AdminEmailTemplateDefinition = {
  key: AdminEmailTemplateKey;
  label: string;
  description: string;
  defaultSubject: string;
  defaultCategory: AdminEmailCategory;
};

export type RenderAdminEmailInput = {
  templateKey: AdminEmailTemplateKey;
  firstName?: string | null;
  subject?: string | null;
  category?: AdminEmailCategory;
  loginUrl?: string | null;
  mailingAddress?: string | null;
};

export type RenderedAdminEmail = {
  subject: string;
  html: string;
  text: string;
};

const ACCESS_BANNER_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1784867716/E3BA7CEB-9F06-4632-BD6E-0A7E57208C83_z9a6wy.png";
const KNOTTY_BANNER_URL =
  "https://res.cloudinary.com/dyfxkq2nk/image/upload/v1784867739/D3742A68-94AC-4609-88D9-10231F48641B_yhbyws.png";
const SUPPORT_PHONE_DISPLAY = "978-MASSEUR";
const SUPPORT_PHONE_E164 = "+19786277387";

export const ADMIN_EMAIL_TEMPLATES: AdminEmailTemplateDefinition[] = [
  {
    key: "login-access-restored",
    label: "Login access restored",
    description:
      "Invite massage professionals back to their profile and introduce Knotty support.",
    defaultSubject: "Your MasseurMatch access is restored",
    defaultCategory: "transactional",
  },
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeHttpUrl(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function renderLoginAccessRestored(input: RenderAdminEmailInput): RenderedAdminEmail {
  const firstName = escapeHtml(input.firstName?.trim() || "there");
  const loginUrl = escapeHtml(safeHttpUrl(input.loginUrl, "https://masseurmatch.com/login"));
  const mailingAddress = escapeHtml(input.mailingAddress?.trim() || "MasseurMatch");
  const subject = input.subject?.trim() || "Your MasseurMatch access is restored";
  const unsubscribe =
    input.category === "marketing"
      ? '<p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#8b93a1;"><a href="{{unsubscribe_url}}" style="color:#8B1E2D;">Unsubscribe from marketing emails</a></p>'
      : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your MasseurMatch profile journey can continue today.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,.10);">
            <tr>
              <td align="center" style="padding:26px 28px 20px;font-size:29px;font-weight:800;letter-spacing:-1px;color:#172033;">
                Masseur<span style="color:#8B1E2D;">Match</span>
              </td>
            </tr>
            <tr>
              <td><img src="${ACCESS_BANNER_URL}" width="640" alt="Your access is restored" style="display:block;width:100%;height:auto;border:0;" /></td>
            </tr>
            <tr>
              <td style="padding:34px 38px 16px;">
                <p style="margin:0 0 18px;font-size:17px;line-height:1.7;">Hi ${firstName},</p>
                <h1 style="margin:0 0 18px;font-size:30px;line-height:1.18;letter-spacing:-.5px;color:#111827;">Your profile journey starts again.</h1>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#4b5563;">Your access to MasseurMatch has been restored, and you can continue building the professional profile that helps clients understand who you are and what makes your work different.</p>
                <p style="margin:0 0 26px;font-size:16px;line-height:1.75;color:#4b5563;">Sign in, review your information, add your best photos, and continue shaping how your practice appears on MasseurMatch.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 30px;">
                  <tr>
                    <td align="center" bgcolor="#8B1E2D" style="border-radius:12px;box-shadow:0 7px 0 #5f111d;">
                      <a href="${loginUrl}" style="display:inline-block;padding:16px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">Continue building my profile</a>
                    </td>
                  </tr>
                </table>
                <div style="border:1px solid #ead7da;background:#fff8f8;border-radius:16px;padding:22px;margin:0 0 28px;">
                  <p style="margin:0 0 7px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#8B1E2D;">Founding Ambassador Program</p>
                  <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">As one of the professionals who believed in MasseurMatch early, you will receive a future invitation to our Founding Ambassador Program.</p>
                </div>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.75;color:#4b5563;">Thank you for believing in MasseurMatch early. We are excited to see your profile come to life and to build this next chapter with you.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px;"><img src="${KNOTTY_BANNER_URL}" width="592" alt="Knotty is here to help" style="display:block;width:100%;height:auto;border:0;border-radius:16px;" /></td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 28px 34px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                  <tr>
                    <td style="padding:0 5px 10px;"><a href="tel:${SUPPORT_PHONE_E164}" style="display:inline-block;padding:13px 20px;border:1px solid #d1d5db;border-radius:10px;color:#172033;font-size:14px;font-weight:700;text-decoration:none;">Call ${SUPPORT_PHONE_DISPLAY}</a></td>
                    <td style="padding:0 5px 10px;"><a href="sms:${SUPPORT_PHONE_E164}" style="display:inline-block;padding:13px 20px;border:1px solid #d1d5db;border-radius:10px;color:#172033;font-size:14px;font-weight:700;text-decoration:none;">Text support</a></td>
                  </tr>
                </table>
                <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#8b93a1;">${mailingAddress}</p>
                ${unsubscribe}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${input.firstName?.trim() || "there"},`,
    "",
    "Your profile journey starts again.",
    "",
    "Your access to MasseurMatch has been restored. Sign in to continue building your professional profile.",
    "",
    `Continue: ${safeHttpUrl(input.loginUrl, "https://masseurmatch.com/login")}`,
    "",
    `Need help? Call or text ${SUPPORT_PHONE_DISPLAY} (${SUPPORT_PHONE_E164}).`,
    "",
    "Thank you for believing in MasseurMatch early.",
  ].join("\n");

  return { subject, html, text };
}

export function renderAdminEmailTemplate(input: RenderAdminEmailInput): RenderedAdminEmail {
  switch (input.templateKey) {
    case "login-access-restored":
      return renderLoginAccessRestored(input);
  }
}
