import { errorResponse, json, parseJsonBody } from "@/app/api/_lib/http";
import { getCities, getPublicTherapists, type PublicTherapist } from "@/app/_lib/directory";
import { assertRateLimit, sanitizeText } from "@/app/_lib/security";
import { chatRequestSchema } from "@/app/_lib/validation";

function formatTherapistList(items: PublicTherapist[]) {
  return items
    .slice(0, 3)
    .map((item) => {
      const name = item.display_name || item.full_name || "Unnamed therapist";
      const city = item.city || "their city";
      const tier = item._tier ? ` (${item._tier})` : "";
      return `${name} in ${city}${tier}`;
    })
    .join(", ");
}

function matchesCity(question: string, city: { name: string; slug: string }) {
  return (
    question.includes(city.name.toLowerCase()) ||
    question.includes(city.slug.replace(/-/g, " "))
  );
}

function extractTier(question: string): "free" | "standard" | "pro" | "elite" | null {
  if (question.includes("elite")) return "elite";
  if (question.includes("standard")) return "standard";
  if (question.includes("pro")) return "pro";
  if (question.includes("free")) return "free";
  return null;
}

async function pickAnswer(question: string) {
  const normalizedQuestion = question.toLowerCase();
  const cities = getCities();
  const matchedCity = cities.find((city) => matchesCity(normalizedQuestion, city));
  const requestedTier = extractTier(normalizedQuestion);

  if (
    normalizedQuestion.includes("contact") ||
    normalizedQuestion.includes("phone") ||
    normalizedQuestion.includes("email")
  ) {
    return "MasseurMatch is a directory only. Open a therapist profile and use the listed contact methods or the direct contact link to reach the provider yourself.";
  }

  if (
    normalizedQuestion.includes("price") ||
    normalizedQuestion.includes("cost") ||
    normalizedQuestion.includes("rate")
  ) {
    const sample = await getPublicTherapists({ page: 1, pageSize: 12 });
    const prices = sample.items.flatMap((item) =>
      [item.incall_price, item.outcall_price].filter(
        (value): value is number => typeof value === "number" && value > 0,
      ),
    );

    if (prices.length === 0) {
      return "Pricing varies by therapist. Open a profile to compare incall and outcall rates directly.";
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return `From the current public sample, listed rates range from $${min} to $${max}. Open individual profiles for exact incall and outcall pricing.`;
  }

  if (matchedCity) {
    const cityResults = await getPublicTherapists({
      city: matchedCity.name,
      tier: requestedTier ?? undefined,
      page: 1,
      pageSize: 6,
    });

    if (!cityResults.items.length) {
      return `I couldn't find public therapists in ${matchedCity.name} right now. Try a nearby city or remove the tier filter.`;
    }

    return `I found ${cityResults.total} public therapists in ${matchedCity.name}. A few matches: ${formatTherapistList(cityResults.items)}.`;
  }

  if (requestedTier || normalizedQuestion.includes("tier") || normalizedQuestion.includes("plan")) {
    if (!requestedTier) {
      return "Therapists can appear in Free, Standard, Pro, and Elite tiers. Tell me a city or tier and I'll narrow it down.";
    }

    const tierResults = await getPublicTherapists({
      tier: requestedTier,
      page: 1,
      pageSize: 6,
    });

    if (!tierResults.items.length) {
      return `I couldn't find public ${requestedTier.toUpperCase()} therapists right now.`;
    }

    return `I found ${tierResults.total} public ${requestedTier.toUpperCase()} therapists. Examples: ${formatTherapistList(tierResults.items)}.`;
  }

  const sample = await getPublicTherapists({ page: 1, pageSize: 4 });
  return `I can help with city searches, price ranges, tiers, and contact info. Try "Find therapists in Miami" or "Show Pro therapists in Chicago." Current examples include ${formatTherapistList(sample.items)}.`;
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "chat", { limit: 20, windowMs: 60_000 });
    const body = await parseJsonBody(request, chatRequestSchema);
    const latestMessage =
      sanitizeText(body.message || "") ||
      [...(body.messages || [])]
        .reverse()
        .find((entry) => entry.role === "user")
        ?.content ||
      "";

    const reply = await pickAnswer(sanitizeText(latestMessage));

    return json({
      ok: true,
      reply,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
