"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebarNav from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebarNav />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 bg-[hsl(220,33%,97%)] p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
