import { describe, it, expect } from "vitest";

import {
  buildMessages,
  type EmailUrlConfig,
} from "../../supabase/functions/auth-email-hook/messages.ts";

const CONFIG: EmailUrlConfig = {
  supabaseUrl: "https://abcxyz.supabase.co",
  siteUrl: "https://masseurmatch.com",
};

// The redirect_to the app sets for account-confirmation flows: our own server
// callback route, which verifies token_hash itself.
const CALLBACK = "https://www.masseurmatch.com/api/auth/callback?next=/pro/onboard";
// A non-callback redirect (e.g. recovery → client /reset-password page), which
// still goes through GoTrue's /auth/v1/verify.
const RESET = "https://www.masseurmatch.com/reset-password";

// Every shell email has exactly one <a> (the button); reauthentication has none.
function confirmLink(html: string): string | undefined {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])[0];
}
// GoTrue reads redirect_to with Go's url.Query().Get() — one decode. URL()
// searchParams.get() does the identical thing.
function redirectSeenByGoTrue(link: string): string | null {
  return new URL(link).searchParams.get("redirect_to");
}

function emailData(over: Record<string, string>): Record<string, string> {
  return {
    email_action_type: over.type,
    token_hash: "hash_current",
    token: "123456",
    redirect_to: CALLBACK,
    ...over,
  };
}

describe("auth-email-hook buildMessages", () => {
  describe("confirmation flows that target our own callback route", () => {
    for (const type of ["signup", "invite", "magiclink"] as const) {
      describe(type, () => {
        const msgs = buildMessages(type, emailData({ type }), { email: "user@example.com" }, CONFIG);

        it("produces one message to the user's address", () => {
          expect(msgs).toHaveLength(1);
          expect(msgs[0].to).toBe("user@example.com");
        });

        it("links straight to the callback with token_hash + type + next (no GoTrue verify hop)", () => {
          const link = confirmLink(msgs[0].html)!;
          const u = new URL(link);
          expect(u.pathname).toBe("/api/auth/callback");
          expect(u.searchParams.get("token_hash")).toBe("hash_current");
          expect(u.searchParams.get("type")).toBe(type);
          expect(u.searchParams.get("next")).toBe("/pro/onboard");
          expect(link).not.toContain("/auth/v1/verify");
        });
      });
    }
  });

  describe("flows that keep the GoTrue verify hop (non-callback redirect)", () => {
    it("recovery → /reset-password uses /auth/v1/verify with a single-encoded redirect_to", () => {
      const msgs = buildMessages(
        "recovery",
        emailData({ type: "recovery", redirect_to: RESET }),
        { email: "user@example.com" },
        CONFIG,
      );
      const link = confirmLink(msgs[0].html)!;
      expect(link).toContain("/auth/v1/verify");
      expect(link).toContain("type=recovery");
      // percent-encoded exactly once — round-trips, and never %252F.
      expect(redirectSeenByGoTrue(link)).toBe(RESET);
      expect(link).not.toContain("%252F");
    });

    it("keeps a redirect_to carrying a second &-param intact (the encode's whole point)", () => {
      const multi = "https://www.masseurmatch.com/reset-password?flow=a&stage=b";
      const msgs = buildMessages(
        "recovery",
        emailData({ type: "recovery", redirect_to: multi }),
        { email: "user@example.com" },
        CONFIG,
      );
      const link = confirmLink(msgs[0].html)!;
      expect(redirectSeenByGoTrue(link)).toBe(multi);
      const stray = [...new URL(link).searchParams.keys()].filter(
        (k) => !["token", "type", "redirect_to"].includes(k),
      );
      expect(stray).toEqual([]);
    });

    it("falls back to siteUrl (a non-callback target) when redirect_to is absent", () => {
      const msgs = buildMessages(
        "signup",
        { email_action_type: "signup", token_hash: "h" },
        { email: "user@example.com" },
        CONFIG,
      );
      const link = confirmLink(msgs[0].html)!;
      expect(link).toContain("/auth/v1/verify");
      expect(redirectSeenByGoTrue(link)).toBe(CONFIG.siteUrl);
    });
  });

  it("reauthentication shows the OTP code and has no link", () => {
    const msgs = buildMessages(
      "reauthentication",
      emailData({ type: "reauthentication", token: "918273" }),
      { email: "user@example.com" },
      CONFIG,
    );
    expect(msgs).toHaveLength(1);
    expect(msgs[0].html).toContain("918273");
    expect(confirmLink(msgs[0].html)).toBeUndefined();
  });

  describe("email_change (Secure Email Change) → callback route", () => {
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

    it("carries token_hash_new for the new inbox and token_hash for the current inbox", () => {
      const newMsg = msgs.find((m) => m.to === "new@example.com")!;
      const oldMsg = msgs.find((m) => m.to === "old@example.com")!;
      expect(new URL(confirmLink(newMsg.html)!).searchParams.get("token_hash")).toBe("hash_new");
      expect(new URL(confirmLink(oldMsg.html)!).searchParams.get("token_hash")).toBe("hash_old");
    });
  });

  it("returns no messages for an unknown action type", () => {
    expect(
      buildMessages("bogus", emailData({ type: "bogus" }), { email: "u@e.com" }, CONFIG),
    ).toEqual([]);
  });
});
