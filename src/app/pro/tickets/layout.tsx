import type { ReactNode } from "react";
import { TicketLocaleEnhancer } from "@/components/pro/tickets/TicketLocaleEnhancer";

export default function TicketsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <TicketLocaleEnhancer />
    </>
  );
}
