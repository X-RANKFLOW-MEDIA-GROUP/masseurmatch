"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navSections = [
  {
    title: "Core",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/therapists", label: "Therapists", icon: HeartHandshake },
      { href: "/admin/photos", label: "Photos", icon: ImageIcon },
      { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
    ],
  },
  {
    title: "Messaging",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/sms", label: "SMS Auto-Reply", icon: MessageSquare },
    ],
  },
  {
    title: "Business",
    items: [
      { href: "/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/logs", label: "Logs", icon: FileClock },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/blog", label: "Blog", icon: Newspaper },
      { href: "/admin/cities", label: "Cities", icon: MapPin },
      { href: "/admin/keywords", label: "Keywords", icon: Tag },
      { href: "/admin/seo", label: "SEO", icon: BarChart },
    ],
  },
  {
    title: "Ops",
    items: [
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
      { href: "/admin/verification", label: "Verification", icon: ShieldCheck },
      { href: "/admin/legal", label: "Legal", icon: FileText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto py-2">
      {navSections.map((section) => (
        <div key={section.title} className="mb-1">
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
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-slate-100 font-medium text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
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
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </Link>
      </div>
    </nav>
  );
}
