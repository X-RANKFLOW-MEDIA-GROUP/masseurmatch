// src/emails/PhotoApprovedEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface PhotoApprovedEmailProps {
  dashboardUrl?: string;
}

const SITE_URL = 'https://masseurmatch.com';
const DASHBOARD_PATH = '/pro/dashboard';

function safeUrl(value: string | undefined, fallbackPath: string) {
  if (!value) return `${SITE_URL}${fallbackPath}`;
  if (value.startsWith('https://masseurmatch.com/')) return value;
  if (value.startsWith('/')) return `${SITE_URL}${value}`;
  return `${SITE_URL}${fallbackPath}`;
}

export default function PhotoApprovedEmail({
  dashboardUrl,
}: PhotoApprovedEmailProps) {
  const safeDashboardUrl = safeUrl(dashboardUrl, DASHBOARD_PATH);

  return (
    <BaseLayout previewText="Your photo has been approved">
      <Text className="text-slate-900 text-xl font-medium mb-4">
        Your photo is approved
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Great! Your photo has been approved and is now visible on your MasseurMatch profile.
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Check your dashboard to view your updated profile and manage additional photos.
      </Text>

      <Section className="text-center mt-6 mb-4">
        <Button
          href={safeDashboardUrl}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Go to Dashboard
        </Button>
      </Section>
    </BaseLayout>
  );
}
