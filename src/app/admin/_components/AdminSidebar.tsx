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
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

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
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">
              Admin
            </span>
          )}
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {navSections.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href, item.exact)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Back to site">
              <Link href="/">
                <Home className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Back to Site</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <Link href="/login">
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
