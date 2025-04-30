import { accounts } from "@/assets/data/dummyAccounts";

export const fetchAccountDetails = async (accountID?: string, accountNo?: string) => {
  const account = accounts.find(
    (account) =>
      account.account_id === accountID || account.account_no === accountNo
  );
  return account;
};
