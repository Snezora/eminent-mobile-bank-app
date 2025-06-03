import { Account, Customer, Transaction } from "@/assets/data/types";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, useColorScheme, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { useEffect, useState } from "react";
import { fetchAccountDetails } from "../providers/fetchAccountDetails";
import { fetchCustomerDetails } from "../providers/fetchCustomerDetails";

const CustomerTransactionBlock = ({
  transaction,
  account,
}: {
  transaction: Transaction;
  account: Account;
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

  useEffect(() => {
    const fetchReceiverAccount = async () => {
      if (transaction.initiator_account_id === account.account_id) {
        setisSender(true);
        setSenderAccount(account);
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
      } else {
        setisSender(false);
        setReceiverAccount(account);
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
      }
    };

    fetchReceiverAccount();
  }, [transaction]);

  return (
    <TouchableOpacity
      style={{ flexDirection: "row", justifyContent: "space-between" }}
      onPress={() => console.log("Transaction: ", transaction)}
    >
      <View style={{ flexDirection: "row", gap: 20 }}>
        <Ionicons
          name={isSender ? "arrow-back-outline" : "arrow-forward-outline"}
          style={{
            backgroundColor: Colors.light.grayColor,
            borderRadius: 50,
            padding: 5,
          }}
          size={36}
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
