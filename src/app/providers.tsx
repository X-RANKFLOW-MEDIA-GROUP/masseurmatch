"use client";

import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

import { BugsnagClient } from "@/app/_components/bugsnag-client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/app/_lib/i18n";

const ChatWidget = dynamic(
  () => import("@/app/_components/chat-widget").then((module) => module.ChatWidget),
  {
    ssr: false,
    loading: () => null,
  },
);

class ChatWidgetBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error("Chat widget render failed", error);
  }

  override render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <BugsnagClient />
            {children}
            <Toaster />
            <Sonner />
            <ChatWidgetBoundary>
              <ChatWidget />
            </ChatWidgetBoundary>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
