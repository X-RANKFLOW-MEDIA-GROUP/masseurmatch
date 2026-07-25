import { Resend } from 'resend';
import { ReactElement } from 'react';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not found. Skipping email send.');
    return { success: false, error: 'Missing API Key' };
  }

  const resend = new Resend(apiKey);

  try {
    // Resend SDK typically returns the created email object or throws on error.
    // Do not destructure { data, error } unless the SDK documents that shape.
    const res = await resend.emails.send({
      from: from || 'MasseurMatch <notifications@masseurmatch.com>',
      to,
      subject,
      react,
    });

    // Defensive: if the SDK returns an object with id or message, treat as success.
    if (!res) {
      console.error('[Email] Resend returned empty response');
      return { success: false, error: 'Empty response from Resend' };
    }

    return { success: true, data: res };
  } catch (err) {
    console.error('[Email] Unexpected error:', err instanceof Error ? err.message : String(err));
    return { success: false, error: err };
  }
}
