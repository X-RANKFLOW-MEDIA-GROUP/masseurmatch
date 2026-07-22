import { describe, it, expect } from "vitest";

import {
  buildMessages,
  type EmailUrlConfig,
} from "../../supabase/functions/auth-email-hook/messages.ts";

const CONFIG: EmailUrlConfig = {
  supabaseUrl: "https://abcxyz.supabase.co",
  siteUrl: "https://masseurmatch.com",
};

const REDIRECT = "https://www.masseurmatch.com/api/auth/callback?next=/pro/onboard";

// Pull hrefs out of generated HTML, then the /auth/v1/verify link specifically.
function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
}
function verifyLink(html: string): string | undefined {
  return hrefs(html).find((h) => h.includes("/auth/v1/verify"));
}

// GoTrue reads redirect_to with Go's url.Query().Get() — one decode.
// URL().searchParams.get() does the identical thing.
function redirectSeenByGoTrue(link: string): string | null {
  return new URL(link).searchParams.get("redirect_to");
}

function emailData(over: Record<string, string>): Record<string, string> {
  return {
    email_action_type: over.type,
    token_hash: "hash_current",
    token: "123456",
    redirect_to: REDIRECT,
    ...over,
  };
}

describe("auth-email-hook buildMessages", () => {
  for (const type of ["signup", "recovery", "magiclink", "invite"] as const) {
    describe(type, () => {
      const msgs = buildMessages(type, emailData({ type }), { email: "user@example.com" }, CONFIG);

      it("produces exactly one message to the user's address", () => {
        expect(msgs).toHaveLength(1);
        expect(msgs[0].to).toBe("user@example.com");
      });

      it("contains a verify link carrying the correct type", () => {
        const link = verifyLink(msgs[0].html);
        expect(link).toBeTruthy();
        expect(link).toContain(`type=${type}`);
      });

      it("percent-encodes redirect_to exactly once (round-trips, no %252F)", () => {
        const link = verifyLink(msgs[0].html)!;
        expect(redirectSeenByGoTrue(link)).toBe(REDIRECT);
        expect(link).toContain("%2F");
        expect(link).not.toContain("%252F");
      });
    });
  }

  it("keeps a redirect_to with a second &-param intact (the encode's whole point)", () => {
    const multi = "https://www.masseurmatch.com/api/auth/callback?next=/pro/onboard&plan=pro";
    const msgs = buildMessages(
      "signup",
      emailData({ type: "signup", redirect_to: multi }),
      { email: "user@example.com" },
      CONFIG,
    );
    const link = verifyLink(msgs[0].html)!;
    // redirect_to survives whole; nothing leaks as a stray top-level param.
    expect(redirectSeenByGoTrue(link)).toBe(multi);
    const stray = [...new URL(link).searchParams.keys()].filter(
      (k) => !["token", "type", "redirect_to"].includes(k),
    );
    expect(stray).toEqual([]);
  });

  it("falls back to siteUrl when redirect_to is absent", () => {
    const msgs = buildMessages(
      "signup",
      { email_action_type: "signup", token_hash: "h" },
      { email: "user@example.com" },
      CONFIG,
    );
    expect(redirectSeenByGoTrue(verifyLink(msgs[0].html)!)).toBe(CONFIG.siteUrl);
  });

  it("reauthentication shows the OTP code and has no verify link", () => {
    const msgs = buildMessages(
      "reauthentication",
      emailData({ type: "reauthentication", token: "918273" }),
      { email: "user@example.com" },
      CONFIG,
    );
    expect(msgs).toHaveLength(1);
    expect(msgs[0].html).toContain("918273");
    expect(verifyLink(msgs[0].html)).toBeUndefined();
  });

  describe("email_change (Secure Email Change)", () => {
    const msgs = buildMessages(
      "email_change",
      emailData({ type: "email_change", token_hash: "hash_old", token_hash_new: "hash_new" }),
      { email: "old@example.com", new_email: "new@example.com" },
      CONFIG,
    );

    it("sends two distinct messages — new inbox and current inbox", () => {
      expect(msgs).toHaveLength(2);
      expect(msgs.map((m) => m.to).sort()).toEqual(["new@example.com", "old@example.com"]);
    });

    it("uses token_hash_new for the new inbox and token_hash for the current inbox", () => {
      const newMsg = msgs.find((m) => m.to === "new@example.com")!;
      const oldMsg = msgs.find((m) => m.to === "old@example.com")!;
      expect(verifyLink(newMsg.html)).toContain("token=hash_new");
      expect(verifyLink(oldMsg.html)).toContain("token=hash_old");
    });

    it("round-trips redirect_to for both messages", () => {
      for (const m of msgs) {
        expect(redirectSeenByGoTrue(verifyLink(m.html)!)).toBe(REDIRECT);
      }
    });
  });

  it("returns no messages for an unknown action type", () => {
    expect(
      buildMessages("bogus", emailData({ type: "bogus" }), { email: "u@e.com" }, CONFIG),
    ).toEqual([]);
  });
});
