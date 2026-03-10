import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
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
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const refreshSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check error:', error);
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }
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
      setSubscription(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        // Defer to avoid Supabase deadlock
        setTimeout(() => refreshSubscription(), 0);
      } else {
        setSubscription({ ...defaultSubscription, loading: false });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        refreshSubscription();
      } else {
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

  // Auto-refresh subscription every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
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
