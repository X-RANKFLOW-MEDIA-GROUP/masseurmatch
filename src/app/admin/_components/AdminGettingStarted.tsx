import Link from "next/link";
import { ArrowRight, Grid3X3, HeartHandshake, MessageSquare, Search } from "lucide-react";

const workflows = [
  {
    href: "/admin/therapists",
    label: "Manage a provider",
    description: "Open profiles, approvals, verification, photos, or moderation.",
    icon: HeartHandshake,
  },
  {
    href: "/admin/bookings",
    label: "Handle today’s requests",
    description: "Review booking approvals, SMS alerts, tickets, and support work.",
    icon: MessageSquare,
  },
  {
    href: "/admin/seo",
    label: "Grow visibility",
    description: "Work with cities, keywords, blog content, and SEO controls.",
    icon: Search,
  },
  {
    href: "/admin/tools",
    label: "See everything",
    description: "Open the complete catalog of admin pages and background systems.",
    icon: Grid3X3,
  },
];

export function AdminGettingStarted() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-6 text-white shadow-sm">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Start here</p>
        <h2 className="font-display mt-2 text-2xl font-bold">What do you need to do today?</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          The dashboard is organized by real work instead of technical features. Choose a workflow below or open All Tools for the complete system map.
        </p>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {workflows.map((workflow) => (
          <Link
            key={workflow.href}
            href={workflow.href}
            className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-white/25 hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <workflow.icon className="h-5 w-5 text-white/80" />
              <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{workflow.label}</h3>
            <p className="mt-1 text-xs leading-5 text-white/60">{workflow.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
