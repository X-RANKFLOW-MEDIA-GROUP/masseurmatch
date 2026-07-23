// src/emails/ProfileApprovedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ProfileApprovedEmailProps {
  profileUrl?: string;
  dashboardUrl?: string;
}

const SITE_URL = 'https://www.masseurmatch.com';
const DASHBOARD_PATH = '/pro/dashboard';

function safeUrl(value: string | undefined, fallbackPath: string) {
  if (!value) return `${SITE_URL}${fallbackPath}`;
  if (value.startsWith('https://www.masseurmatch.com/')) return value;
  if (value.startsWith('/')) return `${SITE_URL}${value}`;
  return `${SITE_URL}${fallbackPath}`;
}

export default function ProfileApprovedEmail({
  profileUrl,
  dashboardUrl,
}: ProfileApprovedEmailProps) {
  const safeDashboardUrl = safeUrl(dashboardUrl, DASHBOARD_PATH);
  const safeProfileUrl = safeUrl(profileUrl, DASHBOARD_PATH);

  return (
    <BaseLayout previewText="Your MasseurMatch profile is approved">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Your profile is approved
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Good news. Your MasseurMatch profile has been approved and your provider account is ready to manage.
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Use your dashboard to review your listing, update profile details, manage photos, and keep your information accurate.
      </Text>

      <Section className="text-center mt-6 mb-4">
        <Button
          href={safeDashboardUrl}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Go to Dashboard
        </Button>
      </Section>

      <Section className="text-center mb-6">
        <Button
          href={safeProfileUrl}
          className="bg-white text-slate-950 border border-slate-300 px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          View Public Profile
        </Button>
      </Section>
    </BaseLayout>
  );
}
