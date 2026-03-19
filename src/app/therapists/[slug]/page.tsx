import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import {
  getCities,
  getImportedReviews,
  getProfilePhotos,
  getPublicTherapistBySlug,
  getPublicTherapists,
  type PricingSessionItem,
  type ProfileFaqItem,
} from "@/app/_lib/directory";
import {
  buildBreadcrumbJsonLd,
  buildProfilePageJsonLd,
  createPageMetadata,
} from "@/app/_lib/seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Params = { slug: string };

type HoursMap = Record<string, string>;

function normalizeFaqItems(value: unknown): ProfileFaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ProfileFaqItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as ProfileFaqItem).question === "string" &&
      typeof (item as ProfileFaqItem).answer === "string",
  );
}

function normalizePricingSessions(value: unknown): PricingSessionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is PricingSessionItem => typeof item === "object" && item !== null,
  );
}

function normalizeHours(value: unknown): { incall: HoursMap; outcall: HoursMap } {
  if (!value || typeof value !== "object") {
    return { incall: {}, outcall: {} };
  }

  if ("incall" in value || "outcall" in value) {
    const structured = value as { incall?: HoursMap; outcall?: HoursMap };
    return {
      incall: structured.incall || {},
      outcall: structured.outcall || {},
    };
  }

  return {
    incall: value as HoursMap,
    outcall: {},
  };
}

function normalizePhone(phone: string | null): string {
  if (!phone) {
    return "";
  }

  return phone.replace(/[^\d+]/g, "");
}

