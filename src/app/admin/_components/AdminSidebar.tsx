"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
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
  Mail,
  Workflow,
} from "lucide-react";

const navSections = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/tools", label: "All Tools", icon: Grid3X3 },
      { href: "/admin/people", label: "People CRM", icon: Users },
      { href: "/admin/migrations", label: "Import Profiles", icon: Workflow },
      { href: "/admin/photos", label: "Photo Approvals", icon: ImageIcon },
      { href: "/admin/moderation", label: "Approvals", icon: ShieldAlert },
      { href: "/admin/profile-reports", label: "Profile Reports", icon: Flag },
    ],
  },
  {
    title: "Communication",
    items: [
      { href: "/admin/emails", label: "Email Center", icon: Mail },
      { href: "/admin/tickets", label: "Tickets", icon: MessageSquare },
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/sms", label: "SMS Auto-Reply", icon: MessageSquare },
    ],
  },
  {
    title: "Revenue",
    items: [
      { href: "/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
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
    title: "System",
    items: [
      { href: "/admin/verification/manual", label: "ID Review", icon: ShieldCheck },
      { href: "/admin/verification", label: "Verification Status", icon: ShieldCheck },
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
      {navSections.map((section) => (
        <div key={section.title} className="mb-1">
          <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">{section.title}</p>
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
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"><Home className="h-4 w-4 shrink-0" />Back to Site</Link>
        <Link href="/pro/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"><LayoutDashboard className="h-4 w-4 shrink-0" />Pro Dashboard</Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"><LogOut className="h-4 w-4 shrink-0" />Logout</button>
      </div>
    </nav>
  );
}
