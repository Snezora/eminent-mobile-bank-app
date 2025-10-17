import { supabase } from "../lib/supabase.js";

const fetchTransactionDetails = async (transactionId: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from("Transaction")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error) {
      console.error("Error fetching transaction details:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching transaction details:", error);
    return null;
  }
};

export default fetchTransactionDetails;