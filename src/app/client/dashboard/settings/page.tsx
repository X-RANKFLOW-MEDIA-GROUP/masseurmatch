"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Trash2, Loader2, Check } from "lucide-react";
import { ClientDashboardLayout } from "../_components/ClientDashboardLayout";
import { toast } from "sonner";

export default function ClientSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ email: string; full_name: string } | null>(null);
  const [preferences, setPreferences] = useState({
    email_inquiry_updates: true,
    email_new_messages: true,
    email_promotions: false,
    email_newsletter: true,
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email ?? "",
          full_name: user.user_metadata?.full_name ?? "",
        });
      }
      setLoading(false);
    }
    fetchUser();
  }, [supabase]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase.auth.updateUser({
      data: { full_name: user?.full_name },
    });

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
    }
    setSaving(false);
  }

  async function handleSaveNotifications() {
    setSaving(true);
    // In production, save to database
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Notification preferences saved");
    setSaving(false);
  }

  if (loading) {
    return (
      <ClientDashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </ClientDashboardLayout>
    );
  }

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-slate-500">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={user?.full_name ?? ""}
                    onChange={(e) => setUser((prev) => prev ? { ...prev, full_name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">Contact support to change your email</p>
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Choose what emails you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Inquiry Updates</p>
                <p className="text-sm text-slate-500">Get notified when therapists respond</p>
              </div>
              <Switch
                checked={preferences.email_inquiry_updates}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, email_inquiry_updates: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">New Messages</p>
                <p className="text-sm text-slate-500">Receive email alerts for new messages</p>
              </div>
              <Switch
                checked={preferences.email_new_messages}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, email_new_messages: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Promotions</p>
                <p className="text-sm text-slate-500">Special offers and discounts</p>
              </div>
              <Switch
                checked={preferences.email_promotions}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, email_promotions: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Newsletter</p>
                <p className="text-sm text-slate-500">Tips, wellness content, and updates</p>
              </div>
              <Switch
                checked={preferences.email_newsletter}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, email_newsletter: checked }))
                }
              />
            </div>
            <Button onClick={handleSaveNotifications} disabled={saving} className="mt-4">
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-600" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Change Password</p>
                <p className="text-sm text-slate-500">Update your account password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Delete Account</p>
                <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
