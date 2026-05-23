// src/emails/SubscriptionCancelledEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface SubscriptionCancelledEmailProps {
  therapistName: string;
  planName: string;
  endDate: string;
  reactivateUrl: string;
}

export default function SubscriptionCancelledEmail({
  therapistName = "Alex",
  planName = "Elite PRO",
  endDate = "November 15, 2026",
  reactivateUrl = "https://masseurmatch.com/pro/billing"
}: SubscriptionCancelledEmailProps) {
  return (
    <BaseLayout previewText="Your subscription has been cancelled">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Cancellation Confirmation
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Hi {therapistName}, we received your request and your <strong>{planName}</strong> subscription has been cancelled. No further charges will be made to your card.
      </Text>

      <Section className="bg-slate-50 border border-slate-200 p-4 mb-6 rounded-md">
        <Text className="text-slate-700 text-sm m-0 leading-relaxed">
          You will continue to have full access to all your PRO features until the end of your current billing cycle: <strong className="font-mono text-slate-900">{endDate}</strong>. After this date, your profile will revert to the basic free plan.
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        It has been a pleasure helping you grow. If you change your mind or your availability changes, you can reactivate your account at any time with just one click.
      </Text>

      <Section className="text-center mb-6">
        <Button
          href={reactivateUrl}
          className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Reactivate my subscription
        </Button>
      </Section>
    </BaseLayout>
  );
}
