
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          // Clear user and session on sign out
          console.log("Signed out event received, clearing user and session");
          setUser(null);
          setSession(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("Sign in or token refresh detected");
          setUser(currentSession?.user ?? null);
          setSession(currentSession);
        } else {
          // For any other events, update state with the current session
          setUser(currentSession?.user ?? null);
          setSession(currentSession);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        console.log("Getting initial session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          // Don't show toast on initial load if no session exists
          if (error.message !== "Session not found") {
            toast({
              title: "Session Error",
              description: error.message,
              variant: "destructive",
            });
          }
          // Clear user and session state on error
          setUser(null);
          setSession(null);
        } else {
          console.log("Initial session:", data?.session?.user?.email || "No session found");
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        // Clear user and session state on error
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
