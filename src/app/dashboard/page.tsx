"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function TherapistDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const id = userData.user?.id ?? null;
      setUserId(id);
      if (!id) {
        setLoading(false);
        return;
      }

      const { data: therapist } = await (supabase as any)
        .from("therapist_profiles")
        .select("*")
        .eq("profile_id", id)
        .maybeSingle();

      setProfile(therapist);

      if (therapist?.id) {
        const [{ data: serviceRows }, { data: priceRows }, { data: photoRows }] = await Promise.all([
          (supabase as any).from("therapist_services").select("*").eq("therapist_profile_id", therapist.id).order("sort_order"),
          (supabase as any).from("therapist_pricing").select("*").eq("therapist_profile_id", therapist.id).order("duration_minutes"),
          (supabase as any).from("therapist_photos").select("*").eq("therapist_profile_id", therapist.id).order("sort_order"),
        ]);
        setServices(serviceRows || []);
        setPricing(priceRows || []);
        setPhotos(photoRows || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  const completion = useMemo(() => profile?.profile_completion_score ?? 0, [profile]);

  async function saveProfile(formData: FormData) {
    if (!profile?.id) return;
    setMessage("Saving profile...");
    const payload = {
      display_name: String(formData.get("display_name") || ""),
      headline: String(formData.get("headline") || ""),
      bio: String(formData.get("bio") || ""),
      city: String(formData.get("city") || ""),
      state: String(formData.get("state") || ""),
      phone: String(formData.get("phone") || ""),
      contact_email: String(formData.get("contact_email") || ""),
      website_url: String(formData.get("website_url") || ""),
      offers_incall: formData.get("offers_incall") === "on",
      offers_outcall: formData.get("offers_outcall") === "on",
      moderation_status: "pending",
      is_published: false,
    };

    const { data, error } = await (supabase as any).from("therapist_profiles").update(payload).eq("id", profile.id).select("*").single();
    if (error) setMessage(error.message);
    else {
      setProfile(data);
      setMessage("Profile saved and sent for moderation.");
    }
  }

  async function addService(formData: FormData) {
    if (!profile?.id) return;
    const service_name = String(formData.get("service_name") || "").trim();
    if (!service_name) return;
    await (supabase as any).from("therapist_services").insert({ therapist_profile_id: profile.id, service_name, is_visible: true });
    const { data } = await (supabase as any).from("therapist_services").select("*").eq("therapist_profile_id", profile.id).order("sort_order");
    setServices(data || []);
  }

  async function addPrice(formData: FormData) {
    if (!profile?.id) return;
    const duration = Number(formData.get("duration_minutes") || 60);
    const price = Math.round(Number(formData.get("price") || 0) * 100);
    const sessionType = String(formData.get("session_type") || "either");
    await (supabase as any).from("therapist_pricing").insert({ therapist_profile_id: profile.id, duration_minutes: duration, price_cents: price, session_type: sessionType, is_visible: true });
    const { data } = await (supabase as any).from("therapist_pricing").select("*").eq("therapist_profile_id", profile.id).order("duration_minutes");
    setPricing(data || []);
  }

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile?.id || !userId) return;
    setMessage("Uploading photo...");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${userId}/${profile.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("therapist-photos").upload(path, file, { upsert: false });
    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }
    const { data: urlData } = supabase.storage.from("therapist-photos").getPublicUrl(path);
    await (supabase as any).from("therapist_photos").insert({ therapist_profile_id: profile.id, storage_path: path, public_url: urlData.publicUrl, approval_status: "pending", is_primary: photos.length === 0 });
    const { data } = await (supabase as any).from("therapist_photos").select("*").eq("therapist_profile_id", profile.id).order("sort_order");
    setPhotos(data || []);
    setMessage("Photo uploaded and sent for moderation.");
  }

  if (loading) return <main className="mx-auto max-w-6xl p-6">Loading dashboard...</main>;
  if (!userId) return <main className="mx-auto max-w-6xl p-6">Please sign in to manage your profile.</main>;
  if (!profile) return <main className="mx-auto max-w-6xl p-6">Your therapist profile is still being created. Refresh after signup completes.</main>;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Therapist Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">Manage your MasseurMatch profile</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Metric label="Completion" value={`${completion}%`} />
          <Metric label="Moderation" value={profile.moderation_status} />
          <Metric label="Visibility" value={profile.is_published ? "Public" : "Private"} />
          <Metric label="Verification" value={profile.verification_status} />
        </div>
        {message && <p className="mt-4 rounded-2xl bg-neutral-100 p-3 text-sm">{message}</p>}
      </section>

      <form action={saveProfile} className="grid gap-4 rounded-3xl border bg-white p-6 shadow-sm md:grid-cols-2">
        <h2 className="md:col-span-2 text-xl font-semibold">Profile details</h2>
        <Input name="display_name" label="Display name" defaultValue={profile.display_name} />
        <Input name="headline" label="Headline" defaultValue={profile.headline} />
        <Input name="city" label="City" defaultValue={profile.city} />
        <Input name="state" label="State" defaultValue={profile.state} />
        <Input name="phone" label="Phone" defaultValue={profile.phone} />
        <Input name="contact_email" label="Contact email" defaultValue={profile.contact_email} />
        <Input name="website_url" label="Website" defaultValue={profile.website_url} />
        <label className="flex items-center gap-2 rounded-2xl border p-3"><input name="offers_incall" type="checkbox" defaultChecked={profile.offers_incall} /> Incall</label>
        <label className="flex items-center gap-2 rounded-2xl border p-3"><input name="offers_outcall" type="checkbox" defaultChecked={profile.offers_outcall} /> Outcall</label>
        <label className="md:col-span-2 grid gap-2 text-sm font-medium">Bio<textarea name="bio" defaultValue={profile.bio || ""} rows={7} className="rounded-2xl border p-3 font-normal" /></label>
        <button className="md:col-span-2 rounded-2xl bg-black px-5 py-3 font-semibold text-white">Save and submit for review</button>
      </form>

      <section className="grid gap-6 md:grid-cols-2">
        <form action={addService} className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Services</h2>
          <div className="mt-4 flex gap-2"><input name="service_name" placeholder="Deep tissue massage" className="flex-1 rounded-2xl border p-3" /><button className="rounded-2xl bg-black px-4 text-white">Add</button></div>
          <ul className="mt-4 space-y-2">{services.map((service) => <li key={service.id} className="rounded-2xl bg-neutral-100 p-3">{service.service_name}</li>)}</ul>
        </form>

        <form action={addPrice} className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Pricing</h2>
          <div className="mt-4 grid gap-2 md:grid-cols-3"><input name="duration_minutes" type="number" placeholder="60" className="rounded-2xl border p-3" /><input name="price" type="number" placeholder="120" className="rounded-2xl border p-3" /><select name="session_type" className="rounded-2xl border p-3"><option value="either">Either</option><option value="incall">Incall</option><option value="outcall">Outcall</option></select></div>
          <button className="mt-3 rounded-2xl bg-black px-4 py-3 text-white">Add price</button>
          <ul className="mt-4 space-y-2">{pricing.map((item) => <li key={item.id} className="rounded-2xl bg-neutral-100 p-3">{item.duration_minutes} min · {item.session_type} · ${(item.price_cents / 100).toFixed(0)}</li>)}</ul>
        </form>
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Photos</h2>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="mt-4" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">{photos.map((photo) => <div key={photo.id} className="rounded-2xl border p-3"><img src={photo.public_url || ""} alt="Profile upload" className="aspect-square w-full rounded-xl object-cover" /><p className="mt-2 text-xs text-neutral-500">{photo.approval_status}</p></div>)}</div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-neutral-100 p-4"><p className="text-sm text-neutral-500">{label}</p><p className="mt-1 text-2xl font-semibold capitalize">{value}</p></div>;
}

function Input({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return <label className="grid gap-2 text-sm font-medium">{label}<input name={name} defaultValue={defaultValue || ""} className="rounded-2xl border p-3 font-normal" /></label>;
}
