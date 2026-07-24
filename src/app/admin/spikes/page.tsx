import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Beaker,
  Boxes,
  FlaskConical,
  Home,
  Split,
} from "lucide-react";

export const metadata = {
  title: "Design Spikes | Admin",
  description: "Private index of prototypes, experiments, and internal design tools.",
  robots: { index: false, follow: false },
};

const spikes = [
  {
    href: "/home-3d",
    title: "Home 3D Concept",
    description: "Premium metallic homepage and brand identity prototype.",
    icon: Home,
    type: "Prototype",
  },
  {
    href: "/design-system/buttons",
    title: "Buttons & 3D Cards",
    description: "Internal UI showcase for buttons, states, and card interactions.",
    icon: Boxes,
    type: "Design system",
  },
  {
    href: "/admin/ab-tests",
    title: "A/B Testing",
    description: "Framework for controlled profile-field and conversion experiments.",
    icon: Split,
    type: "Experiment",
  },
  {
    href: "/admin/dashboard/keyword-trends",
    title: "Keyword Trend Monitor",
    description: "Internal trend analysis and keyword-spike monitoring dashboard.",
    icon: BarChart3,
    type: "Data lab",
  },
];

export default function DesignSpikesPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
              Internal only
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              Design Spikes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Central access to prototypes, visual experiments, design-system previews,
              and controlled product tests. These routes are excluded from search indexing.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {spikes.map((spike) => {
          const Icon = spike.icon;
          return (
            <Link
              key={spike.href}
              href={spike.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-secondary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-brand-secondary/10 group-hover:text-brand-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:text-brand-secondary" />
              </div>
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-950">{spike.title}</h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {spike.type}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{spike.description}</p>
                <code className="mt-4 inline-flex rounded-md bg-slate-950 px-2.5 py-1.5 text-xs text-slate-100">
                  {spike.href}
                </code>
              </div>
            </Link>
          );
        })}
      </section>

      <aside className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <Beaker className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Production navigation must never link directly to these routes. New prototypes
          should be registered here instead of creating hidden aliases or duplicate pages.
        </p>
      </aside>
    </div>
  );
}
