"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";

const SidebarContext = React.createContext<{ collapsed: boolean; setCollapsed: (v: boolean) => void }>({
  collapsed: false,
  setCollapsed: () => {},
});

export function useSidebar() {
  return React.useContext(SidebarContext);
}

export function SidebarProvider({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className={cn("flex min-h-screen w-full", className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { collapsed, setCollapsed } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      className={cn("inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors", className)}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

export function SidebarInset({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-1 flex-col overflow-hidden", className)} {...props} />;
}

export function Sidebar({ className, collapsible, ...props }: React.HTMLAttributes<HTMLDivElement> & { collapsible?: "icon" | "none" }) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-collapsible={collapsible}
      data-collapsed={collapsed}
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 sticky top-0",
        collapsed ? "w-[68px]" : "w-72",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-shrink-0", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-shrink-0", className)} {...props} />;
}

export function SidebarGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  return <section {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useSidebar();
  if (collapsed) return null;
  return <div className={cn("px-3 py-2 text-xs uppercase tracking-[0.2em] text-sidebar-foreground/50", className)} {...props} />;
}

export function SidebarGroupContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export function SidebarMenu(props: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1 p-2", props.className)} {...props} />;
}

export function SidebarMenuItem(props: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li {...props} />;
}

export function SidebarMenuButton({ className, asChild, isActive, tooltip, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; isActive?: boolean; tooltip?: string }) {
  const Comp = asChild ? Slot : "button";
  const { collapsed } = useSidebar();
  return (
    <Comp
      title={collapsed ? tooltip : undefined}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        collapsed && "justify-center px-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarSeparator(props: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-2 border-sidebar-border", props.className)} {...props} />;
}
