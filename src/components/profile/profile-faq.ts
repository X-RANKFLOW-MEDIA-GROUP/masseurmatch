import type { ProfileFaqItem } from "@/app/_lib/directory";
import type { ProfileViewModel } from "./profile-utils";

const HAS_RATES = (value: string) => Boolean(value) && value !== "Contact for rates";

function uniqueList(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

/**
 * Builds the question/answer list shown on a therapist profile.
 *
 * Curated `custom_faq` entries always come first; grounded defaults derived
 * from the profile data fill in the rest so every profile shows a useful Q&A
 * section (and a matching FAQPage JSON-LD block). Answers only state facts that
 * are present in the profile — no fabricated claims, pricing, or guarantees.
 */
export function buildProfileFaq(
  profile: ProfileViewModel,
  custom: ProfileFaqItem[] = [],
): ProfileFaqItem[] {
  const name = profile.name;
  const city = profile.city;
  const state = profile.state;

  const curated: ProfileFaqItem[] = custom
    .filter((item) => item && typeof item.question === "string" && typeof item.answer === "string")
    .map((item) => ({ question: item.question.trim(), answer: item.answer.trim() }))
    .filter((item) => item.question && item.answer);

  const services = uniqueList([...profile.services, ...profile.massageTypes, ...profile.specialties]);
  const defaults: ProfileFaqItem[] = [];

  if (services.length > 0) {
    defaults.push({
      question: `What massage services does ${name} offer in ${city}?`,
      answer: `${name} offers ${services.slice(0, 6).join(", ").toLowerCase()} in ${city}, ${state}. Each session is tailored to your needs — message ${name} to confirm the right approach for you.`,
    });
  }

  if (HAS_RATES(profile.startingPrice)) {
    const parts: string[] = [`Sessions with ${name} start at ${profile.startingPrice}.`];
    if (HAS_RATES(profile.incallPrice)) parts.push(`Incall from ${profile.incallPrice}.`);
    if (HAS_RATES(profile.outcallPrice)) parts.push(`Outcall from ${profile.outcallPrice}.`);
    parts.push(`Final pricing depends on session length and type — contact ${name} to confirm current rates.`);
    defaults.push({
      question: `How much does a massage session with ${name} cost?`,
      answer: parts.join(" "),
    });
  } else {
    defaults.push({
      question: `How much does a massage session with ${name} cost?`,
      answer: `${name} shares pricing directly. Use the contact options on this page to ask about current rates and session lengths.`,
    });
  }

  if (profile.incallAvailable || profile.outcallAvailable) {
    const modes: string[] = [];
    if (profile.incallAvailable) modes.push("incall (at their private studio)");
    if (profile.outcallAvailable) modes.push("outcall (mobile, travelling to you)");
    defaults.push({
      question: `Does ${name} offer incall or outcall massage?`,
      answer: `${name} offers ${modes.join(" and ")} sessions${profile.outcallAvailable && /mile/i.test(profile.travelRadius) ? `, with a travel radius of ${profile.travelRadius}` : ""}. The exact studio address is shared after you connect.`,
    });
  }

  defaults.push({
    question: `What areas does ${name} serve around ${city}?`,
    answer: `${name} is based in ${profile.neighborhood} and serves ${profile.serviceAreas.slice(0, 5).join(", ")} across ${city}, ${state}.`,
  });

  if (profile.availabilityDays.length > 0) {
    defaults.push({
      question: `When is ${name} available?`,
      answer: `${name} is generally available on ${profile.availabilityDays.join(", ")}. ${profile.availabilityHours}. Reach out to confirm a specific time.`,
    });
  }

  defaults.push({
    question: `How do I contact ${name}?`,
    answer: `${name} prefers ${profile.preferredContactMethod.toLowerCase()}. Connect through the contact options on this page — MasseurMatch is a directory and does not book or manage appointments on a provider's behalf.`,
  });

  const seen = new Set<string>();
  const combined: ProfileFaqItem[] = [];
  for (const item of [...curated, ...defaults]) {
    const key = item.question.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(item);
  }

  return combined.slice(0, 8);
}
