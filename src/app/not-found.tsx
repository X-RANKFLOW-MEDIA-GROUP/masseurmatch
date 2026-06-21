import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | MasseurMatch",
};

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-accent">404 Error</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-6 text-lg leading-7 text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/"
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Go back home
        </Link>
        <Link href="/search" className="text-sm font-semibold text-foreground hover:text-accent">
          Search therapists <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
