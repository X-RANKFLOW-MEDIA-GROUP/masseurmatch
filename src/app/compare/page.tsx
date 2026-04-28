import Link from "next/link";

export const metadata = {
  title: "Compare Massage Directories | MasseurMatch",
  description: "See why MasseurMatch is the safest and most trusted alternative to legacy male massage directories.",
};

export default function CompareHubPage() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-16">
      <div className="mb-16 text-center">
        <h1 className="mb-6 text-4xl font-black tracking-tight md:text-5xl">Compare MasseurMatch to Other Directories</h1>
        <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
          See how our strict verification process and modern, premium UX compares to legacy platforms.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/compare/masseurmatch-vs-masseurfinder"
          className="group rounded-2xl border border-border bg-card p-8 transition duration-300 hover:border-primary"
        >
          <h2 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">MasseurMatch vs MasseurFinder</h2>
          <p className="leading-relaxed text-muted-foreground">Compare our rigorous identity verification and safety features against legacy listing sites.</p>
        </Link>
        <Link
          href="/compare/masseurmatch-vs-rentmasseur"
          className="group rounded-2xl border border-border bg-card p-8 transition duration-300 hover:border-primary"
        >
          <h2 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">MasseurMatch vs RentMasseur</h2>
          <p className="leading-relaxed text-muted-foreground">Discover why direct contact and zero middleman fees provide a better booking experience.</p>
        </Link>
        <Link
          href="/compare/masseurmatch-vs-promasseurs"
          className="group rounded-2xl border border-border bg-card p-8 transition duration-300 hover:border-primary"
        >
          <h2 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">MasseurMatch vs ProMasseurs</h2>
          <p className="leading-relaxed text-muted-foreground">A side-by-side look at profile quality, search functionality, and trust signals.</p>
        </Link>
      </div>
    </main>
  );
}
