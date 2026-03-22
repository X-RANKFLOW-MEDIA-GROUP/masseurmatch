import { envAny } from "@/app/api/_lib/env";
import { RouteError } from "@/app/api/_lib/http";

export async function sendSupportEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = envAny(["RESEND_API_KEY"]);

  if (!apiKey) {
    return {
      id: `mock-contact-${Date.now()}`,
      mock: true,
    };
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
      to: ["support@masseurmatch.com"],
      reply_to: input.email,
      subject: `[Contact] ${input.subject}`,
      text: [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
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
  };
}
