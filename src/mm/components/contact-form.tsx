"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, Card, Input, Textarea } from "@/mm/components/primitives";
import { contactSchema } from "@/mm/lib/validation";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: "",
      message: "",
      name: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setError("");
    setStatus("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setError(payload.error || "Unable to send your message.");
      setIsLoading(false);
      return;
    }

    setStatus(payload.message || "Message sent.");
    form.reset();
    setIsLoading(false);
  });

  return (
    <Card className="max-w-2xl">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
              Name
            </label>
            <Input id="contact-name" {...form.register("name")} />
            {form.formState.errors.name?.message ? (
              <p className="mt-2 text-xs font-medium text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
              Email
            </label>
            <Input id="contact-email" type="email" {...form.register("email")} />
            {form.formState.errors.email?.message ? (
              <p className="mt-2 text-xs font-medium text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
        </div>
        <div>
          <label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
            Message
          </label>
          <Textarea id="contact-message" {...form.register("message")} />
          {form.formState.errors.message?.message ? (
            <p className="mt-2 text-xs font-medium text-destructive">{form.formState.errors.message.message}</p>
          ) : null}
        </div>
        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
        {status ? <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">{status}</p> : null}
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Sending..." : "Send message"}
        </Button>
      </form>
    </Card>
  );
}
