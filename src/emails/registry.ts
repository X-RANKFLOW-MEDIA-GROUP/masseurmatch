import SubscriptionCancelledPremiumEmail from './SubscriptionCancelledPremiumEmail';

export const emailTemplates = {
  subscriptionCancelledPremium: {
    name: 'Subscription Cancelled — Premium',
    description: 'Transactional cancellation confirmation using the premium MasseurMatch email design system.',
    subject: 'Your MasseurMatch subscription has been cancelled',
    component: SubscriptionCancelledPremiumEmail,
    category: 'transactional',
    previewProps: {
      therapistName: 'Alex',
      planName: 'Premium',
      endDate: 'August 31, 2026',
    },
  },
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;

export function isEmailTemplateKey(value: string): value is EmailTemplateKey {
  return Object.prototype.hasOwnProperty.call(emailTemplates, value);
}
