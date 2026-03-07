import { Link, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Shield, Camera, Flag, Star, MapPin, ScrollText,
  Users, Mail, LogOut, Bot, Newspaper,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Mailbox", url: "/admin/mailbox", icon: Mail },
  { title: "Moderation", url: "/admin/moderation", icon: Shield },
  { title: "AI Pre-check", url: "/admin/ai-precheck", icon: Bot },
  { title: "Content Flags", url: "/admin/flags", icon: Flag },
  { title: "Featured Masters", url: "/admin/featured", icon: Star },
  { title: "City Ops", url: "/admin/city-ops", icon: MapPin },
  { title: "Audit Log", url: "/admin/audit-log", icon: ScrollText },
];

const userItems = [
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Newsletter", url: "/admin/newsletter", icon: Newspaper },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (url: string) => {
    if (url === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-foreground shrink-0" />
          <span className="text-lg font-bold font-heading text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Admin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Voltar ao site">
              <Link to="/">
                <LayoutDashboard className="shrink-0" />
                <span>Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sair" onClick={signOut}>
              <LogOut className="shrink-0" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
