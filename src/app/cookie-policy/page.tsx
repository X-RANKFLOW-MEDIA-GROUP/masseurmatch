import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Cookie Policy",
  description: "Understand how MasseurMatch uses session and analytics cookies across the directory experience.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <section className="page-shell py-14">
      <div className="surface-panel max-w-4xl px-6 py-8">
        <h1 className="font-display text-4xl">Cookie Policy</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>MasseurMatch uses essential cookies for therapist and admin sessions, plus limited analytics cookies to understand site performance.</p>
          <p>Session cookies keep protected dashboard pages available after login and expire automatically when the session ends or the user signs out.</p>
          <p>Visitors can adjust non-essential cookie preferences in their browser settings.</p>
        </div>
      </div>
    </section>
  );
}
