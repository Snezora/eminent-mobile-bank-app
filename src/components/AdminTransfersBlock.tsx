import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Transaction } from "@/assets/data/types";
import { accounts } from "@/assets/data/dummyAccounts";
import { customers } from "@/assets/data/dummyCustomers";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import fx, { convert } from "money";
import { convertUSDToMYR } from "../providers/convertCurrency";
import { useEffect, useState } from "react";
import { router } from "expo-router";

const AdminTransfersBlock = (transaction: Transaction) => {
  const [newRate, setNewRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchNewRate = async () => {
      const rate = await convertUSDToMYR(transaction.amount);
      setNewRate(rate);
    };
    fetchNewRate();
  }, [transaction.amount]);

  const fetchSenderName = (accountId: string) => {
    const account = accounts.find((acc) => acc.account_id === accountId);
    if (account) {
      const customer = customers.find(
        (cust) => cust.customer_id === account.customer_id
      );
      const lastNameParts = customer?.last_name?.split(" ");
      const initial =
        lastNameParts!.length > 1
          ? lastNameParts![1].charAt(0)
          : lastNameParts?.[0].charAt(0);

      return customer!.first_name + " " + initial + ".";
    }
    return null;
  };

  const findReceiverName = (accountNo: string) => {
    const account = accounts.find((acc) => acc.account_no === accountNo);
    if (account) {
      const customer = customers.find(
        (cust) => cust.customer_id === account.customer_id
      );
      const lastNameParts = customer?.last_name?.split(" ");
      const initial =
        lastNameParts!.length > 1
          ? lastNameParts![1].charAt(0)
          : lastNameParts?.[0].charAt(0);

      return customer!.first_name + " " + initial + ".";
    }
    return null;
  };

  return (
    <TouchableOpacity
      onPress={(event) =>
        router.push({
          pathname: "/TransferDetails/[id]",
          params: { transferID: transaction.transaction_id },
        })
      }
    >
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Text style={styles.text}>
            {dayjs(transaction.transfer_datetime).format("YYYY-MM-DD")}
          </Text>
          <Text style={styles.text}>
            {fetchSenderName(transaction.initiator_account_id)}
          </Text>
        </View>
        <View style={styles.middleContainer}>
          <Text style={styles.text}>$ {transaction.amount.toFixed(2)}</Text>
          {/* <Text style={styles.text}>RM {newRate?.toFixed(2)}</Text> */}
          <FontAwesome name="long-arrow-right" color="black" size={32} />
          <Text style={styles.text}>{transaction.type_of_transfer}</Text>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.text}>
            {dayjs(transaction.transfer_datetime).format("HH:mm")}
          </Text>
          <Text style={styles.text}>
            {findReceiverName(transaction.receiver_account_no)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: "row",
    marginHorizontal: 10,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  middleContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 5,
  },
  text: {
    fontSize: 16,
  },
});

export default AdminTransfersBlock;
