import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Therapist Agreement",
  description: "Review the listing terms, subscription expectations, and content responsibilities for therapists on MasseurMatch.",
  path: "/therapist-agreement",
});

export default function TherapistAgreementPage() {
  return (
    <section className="page-shell py-14">
      <div className="surface-panel max-w-4xl px-6 py-8">
        <h1 className="font-display text-4xl">Therapist Agreement</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>Therapists keep ownership of their practice and are solely responsible for the accuracy of profile content and contact methods.</p>
          <p>Paid tiers increase visibility within the directory and do not guarantee placement in every city or search result.</p>
          <p>MasseurMatch may suspend or remove listings that violate policy, create safety concerns, or misrepresent professional services.</p>
        </div>
      </div>
    </section>
  );
}