export async function generateStaticParams() {
  const res = await getPublicTherapists({ page: 1, pageSize: 200 });
  return res.items.map((item) => ({ slug: item.slug || item.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!profile) {
    return createPageMetadata({
      title: "Therapist profile",
      description: "Public massage therapist profile.",
      path: `/therapists/${resolvedParams.slug}`,
      noIndex: true,
    });
  }

  const name = profile.display_name || profile.full_name || "Therapist";
  const description =
    profile.bio ||
    `Browse ${name}'s public therapist profile on MasseurMatch and review specialties, pricing, and city context.`;

  return createPageMetadata({
    title: `${name} therapist profile`,
    description,
    path: `/therapists/${profile.slug || profile.id}`,
    type: "profile",
    keywords: [profile.city, profile.modality, ...(profile.specialties || [])].filter(
      (value): value is string => Boolean(value),
    ),
  });
}

export default async function TherapistPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const profile = await getPublicTherapistBySlug(resolvedParams.slug);

  if (!profile) {
    notFound();
  }

  const [reviews, photos] = await Promise.all([
    getImportedReviews(profile.id, 5),
    getProfilePhotos(profile.id, 6),
  ]);
  const name = profile.display_name || profile.full_name || "Therapist";
  const profilePath = `/therapists/${profile.slug || profile.id}`;
  const matchedCity = getCities().find((city) => city.name.toLowerCase() === (profile.city || "").toLowerCase());
  const cityPath = matchedCity ? `/${matchedCity.slug}` : profile.city ? `/search?city=${encodeURIComponent(profile.city)}` : "/search";
  const faqItems = normalizeFaqItems(profile.custom_faq);
  const pricingSessions = normalizePricingSessions(profile.pricing_sessions);
  const hours = normalizeHours(profile.business_hours);
  const gallery = photos.length > 0 ? photos.map((photo) => photo.storage_path) : [profile.avatar_url].filter(Boolean) as string[];
  const hasHours = Object.keys(hours.incall).length > 0 || Object.keys(hours.outcall).length > 0;
  const normalizedPhone = normalizePhone(profile.phone);
  const callHref = normalizedPhone ? `tel:${normalizedPhone}` : null;
  const messageHref = normalizedPhone ? `https://wa.me/${normalizedPhone.replace(/[^\d]/g, "")}` : null;
  const smsHref = normalizedPhone ? `sms:${normalizedPhone.replace(/[^\d+]/g, "")}` : null;
  const isVerified =
    profile._tier === "standard" ||
    profile._tier === "pro" ||
    profile._tier === "elite" ||
    Boolean(profile.is_verified_identity) ||
    Boolean(profile.is_verified_profile);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Therapists", path: "/therapists" },
          { name, path: profilePath },
        ])}
      />
      <JsonLd
        data={buildProfilePageJsonLd({
          name,
          path: profilePath,
          description:
            profile.bio ||
            `${name} is listed on MasseurMatch with city context, specialties, and direct contact information.`,
          city: profile.city,
          specialties: profile.specialties,
          image: profile.avatar_url,
          tier: profile._tier,
          incallPrice: profile.incall_price,
          outcallPrice: profile.outcall_price,
          reviews: reviews.map((review) => ({
            rating: review.rating,
            reviewText: review.review_text,
            reviewerName: review.reviewer_name,
          })),
        })}
      />

      <div className="container mx-auto max-w-4xl px-4 py-10 pb-28 md:pb-10">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <Image
            src={
              profile.avatar_url ||
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop"
            }
            alt={`${name} - ${profile.city || "US"} Massage Therapist`}
            width={220}
            height={220}
            className="h-[220px] w-[220px] rounded-lg object-cover"
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {profile._tier || "free"} listing
            </p>
            <h1 className="mt-2 text-4xl font-bold text-foreground">{name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{profile.city || "United States"}</p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {profile.bio || "This therapist profile is still being expanded with more details."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {callHref ? (
                <a className="rounded-full bg-action-primary px-5 py-3 text-sm font-semibold text-white" href={callHref}>
                  Call Now
                </a>
              ) : null}
              {messageHref ? (
                <a className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground" href={messageHref} target="_blank" rel="noreferrer">
                  Message via WhatsApp
                </a>
              ) : null}
              {smsHref ? (
                <a className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground" href={smsHref}>
                  Message via SMS
                </a>
              ) : null}
              <Link className="text-sm font-semibold text-primary hover:underline" href={cityPath}>
                Browse city page
              </Link>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Specialties</p>
                <p className="mt-2">{(profile.specialties || []).join(", ") || "Massage therapy"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  {isVerified ? "Verified profile signal active" : "Verification pending"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Pricing snapshot</p>
                <p className="mt-2">
                  {profile.incall_price ? `Incall $${profile.incall_price}` : "Incall pricing on request"}
                  {" · "}
                  {profile.outcall_price ? `Outcall $${profile.outcall_price}` : "Outcall pricing on request"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <Tabs defaultValue="about">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-secondary/60 p-2">
              <TabsTrigger value="about" className="rounded-xl px-4 py-2.5">About</TabsTrigger>
              <TabsTrigger value="services" className="rounded-xl px-4 py-2.5">Services</TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-xl px-4 py-2.5">Gallery</TabsTrigger>
              <TabsTrigger value="hours" className="rounded-xl px-4 py-2.5">Hours</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">About {name}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {profile.bio || "This therapist is still building out the public profile description."}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">Profile snapshot</h2>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    <p><span className="font-semibold text-foreground">City:</span> {profile.city || "United States"}</p>
                    <p><span className="font-semibold text-foreground">Modality:</span> {profile.modality || "Massage therapy"}</p>
                    <p><span className="font-semibold text-foreground">Specialties:</span> {(profile.specialties || []).join(", ") || "General wellness massage"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">Services and rates</h2>
                  <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {pricingSessions.length > 0 ? (
                      pricingSessions.map((session, index) => (
                        <div key={`${session.name || "session"}-${index}`} className="rounded-2xl border border-border bg-background px-4 py-3">
                          <p className="font-semibold text-foreground">{session.name || `${session.duration || 60} minute session`}</p>
                          <p className="mt-1">Incall: {session.incall ? `$${session.incall}` : "On request"}</p>
                          <p>Outcall: {session.outcall ? `$${session.outcall}` : "On request"}</p>
                        </div>
                      ))
                    ) : (
                      <>
                        <p>Incall: {profile.incall_price ? `$${profile.incall_price}` : "On request"}</p>
                        <p>Outcall: {profile.outcall_price ? `$${profile.outcall_price}` : "On request"}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">What this profile emphasizes</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    The active profile focuses on clean presentation, city relevance, specialties, and direct communication.
                    Visitors can use these details to decide whether to reach out and ask for more specifics before scheduling directly.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-border bg-secondary/20">
                    <Image
                      src={image}
                      alt={`${name} - ${profile.city || "US"} Massage Therapist image ${index + 1}`}
                      width={640}
                      height={640}
                      className="h-64 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="hours" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">Incall hours</h2>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {Object.entries(hours.incall).length > 0 ? Object.entries(hours.incall).map(([day, value]) => (
                      <div key={day} className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">{day}</span>
                        <span>{value}</span>
                      </div>
                    )) : <p>Schedule shared directly with clients.</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/20 p-5">
                  <h2 className="text-xl font-semibold text-foreground">Outcall hours</h2>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {Object.entries(hours.outcall).length > 0 ? Object.entries(hours.outcall).map(([day, value]) => (
                      <div key={day} className="flex items-center justify-between gap-4">
                        <span className="font-medium text-foreground">{day}</span>
                        <span>{value}</span>
                      </div>
                    )) : <p>{hasHours ? "Outcall hours are not listed separately." : "Hours available by appointment."}</p>}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {faqItems.length > 0 ? (
          <section className="mt-10 rounded-3xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-foreground">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-4">
              {faqItems.map((item, index) => (
                <AccordionItem key={`${item.question}-${index}`} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left text-foreground">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">Reviews and trust signals</h2>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                No imported reviews are available yet for this therapist profile.
              </p>
            ) : null}
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border p-4">
                <p className="text-sm leading-6 text-muted-foreground">{review.review_text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Rating: {review.rating ?? "N/A"}
                  {review.reviewer_name ? ` · ${review.reviewer_name}` : ""}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Trust and safety</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            MasseurMatch is a discovery directory. Review profile details carefully, confirm boundaries directly, and
            read the trust and safety guidance before scheduling with any provider.
          </p>
          <details className="mt-4 rounded-2xl border border-border bg-secondary/20 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-foreground">Verification documents (hidden by default)</summary>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Identity verification: {profile.is_verified_identity ? "Submitted and reviewed" : "Not verified"}</p>
              <p>Profile verification: {profile.is_verified_profile ? "Verified" : "Not verified"}</p>
              <p>Photo verification: {profile.is_verified_photos ? "Verified" : "Not verified"}</p>
              <p className="text-xs">Documents are reviewed for trust and safety. Sensitive files are not publicly exposed.</p>
            </div>
          </details>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/safety" className="text-primary hover:underline">
              Read safety guidance
            </Link>
            <Link href={`/contact?report=${encodeURIComponent(profile.slug || profile.id)}`} className="text-primary hover:underline">
              Report an issue
            </Link>
          </div>
        </section>
      </div>

      {(callHref || messageHref || smsHref) ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-4xl gap-2">
            {callHref ? (
              <a href={callHref} className="flex-1 rounded-xl bg-action-primary px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Call Now
              </a>
            ) : null}
            {messageHref ? (
              <a href={messageHref} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                WhatsApp
              </a>
            ) : smsHref ? (
              <a href={smsHref} className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                SMS
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
