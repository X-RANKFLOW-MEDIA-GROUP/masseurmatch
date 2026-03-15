import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read how MasseurMatch handles therapist, contact, and usage data across the directory platform.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="page-shell py-14">
      <div className="surface-panel max-w-4xl px-6 py-8">
        <h1 className="font-display text-4xl">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>MasseurMatch stores therapist profile data, administrative content, and direct contact form submissions needed to operate the directory.</p>
          <p>We do not create consumer accounts for browsing. Visitor activity may be measured in aggregate for analytics, fraud prevention, and directory performance.</p>
          <p>Therapists may update their profile information, request account changes, or contact support regarding personal data handling at any time.</p>
        </div>
      </div>
    </section>
  );
}
