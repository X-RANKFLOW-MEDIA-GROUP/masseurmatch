import Link from "next/link";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Therapist join",
  description: "Review the therapist setup flow and continue into onboarding, profile editing, and billing.",
  path: "/pro/join",
});

export default async function ProJoinPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Therapist portal"
        title="Everything after registration starts here."
        description="Use onboarding to complete your listing, edit profile details from the dashboard, and manage subscription visibility from billing."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          ["1", "Finish onboarding", "/pro/onboard"],
          ["2", "Review dashboard", "/pro/dashboard"],
          ["3", "Manage billing", "/pro/billing"],
        ].map(([step, label, href]) => (
          <Card key={step}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Step {step}</p>
            <h2 className="mt-4 font-display text-3xl">{label}</h2>
            <Link href={href} className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4">
              Open
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}
