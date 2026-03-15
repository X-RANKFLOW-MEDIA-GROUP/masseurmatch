import { Card, SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn how MasseurMatch approaches therapist discovery through direct contact, local city pages, and cleaner profile comparison.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="About"
        title="A directory built around trust, local context, and direct contact."
        description="MasseurMatch is designed for therapist discovery. The platform helps visitors compare listings and helps therapists present their practice clearly without forcing marketplace behavior."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="font-display text-2xl">Directory only</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Visitors browse, compare, and contact therapists directly. The platform does not create visitor logins or manage appointments.
          </p>
        </Card>
        <Card>
          <h3 className="font-display text-2xl">City-first SEO</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            We structure profiles and landing pages around real city intent so local pages feel useful to people and search engines alike.
          </p>
        </Card>
        <Card>
          <h3 className="font-display text-2xl">Therapist growth</h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Featured tiers, professional profiles, and admin moderation help independent therapists present their work with more clarity.
          </p>
        </Card>
      </div>
    </section>
  );
}
