import type { ReactNode } from 'react';
import { Resend } from 'resend';

export interface SendEmailWithTopicOptions {
  to: string;
  subject: string;
  html?: string;
  react?: ReactNode;
  text?: string;
  topicId?: string;
  topicNames?: string[];
  replyTo?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
}

function assertEmailContent(options: SendEmailWithTopicOptions) {
  const hasHtml = typeof options.html === 'string' && options.html.length > 0;
  const hasReact = options.react !== undefined && options.react !== null;

  if (hasHtml === hasReact) {
    throw new Error('Provide exactly one email body: html or react');
  }
}

function buildEmailPayload(options: SendEmailWithTopicOptions) {
  assertEmailContent(options);

  const payload: Record<string, unknown> = {
    from: 'MasseurMatch <notifications@masseurmatch.com>',
    to: options.to,
    subject: options.subject,
  };

  if (options.html) payload.html = options.html;
  if (options.react) payload.react = options.react;
  if (options.text !== undefined) payload.text = options.text;
  if (options.replyTo) payload.replyTo = options.replyTo;
  if (options.headers) payload.headers = options.headers;

  // Preserve the existing topic integration contract used by this project.
  if (options.topicId) {
    payload.topic_id = options.topicId;
  } else if (options.topicNames && options.topicNames.length > 0) {
    payload.topic_ids = options.topicNames;
  }

  return payload;
}

/**
 * Send an email using the existing Resend integration.
 * Supports either raw HTML or a React Email component, plus plain text,
 * custom headers, topics, and Resend idempotency keys.
 */
export async function sendEmailWithTopic(options: SendEmailWithTopicOptions, apiKey?: string) {
  const key = apiKey || process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(key);
  const emailOptions = buildEmailPayload(options);

  try {
    const result = await resend.emails.send(
      emailOptions as unknown as Parameters<typeof resend.emails.send>[0],
      options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
    );

    if (result.error) {
      throw new Error(result.error.message || 'Failed to send email');
    }

    return {
      success: true,
      id: result.data?.id,
    };
  } catch (error) {
    console.error('Failed to send email with topic:', error);
    throw error;
  }
}

/**
 * Send a batch of emails with the same body options supported by single sends.
 */
export async function sendBatchEmailsWithTopic(
  emails: SendEmailWithTopicOptions[],
  apiKey?: string,
  idempotencyKey?: string,
) {
  const key = apiKey || process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(key);
  const batch = emails.map((email) => buildEmailPayload(email));

  try {
    const result = await resend.batch.send(
      batch as unknown as Parameters<typeof resend.batch.send>[0],
      idempotencyKey ? { idempotencyKey } : undefined,
    );

    if (result.error) {
      throw new Error(result.error.message || 'Failed to send batch emails');
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Failed to send batch emails with topic:', error);
    throw error;
  }
}
