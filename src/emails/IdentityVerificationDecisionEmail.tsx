import * as React from "react";
import { Button, Section, Text } from "@react-email/components";
import BaseLayout from "./components/BaseLayout";

interface IdentityVerificationDecisionEmailProps {
  decision: "approved" | "resubmit";
  providerName?: string | null;
  reason?: string | null;
}

const SITE_URL = "https://masseurmatch.com";

export default function IdentityVerificationDecisionEmail({
  decision,
  providerName,
  reason,
}: IdentityVerificationDecisionEmailProps) {
  const approved = decision === "approved";
  const firstName = providerName?.trim().split(/\s+/)[0] || "there";

  return (
    <BaseLayout previewText={approved ? "Your MasseurMatch identity is verified" : "Action required for your MasseurMatch identity verification"}>
      <Text className="text-slate-900 text-xl font-medium mb-4">
        {approved ? "Identity verification approved" : "Identity verification needs a new submission"}
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-4">
        Hi {firstName},
      </Text>

      <Text className="text-slate-600 text-sm leading-relaxed mb-4">
        {approved
          ? "MasseurMatch reviewed your government-issued ID and current challenge selfie. Your Identity Verified status is now active."
          : "We could not approve the identity evidence from your latest submission. Please submit a new verification attempt."}
      </Text>

      {!approved && reason ? (
        <Text className="text-slate-600 text-sm leading-relaxed mb-4">
          Review reason: {reason}
        </Text>
      ) : null}

      <Text className="text-slate-500 text-xs leading-relaxed mb-6">
        Identity Verified confirms identity only. It does not verify professional licensing, background history, qualifications, or services.
      </Text>

      <Section className="text-center mt-6 mb-4">
        <Button
          href={`${SITE_URL}/pro/trust`}
          className="bg-slate-950 text-white px-8 py-3 rounded-md text-sm font-semibold tracking-wide"
        >
          {approved ? "View verification status" : "Resubmit identity verification"}
        </Button>
      </Section>
    </BaseLayout>
  );
}
