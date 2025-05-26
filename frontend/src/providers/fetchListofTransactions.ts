import { supabase } from "../lib/supabase";

const fetchListofTransactions = async ({
  isAdmin,
  user_uuid,
}: {
  isAdmin: boolean;
  user_uuid?: string;
}) => {
  const fetchUserTransactions = async (user_uuid: string) => {
    const { data, error } = await supabase
      .from("Transaction")
      .select("*")
      .eq("user_uuid", user_uuid)
      .order("transfer_datetime", { ascending: false });
    if (error) {
      console.error("Error fetching transactions:", error);
    }
    return data;
  };

  const fetchAllTransactions = async () => {
    const { data, error } = await supabase
      .from("Transaction")
      .select("*")
      .order("transfer_datetime", { ascending: false });
    if (error) {
      console.error("Error fetching all transactions:", error);
    }
    return data;
  };
  if (isAdmin) {
    return fetchAllTransactions();
  } else if (user_uuid) {
    return fetchUserTransactions(user_uuid);
  } else {
    console.error("User UUID is required for non-admin users.");
    return [];
  }
};

export default fetchListofTransactions;
