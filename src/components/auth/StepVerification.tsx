import { Button } from "@/components/ui/button";

export function StepVerification({ onComplete }: { onComplete: () => void }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-background p-5">
      <h3 className="text-lg font-semibold text-foreground">Identity Verification</h3>
      <p className="text-sm text-muted-foreground">
        Confirm your account details to continue onboarding. This lightweight step keeps public listings safer.
      </p>
      <Button type="button" onClick={onComplete}>
        Continue
      </Button>
    </section>
  );
}
