import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  User,
  Camera,
  MapPin,
  DollarSign,
  Clock,
  ShieldCheck,
  CreditCard,
  Settings,
  Search,
  Megaphone,
  MessageCircleQuestion,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard },
  { title: "Perfil", url: "/dashboard/profile", icon: User },
  { title: "Fotos", url: "/dashboard/photos", icon: Camera },
  { title: "Localização", url: "/dashboard/location", icon: MapPin },
  { title: "Preços", url: "/dashboard/pricing", icon: DollarSign },
  { title: "Disponibilidade", url: "/dashboard/availability", icon: Clock },
  { title: "SEO", url: "/dashboard/seo", icon: Search },
  { title: "Promoção", url: "/dashboard/promotion", icon: Megaphone },
  { title: "Q&A", url: "/dashboard/faq", icon: MessageCircleQuestion },
];

const accountItems = [
  { title: "Verificação", url: "/dashboard/verification", icon: ShieldCheck },
  { title: "Assinatura", url: "/dashboard/subscription", icon: CreditCard },
  { title: "Configurações", url: "/dashboard/settings", icon: Settings },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const isActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold font-heading text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            MasseurMatch
          </span>
          <span className="text-lg font-bold font-heading text-sidebar-foreground hidden group-data-[collapsible=icon]:block">
            M
          </span>
        </Link>
        {profile && (
          <div className="mt-3 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile.display_name || profile.full_name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {profile.is_verified_identity ? (
                <Badge variant="outline" className="text-[10px] border-success/40 text-success">Verificado</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-warning/40 text-warning">Não verificado</Badge>
              )}
              {profile.is_active ? (
                <Badge variant="outline" className="text-[10px] border-success/40 text-success">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] border-muted-foreground/40 text-muted-foreground">Inativo</Badge>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Meu Negócio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
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
