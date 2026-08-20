import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import SubscriptionCancelledPremiumEmail from './SubscriptionCancelledPremiumEmail';
import { emailTemplates, type EmailTemplateKey } from './registry';

export function renderSystemTemplate(key: EmailTemplateKey): string {
  const template = emailTemplates[key];

  let element: React.ReactElement;
  switch (key) {
    case 'subscriptionCancelledPremium':
      element = <SubscriptionCancelledPremiumEmail {...template.previewProps} />;
      break;
    default: {
      const exhaustive: never = key;
      throw new Error(`Unsupported email template: ${exhaustive}`);
    }
  }

  return `<!doctype html>${renderToStaticMarkup(element)}`;
}
