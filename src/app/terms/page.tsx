import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Review the terms for using the MasseurMatch directory platform as a visitor or listed therapist.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <section className="page-shell py-14">
      <div className="surface-panel max-w-4xl px-6 py-8">
        <h1 className="font-display text-4xl">Terms of Service</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>MasseurMatch is a directory platform. It provides listing pages, local discovery content, and profile management tools for therapists.</p>
          <p>The service does not create client-side accounts, process appointments, or stand in as a party to direct therapist communications.</p>
          <p>Therapists are responsible for the accuracy of their profile information, service claims, and compliance with applicable law and professional standards.</p>
        </div>
      </div>
    </section>
  );
}
