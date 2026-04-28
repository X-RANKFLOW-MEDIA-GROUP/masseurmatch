import Link from "next/link";
import { JsonLd } from "@/app/_components/JsonLd";
import { buildMetadata } from "@/lib/seo/metadata";
import { schema } from "@/lib/seo/schema";
import { SEO_CITIES } from "@/lib/seo/cities";

export const metadata = buildMetadata({
  title: "Massage by City and Style | MasseurMatch",
  description: "Browse massage therapists by city, style, and contact preference. Compare profiles and contact therapists directly.",
  path: "/massage",
});

export default function MassageIndexPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <JsonLd data={schema.breadcrumb([{ name: "Home", path: "/" }, { name: "Massage", path: "/massage" }])} />
      <h1 className="text-3xl font-bold">Find massage therapists by city and massage style</h1>
      <p className="mt-4 text-muted-foreground">MasseurMatch is a directory only. Browse profiles and contact therapists directly.</p>
      <ul className="mt-6 grid gap-2 md:grid-cols-2">
        {SEO_CITIES.map((city) => (
          <li key={city.slug}><Link href={`/massage/${city.slug}`} className="text-primary hover:underline">Massage therapists in {city.name}</Link></li>
        ))}
      </ul>
    </main>
  );
}
