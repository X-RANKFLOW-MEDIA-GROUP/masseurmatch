import Link from "next/link";

const FOOTER_GROUPS = [
  {
    title: "Directory",
    links: [
      { href: "/search", label: "Search therapists" },
      { href: "/therapists", label: "Browse listings" },
      { href: "/explore", label: "Explore by city" },
    ],
  },
  {
    title: "For Therapists",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/advertise", label: "Advertise" },
      { href: "/pro/join", label: "Therapist portal" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About MasseurMatch" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/safety", label: "Safety" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
      { href: "/therapist-agreement", label: "Therapist agreement" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-brand-deep text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr),repeat(4,minmax(0,0.75fr))]">
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
              City-first discovery
            </span>
            <h2 className="mt-4 font-heading text-2xl text-white">MasseurMatch</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
              Find verified massage therapists through a cleaner directory built around location, specialties,
              and direct contact.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{group.title}</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Copyright {new Date().getFullYear()} MasseurMatch</p>
          <p>Search by city, compare specialties, and contact therapists directly.</p>
          <p>Therapists and clients connect directly. MasseurMatch handles discovery, not bookings.</p>
        </div>
      </div>
    </footer>
  );
}
