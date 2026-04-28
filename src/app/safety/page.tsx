import { JsonLd } from "@/app/_components/json-ld";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/app/_lib/seo";

export const metadata = {
  title: "Safety & Trust | MasseurMatch",
  description: "Learn how MasseurMatch verifies therapists and ensures a safe, premium experience for direct contact massage.",
};

const safetyFaqs = [
  { question: "How are therapists verified?", answer: "We require government ID and live photo verification." },
  {
    question: "Is direct contact safe?",
    answer: "Yes, you control the communication and booking directly with verified professionals.",
  },
];

export default function SafetyPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16">
      <JsonLd data={buildBreadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Safety", path: "/safety" }])} />
      <JsonLd data={buildFaqJsonLd(safetyFaqs)} />

      <div className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-black tracking-tight md:text-5xl">The Safest Way to Find a Verified Male Massage Therapist</h1>
        <p className="text-xl text-muted-foreground">We prioritize your safety and trust before anything else. Here is how we verify our network.</p>
      </div>

      <div className="mb-16 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
            <span className="rounded-full bg-success/20 p-2 text-success">✓</span> Identity Verification
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            Every provider on MasseurMatch must pass a strict government ID and live selfie check via Stripe Identity before their
            profile goes live. You know exactly who is showing up at your door.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
            <span className="rounded-full bg-primary/20 p-2 text-primary">🔒</span> Direct Contact
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            We don&apos;t get in the middle. You communicate directly with your therapist via phone, text, or email, ensuring complete
            transparency and control over your booking experience.
          </p>
        </div>
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h3>Community Standards & Reporting</h3>
        <p>
          We maintain a zero-tolerance policy for harassment, fraud, or inappropriate behavior. Our moderation team actively reviews
          content, and any user can flag a profile for immediate review. If a therapist violates our terms, they are permanently
          banned.
        </p>

        <h3>Booking Safely</h3>
        <ul>
          <li>
            <strong>Communicate clearly:</strong> Discuss expectations, pricing, and boundaries before confirming an appointment.
          </li>
          <li>
            <strong>Protect your privacy:</strong> Only share your address once you feel completely comfortable with the verified
            provider.
          </li>
          <li>
            <strong>Trust your instincts:</strong> If something feels off, cancel the appointment. Your peace of mind is paramount.
          </li>
        </ul>
      </div>
    </main>
  );
}
