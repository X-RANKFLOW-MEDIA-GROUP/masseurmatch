import Link from "next/link";
import Image from "next/image";
import FadeUp from "@/components/motion/FadeUp";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 lg:py-36">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/marketing/hero/cover.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0B1F3A]/85" />
      </div>

      {/* Orange glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[100px]"
      />

      <FadeUp>
        <div className="relative mx-auto max-w-[900px] px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            For therapists
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.75rem,7vw,6rem)] font-extrabold leading-[0.9] tracking-tight text-white">
            Get listed today.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-white/60">
            Join 500+ verified therapists growing their practice through MasseurMatch.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/for-therapists"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_40px_rgba(255,138,31,0.35)]"
            >
              List your practice
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/5"
            >
              View pricing
            </Link>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
