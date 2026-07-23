// src/emails/PaymentFailedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface PaymentFailedEmailProps {
  billingUrl: string;
}

export default function PaymentFailedEmail({ billingUrl = "https://www.masseurmatch.com/pro/billing" }: PaymentFailedEmailProps) {
  return (
    <BaseLayout previewText="Action Required: Update your payment method">
      <Text className="text-amber-600 text-xl font-medium mb-4">
        Payment Issue
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        We were unable to process the renewal for your MasseurMatch Elite subscription with the card on file. To keep your &quot;Available Now&quot; button and premium search placement, please update your billing details.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button
          href={billingUrl}
          className="bg-amber-500 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Update Payment Securely
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        We will attempt to process the payment again within the next 48 hours.
      </Text>
    </BaseLayout>
  );
}
