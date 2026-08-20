import * as React from 'react';

import SubscriptionCancelledPremiumEmail, {
  type SubscriptionCancelledPremiumEmailProps,
} from './SubscriptionCancelledPremiumEmail';
import { emailTemplates, type EmailTemplateKey } from './registry';
import { sendEmailWithTopic } from '@/lib/resend/send-with-topic';

type TemplateProps = {
  subscriptionCancelledPremium: SubscriptionCancelledPremiumEmailProps;
};

type SendRegisteredEmailOptions<K extends EmailTemplateKey> = {
  template: K;
  to: string;
  props: TemplateProps[K];
  subject?: string;
  replyTo?: string;
  text?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  topicId?: string;
};

function renderTemplate(
  template: EmailTemplateKey,
  props: SubscriptionCancelledPremiumEmailProps,
) {
  if (template === 'subscriptionCancelledPremium') {
    return <SubscriptionCancelledPremiumEmail {...props} />;
  }

  throw new Error(`Unsupported email template: ${String(template)}`);
}

export async function sendRegisteredEmail<K extends EmailTemplateKey>(
  options: SendRegisteredEmailOptions<K>,
  apiKey?: string,
) {
  const template = emailTemplates[options.template];

  return sendEmailWithTopic(
    {
      to: options.to,
      subject: options.subject || template.subject,
      react: renderTemplate(
        options.template,
        options.props as SubscriptionCancelledPremiumEmailProps,
      ),
      text: options.text,
      replyTo: options.replyTo,
      headers: options.headers,
      idempotencyKey: options.idempotencyKey,
      topicId: options.topicId,
    },
    apiKey,
  );
}
