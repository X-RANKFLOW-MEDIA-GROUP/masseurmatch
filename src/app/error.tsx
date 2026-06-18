'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-12 w-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We encountered an unexpected error. Our team has been notified.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <button
          onClick={() => reset()}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Try again
        </button>
        <Link href="/" className="text-sm font-semibold text-foreground hover:text-accent">
          Go back home <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
