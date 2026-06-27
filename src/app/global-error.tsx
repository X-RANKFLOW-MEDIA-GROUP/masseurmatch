'use client';

// Global error boundary. Unlike app/error.tsx, this also catches errors thrown
// in the root layout and its providers, replacing the bare browser "Application
// error: a client-side exception has occurred" screen with a branded fallback.
// It must render its own <html>/<body> because it takes over the whole document.

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          color: '#fff',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '9999px',
              background: 'rgba(139,30,45,0.12)',
              color: '#8B1E2D',
              marginBottom: '24px',
            }}
          >
            <AlertTriangle size={30} strokeWidth={2.25} />
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: '0 0 28px' }}>
            We hit an unexpected error while loading the page. Please try again — if it keeps
            happening, refreshing usually clears it.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#8B1E2D',
                color: '#111111',
                fontWeight: 700,
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={18} strokeWidth={2.5} />
              Try again
            </button>
            {/* Intentional full-page navigation: a hard reload recovers more
                reliably than client-side routing once the app tree has errored. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '9999px',
                padding: '12px 24px',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              Go back home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
