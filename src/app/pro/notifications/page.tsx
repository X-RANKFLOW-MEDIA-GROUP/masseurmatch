import { Bell } from "lucide-react";

export const metadata = { title: "Notifications — MasseurMatch Pro" };

export default function NotificationsPage() {
  return <main className="mx-auto max-w-4xl space-y-6 p-4 pb-24 md:p-8"><div><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Account</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">Notifications</h1><p className="mt-2 text-slate-600">Profile, moderation, visibility, subscription, and platform updates will appear here.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><Bell className="mx-auto h-8 w-8 text-slate-400" /><h2 className="mt-4 text-lg font-semibold text-slate-900">No new notifications</h2><p className="mt-2 text-sm text-slate-500">Important account activity will be organized in this inbox.</p></section></main>;
}
