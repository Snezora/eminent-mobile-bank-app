import { supabase } from "../lib/supabase";

const fetchListofAccounts = async ({
  isAdmin,
  user_id,
} : {
  isAdmin: boolean;
  user_id?: string;
}) => {
  if (user_id) {
    let { data, error } = await supabase
      .from("Account")
      .select("*")
      .eq("user_uuid", user_id)
      .order("account_no", { ascending: true });

    return data;
  }
  if (isAdmin) {
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
