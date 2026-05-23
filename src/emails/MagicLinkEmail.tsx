// src/emails/MagicLinkEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface MagicLinkEmailProps {
  loginUrl: string;
}

export default function MagicLinkEmail({ loginUrl = "https://masseurmatch.com/auth/callback" }: MagicLinkEmailProps) {
  return (
    <BaseLayout previewText="Your secure access link to MasseurMatch">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Secure Access
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Click the button below to securely sign in to your MasseurMatch account. This link expires in 15 minutes.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button
          href={loginUrl}
          className="bg-slate-950 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Sign In to Account
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        If you did not request this link, you can safely ignore this email.
      </Text>
    </BaseLayout>
  );
}
