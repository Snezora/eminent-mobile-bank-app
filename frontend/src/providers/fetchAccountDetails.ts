import { accounts } from "@/assets/data/dummyAccounts";
import { Account } from "@/assets/data/types";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export const fetchAccountDetails = async (
  accountID?: string,
  accountNo?: string
) => {
  const [account, setAccount] = useState<Account | null>(null);
  if (accountID) {
    let { data: Account, error } = await supabase.from("Account").select("*").eq("account_id", accountID).single();
    setAccount(Account);
  }
  if (accountNo) {
    let { data: Account, error } = await supabase.from("Account").select("*").eq("account_no", accountNo).single();
    setAccount(Account);
  }
  return account;
};
