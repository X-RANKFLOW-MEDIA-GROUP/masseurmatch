import Link from "next/link";
import { createPageMetadata } from "@/app/_lib/seo";
import { COMPETITOR_INDEX_ROUTES } from "@/lib/seo/competitorComparisonRoutes";

export const metadata = createPageMetadata({
  title: "Massage Directory Comparisons and Alternatives",
  description:
    "Explore neutral comparison pages for massage directory alternatives, including city-based discovery, profile structure, and direct contact options.",
  path: "/massage-directories",
});

export default function MassageDirectoriesHubPage() {
  const visibleRoutes = COMPETITOR_INDEX_ROUTES.filter((entry) => entry.indexable);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold">Massage Directory Alternatives and Comparisons</h1>
      <p className="mt-4 text-muted-foreground">
        Browse editorial comparison pages about professional massage directories. MasseurMatch is a directory-first platform:
        visitors browse profiles and contact providers directly.
      </p>
      <ul className="mt-8 space-y-3">
        {visibleRoutes.map((route) => (
          <li key={route.slug}>
            <Link className="text-primary underline" href={`/massage-directories/${route.slug}`}>
              {route.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
