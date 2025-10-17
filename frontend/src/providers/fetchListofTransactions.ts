import { transactions } from "@/assets/data/dummyTransactions";
import { supabase } from "../lib/supabase.js";

const fetchListofTransactions = async ({
  isMockEnabled,
  isAdmin,
  initiator_account_id,
  receiver_account_no,
}: {
  isMockEnabled: boolean;
  isAdmin: boolean;
  initiator_account_id?: string;
  receiver_account_no?: string;
}) => {
  const fetchUserTransactions = async (
    initiator_account_id: string | undefined,
    receiver_account_no: string | undefined
  ) => {
    if (isMockEnabled) {
      return transactions.filter(
        (transaction) =>
          (!initiator_account_id ||
            transaction.initiator_account_id === initiator_account_id) &&
          (!receiver_account_no ||
            transaction.receiver_account_no === receiver_account_no)
      );
    }

const { data, error } = await supabase
      .from("Transaction")
      .select("*")
      .or(
        `initiator_account_id.eq.${initiator_account_id},receiver_account_no.eq.${receiver_account_no}`
      )
      .order("transfer_datetime", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error);
    }
    return data;
  };

  const fetchAllTransactions = async () => {
    if (isMockEnabled) {
      return transactions.filter(
        (transaction) =>
          (!initiator_account_id ||
            transaction.initiator_account_id === initiator_account_id) &&
          (!receiver_account_no ||
            transaction.receiver_account_no === receiver_account_no)
      );
    }

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
  } else if (initiator_account_id || receiver_account_no) {
    return fetchUserTransactions(initiator_account_id, receiver_account_no);
  } else {
    console.error("User UUID is required for non-admin users.");
    return [];
  }
};

export default fetchListofTransactions;
