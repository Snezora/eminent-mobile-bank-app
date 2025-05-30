import { supabase } from "../lib/supabase";
import { accounts } from "@/assets/data/dummyAccounts";

const fetchListofAccounts = async ({
  isMockEnabled,
  isAdmin,
  customer_id,
} : {
  isMockEnabled: boolean;
  isAdmin: boolean;
  customer_id?: string;
}) => {

  if (isMockEnabled) {
    // Mock data for development purposes
    if (customer_id) {
      return accounts.filter(account => account.customer_id === customer_id);
    }
    if (isAdmin) {
      return accounts;
    }
    return [];
  }

  if (customer_id) {
    let { data, error } = await supabase
      .from("Account")
      .select("*")
      .eq("customer_id", customer_id)
      .order("account_no", { ascending: true });

    return data;
  }
  if (isAdmin && !customer_id) {
    let { data, error } = await supabase
      .from("Account")
      .select("*")
      .order("account_no", { ascending: true });

      if (error) {
        console.error("Error fetching accounts:", error);
      }

    return data;
  }
};

export default fetchListofAccounts;
