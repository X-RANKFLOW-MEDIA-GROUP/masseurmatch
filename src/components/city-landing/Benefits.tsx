import {
  BadgeCheck,
  Images,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

type Benefit = {
  icon: LucideIcon;
  title: string;
};

const BENEFITS: Benefit[] = [
  { icon: BadgeCheck, title: "Create a professional provider profile" },
  { icon: Images, title: "Showcase your services, photos, rates and service area" },
  { icon: MapPin, title: "Appear in the local MasseurMatch directory" },
  { icon: MessageSquare, title: "Receive inquiries directly from potential clients" },
  { icon: LayoutDashboard, title: "Manage your listing through your provider dashboard" },
];

/**
 * "What you get" grid. Generic and city-agnostic — no results are promised
 * (no client counts, leads, bookings, or income).
 */
export function Benefits() {
  return (
    <section aria-labelledby="benefits-heading" className="bg-[#F7F7F7]">
      <div className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            What you get
          </span>
          <h2
            id="benefits-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[2rem]"
          >
            Everything you need to build your listing
          </h2>
        </div>

        <ul
          role="list"
          className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map(({ icon: Icon, title }) => (
            <li
              key={title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-[#FAFAFA] p-6 transition-colors hover:border-[#D9D9D9]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="size-6" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <p className="pt-1 text-base font-medium leading-snug text-foreground">
                {title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
