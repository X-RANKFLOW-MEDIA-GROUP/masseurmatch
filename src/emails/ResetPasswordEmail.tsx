// src/emails/ResetPasswordEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ResetPasswordEmailProps {
  resetUrl: string;
}

export default function ResetPasswordEmail({ resetUrl = "https://masseurmatch.com/reset" }: ResetPasswordEmailProps) {
  return (
    <BaseLayout previewText="Instructions to reset your password">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Reset Password
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        We received a request to change the password for your account. To create a new password, click the button below.
      </Text>

      <Section className="text-center mt-6 mb-6">
        <Button
          href={resetUrl}
          className="bg-slate-950 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Create New Password
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        If you did not make this request, your account is safe and no changes have been made.
      </Text>
    </BaseLayout>
  );
}
