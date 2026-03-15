import Link from "next/link";

interface LegacyAdminViewProps {
  description: string;
  href: string;
  title: string;
}

export default function LegacyAdminView({
  description,
  href,
  title,
}: LegacyAdminViewProps) {
  return (
    <section className="page-shell py-14">
      <div className="surface-panel max-w-3xl px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Legacy Admin View
        </p>
        <h1 className="mt-4 font-display text-4xl text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
        <Link
          href={href}
          className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4"
        >
          Open current admin page
        </Link>
      </div>
    </section>
  );
}

