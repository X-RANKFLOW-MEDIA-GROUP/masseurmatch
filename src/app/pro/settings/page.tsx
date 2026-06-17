"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Bell, Key, LogOut, Save, Shield, User } from "lucide-react";
import Link from "next/link";

type PasswordState = { current: string; next: string; confirm: string };
const EMPTY_PW: PasswordState = { current: "", next: "", confirm: "" };

export default function ProSettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [pwForm, setPwForm] = useState<PasswordState>(EMPTY_PW);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifPush, setNotifPush] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const loadPreferences = async () => {
      try {
        setNotifLoading(true);
        const res = await fetch(`/api/notifications/preferences?userId=${user.id}`);
        if (!res.ok) throw new Error("Failed to load preferences");
        const data = await res.json();
        const prefs = data.preferences;

        setNotifEmail(Boolean(prefs?.email_enabled));
        setNotifSms(Boolean(prefs?.sms_enabled));
        setNotifPush(Boolean(prefs?.push_enabled));
        setSmsPhone(prefs?.phone_e164 ?? "");
      } catch (error) {
        console.error("Failed to load notification preferences", error);
      } finally {
        setNotifLoading(false);
      }
    };

    void loadPreferences();
  }, [user?.id]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }

    if (pwForm.next !== pwForm.confirm) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);

    // Re-authenticate with the current password before updating
    const email = user?.email ?? "";
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: pwForm.current,
    });

    if (signInError) {
      setPwLoading(false);
      setPwError("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });
    setPwLoading(false);

    if (updateError) {
      setPwError(updateError.message);
      return;
    }

    toast({ title: "Password updated", description: "Your password has been changed." });
    setPwForm(EMPTY_PW);
  };

  const handleSaveNotifications = async () => {
    if (!user?.id) return;

    setNotifLoading(true);
    const res = await fetch("/api/notifications/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        emailEnabled: notifEmail,
        smsEnabled: notifSms,
        pushEnabled: notifPush,
        phoneE164: smsPhone || null,
      }),
    });
    setNotifLoading(false);

    if (!res.ok) {
      toast({ title: "Error", description: "Could not save preferences." });
      return;
    }

    toast({ title: "Preferences saved", description: "Notification settings updated." });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 pb-32 md:p-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account, security, and notification preferences.
        </p>
      </header>

      {/* Account info */}
      <section className="overflow-hidden border border-slate-200/60 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <User className="h-4 w-4 text-slate-500" />
          <h2 className="font-sans text-sm font-semibold text-slate-900">Account</h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Email
            </p>
            <p className="font-sans text-sm text-slate-900">{user?.email ?? "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Account ID
            </p>
            <p className="font-mono text-xs text-slate-400">{user?.id ?? "—"}</p>
          </div>
        </div>
      </section>

      {/* Change password */}
      <section className="overflow-hidden border border-slate-200/60 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <Key className="h-4 w-4 text-slate-500" />
          <h2 className="font-sans text-sm font-semibold text-slate-900">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 p-6">
          <div className="grid gap-2">
            <label htmlFor="current-pw" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Current Password
            </label>
            <PasswordInput
              id="current-pw"
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="new-pw" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              New Password
            </label>
            <PasswordInput
              id="new-pw"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="confirm-pw" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Confirm New Password
            </label>
            <PasswordInput
              id="confirm-pw"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              autoComplete="new-password"
            />
          </div>
          {pwError && <p className="text-sm text-red-600">{pwError}</p>}
          <Button
            type="submit"
            disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {pwLoading ? "Saving…" : "Save Password"}
          </Button>
        </form>
      </section>

      {/* Security */}
      <section className="overflow-hidden border border-slate-200/60 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <Shield className="h-4 w-4 text-slate-500" />
          <h2 className="font-sans text-sm font-semibold text-slate-900">Security</h2>
        </div>
        <div className="p-6">
          <p className="mb-4 text-sm text-slate-500">
            If you forgot your password, you can reset it via email.
          </p>
          <Button variant="outline" asChild>
            <Link href="/forgot-password">Reset via Email</Link>
          </Button>
        </div>
      </section>

      {/* Notifications */}
      <section className="overflow-hidden border border-slate-200/60 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <Bell className="h-4 w-4 text-slate-500" />
          <h2 className="font-sans text-sm font-semibold text-slate-900">Notifications</h2>
        </div>
        <div className="space-y-4 p-6">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Email Notifications</p>
              <p className="text-xs text-slate-500">New contacts, messages, and ranking updates</p>
            </div>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">SMS Notifications</p>
              <p className="text-xs text-slate-500">Urgent alerts for new contact requests</p>
            </div>
            <input
              type="checkbox"
              checked={notifSms}
              onChange={(e) => setNotifSms(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Push Notifications</p>
              <p className="text-xs text-slate-500">Browser alerts for real-time updates</p>
            </div>
            <input
              type="checkbox"
              checked={notifPush}
              onChange={(e) => setNotifPush(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
          <div className="grid gap-2">
            <label htmlFor="sms-phone" className="text-xs font-medium uppercase tracking-wider text-slate-500">
              SMS Phone (E.164)
            </label>
            <Input
              id="sms-phone"
              type="tel"
              value={smsPhone}
              onChange={(e) => setSmsPhone(e.target.value)}
              placeholder="+15551234567"
            />
          </div>
          <Button onClick={handleSaveNotifications} className="gap-2">
            <Save className="h-4 w-4" />
            {notifLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </section>

      {/* Sign out */}
      <section className="overflow-hidden border border-rose-200 bg-rose-50 shadow-sm">
        <div className="flex items-center gap-3 border-b border-rose-100 px-6 py-4">
          <LogOut className="h-4 w-4 text-rose-500" />
          <h2 className="font-sans text-sm font-semibold text-rose-900">Session</h2>
        </div>
        <div className="p-6">
          <p className="mb-4 text-sm text-rose-700">
            Sign out from all devices.
          </p>
          <Button
            variant="destructive"
            onClick={async () => { await signOut(); router.push("/"); }}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </section>
    </div>
  );
}
