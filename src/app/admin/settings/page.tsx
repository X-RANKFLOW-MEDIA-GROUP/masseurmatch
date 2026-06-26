"use client";

import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Key, Bell, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Platform configuration and admin preferences."
      />

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-base">General Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-xl">
                <div className="grid gap-2">
                  <label htmlFor="site-name" className="text-sm font-medium text-foreground">Site Name</label>
                  <Input id="site-name" defaultValue="MasseurMatch" className="bg-secondary/30 border-border" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="site-url" className="text-sm font-medium text-foreground">Site URL</label>
                  <Input id="site-url" defaultValue="https://masseurmatch.com" className="bg-secondary/30 border-border" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="admin-email" className="text-sm font-medium text-foreground">Admin Email</label>
                  <Input id="admin-email" type="email" defaultValue="admin@masseurmatch.com" className="bg-secondary/30 border-border" />
                </div>
                <div>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-base">API Keys</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 max-w-xl">
                <div className="grid gap-2">
                  <label htmlFor="supabase-url" className="text-sm font-medium text-foreground">Supabase URL</label>
                  <Input id="supabase-url" defaultValue="••••••••" readOnly className="bg-secondary/30 border-border font-mono text-xs" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="supabase-key" className="text-sm font-medium text-foreground">Supabase Anon Key</label>
                  <Input id="supabase-key" defaultValue="••••••••" readOnly className="bg-secondary/30 border-border font-mono text-xs" />
                </div>
                <p className="text-xs text-muted-foreground">
                  API keys are configured via environment variables and cannot be changed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-base">Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-xl">
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/20 transition-colors">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">New Therapist Registrations</p>
                    <p className="text-xs text-muted-foreground">Get notified when a new therapist signs up</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/20 transition-colors">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">New Reviews</p>
                    <p className="text-xs text-muted-foreground">Get notified about new review submissions</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-secondary/20 transition-colors">
                  <input type="checkbox" className="h-4 w-4 rounded border-border text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Support Tickets</p>
                    <p className="text-xs text-muted-foreground">Get notified about new support requests</p>
                  </div>
                </label>
                <div>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
