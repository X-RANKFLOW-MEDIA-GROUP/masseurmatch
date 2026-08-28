export type ProviderPaidPlanKey = "standard" | "pro" | "elite";

export function canStartPaidSubscription(profileStatus: string | null | undefined) {
  return profileStatus === "approved";
}

export function shouldPublishInitialPaidActivation(input: {
  isEntitled: boolean;
  profileStatus: string | null | undefined;
  visibilityStatus: string | null | undefined;
  isActive: boolean | null | undefined;
  requestedTier: string | null | undefined;
  planKey: ProviderPaidPlanKey;
  subscriptionStatus: string | null | undefined;
}) {
  return (
    input.isEntitled &&
    input.profileStatus === "approved" &&
    input.visibilityStatus === "hidden" &&
    input.isActive === false &&
    input.requestedTier === input.planKey &&
    !input.subscriptionStatus
  );
}
