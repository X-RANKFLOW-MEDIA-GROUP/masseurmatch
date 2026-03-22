import Link from "next/link";
import { PageSection, StatGrid, Surface } from "@/app/_components/primitives";

type AdminToolLink = {
  href: string;
  label: string;
  description?: string;
};

export function AdminTools({
  stats,
  links,
}: {
  stats: Array<{ label: string; value: string; note?: string }>;
  links: AdminToolLink[];
}) {
  return (
    <div className="space-y-6">
      <PageSection
        title="Admin Overview"
        description="Use the consolidated admin surface to move into therapists, users, reviews, cities, keywords, and blog operations."
      />

      <StatGrid items={stats} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {links.map((link) => (
          <Surface key={link.href} className="p-0">
            <Link href={link.href} className="block rounded-3xl p-5 transition-colors hover:bg-accent">
              <p className="text-sm font-semibold text-foreground">{link.label}</p>
              {link.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{link.description}</p> : null}
            </Link>
          </Surface>
        ))}
      </div>
    </div>
  );
}
