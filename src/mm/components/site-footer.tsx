import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr,1fr,1fr] lg:px-8">
        <div>
          <h3 className="font-display text-2xl text-foreground">MasseurMatch</h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            A city-first therapist directory built for direct contact, local discovery, and cleaner profile comparison.
          </p>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <Link href="/about" className="block transition hover:text-foreground">
            About
          </Link>
          <Link href="/privacy" className="block transition hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="block transition hover:text-foreground">
            Terms
          </Link>
          <Link href="/cookie-policy" className="block transition hover:text-foreground">
            Cookie Policy
          </Link>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground">
          <Link href="/therapist-agreement" className="block transition hover:text-foreground">
            Therapist Agreement
          </Link>
          <Link href="/advertise" className="block transition hover:text-foreground">
            Advertise
          </Link>
          <Link href="/chat" className="block transition hover:text-foreground">
            Directory Assistant
          </Link>
          <Link href="/near-me" className="block transition hover:text-foreground">
            Near Me
          </Link>
        </div>
      </div>
    </footer>
  );
}
