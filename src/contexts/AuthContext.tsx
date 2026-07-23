"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { loginMutation, logoutMutation, registerMutation } from "@/app/_lib/mutations";
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  subscribed: boolean;
  plan_key: string | null;
  plan_name: string | null;
  subscription_end: string | null;
  trial_end: string | null;
  is_trial: boolean;
  has_founder_discount: boolean;
  status: string | null;
  loading: boolean;
  config_error: string | null;
}

type AppRole = "admin" | "provider" | "client" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: AppRole; redirect?: string }>;
  signOut: () => Promise<void>;
}

const defaultSubscription: SubscriptionState = {
  subscribed: false,
  plan_key: null,
  plan_name: null,
  subscription_end: null,
  trial_end: null,
  is_trial: false,
  has_founder_discount: false,
  status: null,
  loading: true,
  config_error: null,
};

type SubscriptionResponse = {
  ok: boolean;
  subscribed?: boolean;
  plan_key?: string | null;
  plan_name?: string | null;
  subscription_end?: string | null;
  trial_end?: string | null;
  is_trial?: boolean;
  has_founder_discount?: boolean;
  status?: string | null;
  config_error?: string | null;
};

/**
 * The server auth routes already perform the password exchange and write the
 * Supabase SSR cookies. Reading those cookies is enough to mirror the session
 * into the browser client; signing in with the password a second time adds an
 * unnecessary network round-trip and can rotate the session again.
 */
async function readBrowserSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const refreshSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/pro/subscription", { method: "GET", cache: "no-store" });
      if (!response.ok) {
        setSubscription((prev) => ({ ...prev, loading: false }));
        return;
      }
      const data = (await response.json()) as SubscriptionResponse;
      setSubscription({
        subscribed: data.subscribed ?? false,
        plan_key: data.plan_key ?? null,
        plan_name: data.plan_name ?? null,
        subscription_end: data.subscription_end ?? null,
        trial_end: data.trial_end ?? null,
        is_trial: data.is_trial ?? false,
        has_founder_discount: data.has_founder_discount ?? false,
        status: data.status ?? null,
        loading: false,
        config_error: data.config_error ?? null,
      });
    } catch {
      setSubscription((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    let initialLoadDone = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      initialLoadDone = true;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshSubscription();
      } else {
        setSubscription({ ...defaultSubscription, loading: false });
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (initialLoadDone) {
        setLoading(false);
      }
      if (event === "SIGNED_IN" && initialLoadDone) {
        setTimeout(() => refreshSubscription(), 0);
      } else if (!session) {
        setSubscription({ ...defaultSubscription, loading: false });
      }
    });

    return () => authSub.unsubscribe();
  }, [refreshSubscription]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerMutation({ email, password, fullName });
      // Only read a live session when email confirmation is NOT required.
      // When it is, there is no session yet — the user must confirm by email.
      if (!result.requiresEmailConfirmation) {
        const hydrated = await readBrowserSession();
        setSession(hydrated);
        setUser(hydrated?.user ?? null);
      }
      return {
        error: null,
        requiresEmailConfirmation: result.requiresEmailConfirmation,
        message: result.message,
      };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // The server route enforces CSRF, rate limiting and brute-force lockout,
      // performs the only password exchange, and writes the auth cookies.
      const result = await loginMutation({ email, password });
      const hydrated = await readBrowserSession();
      setSession(hydrated);
      setUser(hydrated?.user ?? null);
      if (hydrated?.user) {
        setTimeout(() => refreshSubscription(), 0);
      }
      return { error: null, role: result.role, redirect: result.redirect };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await logoutMutation().catch(() => null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      setSession(null);
      setUser(null);
      setSubscription({ ...defaultSubscription, loading: false });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, refreshSubscription, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};