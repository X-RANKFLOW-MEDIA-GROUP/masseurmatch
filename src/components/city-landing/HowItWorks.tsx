import { ClipboardList, UserPlus, UserSquare, type LucideIcon } from "lucide-react";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up in a few minutes to get started — no credit card required.",
  },
  {
    icon: UserSquare,
    title: "Build your professional profile",
    description:
      "Add your services, photos, rates and service area so clients understand what you offer.",
  },
  {
    icon: ClipboardList,
    title: "Submit your listing for platform review",
    description:
      "Send your profile in and our team reviews it before it goes live in the directory.",
  },
];

/**
 * Three-step "how it works". The `#how-it-works` id is the target of the hero's
 * secondary CTA.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-20 bg-background"
    >
      <div className="page-shell py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            How it works
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-[2rem]"
          >
            Three steps to your listing
          </h2>
        </div>

        <ol
          role="list"
          className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3"
        >
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-border bg-[#FAFAFA] p-7"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
                  <Icon className="size-6" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
