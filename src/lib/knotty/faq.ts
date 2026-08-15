import { getPublicTherapists } from "@/app/_lib/directory";
import { PLANS } from "@/lib/pricing";
import { KNOTTY_OFFICIAL_URLS } from "@/lib/knotty/website-knowledge";

type KnottyFaqAnswer = {
  answer: string;
  nextStepLabel?: string;
  nextStepHref?: string;
};

function providerPricingSummary() {
  return PLANS.map((plan) => `${plan.name} $${plan.price}/mo`).join(", ");
}

const PRODUCT_QUESTION_PATTERNS: Array<{
  pattern: RegExp;
  answer: KnottyFaqAnswer | ((message: string) => Promise<KnottyFaqAnswer>);
}> = [
  {
    pattern: /\b(sign ?up|join|create (?:an )?account|create (?:a )?profile|where do i register|how do i register)\b/i,
    answer: {
      answer: `You can create your MasseurMatch account here: ${KNOTTY_OFFICIAL_URLS.signup}. Start with your account, then complete your therapist profile with your location, services, photos, and contact details.`,
      nextStepLabel: "Create your account",
      nextStepHref: "/signup/account",
    },
  },
  {
    pattern: /\b(how does masseurmatch work|how does it work|what is masseurmatch|what does masseurmatch do)\b/i,
    answer: {
      answer:
        "MasseurMatch is an LGBTQ+ inclusive directory for independent massage therapists. Clients discover profiles and contact therapists directly, while therapists stay in control of their own scheduling and client payments.",
      nextStepLabel: "Learn about MasseurMatch",
      nextStepHref: "/for-therapists",
    },
  },
  {
    pattern: /\b(contact|phone|email|reach|message someone)\b/i,
    answer: {
      answer:
        "MasseurMatch is a directory. Open a therapist profile and use the listed call, text, WhatsApp, or consented email option to contact that provider directly.",
      nextStepLabel: "Open the directory",
      nextStepHref: "/search",
    },
  },
  {
    pattern: /\b(pro tier|elite tier|standard tier|free plan|tier|plan|billing|subscription|provider pricing|membership price|how much is masseurmatch)\b/i,
    answer: {
      answer: `Current provider plans are ${providerPricingSummary()}. Paid plans add more visibility and profile tools. Full details: ${KNOTTY_OFFICIAL_URLS.pricing}`,
      nextStepLabel: "View pricing",
      nextStepHref: "/pricing",
    },
  },
  {
    pattern: /\bwhat is knotty|how does knotty work|how do you work\b/i,
    answer: {
      answer:
        "Knotty is MasseurMatch's conversational assistant. I can explain the platform, answer provider questions, and help people narrow down therapist options using current directory information.",
      nextStepLabel: "Browse the directory",
      nextStepHref: "/search",
    },
  },
  {
    pattern: /\b(verified|verification|verify|license|licensed)\b/i,
    answer: {
      answer:
        `MasseurMatch can show trust and verification signals, but a badge should not be treated as a guarantee of licensing, quality, safety, or outcome. For current safety information, see ${KNOTTY_OFFICIAL_URLS.safety}`,
      nextStepLabel: "Safety information",
      nextStepHref: "/safety",
    },
  },
  {
    pattern: /\b(price range|how much do sessions cost|session prices)\b/i,
    answer: async () => {
      const sample = await getPublicTherapists({ page: 1, pageSize: 24 });
      const prices = sample.items.flatMap((item) =>
        [item.incall_price, item.outcall_price].filter(
          (value): value is number => typeof value === "number" && value > 0,
        ),
      );

      if (prices.length === 0) {
        return {
          answer:
            "Session pricing is set by each independent therapist. The fastest way to compare is to open profiles with visible incall or outcall rates.",
          nextStepLabel: "Browse session prices",
          nextStepHref: "/search",
        };
      }

      return {
        answer: `From the current public sample, visible session rates range from $${Math.min(...prices)} to $${Math.max(...prices)}. Individual therapists set their own prices.`,
        nextStepLabel: "Compare profiles",
        nextStepHref: "/search",
      };
    },
  },
];

export async function getKnottyFaqAnswer(message: string) {
  for (const entry of PRODUCT_QUESTION_PATTERNS) {
    if (!entry.pattern.test(message)) {
      continue;
    }

    if (typeof entry.answer === "function") {
      return entry.answer(message);
    }

    return entry.answer;
  }

  return null;
}
