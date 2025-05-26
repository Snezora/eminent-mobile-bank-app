import {
  createContext,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/src/lib/supabase";
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Admin, Customer } from "@/assets/data/types";
import { AppState } from "react-native";

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
  const [user, setUser] = useState<Customer | Admin | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setIsAdmin(false);

      try {
        // Fetch the current session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setLoading(false);
          return;
        }

        if (data.session) {
          const [customerData, adminData] = await Promise.all([
            supabase
              .from("Customer")
              .select("*")
              .eq("user_uuid", data.session.user.id)
              .single(),
            supabase
              .from("Admin")
              .select("*")
              .eq("user_uuid", data.session.user.id)
              .single(),
          ]);

          if (customerData.data) {
            setUser(customerData.data);
            setIsAdmin(false);
          } else if (adminData.data) {
            setUser(adminData.data);
            setIsAdmin(true);
          }

          setSession(data.session);
        } else {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error in fetchSession:", error);
      } finally {
        setLoading(false);
      }
    };

    // Call fetchSession on component mount
    fetchSession();

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoading(true);
        fetchSession(); // Re-fetch session and user data on auth state change
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({ session, loading, user, isAdmin}),
    [session, loading, user, isAdmin]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
