import { OnboardingForm } from "@/mm/components/pro-tools";
import { SectionHeading } from "@/mm/components/primitives";
import { getCities } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Therapist onboarding",
  description: "Complete the MasseurMatch therapist onboarding flow across profile, location, services, identity, and review steps.",
  path: "/pro/onboard",
});

export default async function ProOnboardPage() {
  const cities = await getCities();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Onboarding"
        title="Build your therapist profile in five steps."
        description="Add your photo, city, service mix, identity details, and final review information before publishing."
      />
      <div className="mt-10">
        <OnboardingForm cities={cities} />
      </div>
    </section>
  );
}
