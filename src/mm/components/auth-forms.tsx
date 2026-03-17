"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button, Card, Input } from "@/mm/components/primitives";
import { forgotPasswordSchema, loginSchema, registerSchema } from "@/mm/lib/validation";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotValues = z.infer<typeof forgotPasswordSchema>;

function ErrorMessage({ message }: { message?: string }) {
  return message ? <p className="mt-2 text-xs font-medium text-destructive">{message}</p> : null;
}

export function LoginForm({ redirectPath }: { redirectPath?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setServerError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setServerError(payload.error || "Unable to sign in.");
      setIsLoading(false);
      return;
    }

    startTransition(() => {
      router.push(redirectPath || "/pro/dashboard");
      router.refresh();
    });
  });

  return (
    <Card className="max-w-xl">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input id="login-email" type="email" autoComplete="email" {...form.register("email")} />
          <ErrorMessage message={form.formState.errors.email?.message} />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <Input id="login-password" type="password" autoComplete="current-password" {...form.register("password")} />
          <ErrorMessage message={form.formState.errors.password?.message} />
        </div>
        <ErrorMessage message={serverError} />
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </Card>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setServerError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setServerError(payload.error || "Unable to create account.");
      setIsLoading(false);
      return;
    }

    startTransition(() => {
      router.push("/pro/onboard");
      router.refresh();
    });
  });

  return (
    <Card className="max-w-xl">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="register-fullName" className="text-sm font-semibold text-foreground">
            Full name
          </label>
          <Input id="register-fullName" autoComplete="name" {...form.register("fullName")} />
          <ErrorMessage message={form.formState.errors.fullName?.message} />
        </div>
        <div>
          <label htmlFor="register-email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input id="register-email" type="email" autoComplete="email" {...form.register("email")} />
          <ErrorMessage message={form.formState.errors.email?.message} />
        </div>
        <div>
          <label htmlFor="register-password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <Input id="register-password" type="password" autoComplete="new-password" {...form.register("password")} />
          <ErrorMessage message={form.formState.errors.password?.message} />
        </div>
        <ErrorMessage message={serverError} />
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? "Creating account..." : "Create therapist account"}
        </Button>
      </form>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setServerError("");
    setMessage("");

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { error?: string; message?: string };

    if (!response.ok) {
      setServerError(payload.error || "Unable to process the request.");
      setIsLoading(false);
      return;
    }

    setMessage(payload.message || "If the address exists, reset instructions have been sent.");
    setIsLoading(false);
  });

  return (
    <Card className="max-w-xl">
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label htmlFor="forgot-email" className="text-sm font-semibold text-foreground">
            Email
          </label>
          <Input id="forgot-email" type="email" autoComplete="email" {...form.register("email")} />
          <ErrorMessage message={form.formState.errors.email?.message} />
        </div>
        <ErrorMessage message={serverError} />
        {message ? <p className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground">{message}</p> : null}
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading ? "Sending..." : "Send reset instructions"}
        </Button>
      </form>
    </Card>
  );
}
