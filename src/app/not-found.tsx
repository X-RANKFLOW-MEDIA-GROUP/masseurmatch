import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell py-20">
      <div className="surface-panel max-w-2xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">404</p>
        <h1 className="mt-4 font-display text-4xl">That page is not in the directory.</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Try the main therapist search, a city page, or head back to the homepage.
        </p>
        <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4">
          Return home
        </Link>
      </div>
    </section>
  );
}
