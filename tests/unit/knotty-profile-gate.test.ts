import { describe, expect, it } from "vitest";

import { wantsTherapistProfiles } from "@/lib/knotty/service";
import { detectKnottyIntent } from "@/lib/knotty/intent";
import type { KnottyQuickAction } from "@/lib/knotty/types";

function gate(message: string, quickAction: KnottyQuickAction | null = null) {
  const match = detectKnottyIntent({ message, quickAction });
  return wantsTherapistProfiles({
    intent: match.intent,
    normalizedMessage: match.normalizedMessage,
    quickAction,
  });
}

describe("wantsTherapistProfiles", () => {
  it("does not show profiles for greetings or platform questions", () => {
    expect(gate("hi")).toBe(false);
    expect(gate("hello, what is this site?")).toBe(false);
    expect(gate("how does pricing work?")).toBe(false);
    expect(gate("how do I create an account?")).toBe(false);
    expect(gate("can I trust this site?")).toBe(false);
    expect(gate("is my payment information safe?")).toBe(false);
  });

  it("does not show profiles for informational massage questions", () => {
    expect(gate("what is deep tissue massage?")).toBe(false);
    expect(gate("what's the difference between swedish and thai?")).toBe(false);
  });

  it("shows profiles when the person asks for a therapist", () => {
    expect(gate("find me a massage therapist")).toBe(true);
    expect(gate("I'm looking for a masseur in Dallas")).toBe(true);
    expect(gate("can you recommend a deep tissue massage therapist?")).toBe(true);
    expect(gate("show me therapists near me")).toBe(true);
    expect(gate("anyone available now?")).toBe(true);
    expect(gate("I need someone who does sports massage")).toBe(true);
  });

  it("treats quick actions as explicit asks", () => {
    expect(gate("", "available_now")).toBe(true);
    expect(gate("", "mobile")).toBe(true);
    expect(gate("", "verified")).toBe(true);
    expect(gate("", "help_choose")).toBe(true);
  });

  it("treats help_choose phrasing as an explicit ask", () => {
    expect(gate("help me choose")).toBe(true);
    expect(gate("recommend one for me")).toBe(true);
  });
});
