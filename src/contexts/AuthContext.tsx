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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionState;
  refreshSubscription: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; requiresEmailConfirmation?: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; role?: "admin" | "provider" | "client" | null }>;
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
const CLIENT_SESSION_SYNC_TIMEOUT_MS = 8000;

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

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function signInWithRetry(email: string, password: string, attempts = 5) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error) {
      return null;
    }

    lastError = error;

    if (attempt < attempts - 1) {
      await wait(750 * (attempt + 1));
    }
  }

  return lastError;
}

async function establishClientSession(
  email: string,
  password: string,
  sessionTokens?: {
    access_token: string;
    refresh_token: string;
  } | null,
) {
  const accessToken = sessionTokens?.access_token;
  const refreshToken = sessionTokens?.refresh_token;

  if (accessToken && refreshToken) {
    try {
      const result = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!result.error) {
        return;
      }
    } catch {
      // Fall back to a direct browser sign-in below.
    }
  }

  const signInError = await signInWithRetry(email, password);
  if (signInError) {
    throw signInError;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const refreshSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/pro/subscription", {
        method: "GET",
        cache: "no-store",
      });

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
      setLoading(false);
      if (event === "SIGNED_IN" && initialLoadDone) {
        // Only refresh on explicit sign-in events, not on initial session restore
        setTimeout(() => refreshSubscription(), 0);
      } else if (!session) {
        setSubscription({ ...defaultSubscription, loading: false });
      }
    });

    return () => authSub.unsubscribe();
  }, [refreshSubscription]);

  // Clear session on browser close if "remember me" was not checked
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionStorage.getItem("mm_session_only") === "true") {
        supabase.auth.signOut();
        sessionStorage.removeItem("mm_session_only");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerMutation({ email, password, fullName });
      if (!result.requiresEmailConfirmation) {
        await establishClientSession(email, password, result.session);
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

      // Login API already sets the server session cookie.
      // Mirror the Supabase browser session so client auth state hydrates immediately,
      // but don't block login when this sync fails (server cookie is already valid).
      const sessionSyncPromise = establishClientSession(email, password, result.session).catch((sessionError) => {
        console.warn("Client session sync failed after login.", sessionError);
      });
      await Promise.race([
        sessionSyncPromise,
        wait(CLIENT_SESSION_SYNC_TIMEOUT_MS),
      ]);

      return { error: null, role: result.role };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await logoutMutation().catch(() => null);
    await supabase.auth.signOut();
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
