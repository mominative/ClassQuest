import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "teacher" | "student";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  roleLabel: "Teacher" | "Student" | null;
  isTeacher: boolean;
  canEditAllTasks: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  roleLabel: null,
  isTeacher: false,
  canEditAllTasks: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string): Promise<AppRole> => {
    // Use security-definer function to avoid RLS recursion / extra reads
    const { data: isTeach } = await supabase.rpc("is_teacher", { _user_id: userId });
    return isTeach ? "teacher" : "student";
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Defer to avoid deadlock inside the auth callback
        setTimeout(() => {
          fetchRole(session.user.id).then((r) => {
            setRole(r);
            setLoading(false);
          });
        }, 0);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id).then((r) => {
          setRole(r);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRole(null);
  };

  const roleLabel: "Teacher" | "Student" | null =
    role === "teacher" ? "Teacher" : role === "student" ? "Student" : null;

  const isTeacher = role === "teacher";
  const canEditAllTasks = isTeacher;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        roleLabel,
        isTeacher,
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
