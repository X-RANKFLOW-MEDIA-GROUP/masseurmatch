import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/legal", label: "Legal Center" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/therapist-agreement", label: "Therapist Agreement" },
  { href: "/cookie-policy", label: "Cookies" },
];

type LegalPageProps = {
  title: string;
  path: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export function LegalPage({ title, path, lastUpdated = "March 17, 2026", children }: LegalPageProps) {
  return (
    <section className="bg-background py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Legal pages">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                item.href === path
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <header className="mb-10 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Legal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
        </header>

        <article className="prose prose-slate max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary">
          {children}
        </article>
      </div>
    </section>
  );
}
