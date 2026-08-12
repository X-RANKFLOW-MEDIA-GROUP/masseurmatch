import { Resend } from 'resend';

export interface SendEmailWithTopicOptions {
  to: string;
  subject: string;
  html: string;
  topicId?: string;
  topicNames?: string[];
  replyTo?: string;
}

/**
 * Send an email using Resend with topic support for subscription management
 */
export async function sendEmailWithTopic(options: SendEmailWithTopicOptions, apiKey?: string) {
  const key = apiKey || process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(key);

  const emailOptions: any = {
    from: 'notifications@masseurmatch.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  if (options.replyTo) {
    emailOptions.reply_to = options.replyTo;
  }

  if (options.topicId) {
    emailOptions.topic_id = options.topicId;
  } else if (options.topicNames && options.topicNames.length > 0) {
    emailOptions.topic_ids = options.topicNames;
  }

  try {
    const result = await resend.emails.send(emailOptions);

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
 * Send a batch of emails with topic support
 */
export async function sendBatchEmailsWithTopic(
  emails: SendEmailWithTopicOptions[],
  apiKey?: string
) {
  const key = apiKey || process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(key);

  const batch = emails.map((email) => ({
    from: 'notifications@masseurmatch.com',
    to: email.to,
    subject: email.subject,
    html: email.html,
    topic_id: email.topicId,
    reply_to: email.replyTo,
  }));

  try {
    const result = await resend.batch.send(batch as Parameters<typeof resend.batch.send>[0]);

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
