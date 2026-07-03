"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { sendContactMessage } from "@/app/_lib/mutations";
import { ApiError } from "@/app/_lib/request";
import type { ContactAudience } from "@/app/_lib/validation";
import { AppInput, AppTextarea } from "@/app/_components/primitives";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ContactFormState = {
  name: string;
  email: string;
  audience: ContactAudience | "";
  subject: string;
  message: string;
};

const INITIAL_FORM: ContactFormState = {
  name: "",
  email: "",
  audience: "",
  subject: "",
  message: "",
};

const AUDIENCE_OPTIONS: Array<{ value: ContactAudience; label: string }> = [
  { value: "client", label: "Client" },
  { value: "massage-professional", label: "Massage Professional" },
  { value: "other", label: "Other" },
];

const SUBJECT_PLACEHOLDERS: Record<ContactAudience | "", string> = {
  "": "What do you need help with?",
  client: "Example: I need help managing my account",
  "massage-professional": "Example: I have a question about premium placements",
  other: "Example: Partnership or press inquiry",
};

const FIELD_CLASSNAME =
  "!h-14 !rounded-[1.35rem] !border-white/10 !bg-slate-950/80 !px-4 !text-base !text-white !shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] !ring-offset-0 placeholder:!text-slate-500 focus-visible:!border-emerald-400/70 focus-visible:!ring-2 focus-visible:!ring-emerald-500/20";

const TEXTAREA_CLASSNAME =
  "!min-h-44 !rounded-3xl !border-white/10 !bg-slate-950/80 !px-4 !py-3 !text-base !text-white !shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] !ring-offset-0 placeholder:!text-slate-500 focus-visible:!border-emerald-400/70 focus-visible:!ring-2 focus-visible:!ring-emerald-500/20";

const SELECT_TRIGGER_CLASSNAME =
  "!h-14 !rounded-[1.35rem] !border-white/10 !bg-slate-950/80 !px-4 !text-base !text-white !shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] !ring-offset-0 data-[placeholder]:!text-slate-500 [&>svg]:text-slate-500 focus:!border-emerald-400/70 focus:!ring-2 focus:!ring-emerald-500/20";

const SELECT_CONTENT_CLASSNAME =
  "!rounded-[1.25rem] !border-white/10 !bg-slate-950/95 !text-white !shadow-[0_24px_48px_rgba(0,15,30,0.45)] backdrop-blur-xl";

const SELECT_ITEM_CLASSNAME =
  "rounded-xl px-3 py-3 text-sm text-slate-200 focus:!bg-white/10 focus:!text-white";

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);

  const updateField = <Key extends keyof ContactFormState>(
    key: Key,
    value: ContactFormState[Key],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.audience) {
      toast({
        title: "Choose an audience",
        description: "Select whether you are a client, massage professional, or other.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await sendContactMessage({
        name: form.name,
        email: form.email,
        audience: form.audience,
        subject: form.subject,
        message: form.message,
      });
      toast({
        title: "Message sent",
        description: response.mock ? "Saved in mock delivery mode." : `Sent to ${response.to}.`,
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
          <Label htmlFor="contact-name" className="text-sm font-medium text-slate-200">
            Name
          </Label>
          <AppInput
            id="contact-name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={FIELD_CLASSNAME}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-email" className="text-sm font-medium text-slate-200">
            Email Address
          </Label>
          <AppInput
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={FIELD_CLASSNAME}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="contact-audience" className="text-sm font-medium text-slate-200">
            I am a
          </Label>
          <Select
            value={form.audience}
            onValueChange={(value) => updateField("audience", value as ContactAudience)}
          >
            <SelectTrigger id="contact-audience" className={SELECT_TRIGGER_CLASSNAME}>
              <SelectValue placeholder="Choose one" />
            </SelectTrigger>
            <SelectContent className={SELECT_CONTENT_CLASSNAME}>
              {AUDIENCE_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={SELECT_ITEM_CLASSNAME}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-subject" className="text-sm font-medium text-slate-200">
            Subject
          </Label>
          <AppInput
            id="contact-subject"
            placeholder={SUBJECT_PLACEHOLDERS[form.audience]}
            value={form.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            className={FIELD_CLASSNAME}
            required
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-sm font-medium text-slate-200">
          Message
        </Label>
        <AppTextarea
          id="contact-message"
          placeholder="Share the details that will help us get this to the right team faster."
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          className={TEXTAREA_CLASSNAME}
          required
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-7 text-slate-400">We typically respond within 24 hours.</p>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 text-base font-medium text-slate-950 shadow-[0_18px_42px_rgba(16,185,129,0.32)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message"}
          {!loading ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
    </form>
  );
}
