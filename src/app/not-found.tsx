import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm font-bold uppercase tracking-widest text-indigo-600">404 Error</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-6 text-lg leading-7 text-slate-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/"
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Go back home
        </Link>
        <Link href="/search" className="text-sm font-semibold text-slate-900">
          Search therapists <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
