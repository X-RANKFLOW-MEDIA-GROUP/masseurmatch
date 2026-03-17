"use client";

import { useState } from "react";
import { sendContactMessage } from "@/app/_lib/mutations";
import { AppButton, AppInput, AppTextarea, Surface } from "@/app/_components/primitives";
import { useToast } from "@/hooks/use-toast";

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await sendContactMessage(form);
      toast({
        title: "Message sent",
        description: response.mock ? "Saved in mock delivery mode." : `Sent to ${response.to}.`,
      });
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Could not send message",
        description: error instanceof Error ? error.message : "Unknown error.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Surface className="mt-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <AppInput
          placeholder="Your name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
        <AppInput
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
        />
        <AppInput
          placeholder="Subject"
          value={form.subject}
          onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          required
        />
        <AppTextarea
          placeholder="How can we help?"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="min-h-40"
          required
        />
        <AppButton type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send message"}
        </AppButton>
      </form>
    </Surface>
  );
}
