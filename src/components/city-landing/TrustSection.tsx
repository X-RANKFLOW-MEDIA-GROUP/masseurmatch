import { Info, ShieldAlert } from "lucide-react";

/**
 * Trust / disclaimer band. Uses clear, professional language and makes the
 * platform's role explicit: MasseurMatch is a directory, not a service provider
 * or employer. No claims about verifying licensing, safety, quality, or
 * credentials are made here.
 */
export function TrustSection() {
  return (
    <section aria-labelledby="trust-heading" className="bg-background">
      <div className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-border bg-[#FAFAFA] p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Info className="size-6" strokeWidth={2.25} aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="trust-heading"
                  className="text-xl font-bold tracking-tight text-foreground"
                >
                  About the platform
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  MasseurMatch is an online directory for independent massage and
                  bodywork providers. Providers are independent third parties and
                  are responsible for their own services, credentials,
                  communications, scheduling, payments and compliance with
                  applicable laws.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#F1D9DC] bg-[#F8EDEE] p-5">
              <ShieldAlert
                className="mt-0.5 size-5 shrink-0 text-accent"
                strokeWidth={2.25}
                aria-hidden="true"
              />
              <p className="text-sm font-medium leading-relaxed text-[#6E1521]">
                Sexual services, erotic services, escorting, solicitation and
                illegal activity are strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
