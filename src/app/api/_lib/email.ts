import { Resend } from 'resend';
import { ReactElement } from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not found. Skipping email send.');
    return { success: false, error: 'Missing API Key' };
  }

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
