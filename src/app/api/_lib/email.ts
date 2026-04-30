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
    const message = '[Email] RESEND_API_KEY not found.';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
    console.warn(`${message} Skipping email send in non-production environment.`);
    return { success: false, error: 'Missing API Key' };
  }
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: from || 'MasseurMatch <notifications@masseurmatch.com>',
      to,
      subject,
      react,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { success: false, error };
  }
}
