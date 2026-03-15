import { ButtonLink, Card, SectionHeading } from "@/mm/components/primitives";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Advertise",
  description: "Compare MasseurMatch listing tiers and see how therapists can upgrade visibility across city pages and directory search.",
  path: "/advertise",
});

export default function AdvertisePage() {
  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Advertising"
        title="Simple subscription tiers for directory visibility."
        description="Free profiles stay searchable. Pro and Featured tiers add stronger placement, higher trust signals, and better profile coverage."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          ["Free", "$0/mo", "Basic directory listing, direct contact fields, and therapist profile visibility."],
          ["Pro", "$79/mo", "Priority grid placement, richer profile coverage, and stronger city-page exposure."],
          ["Featured", "$149/mo", "Homepage and city-page preference, spotlight placement, and the highest visibility."],
        ].map(([name, price, description]) => (
          <Card key={name}>
            <h3 className="font-display text-3xl">{name}</h3>
            <p className="mt-2 text-lg font-semibold text-primary">{price}</p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
          </Card>
        ))}
      </div>
      <div className="mt-10">
        <ButtonLink href="/register">Create therapist account</ButtonLink>
      </div>
    </section>
  );
}
