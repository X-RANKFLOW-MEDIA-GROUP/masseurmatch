"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientProfilePage() {
  const [form, setForm] = useState({
    fullName: "",
    preferredBudgetMin: 60,
    preferredBudgetMax: 140,
    preferredLanguages: "English, Spanish",
    preferredSpecialties: "Deep Tissue, Relaxation",
  });

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Client profile</h1>
        <p className="text-sm text-muted-foreground">Manage preferences used in dashboard suggestions and search defaults.</p>
      </header>

      <form className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredBudgetMin">Preferred minimum budget</Label>
            <Input
              id="preferredBudgetMin"
              type="number"
              value={form.preferredBudgetMin}
              onChange={(event) => setForm((prev) => ({ ...prev, preferredBudgetMin: Number(event.target.value || 0) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredBudgetMax">Preferred maximum budget</Label>
            <Input
              id="preferredBudgetMax"
              type="number"
              value={form.preferredBudgetMax}
              onChange={(event) => setForm((prev) => ({ ...prev, preferredBudgetMax: Number(event.target.value || 0) }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLanguages">Preferred languages</Label>
          <Input
            id="preferredLanguages"
            value={form.preferredLanguages}
            onChange={(event) => setForm((prev) => ({ ...prev, preferredLanguages: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredSpecialties">Preferred specialties</Label>
          <Input
            id="preferredSpecialties"
            value={form.preferredSpecialties}
            onChange={(event) => setForm((prev) => ({ ...prev, preferredSpecialties: event.target.value }))}
          />
        </div>

        <Button type="button">Save profile</Button>
      </form>
    </main>
  );
}
