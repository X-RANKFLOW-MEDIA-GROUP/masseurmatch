import { getPublicTherapists } from "@/app/_lib/directory";

type KnottyFaqAnswer = {
  answer: string;
  nextStepLabel?: string;
  nextStepHref?: string;
};

const PRODUCT_QUESTION_PATTERNS: Array<{
  pattern: RegExp;
  answer: KnottyFaqAnswer | ((message: string) => Promise<KnottyFaqAnswer>);
}> = [
  {
    pattern: /\b(contact|phone|email|reach|message someone)\b/i,
    answer: {
      answer:
        "MasseurMatch is a directory. Open a therapist profile and use the listed call, text, or WhatsApp options to contact that provider directly.",
      nextStepLabel: "Open the directory",
      nextStepHref: "/search",
    },
  },
  {
    pattern: /\b(pro tier|elite tier|standard tier|tier|plan|billing|subscription|portal)\b/i,
    answer: {
      answer:
        "Plans mainly affect visibility and premium profile tools. Standard improves trust visibility, Pro and Elite add stronger placement, richer media, and more analytics for providers.",
      nextStepLabel: "View pricing",
      nextStepHref: "/pricing",
    },
  },
  {
    pattern: /\bwhat is knotty|how does knotty work|how do you work\b/i,
    answer: {
      answer:
        "Knotty is a concierge layer for the directory. It detects intent, pre-ranks therapists using product signals like availability and distance, then explains the strongest match instead of making you browse cold lists.",
      nextStepLabel: "Try Explore",
      nextStepHref: "/explore",
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
            "Pricing varies by therapist. The fastest way to compare is to open profiles with visible incall or outcall rates.",
          nextStepLabel: "Browse pricing",
          nextStepHref: "/search",
        };
      }

      return {
        answer: `From the current public sample, visible session rates range from $${Math.min(...prices)} to $${Math.max(...prices)}.`,
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
