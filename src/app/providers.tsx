"use client";

import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/app/_lib/i18n";

const ChatWidget = dynamic(
  () => import("@/app/_components/chat-widget").then((module) => module.ChatWidget),
  {
    ssr: false,
  },
);

const KnottyIntroBanner = dynamic(
  () => import("@/app/_components/knotty-intro-banner").then((module) => module.KnottyIntroBanner),
  {
    ssr: false,
  },
);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
            <ChatWidget />
            <KnottyIntroBanner />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
