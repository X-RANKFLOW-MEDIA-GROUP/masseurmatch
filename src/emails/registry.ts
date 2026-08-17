import SubscriptionCancelledPremiumEmail from './SubscriptionCancelledPremiumEmail';

export const emailTemplates = {
  subscriptionCancelledPremium: {
    subject: 'Your MasseurMatch subscription has been cancelled',
    component: SubscriptionCancelledPremiumEmail,
    category: 'transactional',
  },
} as const;

export type EmailTemplateKey = keyof typeof emailTemplates;
