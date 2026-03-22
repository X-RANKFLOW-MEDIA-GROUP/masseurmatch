// src/emails/WelcomeEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface WelcomeEmailProps {
  therapistName: string;
  verifyLink: string;
}

export default function WelcomeEmail({ therapistName = "Alex", verifyLink = "https://masseurmatch.com/verify" }: WelcomeEmailProps) {
  return (
    <BaseLayout previewText="Welcome to MasseurMatch PRO">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Welcome to the elite network, {therapistName}.
      </Text>
      
      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        You are one step away from connecting with high-net-worth clients in your city. To ensure the security and privacy of our directory, please verify your email address to activate your dashboard.
      </Text>

      <Section className="text-center mt-8 mb-8">
        <Button 
          href={verifyLink} 
          className="bg-slate-950 text-white px-8 py-4 rounded-md text-sm font-semibold tracking-wide"
        >
          Verify Email & Access Dashboard
        </Button>
      </Section>

      <Text className="text-slate-500 text-xs mt-6">
        If you did not request this email, there is nothing to worry about. You can safely ignore it.
      </Text>
    </BaseLayout>
  );
}