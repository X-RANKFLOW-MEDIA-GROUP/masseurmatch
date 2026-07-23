// src/emails/UpcomingPaymentEmail.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface UpcomingPaymentEmailProps {
  therapistName: string;
  planName: string;
  amount: string;
  renewalDate: string;
  billingUrl: string;
}

export default function UpcomingPaymentEmail({
  therapistName = "Alex",
  planName = "Elite PRO",
  amount = "$99.00",
  renewalDate = "October 15, 2026",
  billingUrl = "https://www.masseurmatch.com/pro/billing"
}: UpcomingPaymentEmailProps) {
  return (
    <BaseLayout previewText={`Reminder: Your subscription renews on ${renewalDate}`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Your subscription is renewing soon.
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Hi {therapistName}, this is an automatic reminder that your <strong>{planName}</strong> subscription is scheduled for automatic renewal on <strong>{renewalDate}</strong>.
      </Text>

      <Section className="bg-slate-50 border border-slate-200 p-6 mb-6 rounded-md">
        <Row className="mb-2">
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Amount to charge</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-base font-semibold m-0">{amount}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Payment Method</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-xs m-0">Card ending in •••• 4242</Text></Column>
        </Row>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        If you need to update your card or change your plan, click the button below. If everything looks correct, no action is needed.
      </Text>

      <Section className="text-center mb-6">
        <Button
          href={billingUrl}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Manage Billing
        </Button>
      </Section>
    </BaseLayout>
  );
}
