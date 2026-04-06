import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    // Query the profiles table for the user's role field (teacher | student)
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      // Fall back to querying user_roles table if profiles.role is missing
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      const rawRole = (roleRow as { role?: string } | null)?.role ?? "user";
      setRole(rawRole === "admin" ? "admin" : "user");
      return;
    }

    // Map teacher → admin, student → user
    const raw = (data as { role?: string }).role ?? "user";
    if (raw === "teacher") {
      setRole("admin");
    } else if (raw === "student") {
      setRole("user");
    } else {
      // handle legacy values ('admin' / 'user') transparently
      setRole(raw === "admin" ? "admin" : "user");
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // setTimeout avoids Supabase internal deadlock on auth state change
        setTimeout(() => fetchRole(session.user.id), 0);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id);
      }
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
