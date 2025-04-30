import {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/src/lib/supabase";
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Admin, Customer } from "@/assets/data/types";

// Define the AuthData type
interface AuthData {
  session: Session | null;
  loading: boolean;
  user: Customer | Admin | null;
  isAdmin: boolean;
}

// Create the AuthContext with a default value
const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  user: null,
  isAdmin: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const customerData = await supabase
          .from("Customer")
          .select("*")
          .eq("user_uuid", session.user.id)
          .single();
      
        if (customerData.data) {
          setUser(customerData.data);
        } else {
          const adminData = await supabase
            .from("Admin")
            .select("*")
            .eq("admin_uuid", session.user.id)
            .single();
      
          setUser(adminData.data);
          setIsAdmin(true);
        }
      }

      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, user, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
