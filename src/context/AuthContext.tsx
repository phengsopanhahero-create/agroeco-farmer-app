import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

function detectTelegram(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const tg = (window as any).Telegram?.WebApp;
    return !!(tg?.initData && tg.initData.length > 0);
  } catch {
    return false;
  }
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isTelegram: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isTelegram] = useState<boolean>(() => detectTelegram());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const {
        data: { user: existingUser },
      } = await supabase.auth.getUser();

      if (existingUser) {
        if (!cancelled) {
          setUser(existingUser);
          setLoading(false);
        }
        return;
      }

      // No persisted session (common inside Telegram's WebView, where
      // cookies/localStorage set on a previous page don't reliably carry
      // over). Try to silently re-authenticate via Telegram initData
      // before giving up, so protected routes don't bounce to /welcome
      // on every navigation.
      if (isTelegram) {
        try {
          const tg = window.Telegram?.WebApp;
          const res = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tg?.initData }),
            signal: AbortSignal.timeout(10000),
          });
          const { session, error } = await res.json();
          if (!error && session) {
            const { data } = await supabase.auth.setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            });
            if (!cancelled) {
              setUser(data.user ?? null);
              setLoading(false);
            }
            return;
          }
        } catch {
          // fall through to unauthenticated state
        }
      }

      if (!cancelled) {
        setUser(null);
        setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isTelegram]);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signup = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    isTelegram,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
