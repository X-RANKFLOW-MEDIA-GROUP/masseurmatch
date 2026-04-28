"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Bot,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

type OperationMode = "incall" | "outcall" | "both";

type Profile = {
  id: string;
  name: string;
  active: boolean;
  verified: boolean;
  mode: OperationMode;
  city: string;
  neighborhood: string;
  address: string;
  period: string;
  arrivalDate: string;
  eta: string;
  price60Individual: string;
  price90Individual: string;
  price60Couple: string;
  price90Couple: string;
  parking: string;
  aa: string;
  aiResponses: boolean;
};

const MODE_OPTIONS: { value: OperationMode; label: string }[] = [
  { value: "incall", label: "Incall" },
  { value: "outcall", label: "Outcall" },
  { value: "both", label: "Incall & Outcall" },
];

const EMPTY_PROFILE: Omit<Profile, "id"> = {
  name: "",
  active: true,
  verified: false,
  mode: "incall",
  city: "",
  neighborhood: "",
  address: "",
  period: "",
  arrivalDate: "",
  eta: "",
  price60Individual: "",
  price90Individual: "",
  price60Couple: "",
  price90Couple: "",
  parking: "",
  aa: "",
  aiResponses: true,
};

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`;
}

function ProfileForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Profile, "id"> & { id?: string };
  onSave: (data: Omit<Profile, "id"> & { id?: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  function toggle(key: "active" | "aiResponses") {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const inputCls =
    "w-full border border-slate-200 bg-white px-3 py-2 font-sans text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-colors";
  const labelCls = "block font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="border border-slate-200/60 bg-white p-6 shadow-sm space-y-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-medium text-slate-900">
          {form.id ? "Edit Profile" : "New Profile"}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggle("active")}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.active ? "bg-emerald-500" : "bg-slate-300"
            }`}
            aria-label="Active"
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                form.active ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            {form.active ? "Active" : "Inactive"}
          </span>

          {form.verified && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-indigo-600">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Profile Name *</label>
          <input className={inputCls} placeholder="Example: New York Week" value={form.name} onChange={field("name")} />
        </div>
        <div>
          <label className={labelCls}>Operating Mode</label>
          <select className={inputCls} value={form.mode} onChange={field("mode")}>
            {MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Location</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>City *</label>
            <input className={inputCls} placeholder="Example: New York" value={form.city} onChange={field("city")} />
          </div>
          <div>
            <label className={labelCls}>Neighborhood *</label>
            <input className={inputCls} placeholder="Example: Midtown" value={form.neighborhood} onChange={field("neighborhood")} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Full Address *</label>
          <input className={inputCls} placeholder="Example: 123 Main St, Suite 4" value={form.address} onChange={field("address")} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Dates & Hours</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Schedule Text *</label>
            <input className={inputCls} placeholder="Example: 10am to 10pm" value={form.period} onChange={field("period")} />
          </div>
          <div>
            <label className={labelCls}>Arrival Date/Time *</label>
            <input type="datetime-local" className={inputCls} value={form.arrivalDate} onChange={field("arrivalDate")} />
          </div>
          <div>
            <label className={labelCls}>ETA Optional</label>
            <input className={inputCls} placeholder="Example: about 15 min" value={form.eta} onChange={field("eta")} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Pricing</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3 border border-slate-100 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Individual</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>60 minutes</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-sans text-sm text-slate-400">$</span>
                  <input className={`${inputCls} pl-6`} placeholder="0" value={form.price60Individual} onChange={field("price60Individual")} />
                </div>
              </div>
              <div>
                <label className={labelCls}>90 minutes</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-sans text-sm text-slate-400">$</span>
                  <input className={`${inputCls} pl-6`} placeholder="0" value={form.price90Individual} onChange={field("price90Individual")} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 border border-slate-100 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Couples Total</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>60 minutes</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-sans text-sm text-slate-400">$</span>
                  <input className={`${inputCls} pl-6`} placeholder="0" value={form.price60Couple} onChange={field("price60Couple")} />
                </div>
              </div>
              <div>
                <label className={labelCls}>90 minutes</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-sans text-sm text-slate-400">$</span>
                  <input className={`${inputCls} pl-6`} placeholder="0" value={form.price90Couple} onChange={field("price90Couple")} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Parking</label>
            <input className={inputCls} placeholder="Example: Free street parking" value={form.parking} onChange={field("parking")} />
          </div>
          <div>
            <label className={labelCls}>Accessibility / Notes</label>
            <input className={inputCls} placeholder="Example: Available" value={form.aa} onChange={field("aa")} />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-between border border-indigo-100 bg-indigo-50/50 p-4">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-indigo-500" />
          <div>
            <p className="font-sans text-sm font-medium text-slate-800">AI Responses</p>
            <p className="font-sans text-xs text-slate-500">AI can generate personalized responses automatically</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => toggle("aiResponses")}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            form.aiResponses ? "bg-indigo-500" : "bg-slate-300"
          }`}
          aria-label="AI Responses"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              form.aiResponses ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 border border-slate-200 px-5 py-2 font-sans text-sm text-slate-600 transition-colors hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          className="flex items-center gap-2 bg-slate-950 px-6 py-2 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:scale-95"
        >
          <Save className="h-4 w-4" />
          Save Profile
        </button>
      </div>
    </motion.div>
  );
}

function ProfileCard({
  profile,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  profile: Profile;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className={`border bg-white shadow-sm transition-colors ${
        profile.active ? "border-slate-200/60" : "border-slate-200/30 opacity-60"
      }`}
    >
      <div className="flex items-center gap-4 p-5">
        <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${profile.active ? "bg-emerald-400" : "bg-slate-300"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base font-medium text-slate-900 truncate">
              {profile.name || <span className="italic text-slate-400">Unnamed</span>}
            </p>
            {profile.verified && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-indigo-600">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            )}
            {profile.aiResponses && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-indigo-500">
                <Bot className="h-3 w-3" />
                AI
              </span>
            )}
          </div>
          <p className="mt-0.5 font-sans text-xs text-slate-400 truncate">
            {[profile.city, profile.neighborhood].filter(Boolean).join(" · ") || "No location"}
            {profile.period ? ` · ${profile.period}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onEdit} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={onToggleActive} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${profile.active ? "bg-emerald-500" : "bg-slate-300"}`} aria-label="Toggle active">
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${profile.active ? "translate-x-4" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-slate-100">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-5 sm:grid-cols-3 md:grid-cols-4">
              {[
                { label: "Mode", value: MODE_OPTIONS.find((m) => m.value === profile.mode)?.label },
                { label: "Address", value: profile.address },
                { label: "Arrival", value: profile.arrivalDate ? new Date(profile.arrivalDate).toLocaleString("en-US") : "" },
                { label: "ETA", value: profile.eta },
                { label: "60min Individual", value: profile.price60Individual ? `$${profile.price60Individual}` : "" },
                { label: "90min Individual", value: profile.price90Individual ? `$${profile.price90Individual}` : "" },
                { label: "60min Couples", value: profile.price60Couple ? `$${profile.price60Couple}` : "" },
                { label: "90min Couples", value: profile.price90Couple ? `$${profile.price90Couple}` : "" },
                { label: "Parking", value: profile.parking },
                { label: "Accessibility / Notes", value: profile.aa },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div key={row.label}>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">{row.label}</p>
                    <p className="mt-0.5 font-sans text-sm text-slate-700">{row.value}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<(Omit<Profile, "id"> & { id?: string }) | null>(null);
  const [saved, setSaved] = useState(false);

  function startCreate() {
    setEditing({ ...EMPTY_PROFILE });
  }

  function startEdit(profile: Profile) {
    setEditing({ ...profile });
  }

  function handleSave(data: Omit<Profile, "id"> & { id?: string }) {
    if (!data.name.trim()) return;
    if (data.id) {
      setProfiles((prev) => prev.map((p) => (p.id === data.id ? ({ ...data, id: data.id! } as Profile) : p)));
    } else {
      setProfiles((prev) => [...prev, { ...data, id: uid() } as Profile]);
    }
    setEditing(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleDelete(id: string) {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  }

  function handleToggleActive(id: string) {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  }

  const activeCount = profiles.filter((p) => p.active).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-32 md:p-10">
      <div className="sticky top-4 z-30 flex flex-col justify-between gap-4 border border-slate-200/60 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-medium text-slate-900">Manage Profiles</h1>
          <p className="font-sans text-sm text-slate-500">Configure your auto response profiles</p>
        </div>
        <div className="flex items-center gap-4">
          {profiles.length > 0 && <span className="font-mono text-xs text-slate-400">{activeCount} active · {profiles.length} total</span>}
          <AnimatePresence>
            {saved && (
              <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 font-mono text-xs text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button type="button" onClick={startCreate} disabled={!!editing} className="flex items-center gap-2 bg-slate-950 px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-40 active:scale-95">
            <Plus className="h-4 w-4" />
            New Profile
          </button>
        </div>
      </div>

      <AnimatePresence>{editing && <ProfileForm key="form" initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}</AnimatePresence>

      {profiles.length === 0 && !editing ? (
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Bot className="h-6 w-6 text-slate-400" />
          </div>
          <p className="font-display text-lg font-medium text-slate-700">No profiles created</p>
          <p className="mt-1 font-sans text-sm text-slate-400">Create your first auto response profile.</p>
          <button type="button" onClick={startCreate} className="mt-6 flex items-center gap-2 bg-slate-950 px-5 py-2.5 font-sans text-sm font-semibold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Create Profile
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="space-y-3" variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show">
          {profiles.map((profile) =>
            editing?.id === profile.id ? null : (
              <ProfileCard key={profile.id} profile={profile} onEdit={() => startEdit(profile)} onDelete={() => handleDelete(profile.id)} onToggleActive={() => handleToggleActive(profile.id)} />
            ),
          )}
        </motion.div>
      )}
    </div>
  );
}
