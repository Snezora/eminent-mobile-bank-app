import { Account } from "@/assets/data/types";
import { supabase } from "../lib/supabase.js";
import { accounts } from "@/assets/data/dummyAccounts";

export const fetchAccountDetails = async (
  isMockEnabled: boolean,
  accountID?: string,
  accountNo?: string
): Promise<Account | null> => {
  let account: Account | null = null;
  let error;

  if (isMockEnabled) {
    if (accountID) {
      account = accounts.find((acc) => acc.account_id === accountID) ?? null;
    } else if (accountNo) {
      account = accounts.find((acc) => acc.account_no === accountNo) ?? null;
    }

    if (!account) {
      console.warn("Account not found in mock data:", { accountID, accountNo });
    }
    return account;
  }

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
