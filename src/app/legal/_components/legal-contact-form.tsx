"use client";

import { useState } from "react";

import { AppButton, AppInput, AppTextarea } from "@/app/_components/primitives";
import { sendContactMessage } from "@/app/_lib/mutations";
import { ApiError } from "@/app/_lib/request";
import { LEGAL_CONTACT_SUBJECTS } from "@/app/legal/_data/legal-center-data";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LegalContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: LegalContactFormState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function LegalContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LegalContactFormState>(INITIAL_FORM);

  const updateField = <Key extends keyof LegalContactFormState>(key: Key, value: LegalContactFormState[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.subject) {
      toast({
        title: "Choose a subject",
        description: "Select the legal topic that best matches your request.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await sendContactMessage({
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
      });

      toast({
        title: "Message sent",
        description: response.mock
          ? "Saved in mock delivery mode."
          : `Sent to ${response.to}.`,
      });

      setForm(INITIAL_FORM);
    } catch (error) {
      let description = error instanceof Error ? error.message : "Unknown error.";

      if (error instanceof ApiError && typeof error.payload === "object" && error.payload) {
        const payload = error.payload as {
          issues?: {
            fieldErrors?: Record<string, string[] | undefined>;
          };
        };
        const fieldErrors = payload.issues?.fieldErrors;
        const firstFieldMessage = fieldErrors
          ? Object.values(fieldErrors)
              .flat()
              .find((entry): entry is string => Boolean(entry))
          : null;

        if (firstFieldMessage) {
          description = firstFieldMessage;
        }
      }

      toast({
        title: "Could not send message",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="legal-contact-name">Name</Label>
          <AppInput
            id="legal-contact-name"
            placeholder="Your full name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-12 rounded-2xl border-border-subtle bg-white"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="legal-contact-email">Email</Label>
          <AppInput
            id="legal-contact-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="h-12 rounded-2xl border-border-subtle bg-white"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid gap-2">
          <Label htmlFor="legal-contact-phone">Phone</Label>
          <AppInput
            id="legal-contact-phone"
            type="tel"
            placeholder="+1 (555) 555-5555"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="h-12 rounded-2xl border-border-subtle bg-white"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="legal-contact-subject">Subject</Label>
          <Select
            value={form.subject}
            onValueChange={(value) => updateField("subject", value)}
          >
            <SelectTrigger
              id="legal-contact-subject"
              className="h-12 rounded-2xl border-border-subtle bg-white px-4"
            >
              <SelectValue placeholder="Choose the subject" />
            </SelectTrigger>
            <SelectContent>
              {LEGAL_CONTACT_SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="legal-contact-message">Message</Label>
        <AppTextarea
          id="legal-contact-message"
          placeholder="Describe your request, include URLs, account email, listing slug, or any detail that will help the legal team respond faster."
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className="min-h-44 rounded-3xl border-border-subtle bg-white"
          required
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 text-sm leading-7 text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl">
          Information submitted here is used to respond to your legal or compliance inquiry and to keep a record of
          the communication.
        </p>
        <AppButton
          type="submit"
          disabled={loading}
          className="min-h-12 rounded-full px-6"
        >
          {loading ? "Sending..." : "Send request"}
        </AppButton>
      </div>
    </form>
  );
}
