"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { City, Subscription, Therapist } from "@/mm/types";
import { Button, Card, Input, Select, Textarea } from "@/mm/components/primitives";
import { billingSchema, onboardingSchema, profileUpdateSchema } from "@/mm/lib/validation";

type OnboardingValues = z.infer<typeof onboardingSchema>;
type ProfileValues = z.infer<typeof profileUpdateSchema>;
type BillingValues = z.infer<typeof billingSchema>;

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs font-medium text-destructive">{message}</p> : null;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read image."));
    reader.readAsDataURL(file);
  });
}

export function OnboardingForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      photoUrl: "",
      citySlug: cities[0]?.slug || "austin",
      state: cities[0]?.stateCode || "TX",
      latitude: cities[0]?.latitude || 30.2672,
      longitude: cities[0]?.longitude || -97.7431,
      modalities: ["deep-tissue"],
      priceRange: "$100-$150",
      incall: true,
      outcall: false,
      gayFriendly: true,
      inclusive: true,
      languages: ["English"],
    },
  });

  const selectedCity = useMemo(
    () => cities.find((city) => city.slug === form.watch("citySlug")) || cities[0],
    [cities, form],
  );

  const steps = [
    "Personal info",
    "Location",
    "Services",
    "Identity",
    "Review",
  ];

  async function submit(values: OnboardingValues) {
    setIsLoading(true);
    setServerError("");

    const response = await fetch("/api/pro/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, mode: "onboard" }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setServerError(payload.error || "Unable to save onboarding.");
      setIsLoading(false);
      return;
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  return (
    <Card className="max-w-4xl">
      <div className="mb-8 flex flex-wrap gap-3">
        {steps.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index === step ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((values) => {
          void submit(values);
        })}
      >
        {step === 0 ? (
          <>
            <div>
              <label className="text-sm font-semibold text-foreground">Display name</label>
              <Input {...form.register("displayName")} />
              <ErrorText message={form.formState.errors.displayName?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Bio</label>
              <Textarea {...form.register("bio")} />
              <ErrorText message={form.formState.errors.bio?.message} />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Profile photo</label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }

                  const dataUrl = await fileToDataUrl(file);
                  form.setValue("photoUrl", dataUrl, { shouldValidate: true });
                }}
              />
              <ErrorText message={form.formState.errors.photoUrl?.message} />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <label className="text-sm font-semibold text-foreground">City</label>
              <Select
                value={form.watch("citySlug")}
                onChange={(event) => {
                  const city = cities.find((item) => item.slug === event.target.value);
                  if (!city) return;
                  form.setValue("citySlug", city.slug);
                  form.setValue("state", city.stateCode);
                  form.setValue("latitude", city.latitude);
                  form.setValue("longitude", city.longitude);
                }}
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-foreground">Latitude</label>
                <Input type="number" step="0.0001" {...form.register("latitude", { valueAsNumber: true })} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Longitude</label>
                <Input type="number" step="0.0001" {...form.register("longitude", { valueAsNumber: true })} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Current location preset: {selectedCity?.name}, {selectedCity?.stateCode}
            </p>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div>
              <label className="text-sm font-semibold text-foreground">Modalities</label>
              <Input
                defaultValue={form.watch("modalities").join(", ")}
                onChange={(event) =>
                  form.setValue(
                    "modalities",
                    event.target.value
                      .split(",")
                      .map((item) => item.trim().toLowerCase().replace(/\s+/g, "-"))
                      .filter(Boolean),
                    { shouldValidate: true },
                  )
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Price range</label>
              <Input {...form.register("priceRange")} />
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.watch("incall")} onChange={(event) => form.setValue("incall", event.target.checked)} />
                Incall
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.watch("outcall")} onChange={(event) => form.setValue("outcall", event.target.checked)} />
                Outcall
              </label>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.watch("gayFriendly")}
                  onChange={(event) => form.setValue("gayFriendly", event.target.checked)}
                />
                Gay-friendly
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.watch("inclusive")}
                  onChange={(event) => form.setValue("inclusive", event.target.checked)}
                />
                Inclusive
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Languages</label>
              <Input
                defaultValue={form.watch("languages").join(", ")}
                onChange={(event) =>
                  form.setValue(
                    "languages",
                    event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                    { shouldValidate: true },
                  )
                }
              />
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <div className="rounded-[28px] border border-border bg-secondary/50 p-5 text-sm leading-7 text-muted-foreground">
            <p><strong className="text-foreground">Display name:</strong> {form.watch("displayName")}</p>
            <p><strong className="text-foreground">City:</strong> {selectedCity?.name}</p>
            <p><strong className="text-foreground">Modalities:</strong> {form.watch("modalities").join(", ")}</p>
            <p><strong className="text-foreground">Languages:</strong> {form.watch("languages").join(", ")}</p>
            <p><strong className="text-foreground">Price range:</strong> {form.watch("priceRange")}</p>
          </div>
        ) : null}

        {serverError ? <p className="text-sm font-medium text-destructive">{serverError}</p> : null}

        <div className="flex items-center justify-between">
          <Button type="button" variant="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button type="button" onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Submit profile"}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

