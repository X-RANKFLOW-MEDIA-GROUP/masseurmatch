import Link from "next/link";
import { Camera, CreditCard, LifeBuoy, MapPin, ShieldCheck, Sparkles, UserCircle } from "lucide-react";

const topics = [
  { title: "Create your profile", text: "Set up your public profile, services, location, rates, and contact preferences.", icon: UserCircle, href: "/pro/listing" },
  { title: "Photos and approval", text: "Learn photo requirements, moderation rules, and how verification works.", icon: Camera, href: "/pro/photos" },
  { title: "Visibility tools", text: "Use Available Now, travel dates, specials, and profile growth tools.", icon: Sparkles, href: "/pro/growth" },
  { title: "Cities and discovery", text: "Understand how profiles appear in local search and city pages.", icon: MapPin, href: "/explore" },
  { title: "Plans and billing", text: "Manage your subscription, billing details, and payment history.", icon: CreditCard, href: "/pro/subscription" },
  { title: "Safety and privacy", text: "Review platform safety, reporting, privacy, and content standards.", icon: ShieldCheck, href: "/safety" },
];

export const metadata = { title: "Help Center — MasseurMatch", description: "Help and guidance for MasseurMatch members." };

export default function HelpPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
    <div className="mx-auto max-w-6xl">
      <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">Help Center</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">How can we help?</h1><p className="mt-4 text-lg text-slate-600">Find clear guidance for managing your profile, visibility, account, and safety.</p></div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{topics.map((topic) => <Link key={topic.title} href={topic.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><topic.icon className="h-6 w-6 text-indigo-600" /><h2 className="mt-5 text-lg font-semibold">{topic.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{topic.text}</p></Link>)}</div>
      <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl bg-slate-950 p-7 text-white sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Still need help?</h2><p className="mt-1 text-sm text-slate-300">Open a support ticket and keep all updates in one place.</p></div><Link href="/pro/tickets" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"><LifeBuoy className="h-4 w-4" />Contact support</Link></div>
    </div>
  </main>;
}
