// src/emails/ModerationAlertEmail.tsx
import { Text, Button, Section } from '@react-email/components';
import BaseLayout from './components/BaseLayout';
import * as React from 'react';

interface ModerationAlertEmailProps {
  reason: string;
  editUrl: string;
}

export default function ModerationAlertEmail({
  reason = "Suggestive or unprofessional language detected.",
  editUrl = "https://www.masseurmatch.com/pro/listing"
}: ModerationAlertEmailProps) {
  return (
    <BaseLayout previewText="Action Required: Profile update on hold">
      <Text className="text-rose-600 text-xl font-medium mb-4">
        Profile Review Required
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-4">
        To maintain the quality and safety of the MasseurMatch network, all updates go through a review process. Your latest update could not be published for the following reason:
      </Text>

      <Section className="bg-rose-50 border border-rose-100 p-4 mb-6 rounded-md">
        <Text className="text-rose-800 text-sm font-medium m-0">
          Reason: {reason}
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm leading-relaxed mb-6">
        Your previous profile remains live. Please log in to your dashboard and adjust the information according to our quality guidelines so we can approve it.
      </Text>

      <Section className="text-center mb-6">
        <Button
          href={editUrl}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          Edit Profile
        </Button>
      </Section>
    </BaseLayout>
  );
}
