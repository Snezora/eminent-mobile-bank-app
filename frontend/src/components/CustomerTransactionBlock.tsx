import { Account, Customer, Transaction } from "@/assets/data/types";
import { Fontisto, Ionicons } from "@expo/vector-icons";
import { View, Text, useColorScheme, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { useEffect, useState } from "react";
import { fetchAccountDetails } from "../providers/fetchAccountDetails";
import { fetchCustomerDetails } from "../providers/fetchCustomerDetails";
import { router } from "expo-router";

const CustomerTransactionBlock = ({
  transaction,
  account,
  isHistory,
}: {
  transaction: Transaction;
  account: Account;
  isHistory?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [isSender, setisSender] = useState<boolean>(false);
  const [receiverAccount, setReceiverAccount] = useState<Account | null>(null);
  const [senderAccount, setSenderAccount] = useState<Account | null>(null);
  const [receiverCustomer, setReceiverCustomer] = useState<Customer | null>(
    null
  );
  const [senderCustomer, setSenderCustomer] = useState<Customer | null>(null);
  const [sameAccount, setSameAccount] = useState<boolean>(false);

  useEffect(() => {
    const fetchReceiverAccount = async () => {
      let fetchedSenderAccount: Account | null = null;
      let fetchedReceiverAccount: Account | null = null;

      if (transaction.initiator_account_id === account.account_id) {
        setisSender(true);
        setSenderAccount(account);
        fetchedSenderAccount = account;

        const receiverAcc = await fetchAccountDetails(
          false,
          undefined,
          transaction.receiver_account_no
        );
        const receiverCustomer = await fetchCustomerDetails(
          false,
          receiverAcc?.customer_id
        );
        setReceiverAccount(receiverAcc);
        setReceiverCustomer(receiverCustomer);
        fetchedReceiverAccount = receiverAcc;
      } else {
        setisSender(false);
        setReceiverAccount(account);
        fetchedReceiverAccount = account;

        const senderAcc = await fetchAccountDetails(
          false,
          transaction.initiator_account_id
        );
        const senderCustomer = await fetchCustomerDetails(
          false,
          senderAcc?.customer_id
        );
        setSenderAccount(senderAcc);
        setSenderCustomer(senderCustomer);
        fetchedSenderAccount = senderAcc;
      }

      // Now compare the actual fetched accounts, not the state
      if (isHistory) {
        const isSameAccount =
          fetchedSenderAccount?.customer_id ===
          fetchedReceiverAccount?.customer_id;
        setSameAccount(isSameAccount);
      }
    };

    fetchReceiverAccount();
  }, [transaction, isHistory]);

  return (
    <TouchableOpacity
      style={{ flexDirection: "row", justifyContent: "space-between" }}
      onPress={() => {
        router.push({
          pathname: "/(transfer)/transferDetails",
          params: {
            transaction_id: transaction.transaction_id,
          },
        })
      }}
    >
      <View style={{ flexDirection: "row", gap: 20 }}>
        {!sameAccount && (
          <>
            <Fontisto
              name={isSender ? "arrow-left" : "arrow-right"}
              style={{
                backgroundColor: Colors.light.grayColor,
                borderRadius: 50,
                padding: 10,
              }}
              size={28}
              color={"white"}
            />
            <View
              style={{
                flexDirection: "column",
                alignSelf: "center",
                gap: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                TRANSFER {isSender ? "TO" : "FROM"}{" "}
                {isSender
                  ? receiverCustomer?.last_name?.toLocaleUpperCase()
                  : senderCustomer?.last_name?.toLocaleUpperCase()}
              </Text>
              {isSender ? (
                <Text
                  style={{
                    fontWeight: "bold",
                    color: isDarkMode ? "#D52828" : "red",
                  }}
                >
                  - USD {transaction.amount.toFixed(2)}
                </Text>
              ) : (
                <Text style={{ fontWeight: "bold", color: "green" }}>
                  + USD {transaction.amount.toFixed(2)}
                </Text>
              )}
            </View>
          </>
        )}
        {sameAccount && (
          <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
            <Fontisto
              name="arrow-swap"
              style={{
                backgroundColor: Colors.light.grayColor,
                borderRadius: 50,
                padding: 10,
              }}
              size={28}
              color={"white"}
            />
            <View
              style={{
                flexDirection: "column",
                alignSelf: "center",
                gap: 5,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: isDarkMode ? Colors.dark.text : Colors.light.text,
                }}
              >
                TRANSFER BETWEEN OWN ACCOUNT
              </Text>
              <Text
                style={{
                  fontWeight: "bold",
                  color: isDarkMode
                    ? Colors.dark.themeColorSecondary
                    : Colors.light.themeColor,
                }}
              >
                USD {transaction.amount.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
      <Ionicons
        name="chevron-forward-outline"
        size={24}
        color={isDarkMode ? Colors.dark.text : Colors.light.text}
        style={{ alignSelf: "center" }}
      />
    </TouchableOpacity>
  );
};

export default CustomerTransactionBlock;
