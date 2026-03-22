import { sanitizeText } from "@/app/_lib/security";

const BLOCK_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "sex", pattern: /\bsex(?:ual)?\b/i },
  { label: "escort", pattern: /\bescort\b/i },
  { label: "explicit", pattern: /\bexplicit\b/i },
  { label: "happy ending", pattern: /\bhappy\s+ending\b/i },
  { label: "full service", pattern: /\bfull\s+service\b/i },
  { label: "fbsm", pattern: /\bfbsm\b/i },
  { label: "gfe", pattern: /\bgfe\b/i },
  { label: "extras", pattern: /\bextras\b/i },
  { label: "outcall with extras", pattern: /\boutcall\b.*\bextras\b/i },
  { label: "incall with extras", pattern: /\bincall\b.*\bextras\b/i },
  { label: "sensual", pattern: /\bsensual\b/i },
  { label: "erotic", pattern: /\berotic\b/i },
  { label: "nuru", pattern: /\bnuru\b/i },
  { label: "handjob", pattern: /\bhand[\s-]?job\b/i },
  { label: "blowjob", pattern: /\bblow[\s-]?job\b/i },
  { label: "oral", pattern: /\boral\b/i },
];

export const KNOTTY_SAFE_REDIRECT =
  "I can help you find verified therapists, availability, and pricing, but I can’t assist with that request.";

export function runKnottyGuardrails(message: string) {
  const normalized = sanitizeText(message);
  const matches = BLOCK_PATTERNS
    .filter((entry) => entry.pattern.test(normalized))
    .map((entry) => entry.label);

  return {
    blocked: matches.length > 0,
    matches,
    safeReply: KNOTTY_SAFE_REDIRECT,
  };
}
