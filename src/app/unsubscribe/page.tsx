'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error' | 'idle';

export default function UnsubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No unsubscribe token provided. Please check your email link.');
      return;
    }

    const unsubscribe = async () => {
      setStatus('loading');
      try {
        const response = await fetch('/api/email/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to unsubscribe. Please try again later.');
          setStatus('error');
          return;
        }

        setEmail(data.email || '');
        setStatus('success');
      } catch (err) {
        setError('An unexpected error occurred. Please try again later.');
        setStatus('error');
      }
    };

    unsubscribe();
  }, [token]);

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
          {status === 'loading' && (
            <div className="rounded-lg border border-border bg-soft p-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" strokeWidth={2.25} />
              <p className="text-foreground font-medium">Processing your request...</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we update your email preferences.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-8">
                <div className="flex items-start gap-4">
                  <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" strokeWidth={2.25} />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Unsubscribed Successfully
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {email && (
                        <>
                          We've removed <strong>{email}</strong> from our marketing email list.
                        </>
                      )}
                      {!email && (
                        <>
                          We've updated your email preferences.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-soft p-6">
                <h3 className="font-semibold text-foreground">What to expect</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                    <span>You'll no longer receive promotional emails or marketing updates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                    <span>
                      You may still receive important transactional emails like account notifications
                      and billing information.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                    <span>Changes may take up to 10 business days to fully process.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  Return to MasseurMatch
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
                <Link
                  href="/email-opt-out"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-soft"
                >
                  Learn More About Emails
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-8">
                <div className="flex items-start gap-4">
                  <AlertCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-red-600" strokeWidth={2.25} />
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Unable to Unsubscribe
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {error}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-soft p-6">
                <h3 className="font-semibold text-foreground">What you can do</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  To manage your email preferences manually, please email{' '}
                  <a href="mailto:support@masseurmatch.com" className="font-medium text-primary hover:underline">
                    support@masseurmatch.com
                  </a>
                  {' '}with the subject line "Unsubscribe" and include your email address.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  We'll process your request within 10 business days in compliance with CAN-SPAM regulations.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  Return to MasseurMatch
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
                <Link
                  href="/email-opt-out"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-soft"
                >
                  Email Policy
                  <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
