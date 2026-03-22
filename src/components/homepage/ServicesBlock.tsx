import Link from "next/link";
import { ArrowRight, Dumbbell, Waves, Sparkles, HandHeart } from "lucide-react";

type ServicesBlockProps = {
  city: string | null;
};

const SERVICES = [
  { label: "Deep Tissue Massage", slug: "deep-tissue-massage", icon: Dumbbell },
  { label: "Swedish Massage", slug: "swedish-massage", icon: Waves },
  { label: "Sports Recovery", slug: "sports-recovery", icon: Sparkles },
  { label: "Mobile Massage", slug: "mobile-massage", icon: HandHeart },
];

export function ServicesBlock({ city }: ServicesBlockProps) {
  const citySlug = city?.trim().toLowerCase().replace(/\s+/g, "-") ?? null;

  return (
    <section className="page-shell py-10">
      <h2 className="font-display mb-6 text-2xl font-light text-brand-primary sm:text-3xl">
        Popular services
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map(({ label, slug, icon: Icon }) => {
          const href = citySlug ? `/${citySlug}/${slug}` : `/search?keyword=${encodeURIComponent(label)}`;
          return (
            <Link
              key={slug}
              href={href}
              className="group flex items-center gap-4 rounded-[20px] border border-border-subtle bg-white p-4 transition hover:border-brand-accent/30 hover:shadow-[0_8px_20px_rgb(var(--color-brand-primary-rgb)/0.06)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-primary/8">
                <Icon className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="flex-1 text-sm font-semibold text-brand-primary">{label}</span>
              <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-brand-accent" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
