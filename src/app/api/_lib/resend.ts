import { Resend } from "resend";

import { envAny } from "@/app/api/_lib/env";
import { RouteError } from "@/app/api/_lib/http";
import type { ContactAudience } from "@/app/_lib/validation";
import WelcomeEmail from "@/emails/WelcomeEmail";

let _resend: Resend | null = null;

function allowExplicitEmailMock() {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_EMAIL_MOCKS === "true";
}

function getResend() {
  const apiKey = envAny(["RESEND_API_KEY"]);
  if (!apiKey) {
    throw new RouteError(503, "Email service is not configured.");
  }

  if (!_resend) {
    _resend = new Resend(apiKey);
  }
  return _resend;
}

async function sendWelcomeEmail(email: string, name: string, token: string) {
  await getResend().emails.send({
    from: "MasseurMatch Concierge <concierge@masseurmatch.com>",
    to: email,
    subject: "Welcome to MasseurMatch PRO",
    react: WelcomeEmail({
      name,
      isTherapist: true,
      onboardingLink: `https://masseurmatch.com/verify?token=${token}`,
    }),
  });
}

function resolveContactRecipient(subject: string, audience?: ContactAudience) {
  const normalized = subject.toLowerCase();

  if (normalized.includes("dmca") || normalized.includes("copyright")) {
    return "dmca@masseurmatch.com";
  }

  if (normalized.includes("privacy")) {
    return "privacy@masseurmatch.com";
  }

  if (
    normalized.includes("billing") ||
    normalized.includes("refund") ||
    normalized.includes("cancel")
  ) {
    return "billing@masseurmatch.com";
  }

  if (
    normalized.includes("legal") ||
    normalized.includes("subpoena") ||
    normalized.includes("law enforcement") ||
    normalized.includes("cease")
  ) {
    return "legal@masseurmatch.com";
  }

  if (
    normalized.includes("press") ||
    normalized.includes("media") ||
    normalized.includes("interview")
  ) {
    return "press@masseurmatch.com";
  }

  return "support@masseurmatch.com";
}

function formatContactAudience(audience?: ContactAudience) {
  switch (audience) {
    case "client":
      return "Client";
    case "massage-professional":
      return "Massage Professional";
    case "other":
      return "Other";
    default:
      return null;
  }
}

export async function sendSupportEmail(input: {
  name: string;
  email: string;
  phone?: string | null;
  audience?: ContactAudience;
  subject: string;
  message: string;
}) {
  const apiKey = envAny(["RESEND_API_KEY"]);
  const to = resolveContactRecipient(input.subject, input.audience);
  const audienceLabel = formatContactAudience(input.audience);

  if (!apiKey) {
    if (allowExplicitEmailMock()) {
      return {
        id: `mock-contact-${Date.now()}`,
        mock: true,
        to,
      };
    }

    throw new RouteError(503, "Email service is temporarily unavailable.");
  }

  const from = envAny(["RESEND_FROM_EMAIL"], "MasseurMatch <onboarding@resend.dev>");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: input.email,
      subject: `[Contact${audienceLabel ? ` - ${audienceLabel}` : ""}] ${input.subject}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || "Not provided"}`,
        `Audience: ${audienceLabel || "Not provided"}`,
        "",
        input.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new RouteError(
      502,
      errorText || `Resend request failed with status ${response.status}.`,
    );
  }

  const payload = (await response.json()) as { id: string };

  return {
    id: payload.id,
    mock: false,
    to,
  };
}

// Keep the helper referenced by legacy onboarding code in this module.
void sendWelcomeEmail;
