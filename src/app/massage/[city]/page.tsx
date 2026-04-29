import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/_components/JsonLd";
import { buildCityIntro } from "@/lib/seo/contentTemplates";
import { CITY_BY_SLUG } from "@/lib/seo/cities";
import { METADATA_FORMULAS, buildMetadata } from "@/lib/seo/metadata";
import { MODALITIES } from "@/lib/seo/modalities";
import { schema } from "@/lib/seo/schema";
import { SEO_STATES, STATE_SLUG_SET } from "@/lib/seo/states";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  if (STATE_SLUG_SET.has(citySlug)) {
    const state = SEO_STATES.find((item) => item.slug === citySlug);
    return buildMetadata({
      title: `Massage Therapists in ${state?.name || "this state"} | MasseurMatch`,
      description: `Find independent massage therapists in ${state?.name || "this state"}. Browse city pages and contact providers directly.`,
      path: `/massage/${citySlug}`,
    });
  }
  const city = CITY_BY_SLUG.get(citySlug);
  if (!city) return buildMetadata({ title: "Massage city page", description: "City massage listings.", path: `/massage/${citySlug}`, noIndex: true });
  const formula = METADATA_FORMULAS.city(city.name);
  return buildMetadata({ title: formula.title, description: formula.description, path: `/massage/${citySlug}` });
}

export default async function LocationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  if (STATE_SLUG_SET.has(citySlug)) {
    const state = SEO_STATES.find((item) => item.slug === citySlug);
    const stateCities = Array.from(CITY_BY_SLUG.values()).filter((city) => city.stateSlug === citySlug);
    return <main className="container mx-auto px-4 py-10"><h1 className="text-3xl font-bold">Massage Therapists in {state?.name}</h1><ul className="mt-6 grid gap-2">{stateCities.map((city) => <li key={city.slug}><Link className="text-primary hover:underline" href={`/massage/${city.slug}`}>{city.name} massage therapists</Link></li>)}</ul></main>;
  }

  const city = CITY_BY_SLUG.get(citySlug);
  if (!city) notFound();
  const faq = [
    { question: `How do I contact massage therapists in ${city.name}?`, answer: "Use phone, SMS, WhatsApp, email, or website links shown on each profile." },
    { question: "Does MasseurMatch process bookings or payments?", answer: "No. MasseurMatch is a directory only with direct contact between users and therapists." },
  ];

  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd data={schema.breadcrumb([{ name: "Home", path: "/" }, { name: "Massage", path: "/massage" }, { name: city.name, path: `/massage/${city.slug}` }])} />
      <JsonLd data={schema.faq(faq)} />
      <h1 className="text-3xl font-bold">Massage Therapists in {city.name}</h1>
      <p className="mt-4 text-muted-foreground">{buildCityIntro(city.name)}</p>
      <h2 className="mt-8 text-xl font-semibold">Popular massage styles in {city.name}</h2>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {MODALITIES.map((modality) => (<li key={modality.slug}><Link href={`/massage/${city.slug}/${modality.slug}`} className="text-primary hover:underline">{modality.label} in {city.name}</Link></li>))}
      </ul>
      <h2 className="mt-8 text-xl font-semibold">Nearby cities</h2>
      <ul className="mt-3 grid gap-2 md:grid-cols-2">{city.nearby.map((nearby) => <li key={nearby}><Link href={`/massage/${nearby}`} className="text-primary hover:underline">Massage therapists near {nearby.replace(/-/g, " ")}</Link></li>)}</ul>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">How MasseurMatch works</h2>
        <p className="mt-2 text-muted-foreground">Browse profiles, compare massage styles, and contact therapists directly. Profiles are managed by independent providers.</p>
      </section>
      <section className="mt-6">
        <h2 className="text-xl font-semibold">Safety and professionalism</h2>
        <p className="mt-2 text-muted-foreground">MasseurMatch does not process in-platform booking, payments, or reviews. Always communicate clearly and verify session details directly with the provider.</p>
      </section>
      <h2 className="mt-8 text-xl font-semibold">FAQ</h2>
      {faq.map((item) => <div key={item.question} className="mt-3"><h3 className="font-medium">{item.question}</h3><p className="text-muted-foreground">{item.answer}</p></div>)}
    </main>
  );
}
