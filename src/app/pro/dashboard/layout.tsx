import type { ReactNode } from "react";
import { DashboardAnalyticsEnhancer } from "@/components/pro/dashboard/DashboardAnalyticsEnhancer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <DashboardAnalyticsEnhancer />
    </>
  );
}
