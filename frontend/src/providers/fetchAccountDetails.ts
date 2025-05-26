import { Account } from "@/assets/data/types";
import { supabase } from "../lib/supabase";

export const fetchAccountDetails = async (
  accountID?: string,
  accountNo?: string
): Promise<Account | null> => {
  let account: Account | null = null;
  let error;

  if (accountID) {
    const { data, error: err } = await supabase
      .from("Account")
      .select("*")
      .eq("account_id", accountID)
      .single();
    account = data ?? null;
    error = err;
  } else if (accountNo) {
    const { data, error: err } = await supabase
      .from("Account")
      .select("*")
      .eq("account_no", accountNo)
      .single();
    account = data ?? null;
    error = err;
  }

  if (error) {
    console.error("Error fetching account:", error);
  }

  return account;
};