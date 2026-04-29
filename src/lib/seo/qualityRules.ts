import { COMPETITOR_TERMS, UNSAFE_KEYWORDS } from "@/lib/seo/keywords";

export const BOOKING_PROMISE_PATTERNS = [/book now/i, /instant booking/i, /checkout now/i];
export const FAKE_VERIFICATION_PATTERNS = [/license verified/i, /government verified/i];

export function hasUnsafeWording(text: string): boolean {
  return UNSAFE_KEYWORDS.some((term) => text.toLowerCase().includes(term.toLowerCase()));
}

export function hasCompetitorBrandInTitle(title: string): boolean {
  return COMPETITOR_TERMS.some((term) => title.toLowerCase().includes(term.toLowerCase()));
}
