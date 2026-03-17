"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export function Sidebar({ className, collapsible, ...props }: React.HTMLAttributes<HTMLDivElement> & { collapsible?: "icon" | "none" }) {
  return <aside data-collapsible={collapsible} className={cn("w-72 border-r border-border bg-card", className)} {...props} />;
}

export function SidebarHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export function SidebarContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export function SidebarFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}

export function SidebarGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  return <section {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-3 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground", className)} {...props} />;
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

export function SidebarMenuButton({ className, asChild, isActive, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; isActive?: boolean; tooltip?: string }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        isActive && "bg-secondary text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarSeparator(props: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("my-2 border-border", props.className)} {...props} />;
}
