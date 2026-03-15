import { NearMeRedirect } from "@/mm/components/near-me-redirect";
import { SectionHeading } from "@/mm/components/primitives";
import { getCities } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";

export const metadata = buildMetadata({
  title: "Near Me",
  description: "Use your current location to jump to the closest city page in the directory.",
  path: "/near-me",
});

export default async function NearMePage() {
  const cities = await getCities();

  return (
    <section className="page-shell py-14">
      <SectionHeading
        eyebrow="Near me"
        title="Find the closest directory city."
        description="If you allow location access, we will route you to the nearest city page in the current directory coverage."
      />
      <div className="mt-10 rounded-[28px] border border-border bg-card px-6 py-10 shadow-soft">
        <NearMeRedirect cities={cities} />
      </div>
    </section>
  );
}
