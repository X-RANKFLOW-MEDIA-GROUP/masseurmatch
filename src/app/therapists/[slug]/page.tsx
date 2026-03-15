import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/mm/components/json-ld";
import { Card, Pill } from "@/mm/components/primitives";
import { getCityBySlug, getPublicTherapists, getTherapistBySlug, getTherapistReviews } from "@/mm/lib/directory";
import { buildMetadata } from "@/mm/lib/metadata";
import { buildTherapistJsonLd } from "@/mm/lib/structured-data";
import { formatPhoneHref } from "@/mm/lib/utils";

type TherapistPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const therapists = await getPublicTherapists();
  return therapists.map((therapist) => ({ slug: therapist.slug }));
}

export async function generateMetadata({ params }: TherapistPageProps) {
  const resolvedParams = await params;
  const therapist = await getTherapistBySlug(resolvedParams.slug);

  if (!therapist) {
    return buildMetadata({
      title: "Therapist not found",
      description: "The requested therapist profile is not available.",
      path: `/therapists/${resolvedParams.slug}`,
    });
  }

  return buildMetadata({
    title: therapist.displayName,
    description: therapist.bio,
    path: `/therapists/${therapist.slug}`,
    imagePath: `/api/og?slug=${therapist.slug}`,
  });
}

export default async function TherapistPage({ params }: TherapistPageProps) {
  const resolvedParams = await params;
  const therapist = await getTherapistBySlug(resolvedParams.slug);

  if (!therapist) {
    notFound();
  }

  const [city, reviews] = await Promise.all([getCityBySlug(therapist.citySlug), getTherapistReviews(therapist.id)]);

  if (!city) {
    notFound();
  }

  return (
    <>
      <JsonLd data={buildTherapistJsonLd(therapist, city)} />
      <section className="page-shell py-14">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <Card className="overflow-hidden p-0">
            <div className="relative aspect-[4/5]">
              <Image
                src={therapist.photoUrl}
                alt={therapist.displayName}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </Card>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Pill>{therapist.tier}</Pill>
              <Pill>{city.name}</Pill>
              {therapist.gayFriendly ? <Pill className="bg-primary/10 text-foreground">gay-friendly</Pill> : null}
            </div>
            <div>
              <h1 className="font-display text-5xl">{therapist.displayName}</h1>
              <p className="mt-4 text-base leading-8 text-muted-foreground">{therapist.bio}</p>
            </div>

            <Card>
              <h2 className="font-display text-2xl">Contact directly</h2>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <a
                  href={`mailto:${therapist.contactEmail}`}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {therapist.contactEmail}
                </a>
                <a
                  href={formatPhoneHref(therapist.phone)}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  {therapist.phone}
                </a>
                <a href={therapist.website} className="font-semibold text-foreground underline underline-offset-4">
                  Visit website
                </a>
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-2xl">Profile details</h2>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <p>
                  City: {city.name}, {city.stateCode}
                </p>
                <p>Price range: {therapist.priceRange}</p>
                <p>Languages: {therapist.languages.join(", ")}</p>
                <p>
                  Availability style: {therapist.incall ? "Incall" : ""}
                  {therapist.incall && therapist.outcall ? " + " : ""}
                  {therapist.outcall ? "Outcall" : ""}
                </p>
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-2xl">Reviews</h2>
              <div className="mt-4 space-y-3">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No approved reviews yet.</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-border p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {review.authorName} | {review.rating}/5
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{review.body}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Link
              href={`/${city.slug}`}
              className="inline-flex text-sm font-semibold text-foreground underline underline-offset-4"
            >
              Back to {city.name}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
