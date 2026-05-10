// src/emails/ProfileApprovedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ProfileApprovedEmailProps {
  profileUrl?: string;
  dashboardUrl?: string;
}

const SITE_URL = 'https://masseurmatch.com';

function safeUrl(value: string | undefined, fallbackPath: string) {
  if (!value) return `${SITE_URL}${fallbackPath}`;
  if (value.startsWith('https://masseurmatch.com/')) return value;
  if (value.startsWith('/')) return `${SITE_URL}${value}`;
  return `${SITE_URL}${fallbackPath}`;
}

export default function ProfileApprovedEmail({
  profileUrl,
  dashboardUrl,
}: ProfileApprovedEmailProps) {
  const safeProfileUrl = safeUrl(profileUrl, '/pro/dashboard');
  const safeDashboardUrl = safeUrl(dashboardUrl, `/login?redirect=${encodeURIComponent('/pro/dashboard')}`);

  return (
    <BaseLayout previewText="Your MasseurMatch profile update is live">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Your profile update is live
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Good news. Your recent profile updates have been approved and are now reflected on MasseurMatch.
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        MasseurMatch is a neutral directory platform. You remain responsible for keeping your profile accurate, lawful, and up to date.
      </Text>

      <Section className="text-center mt-6 mb-4">
        <Button
          href={safeProfileUrl}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          View Public Profile
        </Button>
      </Section>

      <Section className="text-center mb-6">
        <Button
          href={safeDashboardUrl}
          className="bg-white text-slate-950 border border-slate-300 px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Manage Profile
        </Button>
      </Section>
    </BaseLayout>
  );
}
