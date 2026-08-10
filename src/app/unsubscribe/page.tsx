'use client';

import { Suspense } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import UnsubscribeClient from './unsubscribe-client';

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border bg-white py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Email Preferences
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Manage Subscriptions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Control which emails you receive from MasseurMatch.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <Suspense
            fallback={
              <div className="rounded-lg border border-border bg-soft p-8 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="text-foreground font-medium">Processing your request...</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please wait while we update your email preferences.
                </p>
              </div>
            }
          >
            <UnsubscribeClient />
          </Suspense>
        </div>
      </section>
    </div>
  );
}

}
