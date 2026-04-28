import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { JsonLd } from "@/app/_components/json-ld";
import { generateMetadata as generateRouteMetadata } from "@/app/massage-directories/[slug]/metadata";
import { getCityInventoryMap, getCities } from "@/app/_lib/directory";
import { COMPETITORS } from "@/lib/seo/competitors";
import {
  buildComparisonFaqs,
  buildComparisonFeatureRows,
  buildComparisonH1,
  buildRequiredSections,
} from "@/lib/seo/competitorComparisonContent";
import {
  getCanonicalCompetitorRouteSlug,
  getCompetitorRouteBySlug,
} from "@/lib/seo/competitorComparisonRoutes";
import {
  buildCompetitorArticleSchema,
  buildCompetitorBreadcrumbSchema,
  buildCompetitorFaqSchema,
} from "@/lib/seo/competitorComparisonSchema";

export const dynamicParams = false;

export const generateMetadata = generateRouteMetadata;

export async function generateStaticParams() {
  return [
    ...COMPETITORS.filter((entry) => entry.allowedForComparison).flatMap((entry) => [
      { slug: `masseurmatch-vs-${entry.slug}` },
      { slug: `${entry.slug}-alternative` },
    ]),
    { slug: "best-gay-massage-directory-alternatives" },
    { slug: "best-lgbt-friendly-massage-directory" },
    { slug: "best-male-massage-directory-alternatives" },
    { slug: "best-massage-directory-alternatives" },
  ];
}

async function getTopCitySlugs(limit = 3) {
  const inventory = await getCityInventoryMap();
  const scores = getCities()
    .map((city) => ({ slug: city.slug, name: city.name, count: inventory.get(city.name.toLowerCase()) ?? 0 }))
    .filter((city) => city.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return scores.length > 0 ? scores.map((city) => city.slug) : ["dallas", "miami", "new-york"].slice(0, limit);
}

export default async function MassageDirectoriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonicalSlug = getCanonicalCompetitorRouteSlug(slug);

  if (canonicalSlug !== slug) {
    permanentRedirect(`/massage-directories/${canonicalSlug}`);
  }

  const route = getCompetitorRouteBySlug(slug);

  if (!route) {
    notFound();
  }

  const competitor = COMPETITORS.find((entry) => entry.slug === route.competitorSlug);
  const competitorName = competitor?.name ?? "Massage directory options";

  const h1 = buildComparisonH1(route);
  const tableRows = buildComparisonFeatureRows();
  const faqs = buildComparisonFaqs(competitorName);
  const sections = buildRequiredSections(competitorName);
  const topCities = await getTopCitySlugs(2);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <JsonLd data={buildCompetitorArticleSchema({ slug: route.slug, title: route.title, description: route.description })} />
      <JsonLd data={buildCompetitorBreadcrumbSchema(route.slug, h1)} />
      <JsonLd data={buildCompetitorFaqSchema(route.slug, faqs)} />

      <h1 className="text-3xl font-bold">{h1}</h1>
      <p className="mt-4 text-muted-foreground">{route.description}</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Quick answer</h2>
        <p className="mt-2 text-muted-foreground">
          MasseurMatch is built as a directory first platform for discovering independent massage therapists by city,
          massage style, profile details, and contact preference. Visitors contact providers directly outside the platform.
          MasseurMatch does not manage appointments, payments, or client accounts.
        </p>
      </section>

      <section className="mt-8 overflow-x-auto">
        <h2 className="text-xl font-semibold">Feature comparison table</h2>
        <table className="mt-3 min-w-full border-collapse border border-border text-sm">
          <thead>
            <tr>
              <th className="border border-border p-2 text-left">Feature</th>
              <th className="border border-border p-2 text-left">MasseurMatch</th>
              <th className="border border-border p-2 text-left">{competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.label}>
                <td className="border border-border p-2">{row.label}</td>
                <td className="border border-border p-2">{row.masseurMatch}</td>
                <td className="border border-border p-2">{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Comparison sections</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
          {sections.map((section) => (
            <li key={section}>{section}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Internal links</h2>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li><Link className="underline" href="/massage">/massage</Link></li>
          <li><Link className="underline" href="/near-me">/near-me</Link></li>
          <li><Link className="underline" href="/therapists">/therapists</Link></li>
          <li><Link className="underline" href="/register">/register</Link></li>
          {topCities.map((city) => (
            <li key={city}><Link className="underline" href={`/massage/${city}`}>{`/massage/${city}`}</Link></li>
          ))}
          {topCities.map((city) => (
            <li key={`${city}-gay`}><Link className="underline" href={`/massage/${city}/gay-massage`}>{`/massage/${city}/gay-massage`}</Link></li>
          ))}
          {topCities.map((city) => (
            <li key={`${city}-lgbt`}><Link className="underline" href={`/massage/${city}/lgbt-friendly-massage`}>{`/massage/${city}/lgbt-friendly-massage`}</Link></li>
          ))}
          {topCities.map((city) => (
            <li key={`${city}-male`}><Link className="underline" href={`/massage/${city}/male-massage`}>{`/massage/${city}/male-massage`}</Link></li>
          ))}
          <li><Link className="underline" href="/blog/how-to-find-an-lgbt-friendly-massage-therapist">/blog/how-to-find-an-lgbt-friendly-massage-therapist</Link></li>
          <li><Link className="underline" href="/blog/how-to-choose-a-massage-therapist-near-you">/blog/how-to-choose-a-massage-therapist-near-you</Link></li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-3 space-y-3">
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3 className="font-medium">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Browse MasseurMatch</h2>
        <p className="mt-2 text-muted-foreground">Explore therapist profiles by city, massage style, and direct contact preferences.</p>
        <Link className="mt-3 inline-block underline" href="/therapists">Browse therapists</Link>
      </section>

      <section className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-lg font-semibold">Are you a therapist?</h2>
        <p className="mt-2 text-muted-foreground">Create your public profile and manage your own profile details from the dashboard.</p>
        <Link className="mt-3 inline-block underline" href="/register">Create a profile</Link>
      </section>
    </main>
  );
}