export function ProfileEditor({ cities, therapist }: { cities: City[]; therapist: Therapist }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: therapist.displayName,
      bio: therapist.bio,
      photoUrl: therapist.photoUrl,
      citySlug: therapist.citySlug,
      state: therapist.state,
      latitude: therapist.latitude,
      longitude: therapist.longitude,
      modalities: therapist.modalities,
      priceRange: therapist.priceRange,
      incall: therapist.incall,
      outcall: therapist.outcall,
      gayFriendly: therapist.gayFriendly,
      inclusive: therapist.inclusive,
      languages: therapist.languages,
      contactEmail: therapist.contactEmail,
      phone: therapist.phone,
      website: therapist.website,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setServerError("");
    setStatus("");

    const response = await fetch("/api/pro/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setServerError(payload.error || "Unable to update profile.");
      setIsLoading(false);
      return;
    }

    setStatus("Profile updated.");
    setIsLoading(false);
    router.refresh();
  });

  return (
    <Card>
      <h2 className="font-display text-3xl">Edit profile</h2>
      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-foreground">Display name</label>
            <Input {...form.register("displayName")} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Contact email</label>
            <Input type="email" {...form.register("contactEmail")} />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-foreground">Bio</label>
          <Textarea {...form.register("bio")} />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-foreground">Phone</label>
            <Input {...form.register("phone")} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Website</label>
            <Input {...form.register("website")} />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">City</label>
            <Select
              value={form.watch("citySlug")}
              onChange={(event) => {
                const city = cities.find((item) => item.slug === event.target.value);
                if (!city) return;
                form.setValue("citySlug", city.slug);
                form.setValue("state", city.stateCode);
                form.setValue("latitude", city.latitude);
                form.setValue("longitude", city.longitude);
              }}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-foreground">Modalities</label>
            <Input
              defaultValue={therapist.modalities.join(", ")}
              onChange={(event) =>
                form.setValue(
                  "modalities",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim().toLowerCase().replace(/\s+/g, "-"))
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Languages</label>
            <Input
              defaultValue={therapist.languages.join(", ")}
              onChange={(event) =>
                form.setValue(
                  "languages",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
        </div>
        {serverError ? <p className="text-sm font-medium text-destructive">{serverError}</p> : null}
        {status ? <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">{status}</p> : null}
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}

export function BillingPanel({ subscription }: { subscription: Subscription }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function changeTier(values: BillingValues): Promise<void> {
    setIsLoading(true);
    setStatus("");
    const response = await fetch("/api/pro/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { message?: string; error?: string };

    setStatus(payload.message || payload.error || "");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <h2 className="font-display text-3xl">Billing</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Current tier: <strong className="text-foreground">{subscription.tier}</strong> • Status:{" "}
        <strong className="text-foreground">{subscription.status}</strong>
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button disabled={isLoading} onClick={() => void changeTier({ tier: "free" })} type="button" variant="secondary">
          Free
        </Button>
        <Button disabled={isLoading} onClick={() => void changeTier({ tier: "pro" })} type="button" variant="secondary">
          Upgrade to Pro
        </Button>
        <Button disabled={isLoading} onClick={() => void changeTier({ tier: "featured" })} type="button">
          Upgrade to Featured
        </Button>
      </div>
      <Link
        href="/pro/billing?portal=1"
        className="mt-6 inline-flex text-sm font-semibold text-foreground underline underline-offset-4"
      >
        Open billing portal
      </Link>
      {status ? <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">{status}</p> : null}
    </Card>
  );
}
