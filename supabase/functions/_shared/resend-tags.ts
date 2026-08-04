const MAX_TAG_LENGTH = 256;

/**
 * Resend tag values only accept ASCII letters, digits, underscores and dashes.
 * Normalize every queue-sourced value at the delivery boundary so legacy rows
 * cannot make an otherwise valid email fail.
 */
export function sanitizeResendTag(value: string | null | undefined, fallback: string): string {
  const asciiValue = Array.from((value ?? "").normalize("NFKD"))
    .filter((character) => character.codePointAt(0)! <= 0x7f)
    .join("");
  const normalized = asciiValue
    .replace(/[^A-Za-z0-9_-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, MAX_TAG_LENGTH);

  return normalized || fallback;
}
