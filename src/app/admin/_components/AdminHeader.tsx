"use client";

import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-white/80 px-4 backdrop-blur-xl lg:h-[60px] lg:px-6">
      <SidebarTrigger />
      <span className="text-sm font-semibold text-muted-foreground">Admin Panel</span>

      <div className="flex-1" />

      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="pl-8 w-[200px] lg:w-[280px] bg-secondary/50 border-none focus-visible:ring-primary"
        />
      </div>
    </header>
  );
}
