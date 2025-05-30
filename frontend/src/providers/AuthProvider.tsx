import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/src/lib/supabase";
import React from "react";
import { Session } from "@supabase/supabase-js";
import { Admin, Customer } from "@/assets/data/types";

interface AuthData {
  session: Session | null;
  loading: boolean;
  user: Customer | Admin | null;
  isAdmin: boolean;
  isMockEnabled?: boolean;
}

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  user: null,
  isAdmin: false,
  isMockEnabled: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Customer | Admin | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMockEnabled, setIsMockEnabled] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);

      if (isMockEnabled) {
        const mockSession: Session = {
          user: {
            id: "mock-user-id",
            email: "admin@ewb.com",
            app_metadata: {},
            user_metadata: {},
            aud: "",
            created_at: ""
          },
          access_token: "mock-access-token",
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          token_type: "bearer",
        };

        const mockAdmin: Admin = {
          user_uuid: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
          username: 'admin_manager',
          admin_id: "ad1d1d1d-e1e1-f1f1-a1a1-b1b1b1b1b1ad",
          role: 'Manager',
          created_at: '2023-12-01T09:00:00Z'
        };

        setSession(mockSession);
        setUser(mockAdmin);
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
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

    fetchSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setLoading(true);
        fetchSession(); 
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({ session, loading, user, isAdmin, isMockEnabled }),
    [session, loading, user, isAdmin, isMockEnabled]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);