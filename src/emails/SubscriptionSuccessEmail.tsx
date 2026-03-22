// src/emails/SubscriptionSuccessEmail.tsx
import { Text, Button, Section, Row, Column } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface SubscriptionEmailProps {
  therapistName: string;
  planName: string;
  amount: string;
  dashboardLink: string;
}

export default function SubscriptionSuccessEmail({ 
  therapistName = "Alex", 
  planName = "Elite PRO", 
  amount = "$99.00",
  dashboardLink = "https://masseurmatch.com/pro/dashboard" 
}: SubscriptionEmailProps) {
  return (
    <BaseLayout previewText={`Your ${planName} subscription is active`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Your upgrade is complete ⚡
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Hi {therapistName}, your payment was successful. Your account has been instantly upgraded to the <strong>{planName}</strong> plan. You now have unlimited access to the "Available Now" feature and the Travel Mode engine.
      </Text>

      {/* Brutalist Receipt Box */}
      <Section className="bg-slate-50 border border-slate-200 p-6 mb-8 rounded-md">
        <Row className="mb-2">
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Amount Paid</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-base font-semibold m-0">{amount}</Text></Column>
        </Row>
        <Row>
          <Column><Text className="text-slate-500 text-xs uppercase tracking-widest m-0">Billing Cycle</Text></Column>
          <Column align="right"><Text className="text-slate-900 font-mono text-xs m-0">Monthly</Text></Column>
        </Row>
      </Section>

      <Section className="text-center mb-6">
        <Button 
          href={dashboardLink} 
          className="bg-indigo-600 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Go to Dashboard
        </Button>
      </Section>
    </BaseLayout>
  );
}