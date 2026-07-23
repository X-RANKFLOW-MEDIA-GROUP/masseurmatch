// src/emails/NewClientMessageEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface NewClientMessageEmailProps {
  therapistName: string;
  clientCity: string;
  inboxUrl: string;
}

export default function NewClientMessageEmail({
  therapistName = "Alex",
  clientCity = "Dallas",
  inboxUrl = "https://www.masseurmatch.com/pro/messages"
}: NewClientMessageEmailProps) {
  return (
    <BaseLayout previewText={`New massage request in ${clientCity}`}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        New client request 🔔
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Hi {therapistName}, a client in the <strong>{clientCity}</strong> area just sent you a message through your MasseurMatch profile.
      </Text>

      <Section className="bg-slate-50 border-l-4 border-indigo-500 p-4 mb-8">
        <Text className="text-slate-700 text-sm font-medium m-0">
          Elite Tip: Therapists who respond within the first 15 minutes are 80% more likely to close the session.
        </Text>
      </Section>

      <Section className="text-center mb-6">
        <Button
          href={inboxUrl}
          className="bg-indigo-600 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Read and Reply Now
        </Button>
      </Section>
    </BaseLayout>
  );
}
