import Link from "next/link";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-foreground py-24 text-center text-background lg:py-40">
      {/* Decorative orange accent */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.9] tracking-tight">
          Get listed today.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-background/70">
          Join 500+ verified therapists growing their practice through MasseurMatch.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/for-therapists"
            className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_40px_rgba(255,138,31,0.4)]"
          >
            List your practice
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-14 items-center justify-center rounded-full border border-background/30 px-8 text-sm font-semibold text-background transition-all hover:border-background/60 hover:bg-background/10"
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
