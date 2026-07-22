"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, HeartHandshake, ShieldCheck, ShieldAlert, CreditCard,
  FileClock, FileText, BarChart, LifeBuoy, Settings, LogOut, MapPin, Tag,
  Newspaper, Home, ImageIcon, BarChart3, MessageSquare, Flag, Search,
} from "lucide-react";

const navSections = [
  { title: "Core", items: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/therapists", label: "Masseurs", icon: HeartHandshake },
    { href: "/admin/photos", label: "Photos", icon: ImageIcon },
    { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
    { href: "/admin/profile-reports", label: "Profile Reports", icon: Flag },
  ]},
  { title: "Communication", items: [
    { href: "/admin/sms", label: "SMS", icon: MessageSquare },
    { href: "/admin/tickets", label: "Support Tickets", icon: MessageSquare },
  ]},
  { title: "Business", items: [
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/logs", label: "Logs", icon: FileClock },
  ]},
  { title: "SEO & Growth", items: [
    { href: "/admin/dashboard/keyword-trends", label: "Keyword Trends", icon: Search },
    { href: "/admin/keywords", label: "Keyword Manager", icon: Tag },
    { href: "/admin/cities", label: "Cities", icon: MapPin },
    { href: "/admin/seo", label: "SEO Pages", icon: BarChart },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
  ]},
  { title: "Operations", items: [
    { href: "/admin/support", label: "Support", icon: LifeBuoy },
    { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
    { href: "/admin/legal", label: "Legal", icon: FileText },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ]},
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname?.startsWith(href) ?? false;

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto py-2">
      {navSections.map((section) => (
        <div key={section.title} className="mb-1">
          <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{section.title}</p>
          <ul>{section.items.map((item) => {
            const active = isActive(item.href, item.exact);
            return <li key={item.href}><Link href={item.href} className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors ${active ? "border-brand-secondary bg-brand-secondary/[0.06] font-medium text-brand-secondary" : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><item.icon className="h-4 w-4 shrink-0" />{item.label}</Link></li>;
          })}</ul>
        </div>
      ))}
      <div className="mt-auto border-t border-slate-100 pt-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><Home className="h-4 w-4" />Back to Site</Link>
        <Link href="/pro/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"><LayoutDashboard className="h-4 w-4" />Pro Dashboard</Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" />Logout</button>
      </div>
    </nav>
  );
}
