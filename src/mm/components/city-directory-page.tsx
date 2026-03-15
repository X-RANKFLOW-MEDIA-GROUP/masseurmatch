import { JsonLd } from "@/mm/components/json-ld";
import { Card, SectionHeading } from "@/mm/components/primitives";
import { TherapistCard } from "@/mm/components/therapist-card";
import { buildCityJsonLd } from "@/mm/lib/structured-data";
import type { City, Therapist } from "@/mm/types";

export function CityDirectoryPage({
  city,
  description,
  eyebrow,
  therapistCountLabel,
  therapists,
  title,
}: {
  city: City;
  description: string;
  eyebrow: string;
  therapistCountLabel: string;
  therapists: Therapist[];
  title: string;
}) {
  return (
    <>
      <JsonLd data={buildCityJsonLd(city, therapists.length)} />
      <section className="page-shell py-14">
        <div className="hero-panel px-6 py-10 lg:px-10">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-8 grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
            <Card className="bg-white/70">
              <p className="font-semibold text-foreground">{therapistCountLabel}</p>
            </Card>
            <Card className="bg-white/70">
              <p className="font-semibold text-foreground">Direct contact only</p>
            </Card>
            <Card className="bg-white/70">
              <p className="font-semibold text-foreground">{city.hero}</p>
            </Card>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {therapists.map((therapist) => (
            <TherapistCard key={therapist.id} therapist={therapist} city={city} />
          ))}
        </div>
      </section>
    </>
  );
}
