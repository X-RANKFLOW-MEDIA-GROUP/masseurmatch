"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NewsletterSignupProps = {
  className?: string;
  theme?: "light" | "dark";
  title?: string;
  description?: string;
};

export function NewsletterSignup({
  className,
  theme = "light",
  title = "Get updates in your inbox",
  description = "Receive new city launches, profile tips, and safety updates.",
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isDark = theme === "dark";

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div
      className={cn(
        "rounded-[1.75rem] border p-5",
        isDark
          ? "border-white/14 bg-white/[0.055] shadow-[0_22px_52px_rgb(0_0_0_/_0.16)] backdrop-blur-xl"
          : "premium-surface border-border bg-bg-surface shadow-brand",
        className,
      )}
    >
      <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-foreground")}>{title}</p>
      <p className={cn("mt-1 text-xs", isDark ? "text-white/70" : "text-muted-foreground")}>{description}</p>
      <form className="mt-3 flex w-full max-w-lg flex-wrap gap-2" onSubmit={onSubmit}>
        <Input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={cn(isDark ? "border-white/16 bg-white/[0.08] text-white placeholder:text-white/45" : "")}
        />
        <Button type="submit" variant={isDark ? "hero" : "default"}>Sign up</Button>
      </form>
      {submitted ? <p className={cn("mt-2 text-xs", isDark ? "text-white/70" : "text-muted-foreground")}>Thanks, you're subscribed.</p> : null}
    </div>
  );
}
