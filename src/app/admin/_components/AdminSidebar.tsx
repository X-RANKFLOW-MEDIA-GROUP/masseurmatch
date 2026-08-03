"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  FileClock,
  FileText,
  BarChart,
  LifeBuoy,
  Settings,
  LogOut,
  MapPin,
  Tag,
  Newspaper,
  Home,
  ImageIcon,
  BarChart3,
  CalendarCheck,
  MessageSquare,
  Flag,
  Grid3X3,
  Workflow,
} from "lucide-react";

const navSections = [
  {
    title: "Start here",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/tools", label: "All Tools", icon: Grid3X3 },
    ],
  },
  {
    title: "People & profiles",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/therapists", label: "Therapists", icon: HeartHandshake },
      { href: "/admin/photos", label: "Photos", icon: ImageIcon },
      { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
      { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
      { href: "/admin/profile-reports", label: "Profile Reports", icon: Flag },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/bookings", label: "Booking Approvals", icon: CalendarCheck },
      { href: "/admin/sms", label: "SMS Auto-Reply", icon: MessageSquare },
      { href: "/admin/tickets", label: "Tickets", icon: MessageSquare },
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
      { href: "/admin/migrations", label: "Imports", icon: Workflow },
    ],
  },
  {
    title: "Growth & content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/cities", label: "Cities", icon: MapPin },
      { href: "/admin/keywords", label: "Keywords", icon: Tag },
      { href: "/admin/seo", label: "SEO", icon: BarChart },
    ],
  },
  {
    title: "Business & system",
    items: [
      { href: "/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/logs", label: "Logs", icon: FileClock },
      { href: "/admin/legal", label: "Legal", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto py-2">
      <div className="mx-3 mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
        <p className="text-xs font-semibold text-blue-950">New to the admin?</p>
        <Link href="/admin/tools" className="mt-0.5 block text-xs text-blue-700 hover:underline">
          Open All Tools for a guided map.
        </Link>
      </div>

      {navSections.map((section) => (
        <div key={section.title} className="mb-2">
          <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {section.title}
          </p>
          <ul>
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 border-l-2 px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? "border-brand-secondary bg-brand-secondary/[0.06] font-medium text-brand-secondary"
                        : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={2.25} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto border-t border-slate-100 pt-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <Home className="h-4 w-4 shrink-0" />
          Back to Site
        </Link>
        <Link
          href="/pro/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Pro Dashboard
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </nav>
  );
}
