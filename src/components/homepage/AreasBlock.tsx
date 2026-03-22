import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";

type AreasBlockProps = {
  city: string | null;
  neighborhoods: string[];
};

export function AreasBlock({ city, neighborhoods }: AreasBlockProps) {
  if (!neighborhoods.length || !city) return null;

  const citySlug = city.trim().toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="page-shell py-10">
      <h2 className="font-display mb-6 text-2xl font-light text-brand-primary sm:text-3xl">
        Nearby areas
      </h2>
      <div className="flex flex-wrap gap-2">
        {neighborhoods.map((hood) => {
          const slug = hood.trim().toLowerCase().replace(/\s+/g, "-");
          return (
            <Link
              key={hood}
              href={`/${citySlug}/${slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-medium text-brand-primary transition hover:border-brand-accent/30 hover:bg-brand-accent/5"
            >
              <MapPin className="h-3.5 w-3.5 text-text-muted" />
              {hood}
              <ChevronRight className="h-3.5 w-3.5 text-text-muted transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
