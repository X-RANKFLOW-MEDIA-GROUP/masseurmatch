"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { loginMutation, logoutMutation, registerMutation } from "@/app/_lib/mutations";
import { supabase } from "@/integrations/supabase/client";

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

async function hydrateBrowserSession(email: string, password: string): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;

  const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
  return signInData.session ?? null;
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
        setSubscription((previous) => ({ ...previous, loading: false }));
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
      setSubscription((previous) => ({ ...previous, loading: false }));
    }
  }, []);

  useEffect(() => {
    let initialLoadDone = false;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      initialLoadDone = true;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      if (currentSession?.user) refreshSubscription();
      else setSubscription({ ...defaultSubscription, loading: false });
    });

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (initialLoadDone) setLoading(false);
      if (event === "SIGNED_IN" && initialLoadDone) {
        setTimeout(() => refreshSubscription(), 0);
      } else if (!currentSession) {
        setSubscription({ ...defaultSubscription, loading: false });
      }
    });

    return () => authSubscription.unsubscribe();
  }, [refreshSubscription]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerMutation({ email, password, fullName });
      if (!result.requiresEmailConfirmation) {
        const hydrated = await hydrateBrowserSession(email, password);
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
      const result = await loginMutation({ email, password });
      const hydrated = await hydrateBrowserSession(email, password);
      setSession(hydrated);
      setUser(hydrated?.user ?? null);
      if (hydrated?.user) setTimeout(() => refreshSubscription(), 0);
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
