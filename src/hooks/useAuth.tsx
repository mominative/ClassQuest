import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─── Hard-coded admin email ───────────────────────────────────────────────────
const ADMIN_EMAIL = "teacher@test.com";

type AppRole = "admin" | "user";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  roleLabel: "Admin" | "Member" | null;
  canEditAllTasks: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  roleLabel: null,
  canEditAllTasks: false,
  loading: true,
  signOut: async () => {},
});

/** Derive role directly from email — no database call needed. */
const roleFromEmail = (email: string | undefined): AppRole =>
  email === ADMIN_EMAIL ? "admin" : "user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setRole(session?.user ? roleFromEmail(session.user.email) : null);
      setLoading(false);
    });

    // Hydrate on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setRole(session?.user ? roleFromEmail(session.user.email) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  };

  const roleLabel: "Admin" | "Member" | null =
    role === "admin" ? "Admin" : role === "user" ? "Member" : null;

  const canEditAllTasks = role === "admin";

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        roleLabel,
        canEditAllTasks,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
